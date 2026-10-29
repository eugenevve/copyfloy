# Architecture

This document describes the internal architecture of application, the responsibilities of its main processes and services, and how they interact with each other.

---

<br />

## 🧱 Process Model

Application is built on Electron and is split into three layers:

```text
┌──────────────────────────────────────────────────────────┐
│ Main process (Node.js)                                   │
│ services, storage, scheduling, tray, updates, system     │
└───────────────▲──────────────────────────────────────────┘
                │ IPC (channels from src/shared/constants/ipc.ts)
┌───────────────┴──────────────────────────────────────────┐
│ Preload                                                  │
│ exposes a restricted window.api                          │
└───────────────▲──────────────────────────────────────────┘
                │ window.api
┌───────────────┴──────────────────────────────────────────┐
│ Renderer (React)                                         │
│ Home (tasks), Labels, Report, Settings, About            │
└──────────────────────────────────────────────────────────┘
```

- **Main process** - contains all the core logic. It has full access to Node.js and the file system.
- **Preload** - the only bridge between the two worlds. It exposes `window.api` with a limited set of methods to the interface.
- **Renderer** - the React interface. It has no direct access to Node.js and talks to the main process only through IPC.
- **Shared** - code used by both sides: IPC channel names, types (`ITask`, `ILabel`, `IReport`, ...) and constants.

Most main-process services follow one pattern:

```text
Service  - logic
Ipc      - registers IPC handlers that expose the service
Storage  - reads and writes the JSON file of the service
```

### Application startup

The entry point is `src/main/index.ts`:

1. In development mode `userData` is redirected to a separate `<name>-dev` directory, so a development build never touches the data of the installed application. This happens before any service is created, because storages resolve their paths at construction.
2. A single-instance lock is requested. If the lock is not acquired, the second process exits; the running instance receives the `second-instance` event and restores its window.
3. After `app.whenReady()` the services are initialized (tasks and scheduler, labels, reports, updater, Discord), then IPC handlers are registered.
4. The main window is created, and the services that depend on it (tray, updater events) are initialized.

The application supports a `--hidden` command-line flag: the window is created but not shown, so the app can start silently in the tray.

---

<br />

## 📦 Task System

The task system is the core of application.

Each task contains information about the source, destination, schedule, exclusions, and other task configuration.

### Task types

| Type         | Source                                   | Result                                                                |
| ------------ | ---------------------------------------- | --------------------------------------------------------------------- |
| `file`       | A local file                             | The file is copied to `<destination>\<file name>`                     |
| `folder`     | A local folder                           | The folder is copied recursively to `<destination>\<folder name>`     |
| `repository` | HTTPS URL of a GitHub or GitLab repo     | The repository is cloned to `<destination>\<repository name>`         |

Any task can additionally be marked as an **archive** task (`isArchive`). In this mode the result is a single ZIP file instead of a copy of the file tree. See [Archive Mode](#-archive-mode).

### Task fields

| Field                | Description                                                           |
| -------------------- | --------------------------------------------------------------------- |
| `id`                 | Numeric task ID                                                       |
| `name`               | Display name                                                          |
| `type`               | `file`, `folder` or `repository`                                      |
| `source`             | Path to a file / folder, or the repository URL                        |
| `target`             | Destination folder                                                    |
| `schedule`           | Optional schedule and the `notify` flag                               |
| `exceptions`         | Excluded paths (files and folders only)                               |
| `labelsIds`          | IDs of the labels attached to the task                                |
| `isPinned`           | The task is pinned to the top of the list                             |
| `isArchive`          | Pack the result into a ZIP archive                                    |
| `repositoryProvider` | `github` or `gitlab` (repository tasks only)                          |
| `isPrivate`          | The repository is private (repository tasks only)                     |
| `accessToken`        | Personal access token for a private repository (stored encrypted)    |

### Task execution

A task can be executed in two ways:

```text
Manual execution
       ↓
CopyService
       ↓
File / Folder / Repository
```

or:

```text
Scheduler
    ↓
Scheduled Task
    ↓
CopyService
    ↓
File / Folder / Repository
```

When a task is created, updated, or deleted, the scheduler is automatically updated to reflect the current task configuration.

### Task lifecycle

Every run goes through the same steps inside `CopyService.run()`:

```text
Start
  ↓
Register the run (AbortController, progress = 0)
  ↓
Copy / clone / archive  ──→  progress events to the UI
  ↓
Success ──→ notification (if enabled) + report record
Error   ──→ error notification + report record
Stop    ──→ no notification, no report record
  ↓
Unregister the run, progress event with null (finished)
```

- A task that is **already running is not started again**. This also applies to scheduled starts: if the previous run has not finished, the new one is ignored.
- Several different tasks can run at the same time.
- Progress is a percentage (0-100) broadcast to every window through the `tasks.progress` channel. The UI can also request the progress of all running tasks (`tasks.getRunning`), for example after the window was hidden and shown again.

### Stopping a task

`CopyService.stop()` aborts the run through its `AbortController`. The cancellation is cooperative and cleans up after itself:

- Files that have already been copied are kept.
- A file that was being written when the run was stopped is removed, so no half-written file is left behind.
- A partial ZIP archive is removed.
- A partial clone is removed **only if the destination folder did not exist before the run**. A pre-existing folder is never deleted.
- A running `git` process is terminated.
- A stopped run is not an error: it produces no error notification and no record in the report.

---

<br />

## ⏰ Scheduling

Uses `node-cron` to schedule automatic task execution.

Supported schedule types include:

| Schedule | Description                               |
| -------- | ----------------------------------------- |
| Minutes  | Run every configured number of minutes    |
| Hourly   | Run every hour at a configured minute     |
| Daily    | Run once per day at a configured time     |
| Weekly   | Run on selected days at a configured time |
| Disabled | Disable automatic execution               |

For example:

```text
Every 5 minutes
*/5 * * * *

Every hour at minute 30
30 * * * *

Every day at 02:00
0 2 * * *

Every Monday at 03:30
30 3 * * 1
```

`SchedulerService` keeps one cron job per task (`task ID → job`). Whenever tasks change, all jobs are stopped and recreated from the current list (`rescheduleAll`). Tasks without a schedule, or with the schedule disabled, get no job. If a schedule cannot be converted to a valid cron expression, the task is skipped and a warning is written to the log.

The schedule also carries the `notify` flag. When it is enabled, a notification is shown after every successful run of the task. Errors are always reported regardless of this flag.

The application process must remain running for scheduled tasks to execute.

Application can remain active in the Windows system tray, allowing scheduled operations to continue without keeping the main application window open.

---

<br />

## 📁 Copy Operations

Application uses `fs-extra` for file system operations.

For every file or folder task, the destination path is constructed using the source name:

```text
destination = target / basename(source)
```

Both files and directories are supported.

Existing files are overwritten during the copy operation. Nothing is ever deleted in the destination.

### How a copy works

1. **Collect.** The source tree is walked once and turned into a flat list of entries (path, destination, size, is-directory). Excluded paths are skipped here and counted as skipped.
2. **Copy.** The entries are processed one by one. Directories are created, files are streamed from the source to the destination. Progress is calculated from the number of bytes copied relative to the total size collected in step 1.
3. **Statistics.** The number of copied files, the number of skipped paths and the total size are saved to the report.

### Excluding Files and Directories

A task can contain a list of excluded paths.

For example:

```text
D:\Projects
├── src/
├── dist/
├── node_modules/
├── README.md
└── .git/
```

You can exclude:

```text
node_modules/
.git/
```

The excluded paths and their contents will not be copied. A path is excluded if it is equal to an excluded path or is located inside it. Each excluded path that is hit during the walk counts as one skipped item in the report; the contents of an excluded folder are not counted separately.

Exclusions apply to file and folder tasks, including those in archive mode. They are not used for repository tasks.

---

<br />

## 🗜 Archive Mode

When `isArchive` is enabled, the result of a run is a single ZIP file instead of a copy of the file tree. The archive is created with the `archiver` package (compression level 6).

**Files and folders**

```text
Source        D:\Documents
Destination   E:\Backup
Result        E:\Backup\Documents.zip
```

- Exclusions are applied while the source tree is collected, so excluded paths do not get into the archive.
- Paths inside the archive start with the source name (`Documents/...`).
- An existing archive with the same name is replaced.

**Repositories**

The repository is first cloned into a temporary folder and then packed:

```text
Clone into a temporary folder   0-70 %
Pack the whole clone into ZIP   70-100 %
```

- The archive contains the whole clone, including the `.git` directory.
- The result is `<destination>\<repository name>.zip`.
- The temporary folder is always removed afterwards, whether the run succeeded, failed or was stopped.

Progress of the packing step is reported from the number of bytes processed. If a run is stopped or fails while packing, the incomplete archive is deleted.

---

<br />

## 🌿 Git Repositories

A task of the `repository` type backs up a Git repository. `GitRepositoryService` works through the system `git` executable (it is started as a child process), so **Git must be installed and available in `PATH`**. The availability is checked on demand (`git --version`) and exposed to the UI: if Git is missing, repository tasks cannot be created or started, and the interface shows a hint.

### Supported sources

- Providers: **GitHub** (`github.com`) and **GitLab** (`gitlab.com`).
- The URL must use `https`, point to the host that matches the selected provider, and must not contain a user name or a password.
- The URL must contain the owner and the repository name. A trailing `/` and a `.git` suffix are ignored; the query string and the fragment are removed.
- Authentication prompts are disabled (`GIT_TERMINAL_PROMPT=0`), so `git` never waits for input in the background.

### First run and next runs

```text
Destination does not contain .git
  ↓
git clone --progress <url> <target>/<repository name>

Destination already contains .git
  ↓
origin URL matches?  ── no ──→ error: "The destination already contains a different repository"
  ↓ yes
git pull --ff-only --progress
```

- The first run clones the repository.
- Next runs update the existing clone with a fast-forward-only `pull`. Nothing is overwritten or reset: if the local clone cannot be fast-forwarded, the run fails with the message from `git`.
- The remote of an existing clone is always compared with the task's URL, so a task can never write into a repository that belongs to another project.

### Progress

`git` writes progress to `stderr`. The output is parsed and converted to a single percentage:

```text
Receiving objects  → 0-90 %
Resolving deltas   → 90-100 %
```

In archive mode these values are scaled to the first 70 % of the run (see [Archive Mode](#-archive-mode)).

### Private repositories

A private repository requires a personal access token.

- The token is passed to `git` through the `http.extraheader` configuration of the single process (`GIT_CONFIG_*` environment variables), as a Basic `Authorization` header. It is never put into the URL, so it does not appear in `.git/config`, in the command line, or in logs.
- For GitHub the user name `x-access-token` is used, for GitLab `oauth2`.
- If a private task has no token (it was never entered, was removed on export, or cannot be decrypted), the **Run** button is disabled and the reason is shown in a tooltip.

### Token storage

Tokens are encrypted with Electron `safeStorage` (operating system level encryption) before they are written to `tasks.json`:

```text
"accessToken": "encrypted:<base64 ciphertext>"
```

- If encryption is not available on the system, saving a task with a token fails instead of storing it as plain text.
- If a stored token cannot be decrypted (for example `tasks.json` was copied to another Windows account or machine), the task is loaded without a token, and the original ciphertext is kept in memory so that saving other tasks does not erase it. The user is asked to enter the token again by editing the task.
- Tokens are **removed from export files**. See [Task Storage](#-task-storage).

---

<br />

## 💾 Task Storage

Tasks are stored locally in JSON format.

The application uses Electron's `userData` directory for its default task storage:

```text
tasks.json
```

The storage layer is responsible for:

- Loading tasks
- Saving tasks
- Creating the required directory
- Importing tasks from JSON files
- Exporting tasks to JSON files
- Handling invalid or unavailable task files
- Encrypting and decrypting access tokens
- Validating the structure of tasks read from a file

Every task read from a file is validated (types of all fields, supported task types and providers). A file with an invalid structure is rejected as a whole, and an empty or missing file is reported as an error.

### Order of tasks

The order of tasks is the order in which they are stored in `tasks.json`. The user can change it by drag and drop; the UI sends the new order of IDs (`tasks.reorder`), the main process validates it and saves the reordered list.

Pinned tasks form a separate group at the top of the list. A task can be moved only within its own group (pinned or regular). Reordering is available only when no search, type filter or label filter is active, because otherwise the visible list is only a part of all tasks.

### Export and import

Tasks can also be exported manually to another JSON file and imported later.

This makes it possible to back up or transfer task configurations between installations.

Task export files include both tasks and labels.

- **Access tokens are not exported.** After importing a private repository task, the token has to be entered again.
- Import offers two modes: **add** the imported tasks to the existing ones or **replace** the existing tasks.
- Imported tasks always receive new unique IDs.
- During import, labels that already exist with the same name and color are reused; otherwise, imported labels are added with unique IDs. Task label references are updated to use the resulting IDs.
- Files in the legacy format (a plain array of tasks without labels) are still accepted.
- After an import the scheduler is rebuilt for the resulting list of tasks.

---

<br />

## 📊 Reports

Every finished run of a task is recorded, so the user can see what was done and when. The history is shown on the **Report** page.

A record contains:

| Field          | Description                                               |
| -------------- | --------------------------------------------------------- |
| `taskId`       | ID of the task                                            |
| `taskName`     | Name of the task at the moment of the run                 |
| `startedAt`    | Start time                                                |
| `durationMs`   | Duration of the run                                       |
| `status`       | `success` or `error`                                      |
| `filesCopied`  | Number of copied files (files only, not directories)      |
| `filesSkipped` | Number of excluded paths that were skipped                |
| `totalBytes`   | Total size of the copied data                             |
| `error`        | Error message for failed runs                             |

The report is stored in the `userData` directory:

```text
report.json
```

- Only the **last 1000** records are kept; older ones are dropped automatically.
- A record is written for successful and failed runs, whether started manually or by the scheduler. Runs stopped by the user are not recorded.
- The task name is saved in the record, so the history stays readable after a task was renamed or deleted.
- Record IDs are based on the start time; if two runs start in the same millisecond, the ID is increased until it is unique (the IDs are used as list keys in the UI).
- A damaged or invalid `report.json` is ignored and treated as an empty history.

`ReportService` returns the history together with the summary: the current number of tasks, the number of successful runs and the number of failed runs. Records are returned from the newest to the oldest. The history can be cleared from the Report page after a confirmation.

---

<br />

## 🏷 Labels

Labels help organize tasks visually. Each label has a numeric ID, a name, and a color, and a task can reference multiple labels through `labelsIds`.

Labels are stored separately from tasks as JSON in the Electron `userData` directory:

```text
labels.json
```

The label service handles label retrieval, creation, updates, and deletion through IPC. When a label is deleted, its ID is also removed from every task that references it.

Labels can also be used to filter the task list on the Home page.

---

<br />

## 🖥 System Tray

Application can continue running in the Windows system tray.

By default, closing the main window does not necessarily terminate the application. Instead, the application can remain active in the tray so scheduled tasks can continue running.

The exact close behavior can be controlled through application settings. This allows application to work as a background utility without keeping the main window visible.

How it works:

- When **Minimize to tray on close** is enabled (the default) and the application is not quitting, the close event of the window is cancelled and the window is only hidden.
- A click on the tray icon shows the window (restoring it if it was minimized) and focuses it. A right click opens a menu with **Open** and **Close**.
- **Close** in the tray menu really quits the application: it marks the application as quitting and calls `app.quit()`.
- When the option is disabled, closing the window quits the application, and scheduled tasks stop.
- Launching the application a second time does not create another process; it restores the window of the running instance.

---

<br />

## ⚙️ Settings

Application settings are stored in `settings.json` in the `userData` directory:

| Setting        | Default | Description                                               |
| -------------- | ------- | --------------------------------------------------------- |
| `sidebarOpen`  | `true`  | Whether the sidebar is expanded                           |
| `autoStart`    | `false` | Start the application with Windows                        |
| `runAdmin`     | `false` | Run the application as administrator                      |
| `zoomFactor`   | `1`     | Page zoom; clamped to an allowed range                    |
| `minimizeTray` | `true`  | Hide the window to the tray instead of quitting on close  |
| `windowState`  | -       | Position, size and maximized state of the window          |

When a setting changes, `SettingsService` stores the new value and applies the related system settings.

### Auto-start and run as administrator

Both options work only in the **packaged build on Windows**; in development they have no effect.

| Auto-start | Run as admin | What is configured                                                                    |
| ---------- | ------------ | ------------------------------------------------------------------------------------- |
| off        | any          | The login item and the scheduled task are removed                                     |
| on         | off          | A regular login item is registered through Electron                                   |
| on         | on           | A Windows scheduled task `<name>-auto-start` runs the app at logon with highest rights |

Elevated applications are not started by a regular login item, because Windows blocks it. That is why the combination of both options uses Task Scheduler (`schtasks`, `/sc onlogon /rl highest`) and turns the regular login item off.

"Run as administrator" itself is implemented in `RunAdminService`: it adds or removes the `~ RUNASADMIN` flag for the executable in the registry key `HKCU\Software\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers`, so Windows requests elevation on every launch.

### Window

- The window is frameless; the title bar buttons (minimize, maximize, close) are drawn by the interface and call the main process through IPC.
- Position, size and maximized state are saved (with a delay, so the file is not written on every pixel of a resize) and restored on the next launch. If the saved position is no longer visible, for example a monitor was disconnected, the window is centered.
- The minimum window size is 720 × 540.
- Page zoom can be changed from the interface and with keyboard shortcuts; the value is clamped, applied immediately and saved.
- Links that the interface tries to open in a new window are opened in the default browser of the system.
- Developer tools are available only in development mode.

---

<br />

## 🔄 Updates

`UpdaterService` is built on `electron-updater` and uses GitHub releases.

The update is controlled manually from the Settings page:

```text
Check for updates
       ↓
Update available? ── no ──→ "not available"
       ↓ yes
Download (progress is sent to the UI)
       ↓
Install: close the windows and restart with the new version
```

- Automatic download is disabled; an update is downloaded only after the user asks for it.
- A downloaded update is also installed when the application quits (`autoInstallOnAppQuit`).
- The events of `electron-updater` (available, not available, progress, downloaded, error) are forwarded to the interface through IPC.
- During installation a separate status window is shown.
- In development there is no packaged application, so the installation step does nothing.

---

<br />

## 🎮 Discord Rich Presence

`DiscordService` uses `@xhayper/discord-rpc` to show the application in the Discord profile of the user.

The activity is set on startup and shows the application name, a short status and the time elapsed since the launch. The status differs between the packaged build and the development build. The connection is closed when the application quits.

---

<br />

## 🖼 Interface

The renderer is a React application with `HashRouter` and CSS Modules. It contains the following pages:

| Page     | Purpose                                                                                       |
| -------- | --------------------------------------------------------------------------------------------- |
| Home     | Task list: search, filters by type and label, run / stop, progress, pinning, drag-and-drop    |
| Labels   | Creating, editing and deleting labels                                                         |
| Report   | Summary and history of task runs                                                              |
| Settings | Auto-start, administrator mode, tray behavior, zoom, updates, import and export of tasks      |
| About    | Information about the application                                                            |

The interface keeps no data of its own: tasks, labels, settings and reports are always read from and written to the main process through `window.api`. The drag-and-drop list is built with `@dnd-kit` and supports both pointer and keyboard control.

---

<br />

## 🗂 Data Files

All persistent data is stored locally as JSON files in Electron's `userData` directory:

| File            | Content                                                              |
| --------------- | -------------------------------------------------------------------- |
| `tasks.json`    | Tasks (access tokens are stored encrypted)                           |
| `labels.json`   | Labels                                                               |
| `settings.json` | Application settings and the state of the window                     |
| `report.json`   | History of task runs (up to 1000 latest records)                     |

In development mode the directory is `<appData>/<name>-dev`, separate from the installed application.

---

<br />

## ⚙️ Application Services

The main process is organized into dedicated services, each responsible for a specific area of application functionality.

### `AppService`

Responsible for:

- Information about the application package
- Information about granted administrator privileges

### `CopyService`

Responsible for:

- Copying files
- Copying directories
- Overwriting existing files
- Applying copy exclusions
- Running repository tasks through `GitRepositoryService`
- Creating ZIP archives through `ArchiveService`
- Tracking running tasks, reporting their progress and stopping them
- Cleaning up partial results of interrupted runs
- Writing the result of every run to the report
- Reporting copy errors
- Showing task completion notifications

Helpers:

- `GitRepositoryService` - clone and update of GitHub / GitLab repositories, authentication for private repositories, progress parsing
- `ArchiveService` - writing entries to a ZIP file with progress and cancellation support

### `DiscordService`

Responsible for:

- The application's display status within the Discord profile activity status

### `NotificationService`

Provides success and error notifications for task execution.

### `LabelService`

Manages label storage and IPC operations. When labels are deleted, it also removes their references from stored tasks.

### `ReportService`

Provides the history of task runs and the summary (tasks, successful and failed runs) to the interface, and clears the history on request. Records are written by `CopyService` through `ReportStorage`.

### `SchedulerService`

Responsible for scheduling and rescheduling tasks using `node-cron`.

### `SettingsService`

Manages application settings such as:

- Auto-start
- Administrator startup
- Window/application behavior
- Minimize to tray
- Sidebar state and page zoom
- Other persistent application settings

Helpers: `AutoStartService`, `RunAdminService`, `SettingsStorage`.

### `TaskService`

Coordinates the task-related services:

- Task storage
- Copy operations
- Scheduling
- IPC communication

### `TrayService`

Handles the Windows system tray integration.

### `UpdaterService`

Provides application update functionality.

### `WindowService`

Controls the main application window, including its state and window behavior.

Helpers: `WindowEvents` (window events), `WindowStateService` (saving and restoring the window state), `WindowIpc` (title bar controls).

---

<br />

## 🔒 Security

- The renderer runs without direct access to Node.js; everything goes through the limited `window.api` of the preload script and IPC channels declared in one place (`src/shared/constants/ipc.ts`).
- Access tokens of private repositories are encrypted with `safeStorage`, are never exported and are never put into a command line or a URL.
- Repository URLs are strictly validated: only `https` and only `github.com` / `gitlab.com`, with no embedded credentials.
- A repository task never overwrites a foreign repository and never deletes an existing folder on cancellation.
- Copying never deletes anything in the destination.
- Links opened from the interface go to the system browser instead of a new application window.
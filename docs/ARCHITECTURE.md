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
│ Home (tasks), Labels, Report, Settings, Shortcuts, About │
└──────────────────────────────────────────────────────────┘
```

- **Main process** - contains all the core logic. It has full access to Node.js and the file system.
- **Preload** - the only bridge between the two worlds. It exposes `window.api` with a limited set of methods to the interface.
- **Renderer** - the React interface. It has no direct access to Node.js and talks to the main process only through IPC.
- **Shared** - code used by both sides: IPC channel names, types (`ITask`, `ILabel`, `IReport`, ...) and constants (limits, zoom range).

Most main-process services follow one pattern:

```text
Service  - logic
Ipc      - registers IPC handlers that expose the service
Storage  - reads and writes the JSON file of the service
```

### Application startup

The entry point is `src/main/index.ts`:

1. In development mode `userData` is redirected to a separate `<name>-dev` directory, so a development build never touches the data of the installed application. This happens before any service is created, because storages resolve their paths at construction.
2. The services are created while the module is loaded. `SettingsService` reads `settings.json` in its constructor and immediately re-applies the saved auto-start setting (see [Auto-start and run as administrator](#auto-start-and-run-as-administrator)).
3. A single-instance lock is requested. If the lock is not acquired, the second process exits; the running instance receives the `second-instance` event and restores its window.
4. After `app.whenReady()` the application ID is configured (`AppUserModelId`, needed for Windows notifications and the taskbar), the services are initialized (tasks, scheduler and missed-run detection, labels, reports, updater, Discord), and then IPC handlers are registered.
5. The main window is created, and the services that depend on it (tray, updater events) are initialized.
6. When the interface is ready, it asks the main process for the runs that were missed while the application was closed (see [Missed Runs](#-missed-runs)).

The application supports a `--hidden` command-line flag: the window is created but not shown (`ready-to-show` only writes a message to the log), so the app can start silently in the tray. The flag is **not** added by the application's own auto-start; it has to be passed manually, for example from a shortcut.

On exit (`before-quit`) the application marks itself as quitting, so that the window close handler stops hiding the window into the tray, and closes the Discord connection. When all windows are closed, the application quits on every platform except macOS.

### Logging

`Logger` (`src/main/utils/logger.ts`) is a thin wrapper over the console with three levels (`info`, `warn`, `error`). Every message has a scope (`CopyService`, `TaskStorage`, ...), a text and optional details. It is used by the services for events that are useful when something goes wrong: start and end of a task, failed storage reads and writes, schedule problems, auto-start changes. There is no log file; the messages are visible in the console when the application is started from a terminal or in development mode.

---

<br />

## 🔌 IPC

All channel names are declared in one place, `src/shared/constants/ipc.ts`, and are used by both the main process and the preload script. The interface never calls `ipcRenderer` directly; it uses `window.api`.

| Group      | Purpose                                                                                                                     |
| ---------- | --------------------------------------------------------------------------------------------------------------------------- |
| `app`      | Whether the build is packaged, whether it is a portable build, whether the process has administrator rights                 |
| `window`   | Title bar controls (minimize, maximize, close), maximized state and its change event                                        |
| `settings` | Getters and setters of every application setting: sidebar, auto-start, administrator mode, zoom, tray, date and time format |
| `tasks`    | CRUD, order, run / stop, progress, running tasks, missed runs, Git availability, export / import, file dialogs              |
| `labels`   | CRUD and order                                                                                                              |
| `report`   | Get and clear the history                                                                                                   |
| `updater`  | Check, download, install, and the events forwarded to the interface (available, not available, progress, downloaded, error) |

Two kinds of messages go from the main process to the interface without a request: **task progress** (`tasks.progress`) and **updater events**; the maximized state of the window is pushed the same way. Everything else is a request that returns a result (`ipcMain.handle`).

Three channels are **synchronous** (`sendSync`): `app.isPackaged`, `app.isPortable` and `settings.getSidebar`. Their values never change while the application is running or are needed before the first render, so the interface reads them once at startup, and `window.api` exposes them as plain values (`window.api.app.isPackaged`, `window.api.app.isPortable`) instead of promises.

---

<br />

## 📦 Task System

The task system is the core of application.

Each task contains information about the source, destination, schedule, exclusions, and other task configuration.

### Task types

| Type         | Source                               | Result                                                            |
| ------------ | ------------------------------------ | ----------------------------------------------------------------- |
| `file`       | A local file                         | The file is copied to `<destination>\<file name>`                 |
| `folder`     | A local folder                       | The folder is copied recursively to `<destination>\<folder name>` |
| `repository` | HTTPS URL of a GitHub or GitLab repo | The repository is cloned to `<destination>\<repository name>`     |

Any task can additionally be marked as an **archive** task (`isArchive`). In this mode the result is a single ZIP file instead of a copy of the file tree. See [Archive Mode](#-archive-mode).

### Task fields

| Field                | Description                                                       |
| -------------------- | ----------------------------------------------------------------- |
| `id`                 | Numeric task ID (the creation timestamp, made unique if needed)   |
| `name`               | Display name                                                      |
| `type`               | `file`, `folder` or `repository`                                  |
| `source`             | Path to a file / folder, or the repository URL                    |
| `target`             | Destination folder                                                |
| `schedule`           | Optional schedule and the `notify` flag                           |
| `exceptions`         | Excluded paths (the interface offers them for folder tasks)       |
| `labelsIds`          | IDs of the labels attached to the task                            |
| `isPinned`           | The task is pinned to the top of the list                         |
| `isArchive`          | Pack the result into a ZIP archive                                |
| `repositoryProvider` | `github` or `gitlab` (repository tasks only)                      |
| `isPrivate`          | The repository is private (repository tasks only)                 |
| `accessToken`        | Personal access token for a private repository (stored encrypted) |

The ID of a task is its creation time. This is used by [Missed Runs](#-missed-runs): for a task that has never run, the creation time is the moment from which runs are counted.

### Creating and editing a task

A task is created in a form with the name, labels, type, source, destination, exclusions (folders), the repository settings (provider, visibility, token) and the **Create ZIP archive instead of copying** option. The form validates the repository URL and disables saving while a private repository has no token. Changing the type of the task clears the source and the exclusions.

Exclusions are added in two steps: the **Add a file or folder** button opens a small dialog where the user chooses what to exclude - a folder or a file, because the system dialog cannot select both at once - and then the system dialog opens in the source folder with multiple selection enabled. Paths that are already in the list are not added twice.

The **schedule is not a part of this form.** A task is saved first, and its schedule is set later in a separate dialog (the clock button on the task card), which updates only the `schedule` field. Both dialogs ask for confirmation when closed with unsaved changes.

### Task execution

Every way of starting a task ends in the same `CopyService.run()`:

```text
Run / Stop button or Enter key   ─┐
Run tasks (queue in the UI)      ─┤
Scheduler (node-cron)            ─┼──→ CopyService.run() ──→ File / Folder / Repository
Missed-run prompt ("Run now")    ─┘
```

When a task is created, updated, deleted or imported, the scheduler is automatically updated to reflect the current task configuration.

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
- The task card shows the percentage while the task is running, and the **Run** button turns into **Stop**.
- A repository task whose Git or token is not available cannot be started: its **Run** button is disabled and the reason is shown on the card.

### Running several tasks

The **Run tasks** button in the header of the Home page opens a dialog with two choices: all tasks, or only the tasks that match the current search, type and label filters (disabled when nothing matches).

- The queue exists only in the interface: it calls `tasks.run` for each task in turn and starts the next one when the previous run has finished. The tasks are run in the order of the list - pinned first, then the newest ones.
- The queue is not stored. If the application is closed before it finishes, the rest of the tasks are not run.
- An error in one task does not stop the queue; it is recorded in the report as usual. **Stop** on a card cancels only that task, and the queue goes on with the next one.
- A task that is already running (for example, started by the scheduler) is skipped by the rule above.
- The button is disabled while the queue is being processed and when there are no tasks.

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

| Schedule | Fields                     | Description                               |
| -------- | -------------------------- | ----------------------------------------- |
| Minutes  | `interval` (1-60)          | Run every configured number of minutes    |
| Hourly   | `minutes`                  | Run every hour at a configured minute     |
| Daily    | `hours`, `minutes`         | Run once per day at a configured time     |
| Weekly   | `hours`, `minutes`, `days` | Run on selected days at a configured time |
| Disabled | -                          | Disable automatic execution               |

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

The schedule also carries the `notify` flag. When it is enabled, a system notification is shown after every successful run of the task; for a new schedule it is enabled by default. Errors are always reported regardless of this flag.

The schedule is shown on the task card in a short form, for example `Daily at 12:00`, `Every hour at :30`, `Every 5 min` or `Mon, Wed at 03:30`. The time follows the selected [time format](#date-and-time-format).

The application process must remain running for scheduled tasks to execute.

Application can remain active in the Windows system tray, allowing scheduled operations to continue without keeping the main application window open.

---

<br />

## 🕓 Missed Runs

Cron jobs exist only while the application is running. If the application was closed at the scheduled time, the run would be silently lost. `MissedTaskService` detects such runs on the next launch and offers to run them.

```text
Startup
   ↓
MissedTaskService.findMissed()  ──→  list of tasks, kept in memory
   ↓
Interface is ready: tasks.getMissed  (the list is returned once and cleared)
   ↓
"Task skipped" prompt, one task at a time:
   Run now ──→ tasks.dismissMissed + tasks.run
   Skip    ──→ tasks.dismissMissed
```

### How a missed run is detected

A task is checked only if it has an **hourly, daily or weekly** schedule. Tasks that run every N minutes and tasks with the schedule disabled are never reported.

For such a task the service calculates two moments:

- **The last scheduled time** - the latest moment, not later than now, at which the schedule should have fired. For an hourly schedule it is the configured minute of the current or the previous hour; for daily and weekly schedules the service looks back up to seven days for a day that matches the schedule. If no moment can be found (for example a weekly schedule without days), the task is not reported.
- **The last run** - the latest of: the start of the newest record of this task in the report (successful or failed), the creation time of the task (its ID), and the time the user last answered the prompt for this task.

The task is considered missed if the last scheduled time is **later than** the last run.

### The prompt

The interface shows a modal **Task skipped** for each missed task, one after another: _Task "…" was not executed on schedule because the application was not running. Run it now?_

- **Run now** starts the task and remembers the answer.
- **Skip** (or closing the dialog) only remembers the answer.

The answer is stored in `missed-dismissed.json` (`task ID → time of the answer`). Thanks to it the same missed run is not offered again at the next launch. If the file cannot be written, the prompt may appear once more - nothing else is affected. Entries of deleted tasks are not removed from the file.

### Limitations

- The check is done once per launch, and the list is handed to the interface once.
- The last run is taken from the report, so **clearing the report history makes the application forget when tasks last ran**; at the next launch a task whose schedule fired after its creation may be offered again.
- A run stopped by the user is not recorded in the report and therefore does not count as a run.

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

Exclusions are applied by the copy and the archive code for any file or folder task, but the interface offers them only for folder tasks (a single file has nothing to exclude). They are not used for repository tasks.

---

<br />

## 🗜 Archive Mode

When `isArchive` is enabled, the result of a run is a single ZIP file instead of a copy of the file tree. The archive is created with the `archiver` package (compression level 6). The mode is available for every task type.

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

A task of the `repository` type backs up a Git repository. `GitRepositoryService` works through the system `git` executable (it is started as a child process), so **Git must be installed and available in `PATH`**. The availability is checked on demand (`git --version`) and exposed to the UI: if Git is missing, repository tasks cannot be started, and the interface shows a hint.

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
- If a private task has no token (it was never entered, was removed on export, or cannot be decrypted), the **Run** button is disabled and the reason is shown on the card.

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

### Limits

The number of tasks and the number of labels are each limited to **1000** (`MAX_LIST_ITEMS`). When the limit is reached, the **Add** button is disabled, and the main process ignores attempts to create more items. An import is truncated to the same limit. The report keeps the last 1000 records.

### Order of tasks

In `tasks.json` tasks are stored from the oldest to the newest. The interface shows them the other way round: **the newest task is at the top**, and pinned tasks form a separate group above the others.

The user can change the order by drag and drop, with the mouse or the keyboard:

1. The interface sends the IDs of **all** tasks in the order in which they are displayed (not only the ones on the current page).
2. The main process checks that the list contains exactly the stored IDs, each once, with no unknown ones (`reorderDisplayIds`). Otherwise the request is ignored and the current list is returned.
3. The list is saved in reversed form, so the displayed order matches the stored one.

A task can be moved only within its own group (pinned or regular). Reordering is available only when no search, type filter or label filter is active, because otherwise the visible list is only a part of all tasks. The same mechanism is used for labels.

### Export and import

Tasks can also be exported manually to another JSON file and imported later.

This makes it possible to back up or transfer task configurations between installations.

Task export files include both tasks and labels.

- **Access tokens are not exported.** After importing a private repository task, the token has to be entered again.
- Import offers two modes: **add** the imported tasks to the existing ones or **replace** the existing tasks. If the file contains no tasks, nothing is replaced.
- Imported tasks always receive new unique IDs.
- During import, labels that already exist with the same name and color are reused; otherwise, imported labels are added with unique IDs. Task label references are updated to use the resulting IDs.
- Files in the legacy format (a plain array of tasks without labels) are still accepted.
- The result is truncated to the limit of 1000 tasks and 1000 labels.
- After an import the scheduler is rebuilt for the resulting list of tasks.
- A file with an invalid structure is rejected, and the interface shows an **Import error**.

---

<br />

## 📊 Reports

Every finished run of a task is recorded, so the user can see what was done and when. The history is shown on the **Report** page.

A record contains:

| Field          | Description                                          |
| -------------- | ---------------------------------------------------- |
| `taskId`       | ID of the task                                       |
| `taskName`     | Name of the task at the moment of the run            |
| `startedAt`    | Start time                                           |
| `durationMs`   | Duration of the run                                  |
| `status`       | `success` or `error`                                 |
| `filesCopied`  | Number of copied files (files only, not directories) |
| `filesSkipped` | Number of excluded paths that were skipped           |
| `totalBytes`   | Total size of the copied data                        |
| `error`        | Error message for failed runs                        |

The report is stored in the `userData` directory:

```text
report.json
```

- Only the **last 1000** records are kept; older ones are dropped automatically.
- A record is written for successful and failed runs, whether started manually, from the **Run tasks** queue, by the scheduler or after a missed-run prompt. Runs stopped by the user are not recorded.
- The task name is saved in the record, so the history stays readable after a task was renamed or deleted.
- Record IDs are based on the start time; if two runs start in the same millisecond, the ID is increased until it is unique (the IDs are used as list keys in the UI).
- A damaged or invalid `report.json` is ignored and treated as an empty history.

`ReportService` returns the history together with the summary: the current number of tasks, the number of successful runs and the number of failed runs. Records are returned from the newest to the oldest. The history can be cleared from the Report page after a confirmation.

The history is also the source of information for [Missed Runs](#-missed-runs).

### The Report page

The page consists of the summary (tasks, successful and failed operations), the **Clear history** button, a chart and a table.

**Charts.** The chart is drawn with Recharts as a line chart with two lines: successful runs (green) and failed runs (red). Two views are available:

| View     | What it shows                                                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| By weeks | The last 14 days, ending with the latest day that has records; the number of runs per day, days without runs are shown as zero |
| By hours | 24 hours of one day chosen in a drop-down list that contains only days with records (the newest first)                         |

Labels of the axes and the tooltips follow the selected [date and time format](#date-and-time-format). Charts are calculated in the interface from the records that were already received; there is no separate request.

**Table.** The history table shows the task, the start time, the number of copied and skipped files, the duration and the total size. A failed run is highlighted, and the error message is shown on hover. Records are displayed 100 at a time; the next ones are loaded with the **Show more** button.

---

<br />

## 🏷 Labels

Labels help organize tasks visually. Each label has a numeric ID, a name, and a color, and a task can reference multiple labels through `labelsIds`.

Labels are stored separately from tasks as JSON in the Electron `userData` directory:

```text
labels.json
```

The label service handles label retrieval, creation, updates, deletion and reordering through IPC. When a label is deleted, its ID is also removed from every task that references it.

On the Labels page the list is searchable by name and can be reordered by drag and drop (when no search is active). The newest label is shown first, the same way as tasks, and 100 labels are displayed at a time.

Labels are also used to filter the task list on the Home page: the chips of all labels are shown under the search field (they can be scrolled horizontally), and selecting several of them shows the tasks that have **at least one** of the selected labels.

---

<br />

## 🔎 Task List

The Home page shows the list of tasks with the following tools:

- **Search** by task name (case-insensitive).
- **Type filter** - all, file, folder or repository.
- **Label filter** - see [Labels](#-labels).

All three work together: a task is shown if it matches the type, the search text and the labels at the same time. The counter in the header shows the number of tasks that match. The same filters define the second option of the **Run tasks** dialog (see [Running several tasks](#running-several-tasks)).

The list is displayed 100 tasks at a time. The **Show more** button adds the next 100. Drag and drop works on the full list, not only on the visible part.

Each card shows the type icon, the name, the pin button, the progress of a running task, the buttons **Run / Stop**, **Schedule**, **Edit** and **Delete**, the source and the destination, the short text of the schedule and the labels of the task. Deleting a task asks for confirmation.

The list and the card actions can also be controlled from the keyboard, see [Keyboard control](#keyboard-control).

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
- When the option is disabled, closing the window quits the application, and scheduled tasks stop. The runs scheduled for the time the application was closed are then offered at the next launch, see [Missed Runs](#-missed-runs).
- Launching the application a second time does not create another process; it restores the window of the running instance.

---

<br />

## ⚙️ Settings

Application settings are stored in `settings.json` in the `userData` directory:

| Setting          | Default          | Description                                              |
| ---------------- | ---------------- | -------------------------------------------------------- |
| `sidebarOpen`    | `true`           | Whether the sidebar is expanded                          |
| `autoStart`      | `false`          | Start the application with Windows                       |
| `runAdmin`       | `false`          | Run the application as administrator                     |
| `zoomFactor`     | `1`              | Page zoom, from 0.5 to 3.0                               |
| `minimizeTray`   | `true`           | Hide the window to the tray instead of quitting on close |
| `dateTimeFormat` | `DMY`, `24-hour` | Format of dates and time in the interface                |
| `windowState`    | -                | Position, size and maximized state of the window         |

When a setting changes, `SettingsService` stores the new value and applies the related system settings. At startup the saved values are merged with the defaults, so a setting that was added in a newer version gets its default value instead of being missing.

The Settings page contains one widget for each of them: auto-start, run as administrator, page zoom, minimize to tray, date and time format, import / export of tasks and the update checker.

### Auto-start and run as administrator

Both options work only in the **packaged build on Windows**; in development they have no effect, and the widgets are disabled. This applies to the installed and to the portable build alike.

| Auto-start | Run as admin | What is configured                                                                     |
| ---------- | ------------ | -------------------------------------------------------------------------------------- |
| off        | any          | The login item and the scheduled task are removed                                      |
| on         | off          | A regular login item is registered through Electron                                    |
| on         | on           | A Windows scheduled task `<name>-auto-start` runs the app at logon with highest rights |

Elevated applications are not started by a regular login item, because Windows blocks it. That is why the combination of both options uses Task Scheduler (`schtasks`, `/sc onlogon /rl highest`) and turns the regular login item off.

"Run as administrator" itself is implemented in `RunAdminService`: it adds or removes the `~ RUNASADMIN` flag for the executable in the registry key `HKCU\Software\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers`, so Windows requests elevation on every launch. The change takes effect after the application is restarted, and the Settings page says so.

Both services register the path of the **current executable** (`app.getPath("exe")`). The auto-start setting is applied again on every launch, so after the application was updated or moved (which is typical for the portable build) it is enough to start it once from the new place for the registration to follow. The administrator flag is written only when the setting is changed, so it has to be switched off and on again to be registered for a new path.

### Window

- The window is frameless; the title bar buttons (minimize, maximize, close) are drawn by the interface and call the main process through IPC.
- The base size of the window is 720 × 540. It is also the minimum size: the window cannot be made smaller.
- Position, size and maximized state are saved (with a delay, so the file is not written on every pixel of a resize) and restored on the next launch. If the saved position is no longer visible, for example a monitor was disconnected, the window is centered. While the window is minimized or full screen, the previously saved state is kept.
- On displays with a scale factor above 100 % Windows reports the borders of a resized window differently, so the real window bounds are saved in this case.
- Developer tools are available only in development mode; the shortcuts `Ctrl` + `Shift` + `I` and `F12` are blocked in the packaged application.
- Links that the interface tries to open in a new window are opened in the default browser of the system.

### Page zoom

- The zoom is changed in 10 % steps from 50 % to 300 % with the buttons on the Settings page or with the keyboard: `Ctrl` + `+` / `-` to change and `Ctrl` + `0` to reset to 100 % (see [Keyboard control](#keyboard-control)).
- The value is clamped to the allowed range in the main process, applied to the window immediately and saved in `settings.json`.

---

<br />

## 🎨 Appearance

### Theme

The interface has three themes: **light**, **dark** and **system**. One button in the sidebar switches them in a cycle `system → dark → light → system`.

- The choice is stored in the `localStorage` of the application window under the key `theme`, not in `settings.json`. The default is the system theme.
- The resolved theme (`light` or `dark`) is written to the `data-theme` attribute of the root element, and the colors of the interface are CSS variables that depend on it.
- In the system mode the application follows the operating system and reacts to its changes at once.

### Date and time format

The date and time format is a setting of the application, not of the operating system. It is chosen in the **Date & Time Format** widget.

| Option      | Values                                                                                                                       |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Date format | `DD/MM/YYYY`, `DD.MM.YYYY`, `DD-MM-YYYY`, `MM/DD/YYYY`, `MM.DD.YYYY`, `MM-DD-YYYY`, `YYYY-MM-DD`, `YYYY.MM.DD`, `YYYY/MM/DD` |
| Time format | 24-hour (`13:00`) or 12-hour (`1:00 PM`)                                                                                     |

How it works:

- The main process only stores the pair `dateFormat` / `timeFormat` in `settings.json` and returns it through IPC.
- The interface keeps the current value in a small store (`dateTimeFormatState`) with subscriptions. Components subscribe to it with `useSyncExternalStore`, so a change is applied everywhere at once, without reloading the page: in the task cards, in the report table and in the charts.
- On startup the saved value is read and checked against the allowed values; an unknown value is replaced by the default.

---

<br />

## 🧩 Build Variants

The application is distributed in two forms. The code is the same; the build type is detected at runtime by `isPortable()`.

| Variant       | Package                                              | How it is detected                                           | Updates                               |
| ------------- | ---------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------- |
| **Installed** | NSIS installer `Copyfloy-setup-<version>.exe`        | `Uninstall <name>.exe` is located next to the executable     | Downloaded and installed by the app   |
| **Portable**  | ZIP archive `Copyfloy-portable-<version>-<arch>.zip` | The packaged app has no `Uninstall <name>.exe` in its folder | Manually: the user replaces the files |

### Detection

`isPortable()` (`src/main/utils/isPortable.ts`) returns `true` when all of the following is true:

1. The application is packaged (a development run is never portable).
2. The folder of the executable can be read.
3. It contains no file that matches `Uninstall *.exe` - the NSIS installer puts such a file next to the application, while a ZIP archive does not have it.

If the folder cannot be read, the build is treated as **installed**, because this is the safe default: the normal update flow stays available.

The result is available to the main process (`AppService.isPortable()`) and to the interface (`window.api.app.isPortable`, read synchronously at startup).

### What is different

The only place where the two variants behave differently is the update process (see [Updates](#-updates)). Everything else is identical:

- The code has no separate data location for the portable build, so both variants use the same default Electron `userData` directory and, therefore, the same `tasks.json`, `labels.json`, `settings.json`, `report.json` and `missed-dismissed.json`.
- Auto-start and run as administrator work the same way and use the path of the current executable (see [Settings](#-settings)).

### Architectures

Windows on **x64** and on **ARM64** are supported. When both are built, the installer is a single `.exe` that contains both versions and installs the matching one; the portable build is a separate archive for each architecture (`-x64.zip`, `-arm64.zip`).

---

<br />

## 🔄 Updates

`UpdaterService` is built on `electron-updater` and uses GitHub releases. The repository is set in the `build.publish` section of `package.json`, and the metadata of a release is read from `latest.yml`.

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
- During installation a separate small window with a spinner is shown. The other windows are closed, and after a short pause (3 seconds) the installer is started silently and restarts the application.
- In development there is no packaged application, so the installation step does nothing.
- The update signature check is turned off (`verifyUpdateCodeSignature: false`), because the executable is not code-signed yet.

### Portable build

A portable build must not be updated with the NSIS installer, so the update flow is limited:

| Step                   | Installed build                       | Portable build                                                                                       |
| ---------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Check                  | Works                                 | Works                                                                                                |
| Update found           | The **Download the update** button    | A message with the new version and a link to the Releases page; the widget returns to the idle state |
| Download               | Downloads the installer               | Does nothing (an empty result is returned)                                                           |
| Install                | Closes the app and runs the installer | Does nothing                                                                                         |
| `autoInstallOnAppQuit` | Enabled                               | Disabled                                                                                             |

The checks are made in the main process (`UpdaterService`), so the installer cannot be downloaded or started even if the interface is bypassed. The interface only changes what the user sees: for a portable build it shows the message _"The portable version is not updated automatically: download the new ZIP archive from the Releases page and replace the application files"_.

---

<br />

## 📦 Packaging

Packaging is done by `electron-builder`; its settings are in the `build` section of `package.json`. The source is compiled by `electron-vite` into the `out` directory, and only `out/**/*` is put into the package.

| Command                 | Result                                                                                   |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| `npm run build:win`     | Lint, build, then the NSIS installer for x64 only                                        |
| `npm run build:win:all` | Lint, build, then everything for x64 and ARM64: the installer and both portable archives |

The files are written to the `dist` directory:

```text
Copyfloy-setup-<version>.exe                  installer (NSIS)
Copyfloy-setup-<version>.exe.blockmap         data for differential updates
Copyfloy-portable-<version>-x64.zip           portable, Intel / AMD
Copyfloy-portable-<version>-arm64.zip         portable, Windows on ARM
latest.yml                                    update metadata for electron-updater
```

Notes:

- The names are set by `artifactName` (`nsis.artifactName` for the installer, `win.artifactName` for the archives).
- The installer is not one-click: the user can choose the installation folder; it installs for the current user (not per machine), creates a desktop shortcut and a shortcut named after the application, and shows the MIT license. It also writes `Uninstall <name>.exe` - the file by which the installed build is recognized.
- The icon of the application is also copied next to the executable (`extraResources`, `icon.png`), for the window and the tray.
- The icons are generated from `resources/icon.svg` by `npm run icons`; `npm run icons-check` prints the sizes stored in `icon.ico`.

---

<br />

## 🚢 Releases

A release is created by the **Release** workflow in GitHub Actions (`.github/workflows/release.yml`).

- It is started manually (`workflow_dispatch`) and runs **only on `main`**.
- Only one release run at a time is allowed (`concurrency`), and a started run is not cancelled by another one.
- The workflow needs the permissions `contents: write` (to create a release) and `statuses: write` (to set the commit status).

```text
Prepare (Ubuntu)
   status "pending" for the commit
   version = package.json → fails if a release with this version already exists
   release notes = commit subjects since the previous version commit
        ↓
Build (Windows)
   Node.js 22, npm ci, npm run build:win:all -- --publish never
   checks that the installer, the blockmap, both ZIP archives and latest.yml exist
   checks that latest.yml references the installer of this version
        ↓
Release (Ubuntu)
   gh release create <version> with the five files and the notes
        ↓
Status (always)
   final status "Release build" for the commit: success / failure / error
```

### Version and release notes

- The version of the release is the `version` from `package.json`. To make a new release, raise it first; if a release with such a tag exists, the workflow stops at the first step.
- The **release notes** are the list of commit subjects between the previous version commit and the current one. A version commit is a commit whose whole message is `X.Y.Z`; the commit of the version that is being released is not included. If there is no previous version commit, the notes are built from the whole history.
- A subject that ends with a pull request number (`(#123)`) is written as it is; for the other commits the hash is added to the subject. Merge commits are skipped.
- At the end of the notes the text of `.github/release-footer.md` is added: the installation instructions (which file to choose) and the warnings about the experimental status and about the missing code signature. The placeholder `__VERSION__` in it is replaced by the version.

### Result

The release is created with the title `Copyfloy <version>` for the commit that the workflow was run on. The built-in updater of the installed application finds it through `latest.yml`; the portable build only shows a link to the Releases page.

The workflow does not run the tests or the linters itself, but `npm run build:win:all` starts `npm run build`, which includes the CSS and JS/TS linters with zero allowed warnings, so a build with lint errors does not produce a release.

---

<br />

## 🎮 Discord Rich Presence

`DiscordService` uses `@xhayper/discord-rpc` to show the application in the Discord profile of the user.

The activity is set on startup and shows the application name, a short status and the time elapsed since the launch. The status differs between the packaged build and the development build. The connection is closed when the application quits.

---

<br />

## 🖼 Interface

The renderer is a React application with `HashRouter` and CSS Modules. It contains the following pages:

| Page      | Purpose                                                                                                                 |
| --------- | ----------------------------------------------------------------------------------------------------------------------- |
| Home      | Task list: search, filters by type and label, run / stop, run several tasks, progress, pinning, schedule, drag and drop |
| Labels    | Creating, editing, deleting, searching and reordering labels                                                            |
| Report    | Summary, charts and history of task runs                                                                                |
| Settings  | Auto-start, administrator mode, zoom, tray behavior, date and time format, import and export of tasks, updates          |
| Shortcuts | Reference of keyboard shortcuts                                                                                         |
| About     | Description of the application, its version and a link to the GitHub repository                                         |

Common parts of the interface:

- **Header tools** - the title with the counter, the **Add** button, search, the type filter and the label chips; it is shared by the Home and Labels pages. Only the Home page adds the filters and the **Run tasks** button.
- **Modals** - confirmations, alerts and forms are shown through one modal provider. The **Task skipped** prompt for [missed runs](#-missed-runs) is a separate component that uses the same alert window and is shown at startup.
- **Pagination** - lists of tasks, labels and report records show 100 items (`PAGE_ITEMS`) at a time, with the **Show more** button.
- **Drag and drop** - lists are sorted with `@dnd-kit` (pointer and keyboard sensors, movement restricted to the vertical axis and to the list).
- **Charts** - the Report page uses Recharts with the colors of the current theme.
- **Shared state outside React** - theme, zoom and date and time format. They are small stores with subscriptions, so any component can follow them.
- **Build-dependent behavior** - widgets read `window.api.app.isPackaged` and `window.api.app.isPortable`: in development the auto-start, administrator and update widgets are disabled or explain that the setting is not available, and the update widget changes its messages for a portable build.

The interface keeps no important data of its own: tasks, labels, settings and reports are always read from and written to the main process through `window.api`. The only values the interface stores itself are the selected theme and the temporary state of filters, search and forms.

### Keyboard control

Keyboard handling lives entirely in the renderer and is built from three small hooks. The **Shortcuts** page (`Ctrl` + `5`) is a static reference of everything below.

| Hook                        | Where it is used      | What it does                                                                       |
| --------------------------- | --------------------- | ---------------------------------------------------------------------------------- |
| `useKeyboardShortcuts`      | App, Home, Labels     | Page-level shortcuts: switching pages, creating an item, focusing the search field |
| `useKeyboardListNavigation` | Task list, label list | Selection of an item with the arrow keys and actions on the selected item          |
| `useZoomShortcuts`          | App                   | Page zoom                                                                          |

**Page shortcuts.** A shortcut is described by a key, an action and two optional flags: `enabled` and `ignoreInputs`. The `mod+` prefix means `Ctrl` (or `Cmd`). The hook does nothing while a modal window is open (an element with `aria-modal="true"`) or when `Alt` or `Shift` is pressed. With `ignoreInputs` a shortcut is skipped when the focus is in a text field, so typing is never intercepted.

| Shortcut             | Action                                                                                 | Scope        |
| -------------------- | -------------------------------------------------------------------------------------- | ------------ |
| `Ctrl` + `1` ... `6` | Home, Labels, Settings, Report, Shortcuts, About                                       | App          |
| `Ctrl` + `N`         | Create a task / a label (disabled when the limit of 1000 is reached or a form is open) | Home, Labels |
| `Ctrl` + `F`         | Focus the search field (works from a text field too)                                   | Home, Labels |

**List navigation.** `↑` / `↓` select the previous or the next item and move the focus to its card; if there is no selection yet, the first or the last item is chosen. If the selection goes beyond the visible part, the next pages are loaded automatically (**Show more**). `Esc` clears the selection. Actions are a map from a key to a handler and are applied to the selected item only:

| Key          | Task list                                 | Label list                      |
| ------------ | ----------------------------------------- | ------------------------------- |
| `Enter`      | Run the task, or stop it if it is running | -                               |
| `Ctrl` + `E` | Edit                                      | Edit                            |
| `Ctrl` + `S` | Open the schedule dialog                  | -                               |
| `Delete`     | Delete (after the confirmation)           | Delete (after the confirmation) |

The navigation is ignored while a modal window is open, while an item is being dragged, when the focus is in a text field and for action keys when the focus is on a button (so `Enter` on a button keeps its normal meaning).

**Zoom.** `useZoomShortcuts` listens to `Ctrl` + `+` / `-` / `0` (the numeric keypad works too) for the whole application. Unlike the page shortcuts it is not blocked by modal windows or text fields.

When a shortcut is added or changed, the list in `src/renderer/src/pages/Shortcuts/index.tsx` has to be updated by hand: it is not generated from the handlers.

---

<br />

## 🗂 Data Files

All persistent data is stored locally as JSON files in Electron's `userData` directory:

| File                    | Content                                                                |
| ----------------------- | ---------------------------------------------------------------------- |
| `tasks.json`            | Tasks (access tokens are stored encrypted)                             |
| `labels.json`           | Labels                                                                 |
| `settings.json`         | Application settings, date and time format and the state of the window |
| `report.json`           | History of task runs (up to 1000 latest records)                       |
| `missed-dismissed.json` | Time of the last answer to the "Task skipped" prompt for each task     |

The selected theme is not in these files: it is stored in the local storage of the application window.

In development mode the directory is `<appData>/<name>-dev`, separate from the installed application. The installed and the portable builds use the same directory.

---

<br />

## ⚙️ Application Services

The main process is organized into dedicated services, each responsible for a specific area of application functionality.

### `AppService`

Responsible for:

- Configuring the application ID (`AppUserModelId`) at startup
- Information about the application package: whether it is packaged and whether it is a portable build
- Information about granted administrator privileges (`net session` on Windows)

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

- `CopyRunners` - the runners of the three kinds of work: `FileCopier` (copy of a file or a folder), `RepositoryRunner` (clone or update of a repository) and `ArchiveRunner` (ZIP archive); `CopyService` chooses one of them by the type of the task and the `isArchive` flag
- `GitRepositoryService` - clone and update of GitHub / GitLab repositories, authentication for private repositories, progress parsing
- `ArchiveService` - writing entries to a ZIP file with progress and cancellation support

### `DiscordService`

Responsible for:

- The application's display status within the Discord profile activity status

### `NotificationService`

Provides success and error notifications for task execution.

### `LabelService`

Manages label storage and IPC operations: retrieval, creation, updates, deletion and reordering. When labels are deleted, it also removes their references from stored tasks.

### `ReportService`

Provides the history of task runs and the summary (tasks, successful and failed runs) to the interface, and clears the history on request. Records are written by `CopyService` through `ReportStorage`.

### `SchedulerService`

Responsible for scheduling and rescheduling tasks using `node-cron`.

Helpers:

- `ScheduleUtils` - converts a schedule to a cron expression
- `MissedTaskService` - finds the runs missed while the application was closed and handles the answers of the user; it is created and initialized by `TaskService`

### `SettingsService`

Manages application settings such as:

- Auto-start
- Administrator startup
- Window/application behavior
- Minimize to tray
- Sidebar state and page zoom
- Date and time format
- Other persistent application settings

Helpers: `AutoStartService`, `RunAdminService`, `SettingsStorage`.

### `TaskService`

Coordinates the task-related services:

- Task storage
- Copy operations
- Scheduling
- Missed-run detection
- IPC communication

### `TrayService`

Handles the Windows system tray integration.

### `UpdaterService`

Provides application update functionality: check, download and installation of updates, forwarding of the updater events to the interface. For a portable build the download and the installation are disabled (see [Updates](#-updates)).

### `WindowService`

Controls the main application window, including its state and window behavior.

Helpers: `WindowEvents` (window events), `WindowStateService` (saving and restoring the window state), `WindowIpc` (title bar controls).

### Utilities

Shared helpers of the main process (`src/main/utils`):

| Utility               | Purpose                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------ |
| `Logger`              | Console logging with levels and scopes                                                     |
| `environment`         | Platform flags (`isWindows`, `isPackagedWindows`) and the application state (`isQuitting`) |
| `exePath`             | Path of the current executable, used by auto-start and the administrator flag              |
| `isPortable`          | Detection of the portable build                                                            |
| `checkIsAdmin`        | Check of administrator rights                                                              |
| `reorderDisplayIds`   | Validation and saving order of a reordered list of tasks or labels                         |
| `writeJsonAtomically` | Writing of JSON files, used by the storages                                                |

---

<br />

## 🔒 Security

- The renderer runs without direct access to Node.js; everything goes through the limited `window.api` of the preload script and IPC channels declared in one place (`src/shared/constants/ipc.ts`).
- Access tokens of private repositories are encrypted with `safeStorage`, are never exported and are never put into a command line or a URL.
- Repository URLs are strictly validated: only `https` and only `github.com` / `gitlab.com`, with no embedded credentials.
- A repository task never overwrites a foreign repository and never deletes an existing folder on cancellation.
- Copying never deletes anything in the destination.
- The order of tasks and labels received from the interface is validated before it is saved: it must be exactly the set of stored IDs.
- The size of the lists is limited, so the data files cannot grow without bounds.
- Links opened from the interface go to the system browser instead of a new application window.
- The portable build cannot download or start the installer: the restriction is enforced in the main process, not only in the interface.
- Developer tools and their shortcuts are disabled in the packaged application.

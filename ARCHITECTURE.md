# Architecture

This document describes the internal architecture of application, the responsibilities of its main processes and services, and how they interact with each other.

---

<br />

## 📦 Task System

The task system is the core of application.

Each task contains information about the source, destination, schedule, exclusions, and other task configuration.

A task can be executed in two ways:

```text
Manual execution
       ↓
CopyService
       ↓
File / Folder Copy
```

or:

```text
Scheduler
    ↓
Scheduled Task
    ↓
CopyService
    ↓
File / Folder Copy
```

When a task is created, updated, or deleted, the scheduler is automatically updated to reflect the current task configuration.

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

The application process must remain running for scheduled tasks to execute.

Application can remain active in the Windows system tray, allowing scheduled operations to continue without keeping the main application window open.

---

<br />

## 📁 Copy Operations

Application uses `fs-extra` for file system operations.

For every task, the destination path is constructed using the source name:

```text
destination = target / basename(source)
```

Both files and directories are supported.

Existing files are overwritten during the copy operation.

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

The excluded paths and their contents will not be copied.

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

Tasks can also be exported manually to another JSON file and imported later.

This makes it possible to back up or transfer task configurations between installations.

---

<br />

## 🖥 System Tray

Application can continue running in the Windows system tray.

By default, closing the main window does not necessarily terminate the application. Instead, the application can remain active in the tray so scheduled tasks can continue running.

The exact close behavior can be controlled through application settings.

This allows application to work as a background utility without keeping the main window visible.

---

<br />

## ⚙️ Application Services

The main process is organized into dedicated services, each responsible for a specific area of application functionality.

### `CopyService`

Responsible for:

- Copying files
- Copying directories
- Overwriting existing files
- Applying copy exclusions
- Reporting copy errors
- Showing task completion notifications

### `TaskService`

Coordinates the task-related services:

- Task storage
- Copy operations
- Scheduling
- IPC communication

### `TaskStorage`

Responsible for persistent task storage in JSON format.

### `SchedulerService`

Responsible for scheduling and rescheduling tasks using `node-cron`.

### `NotificationService`

Provides success and error notifications for task execution.

### `SettingsService`

Manages application settings such as:

- Auto-start
- Administrator startup
- Window/application behavior
- Other persistent application settings

### `TrayService`

Handles the Windows system tray integration.

### `WindowService`

Controls the main application window, including its state and window behavior.

### `SetupUpdater`

Provides application update functionality.

### `AppState`

Contains application-level state management.

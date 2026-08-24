# Copyflow (active development)

[![Electron](https://img.shields.io/badge/Electron-43-1a1a1a?style=for-the-badge&logo=electron&logoColor=white&labelColor=000000)](https://www.electronjs.org/)
[![Vite](https://img.shields.io/badge/Vite-Electron_Vite-1a1a1a?style=for-the-badge&logo=vite&logoColor=white&labelColor=000000)](https://electron-vite.org/)
[![React](https://img.shields.io/badge/React-19-1a1a1a?style=for-the-badge&logo=react&logoColor=white&labelColor=000000)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-1a1a1a?style=for-the-badge&logo=typescript&logoColor=white&labelColor=000000)](https://www.typescriptlang.org/)
[![Platform](https://img.shields.io/badge/Platform-Windows-1a1a1a?style=for-the-badge&labelColor=000000)](https://www.microsoft.com/windows)
[![License](https://img.shields.io/badge/License-MIT-1a1a1a?style=for-the-badge&labelColor=000000)](./LICENSE)

> [!WARNING]
> **Experimental - not ready for public consumption.** This SDK is under active
> development, has not been security audited, and may change without notice. Do
> not use it for production workloads or with production credentials.

A lightweight Windows desktop application for scheduling and automating local file and folder copy operations.

Application allows you to create copy tasks with a source and destination, configure an execution schedule, exclude specific files or directories, and run tasks automatically in the background.

---

<br />

## ✨ About

Application is designed to simplify recurring local file copy operations between drives, folders, removable storage devices, and other accessible locations.

A task consists of a single source and destination:

```text
[Source]
D:\Documents
    ↓
[Destination]
E:\Backup
    ↓
[Result]
E:\Backup\Documents
```

The source can be either a **file or a directory**, while the destination is a directory.

Tasks can be executed manually or automatically according to a configured schedule.

The application can remain running in the **Windows system tray**, allowing scheduled tasks to operate without keeping the main window open.

---

<br />

## 💡 Why this project exists

Application was created as a lightweight solution for automating repetitive local file copy operations.

The project focuses on:

- Simple task-based configuration
- Local file and folder operations
- Flexible scheduling
- Background execution
- Windows system integration
- Maintainable Electron architecture

Instead of manually copying the same folders on a regular basis, users can configure a task once and let application execute it automatically.

### 🤖 AI-Assisted Development

An important part of this project is the development process itself.

Application is being developed with the help of several free AI tools, with each model being used for a different role in the development workflow:

- **ChatGPT** - general-purpose development assistance, architecture discussions, implementation, documentation, and everyday development tasks.
- **Claude** - solving complex and fundamental technical problems, exploring architectural approaches, and working through more challenging engineering decisions.
- **Gemini** - refining concepts, improving existing solutions, exploring alternative approaches, and helping iterate on the project's overall direction.

Rather than relying on a single AI model, the project uses a **multi-model development approach**, where different AI systems are used according to their strengths.

The goal is not simply to generate code with AI, but to use AI as a development tool for **exploration, problem solving, iteration, and continuous improvement**, while keeping the overall architecture and technical decisions under human direction.

---

<br />

## 🚀 Features

### 📁 File & Folder Copying

- Copy individual files
- Copy entire directories recursively
- Preserve the source directory as part of the destination path
- Copy between local drives and folders
- Copy to removable storage such as USB drives
- Automatically overwrite existing files

### ⏰ Task Scheduling

- Run tasks manually
- Schedule tasks to run automatically
- Every N minutes
- Hourly
- Daily
- Weekly
- Enable or disable task scheduling
- Optional notifications after task execution

### 🚫 Copy Exceptions

- Exclude specific files from a task
- Exclude specific directories
- Select multiple files or directories as exclusions
- Excluded directories and their contents are skipped during copying

### 📋 Task Management

- Create copy tasks
- Edit existing tasks
- Delete tasks
- Run tasks manually
- Store tasks persistently
- Import tasks from JSON
- Export tasks to JSON

### 🔔 Notifications

- Success notifications for completed tasks
- Error notifications when a task fails

### 🖥 Windows Integration

- System tray support
- Run application in the background
- Configure application window behavior
- Optional behavior for closing the main window
- Optional application auto-start
- Application settings stored locally

### 🔄 Application Updates

- Built-in update infrastructure using `electron-updater`
- Application update support is part of the project architecture

---

<br />

## 🛠 Tech Stack

### Production

- **Electron** - desktop application runtime
- **React** - frontend UI
- **TypeScript** - application development
- **React Router** - frontend routing
- **fs-extra** - file and directory operations
- **node-cron** - task scheduling
- **electron-updater** - application updates
- **Electron Toolkit** - Electron preload and utility helpers

### Development

- **Vite / electron-vite** - development and build tooling
- **ESLint** - JavaScript/TypeScript linting
- **Stylelint** - CSS/SCSS linting
- **TypeScript ESLint** - TypeScript-aware linting
- **Prettier ESLint configuration** - formatting compatibility

---

<br />

## 🏗 Architecture

Follows the standard Electron architecture with a clear separation between the **main process**, **preload layer**, and **renderer application**.

For a detailed overview of the application architecture, services, data flow, and task lifecycle, see: [Architecture Documentation](./docs/ARCHITECTURE.md)

```text
src/
├── main/
│   └── services/
│       ├── AppState/
│       ├── CopyService/
│       ├── NotificationService/
│       ├── SchedulerService/
│       ├── SettingsService/
│       ├── SetupUpdater/
│       ├── TaskService/
│       ├── TrayService/
│       └── WindowService/
│
├── preload/
│   └── ...
│
└── renderer/
    └── ...
```

### Main Process

The main process contains the application's core functionality and system-level services.

### Preload

The preload layer provides a controlled API between the renderer process and Electron's main process.

### Renderer

The renderer communicates with the backend through IPC handlers rather than accessing Node.js APIs directly.

---

<br />

## 📦 Installation

Clone the repository:

```bash
git clone https://github.com/eugenevve/copyflow.git
cd copyflow
```

Install dependencies:

```bash
npm install
```

---

<br />

## 🚀 Development

Start the application in development mode:

```bash
npm run dev
```

The development environment is powered by `electron-vite`.

---

<br />

## 🔍 Code Quality

Run JavaScript and TypeScript linting:

```bash
npm run lint
```

Run CSS/SCSS linting:

```bash
npm run lint:css
```

The production build runs both linting steps before building the application.

---

<br />

## 🏗 Production Build

Build the application:

```bash
npm run build
```

Preview the generated Electron build:

```bash
npm run preview
```

The project includes an `electron-builder.yml` configuration for application packaging.

---

<br />

## 📦 Windows Installer

Create a Windows installer:

```bash
npm run build:win
```

This command first creates the production build and then packages the application using `electron-builder`.

The generated files are placed in the `dist` directory.

The Windows installer uses the NSIS target and provides:

- a selectable installation directory;
- desktop shortcut creation;
- application and installer icons;
- uninstaller support;
- MIT license information during installation.

The packaging configuration is defined in `package.json`.

### Build output

After a successful build, the Windows installer will be available in:

```text
dist/Copyflow-setup-1.0.0.exe
```

---

<br />

## ⚠️ Windows Security Notice

Application is currently distributed without a code-signing certificate.

Because the Windows executable is not digitally signed, Windows Defender SmartScreen or other Windows security components may display a warning when launching the application.

This does not necessarily indicate that the application is malicious. The warning is related to the executable not having a trusted digital signature.

Code signing and distribution configuration may be added in a future release.

---

<br />

## 🤝 Contribution

The project is currently under active development.

Suggestions, improvements, bug reports, and pull requests are welcome as the project evolves.

If you encounter an issue or have an idea for a new feature, feel free to open an issue or submit a pull request.

---

<br />

## 📄 License

This project is available under the **[MIT License](./LICENSE)**.

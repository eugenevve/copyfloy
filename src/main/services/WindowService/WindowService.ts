import { join } from "node:path";

import { is } from "@electron-toolkit/utils";
import iconPath from "@resources/icon.png?asset";
import { IWindowState, SettingsAction } from "@shared/types/window";
import { BrowserWindow, screen } from "electron";

import { WindowEvents } from "./WindowEvents";
import { WindowStateService } from "./WindowStateService";
import { appState } from "../AppState/AppState";
import { SettingsService } from "../SettingsService/SettingsService";

// Service responsible for creating and managing the main application window
export class WindowService {
  private mainWindow: BrowserWindow | null = null;

  constructor(
    private readonly settingsService: SettingsService,
    private readonly windowStateService: WindowStateService
  ) {}

  // Creates the main application window
  createMainWindow(): BrowserWindow {
    const isSilentStart = process.argv.includes("--hidden");
    const windowState = this.windowStateService.getState();

    const window = new BrowserWindow({
      width: windowState?.width ?? 700,
      height: windowState?.height ?? 500,
      useContentSize: false,
      minWidth: 600,
      minHeight: 450,
      show: false,
      autoHideMenuBar: true,
      frame: false,
      icon: iconPath,
      webPreferences: {
        preload: join(__dirname, "../preload/index.js"),
        sandbox: false,
        devTools: is.dev,
      },
    });

    this.mainWindow = window;

    this.restoreWindowState(window, windowState);
    this.initWindowEvents(window, isSilentStart);
    this.loadRenderer(window);

    return window;
  }

  // Restores the saved window position, size and maximized state
  private restoreWindowState(window: BrowserWindow, windowState: IWindowState | undefined): void {
    if (!windowState) {
      return;
    }

    if (
      windowState.x !== undefined &&
      windowState.y !== undefined &&
      this.windowStateService.isPositionVisible(windowState)
    ) {
      window.setPosition(Math.round(windowState.x), Math.round(windowState.y));

      window.setSize(Math.round(windowState.width), Math.round(windowState.height));
    } else {
      window.center();
    }

    if (windowState.isMaximized) {
      window.maximize();
    }
  }

  // Registers all BrowserWindow events
  private initWindowEvents(window: BrowserWindow, isSilentStart: boolean): void {
    const events = new WindowEvents(window, {
      isSilentStart,

      onResize: () => {
        this.scheduleWindowStateSave();
      },

      onMove: () => {
        this.scheduleWindowStateSave();
      },

      onMaximize: (isMaximized) => {
        window.webContents.send("window:maximized-change", isMaximized);
      },

      onClose: (event) => {
        this.handleWindowClose(event);
      },

      onClosed: () => {
        this.windowStateService.cancelPendingSave();
        this.mainWindow = null;
      },

      onBeforeInput: (event, input) => {
        this.handleBeforeInputEvent(event, input);
      },
    });

    events.init();
  }

  // Handles the window close event according to the current application settings
  private handleWindowClose(event: Electron.Event): void {
    const settings = this.settingsService.getSettings();

    if (settings.closeAction === SettingsAction.MINIMIZE && !appState.isQuitting) {
      event.preventDefault();
      this.mainWindow?.hide();
    }
  }

  // Schedules saving the current window state
  private scheduleWindowStateSave(): void {
    this.windowStateService.scheduleSave(() => {
      return this.getCurrentWindowState();
    });
  }

  // Builds the current window state
  private getCurrentWindowState(): IWindowState {
    const window = this.mainWindow;

    if (!window || window.isDestroyed()) {
      throw new Error("Main window is not available");
    }

    if (window.isMinimized() || window.isFullScreen()) {
      const previousState = this.windowStateService.getState();

      if (previousState) {
        return previousState;
      }
    }

    const isMaximized = window.isMaximized();

    const bounds = isMaximized ? window.getNormalBounds() : window.getBounds();

    let width = bounds.width;
    let height = bounds.height;

    // Windows can report resize borders differently when display scaling
    // is enabled. Use the actual window bounds in this case
    if (process.platform === "win32" && !isMaximized) {
      const display = screen.getDisplayMatching(bounds);

      if (display.scaleFactor > 1) {
        const realBounds = window.getBounds();

        width = realBounds.width;
        height = realBounds.height;
      }
    }

    return {
      width: Math.round(width),
      height: Math.round(height),
      x: Math.round(bounds.x),
      y: Math.round(bounds.y),
      isMaximized,
    };
  }

  // Blocks DevTools shortcuts in production
  private handleBeforeInputEvent(event: Electron.Event, input: Electron.Input): void {
    const controlOrMeta = process.platform === "darwin" ? input.meta : input.control;

    const isDevTools = (controlOrMeta && input.shift && input.key.toLowerCase() === "i") || input.key === "F12";

    if (isDevTools && !is.dev) {
      event.preventDefault();
    }
  }

  // Loads the Renderer application
  private loadRenderer(window: BrowserWindow): void {
    if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
      void window.loadURL(process.env["ELECTRON_RENDERER_URL"]);
    } else {
      void window.loadFile(join(__dirname, "../renderer/index.html"));
    }
  }

  // Restores the existing window or creates a new one
  restoreOrCreate(): void {
    if (!this.mainWindow) {
      this.createMainWindow();
      return;
    }

    const window = this.mainWindow;

    if (window.isMinimized()) {
      window.restore();
    }

    if (!window.isVisible()) {
      window.show();
    }

    window.focus();
  }

  // Closes the main window
  close(): void {
    this.mainWindow?.close();
  }

  // Minimizes the main window
  minimize(): void {
    this.mainWindow?.minimize();
  }

  // Toggles the maximized state
  toggleMaximize(): void {
    const window = this.mainWindow;

    if (!window) {
      return;
    }

    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
  }

  // Returns whether the main window is maximized
  isMaximized(): boolean {
    return this.mainWindow?.isMaximized() ?? false;
  }

  // Returns the current main window
  getWindow(): BrowserWindow | null {
    return this.mainWindow;
  }
}

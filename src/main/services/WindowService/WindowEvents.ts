import { BrowserWindow, shell } from "electron";

export interface WindowEventsOptions {
  isSilentStart: boolean;
  onResize: () => void;
  onMove: () => void;
  onMaximize: (isMaximized: boolean) => void;
  onClose: (event: Electron.Event) => void;
  onClosed: () => void;
  onBeforeInput: (event: Electron.Event, input: Electron.Input) => void;
}

// Handles BrowserWindow events
export class WindowEvents {
  constructor(
    private readonly window: BrowserWindow,
    private readonly options: WindowEventsOptions
  ) {}

  // Registers all BrowserWindow events
  init(): void {
    this.window.on("resize", () => {
      this.options.onResize();
    });

    this.window.on("move", () => {
      this.options.onMove();
    });

    this.window.on("maximize", () => {
      this.options.onMaximize(true);
    });

    this.window.on("unmaximize", () => {
      this.options.onMaximize(false);
    });

    this.window.on("ready-to-show", () => {
      if (!this.options.isSilentStart) {
        this.window.show();
      } else {
        console.log("[Window] Application started in silent mode (--hidden flag)!");
      }
    });

    this.window.on("close", (event) => {
      this.options.onClose(event);
    });

    this.window.on("closed", () => {
      this.options.onClosed();
    });

    this.window.webContents.on("before-input-event", (event, input) => {
      this.options.onBeforeInput(event, input);
    });

    this.window.webContents.setWindowOpenHandler((details) => {
      void shell.openExternal(details.url);

      return {
        action: "deny",
      };
    });
  }
}

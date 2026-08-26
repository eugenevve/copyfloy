export interface IWindowState {
  width: number;
  height: number;
  x?: number;
  y?: number;
  isMaximized: boolean;
}

export interface IAppSettings {
  closeAction: SettingsAction.QUIT | SettingsAction.MINIMIZE;
  autoStart: boolean;
  runAsAdmin: boolean;
  windowState?: IWindowState;
  isSidebarOpen: boolean;
}

export enum SettingsAction {
  QUIT = "quit",
  MINIMIZE = "minimize",
}

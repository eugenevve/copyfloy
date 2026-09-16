export interface IWindowState {
  isMaximized: boolean;
  width: number;
  height: number;
  x?: number;
  y?: number;
}

export interface IAppSettings {
  closeAction: SettingsAction.QUIT | SettingsAction.MINIMIZE;
  windowState?: IWindowState;
  runAdmin: boolean;
  autoStart: boolean;
  sidebarOpen: boolean;
  zoomFactor: number;
}

export enum SettingsAction {
  QUIT = "quit",
  MINIMIZE = "minimize",
}

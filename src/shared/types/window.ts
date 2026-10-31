import { IDateTimeFormat } from "./settings";

export interface IAppSettings {
  windowState?: IWindowState;
  autoStart: boolean;
  runAdmin: boolean;
  sidebarOpen: boolean;
  zoomFactor: number;
  minimizeTray: boolean;
  dateTimeFormat: IDateTimeFormat;
}

export interface IWindowState {
  isMaximized: boolean;
  width: number;
  height: number;
  x?: number;
  y?: number;
}

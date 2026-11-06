import { ipcRenderer, IpcRendererEvent } from "electron";

export const invoke = <T>(channel: string, ...args: unknown[]) => {
  return ipcRenderer.invoke(channel, ...args) as Promise<T>;
};

export const receive = <T>(channel: string, callback: (value: T) => void) => {
  const listener = (_event: IpcRendererEvent, value: T) => {
    callback(value);
  };

  ipcRenderer.on(channel, listener);

  return () => {
    ipcRenderer.removeListener(channel, listener);
  };
};

export const receiveNoData = (channel: string, callback: () => void) => {
  const listener = () => {
    callback();
  };

  ipcRenderer.on(channel, listener);

  return () => {
    ipcRenderer.removeListener(channel, listener);
  };
};

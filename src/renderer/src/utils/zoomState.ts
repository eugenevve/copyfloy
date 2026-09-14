import { clampZoom, STANDART_ZOOM } from "@shared/constants/zoom";

type Listener = (zoom: number) => void;

let zoomFactor = STANDART_ZOOM;
const listeners = new Set<Listener>();

export const getZoom = (): number => zoomFactor;

export const subscribeZoom = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const setZoom = (value: number): void => {
  zoomFactor = clampZoom(value);
  listeners.forEach((listener) => listener(zoomFactor));
  void window.api?.settings?.zoom?.set(zoomFactor);
};

export const initZoom = async (): Promise<void> => {
  const saved = await window.api?.settings?.zoom?.get();
  if (typeof saved === "number") {
    zoomFactor = clampZoom(saved);
    listeners.forEach((listener) => listener(zoomFactor));
  }
};

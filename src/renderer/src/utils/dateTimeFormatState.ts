import { DateFormat, IDateTimeFormat, TimeFormat } from "@shared/types/settings";

const DEFAULT_FORMAT: IDateTimeFormat = {
  dateFormat: DateFormat.DMY,
  timeFormat: TimeFormat.TWENTY_FOUR_HOUR,
};

type Listener = () => void;

let dateTimeFormat = DEFAULT_FORMAT;
const listeners = new Set<Listener>();

export const getDateTimeFormat = (): IDateTimeFormat => dateTimeFormat;

export const subscribeDateTimeFormat = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const setDateTimeFormat = (format: IDateTimeFormat): void => {
  dateTimeFormat = format;
  listeners.forEach((listener) => listener());
  void window.api?.settings?.dateTimeFormat?.set(format);
};

export const initDateTimeFormat = async (): Promise<void> => {
  const saved = await window.api?.settings?.dateTimeFormat?.get();
  if (!saved) return;

  dateTimeFormat = {
    dateFormat: Object.values(DateFormat).includes(saved.dateFormat) ? saved.dateFormat : DEFAULT_FORMAT.dateFormat,
    timeFormat: Object.values(TimeFormat).includes(saved.timeFormat) ? saved.timeFormat : DEFAULT_FORMAT.timeFormat,
  };
  listeners.forEach((listener) => listener());
};

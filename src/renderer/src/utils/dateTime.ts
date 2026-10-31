import { DateFormat, IDateTimeFormat, TimeFormat } from "@shared/types/settings";

const pad = (value: number): string => String(value).padStart(2, "0");

export const formatDate = (date: Date, dateFormat: DateFormat, includeYear = true): string => {
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = String(date.getFullYear());
  const monthFirst = [DateFormat.MDY, DateFormat.MDY_DOT, DateFormat.MDY_HYPHEN].includes(dateFormat);
  const yearFirst = [DateFormat.YMD, DateFormat.YMD_DOT, DateFormat.YMD_SLASH].includes(dateFormat);
  const separator = [DateFormat.DMY_DOT, DateFormat.MDY_DOT, DateFormat.YMD_DOT].includes(dateFormat)
    ? "."
    : [DateFormat.DMY_HYPHEN, DateFormat.MDY_HYPHEN, DateFormat.YMD].includes(dateFormat)
      ? "-"
      : "/";

  const dateParts = monthFirst || yearFirst ? [month, day] : [day, month];
  if (includeYear) dateParts.splice(yearFirst ? 0 : 2, 0, year);

  return dateParts.join(separator);
};

export const formatTime = (date: Date, timeFormat: TimeFormat): string => {
  const hours = date.getHours();
  const minutes = pad(date.getMinutes());

  if (timeFormat === TimeFormat.TWELVE_HOUR) {
    return `${hours % 12 || 12}:${minutes} ${hours < 12 ? "AM" : "PM"}`;
  }

  return `${pad(hours)}:${minutes}`;
};

export const formatDateTime = (date: Date, format: IDateTimeFormat): string =>
  `${formatDate(date, format.dateFormat)} ${formatTime(date, format.timeFormat)}`;

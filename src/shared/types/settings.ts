export interface IDateTimeFormat {
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
}

export enum DateFormat {
  DMY = "DMY",
  DMY_DOT = "DMY_DOT",
  DMY_HYPHEN = "DMY_HYPHEN",
  MDY = "MDY",
  MDY_DOT = "MDY_DOT",
  MDY_HYPHEN = "MDY_HYPHEN",
  YMD = "YMD",
  YMD_DOT = "YMD_DOT",
  YMD_SLASH = "YMD_SLASH",
}

export enum TimeFormat {
  TWELVE_HOUR = "12-hour",
  TWENTY_FOUR_HOUR = "24-hour",
}

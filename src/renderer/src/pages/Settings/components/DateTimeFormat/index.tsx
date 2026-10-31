import { Select } from "@app/ui/Select";
import { getDateTimeFormat, setDateTimeFormat, subscribeDateTimeFormat } from "@app/utils/dateTimeFormatState";
import { DateFormat, TimeFormat } from "@shared/types/settings";
import { FC, useSyncExternalStore } from "react";

import { WidgetContainer } from "../WidgetContainer";

const DATE_FORMAT_OPTIONS = [
  { label: "DD/MM/YYYY", value: DateFormat.DMY },
  { label: "DD.MM.YYYY", value: DateFormat.DMY_DOT },
  { label: "DD-MM-YYYY", value: DateFormat.DMY_HYPHEN },
  { label: "MM/DD/YYYY", value: DateFormat.MDY },
  { label: "MM.DD.YYYY", value: DateFormat.MDY_DOT },
  { label: "MM-DD-YYYY", value: DateFormat.MDY_HYPHEN },
  { label: "YYYY-MM-DD", value: DateFormat.YMD },
  { label: "YYYY.MM.DD", value: DateFormat.YMD_DOT },
  { label: "YYYY/MM/DD", value: DateFormat.YMD_SLASH },
];

const TIME_FORMAT_OPTIONS = [
  { label: "24-hour (13:00)", value: TimeFormat.TWENTY_FOUR_HOUR },
  { label: "12-hour (AM/PM)", value: TimeFormat.TWELVE_HOUR },
];

export const DateTimeFormatWidget: FC = () => {
  const format = useSyncExternalStore(subscribeDateTimeFormat, getDateTimeFormat);

  return (
    <WidgetContainer title="Date & Time Format">
      <Select
        label="Date format"
        value={format.dateFormat}
        options={DATE_FORMAT_OPTIONS}
        onChange={(dateFormat) => setDateTimeFormat({ ...format, dateFormat: dateFormat as DateFormat })}
      />
      <Select
        label="Time format"
        value={format.timeFormat}
        options={TIME_FORMAT_OPTIONS}
        onChange={(timeFormat) => setDateTimeFormat({ ...format, timeFormat: timeFormat as TimeFormat })}
      />
    </WidgetContainer>
  );
};

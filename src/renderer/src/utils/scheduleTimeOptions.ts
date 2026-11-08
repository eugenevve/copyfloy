import { ISelectOption } from "@app/ui/Select/Select.types";

export enum ScheduleMeridiemEnum {
  AM = "AM",
  PM = "PM",
}

const HOURS_ONE_TO_ELEVEN: ISelectOption[] = Array.from({ length: 11 }, (_, index) => ({
  label: String(index + 1),
  value: String(index + 1),
}));

export const SCHEDULE_HOUR_OPTIONS_12: Record<ScheduleMeridiemEnum, ISelectOption[]> = {
  [ScheduleMeridiemEnum.AM]: [{ label: "12", value: "12" }, ...HOURS_ONE_TO_ELEVEN],
  [ScheduleMeridiemEnum.PM]: [{ label: "12", value: "12" }, ...HOURS_ONE_TO_ELEVEN],
};

export const SCHEDULE_HOUR_OPTIONS_24: ISelectOption[] = Array.from({ length: 24 }, (_, hour) => ({
  label: String(hour).padStart(2, "0"),
  value: String(hour),
}));

export const SCHEDULE_MERIDIEM_OPTIONS: ISelectOption[] = [
  { label: ScheduleMeridiemEnum.AM, value: ScheduleMeridiemEnum.AM },
  { label: ScheduleMeridiemEnum.PM, value: ScheduleMeridiemEnum.PM },
];

export const SCHEDULE_MINUTE_OPTIONS: ISelectOption[] = Array.from({ length: 60 }, (_, minute) => ({
  label: String(minute),
  value: String(minute),
}));

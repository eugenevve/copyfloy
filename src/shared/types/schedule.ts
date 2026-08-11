export interface IScheduleConfig {
  type: ScheduleType;
  notify: boolean;
  hours?: number;
  minutes?: number;
  interval?: number;
  days?: number[];
}

export enum ScheduleType {
  DISABLED = "disabled",
  DAILY = "daily",
  HOURLY = "hourly",
  MINUTES = "minutes",
  WEEKLY = "weekly",
}

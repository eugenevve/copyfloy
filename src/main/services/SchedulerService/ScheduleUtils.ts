import { IScheduleConfig, ScheduleType } from "@shared/types/schedule";

// Converts an application schedule configuration to a cron expression
// Returns null if the schedule is disabled or cannot be converted to a valid cron expression
export function convertToCron(config: IScheduleConfig): string | null {
  const { type, hours = 0, minutes = 0, interval = 5, days = [] } = config;

  switch (type) {
    case ScheduleType.MINUTES:
      return `*/${interval} * * * *`;

    case ScheduleType.HOURLY:
      return `${minutes} * * * *`;

    case ScheduleType.DAILY:
      return `${minutes} ${hours} * * *`;

    case ScheduleType.WEEKLY: {
      const cronDays = days.map((day) => (day === 7 ? 0 : day)).join(",");

      return cronDays ? `${minutes} ${hours} * * ${cronDays}` : null;
    }

    case ScheduleType.DISABLED:
    default:
      return null;
  }
}

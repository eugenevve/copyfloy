import { DAYS_LIST } from "@app/utils/daysList";
import { ISchedule, ScheduleType } from "@shared/types/schedule";

const pad = (value = 0) => String(value).padStart(2, "0");

export const getScheduleText = (schedule?: ISchedule) => {
  if (!schedule) return "";

  const time = `${pad(schedule.hours)}:${pad(schedule.minutes)}`;

  switch (schedule.type) {
    case ScheduleType.DAILY:
      return `Daily at ${time}`;
    case ScheduleType.HOURLY:
      return `Every hour at :${pad(schedule.minutes)}`;
    case ScheduleType.MINUTES:
      return `Every ${schedule.interval ?? 0} min`;
    case ScheduleType.WEEKLY: {
      const days = (schedule.days ?? []).map((day) => DAYS_LIST[day - 1]).filter(Boolean);
      return `${days.map((day) => day.label).join(", ")} at ${time}`;
    }
    default:
      return "";
  }
};

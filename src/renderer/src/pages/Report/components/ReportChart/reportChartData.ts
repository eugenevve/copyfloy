import { IReportRecord, ReportStatus } from "@shared/types/report";

export interface IReportChartData {
  date: Date;
  label: string;
  success: number;
  error: number;
}

const DAY_COUNT = 14;

export const getReportChartData = (records: IReportRecord[]): IReportChartData[] => {
  const countsByDay = new Map<number, { success: number; error: number }>();

  records.forEach((record) => {
    const day = new Date(record.startedAt);
    day.setHours(0, 0, 0, 0);
    const timestamp = day.getTime();
    const counts = countsByDay.get(timestamp) ?? { success: 0, error: 0 };

    if (record.status === ReportStatus.SUCCESS) {
      counts.success += 1;
    } else {
      counts.error += 1;
    }

    countsByDay.set(timestamp, counts);
  });

  if (countsByDay.size === 0) {
    return [];
  }

  const lastDay = new Date(Math.max(...countsByDay.keys()));

  return Array.from({ length: DAY_COUNT }, (_, index) => {
    const date = new Date(lastDay);
    date.setDate(lastDay.getDate() - (DAY_COUNT - index - 1));
    date.setHours(0, 0, 0, 0);
    const counts = countsByDay.get(date.getTime());

    return {
      date,
      label: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      success: counts?.success ?? 0,
      error: counts?.error ?? 0,
    };
  });
};

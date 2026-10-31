import { IReportRecord, ReportStatus } from "@shared/types/report";

export interface IReportDayChartData {
  label: string;
  success: number;
  error: number;
}

const HOURS_IN_DAY = 24;

const getDayStart = (timestamp: number): number => {
  const day = new Date(timestamp);
  day.setHours(0, 0, 0, 0);
  return day.getTime();
};

const getHourLabel = (hour: number, isTwelveHour: boolean): string => {
  if (isTwelveHour) {
    return `${hour % 12 || 12} ${hour < 12 ? "AM" : "PM"}`;
  }

  return `${String(hour).padStart(2, "0")}:00`;
};

// Day start timestamps, newest first
export const getAvailableDays = (records: IReportRecord[]): number[] =>
  Array.from(new Set(records.map((record) => getDayStart(record.startedAt)))).sort((a, b) => b - a);

export const getReportDayChartData = (
  records: IReportRecord[],
  dayStart: number,
  isTwelveHour: boolean
): IReportDayChartData[] => {
  const data: IReportDayChartData[] = Array.from({ length: HOURS_IN_DAY }, (_, hour) => ({
    label: getHourLabel(hour, isTwelveHour),
    success: 0,
    error: 0,
  }));

  records.forEach((record) => {
    if (getDayStart(record.startedAt) !== dayStart) return;

    const hourData = data[new Date(record.startedAt).getHours()];
    if (record.status === ReportStatus.SUCCESS) {
      hourData.success += 1;
    } else {
      hourData.error += 1;
    }
  });

  return data;
};

import { IReportRecord } from "@shared/types/report";

export interface IReportChartSwitcher {
  records: IReportRecord[];
}

export enum ChartView {
  WEEKS = "weeks",
  HOURS = "hours",
}

export interface IReportRecord {
  id: number;
  taskId: number;
  taskName: string;
  startedAt: number;
  durationMs: number;
  status: ReportStatus;
  filesCopied?: number;
  filesSkipped: number;
  totalBytes?: number;
  error?: string;
}

export enum ReportStatus {
  SUCCESS = "success",
  ERROR = "error",
}

export interface IReport {
  totalTasks: number;
  successCount: number;
  errorCount: number;
  records: IReportRecord[];
}

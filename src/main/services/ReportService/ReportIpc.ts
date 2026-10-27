import { IPC_CHANNELS } from "@shared/constants/ipc";
import { IReport, ReportStatus } from "@shared/types/report";
import { ipcMain } from "electron";

import { ReportStorage } from "./ReportStorage";
import { TaskStorage } from "../TaskService/TaskStorage";

export class ReportIpc {
  constructor(
    private readonly reportStorage: ReportStorage,
    private readonly taskStorage: TaskStorage
  ) {}

  init(): void {
    // Handle fetching the report data
    ipcMain.handle(IPC_CHANNELS.report.get, (): IReport => {
      const records = this.reportStorage.load();

      return {
        totalTasks: this.taskStorage.load().length,
        successCount: records.filter((record) => record.status === ReportStatus.SUCCESS).length,
        errorCount: records.filter((record) => record.status === ReportStatus.ERROR).length,
        records: records.toReversed(),
      };
    });

    // Handle clearing the report history
    ipcMain.handle(IPC_CHANNELS.report.clear, (): void => {
      this.reportStorage.save([]);
    });
  }
}

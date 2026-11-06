import { IPC_CHANNELS } from "@shared/constants/ipc";
import { ipcMain } from "electron";

import type { MissedTaskService } from "./MissedTaskService";

export class MissedTaskIpc {
  constructor(private readonly missedTaskService: MissedTaskService) {}

  init() {
    // Handle IPC requests related to missed tasks
    ipcMain.handle(IPC_CHANNELS.tasks.getMissed, () => this.missedTaskService.getMissed());

    // Handle IPC request to dismiss a missed task
    ipcMain.handle(IPC_CHANNELS.tasks.dismissMissed, (_, taskId: number) => this.missedTaskService.dismiss(taskId));
  }
}

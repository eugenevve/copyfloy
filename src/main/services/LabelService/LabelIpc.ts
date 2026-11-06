import { IPC_CHANNELS } from "@shared/constants/ipc";
import { ILabel } from "@shared/types/labels";
import { ipcMain } from "electron";

import type { LabelService } from "./LabelService";

export class LabelIpc {
  constructor(private readonly labelService: LabelService) {}

  init() {
    // Handle IPC request to get all labels
    ipcMain.handle(IPC_CHANNELS.labels.get, () => this.labelService.get());

    // Handle IPC request to create a new label
    ipcMain.handle(IPC_CHANNELS.labels.save, (_, newLabel: Omit<ILabel, "id">) => this.labelService.create(newLabel));

    // Handle IPC request to update a label
    ipcMain.handle(IPC_CHANNELS.labels.update, (_, updatedLabel: ILabel) => this.labelService.update(updatedLabel));

    // Handle IPC request to delete a label
    ipcMain.handle(IPC_CHANNELS.labels.delete, (_, id: number) => this.labelService.delete(id));

    // Handle IPC request to reorder labels
    ipcMain.handle(IPC_CHANNELS.labels.reorder, (_, orderedIds: number[]) => this.labelService.reorder(orderedIds));
  }
}

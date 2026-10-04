import { IPC_CHANNELS } from "@shared/constants/ipc";
import { ILabel } from "@shared/types/labels";
import { ipcMain } from "electron";

import { LabelStorage } from "./LabelStorage";
import { TaskStorage } from "../TaskService/TaskStorage";

export class LabelIpc {
  constructor(
    private readonly labelStorage: LabelStorage,
    private readonly taskStorage: TaskStorage
  ) {}

  init(): void {
    // Get labels
    ipcMain.handle(IPC_CHANNELS.labels.get, () => {
      return this.labelStorage.load();
    });

    // Create a new label
    ipcMain.handle(IPC_CHANNELS.labels.save, (_, newLabel: Omit<ILabel, "id">) => {
      const labels = this.labelStorage.load();

      const label: ILabel = {
        id: Date.now(),
        ...newLabel,
      };

      labels.push(label);

      this.labelStorage.save(labels);

      return labels;
    });

    // Update a label
    ipcMain.handle(IPC_CHANNELS.labels.update, (_, updatedLabel: ILabel) => {
      const labels = this.labelStorage.load().map((label) => {
        return label.id === updatedLabel.id ? updatedLabel : label;
      });

      this.labelStorage.save(labels);

      return labels;
    });

    // Delete a label
    ipcMain.handle(IPC_CHANNELS.labels.delete, (_, id: number) => {
      const labels = this.labelStorage.load().filter((label) => label.id !== id);
      const tasks = this.taskStorage.load().map((task) => ({
        ...task,
        labelsIds: task.labelsIds?.filter((labelId) => labelId !== id),
      }));

      this.labelStorage.save(labels);
      this.taskStorage.save(tasks);

      return labels;
    });
  }
}

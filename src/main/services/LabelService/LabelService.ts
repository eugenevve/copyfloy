import { reorderDisplayIds } from "@main/utils/reorderDisplayIds";
import { MAX_LIST_ITEMS } from "@shared/constants/limits";
import { ILabel } from "@shared/types/labels";

import { LabelStorage } from "./LabelStorage";
import { TaskStorage } from "../TaskService/TaskStorage";

export class LabelService {
  private readonly labelStorage: LabelStorage;
  private readonly taskStorage: TaskStorage;

  constructor(taskStorage: TaskStorage) {
    this.taskStorage = taskStorage;
    this.labelStorage = new LabelStorage();
  }

  get() {
    return this.labelStorage.load();
  }

  create(newLabel: Omit<ILabel, "id">) {
    const labels = this.labelStorage.load();

    if (labels.length >= MAX_LIST_ITEMS) {
      return labels;
    }

    labels.push({ id: Date.now(), ...newLabel });
    this.labelStorage.save(labels);

    return labels;
  }

  update(updatedLabel: ILabel) {
    const labels = this.labelStorage.load().map((label) => (label.id === updatedLabel.id ? updatedLabel : label));

    this.labelStorage.save(labels);

    return labels;
  }

  delete(id: number) {
    const labels = this.labelStorage.load().filter((label) => label.id !== id);
    const tasks = this.taskStorage.load().map((task) => ({
      ...task,
      labelsIds: task.labelsIds?.filter((labelId) => labelId !== id),
    }));

    this.labelStorage.save(labels);
    this.taskStorage.save(tasks);

    return labels;
  }

  reorder(orderedIds: number[]) {
    const labels = this.labelStorage.load();
    const reorderedLabels = reorderDisplayIds(labels, orderedIds);

    if (!reorderedLabels) {
      return labels;
    }

    this.labelStorage.save(reorderedLabels);

    return reorderedLabels;
  }
}

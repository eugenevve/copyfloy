import { ILabel } from "@shared/types/labels";
import { ITask } from "@shared/types/tasks";

export interface ITaskList {
  items: ITask[];
  labels: ILabel[];
  reorder: boolean;
  onRun: (task: ITask) => void;
  onSchedule: (task: ITask) => void;
  onEdit: (task: ITask) => void;
  onDelete: (task: ITask) => void;
  onPin: (task: ITask) => void;
  onReorder: (orderedIds: number[]) => void;
}

import { ILabel } from "@shared/types/labels";
import { ITask } from "@shared/types/tasks";

export interface ITaskList {
  items: ITask[];
  labels: ILabel[];
  reorder: boolean;
  progress: Record<number, number>;
  gitAvailable: boolean | null;
  onRun: (task: ITask) => void;
  onStop: (task: ITask) => void;
  onSchedule: (task: ITask) => void;
  onEdit: (task: ITask) => void;
  onDelete: (task: ITask) => void;
  onPin: (task: ITask) => void;
  onReorder: (orderedIds: number[]) => void;
}

import { ITask } from "@shared/types/tasks";

export interface ITaskList {
  items: ITask[];
  onRun: (item: ITask) => void;
  onSchedule: (item: ITask) => void;
  onEdit: (item: ITask) => void;
  onDelete: (item: ITask) => void;
}

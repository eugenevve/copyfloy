import { ITask } from "@shared/types/tasks";

export interface ITaskList {
  items: ITask[];
  onRun: (task: ITask) => void;
  onSchedule: (task: ITask) => void;
  onEdit: (task: ITask) => void;
  onDelete: (task: ITask) => void;
}

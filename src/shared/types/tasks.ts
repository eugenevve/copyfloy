import { IScheduleConfig } from "./schedule";

export interface ITaskItem {
  task: Task;
  onRun: () => void;
  onEdit: () => void;
  onSchedule: () => void;
  onDelete: () => void;
}

export interface Task {
  id: number;
  name: string;
  type: TaskType;
  source: string;
  target: string;
  schedule?: IScheduleConfig;
  exceptions?: string[];
}

export enum TaskType {
  FILE = "file",
  FOLDER = "folder",
}

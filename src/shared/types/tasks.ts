import { ILabel } from "./labels";
import { IScheduleConfig } from "./schedule";

export interface ITaskItem {
  task: ITask;
  labels: ILabel[];
  onRun: () => void;
  onSchedule: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPin: () => void;
}

export interface ITask {
  id: number;
  name: string;
  type: TaskType;
  source: string;
  target: string;
  schedule?: IScheduleConfig;
  exceptions?: string[];
  labelsIds?: number[];
  isPinned?: boolean;
}

export enum TaskType {
  FOLDER = "folder",
  FILE = "file",
}

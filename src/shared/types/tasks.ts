import { ILabel } from "./labels";
import { ISchedule } from "./schedule";

export interface ITaskItem {
  task: ITask;
  labels: ILabel[];
  reorder: boolean;
  dimmed?: boolean;
  progress?: number;
  gitAvailable: boolean | null;
  onRun: () => void;
  onStop: () => void;
  onSchedule: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPin: () => void;
}

export interface ITaskProgress {
  taskId: number;
  percent: number | null;
}

export interface ITask {
  id: number;
  name: string;
  type: TaskType;
  source: string;
  target: string;
  schedule?: ISchedule;
  exceptions?: string[];
  labelsIds?: number[];
  isPinned?: boolean;
  repositoryProvider?: RepositoryProvider;
  isPrivate?: boolean;
  accessToken?: string;
  isArchive?: boolean;
}

export enum TaskType {
  FOLDER = "folder",
  FILE = "file",
  REPOSITORY = "repository",
}

export enum RepositoryProvider {
  GITHUB = "github",
  GITLAB = "gitlab",
}

export enum RepositoryVisibility {
  PUBLIC = "public",
  PRIVATE = "private",
}

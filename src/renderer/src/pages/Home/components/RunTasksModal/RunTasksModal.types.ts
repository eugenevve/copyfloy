import { ITask } from "@shared/types/tasks";

export interface IRunTasksModal {
  allTasks: ITask[];
  matchingTasks: ITask[];
  onClose: () => void;
  onRun: (tasks: ITask[]) => void;
}

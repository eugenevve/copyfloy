import { ILabel } from "./labels";
import { ITask } from "./tasks";

export interface ITaskTransfer {
  tasks: ITask[];
  labels: ILabel[];
}

export enum ImportMode {
  ADD = "add",
  REPLACE = "replace",
}

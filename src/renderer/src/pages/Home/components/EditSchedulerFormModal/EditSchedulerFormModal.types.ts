import { ITask } from "@shared/types/tasks";

export interface IEditSchedulerFormModal {
  initialData: ITask;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}

import { ITask } from "@shared/types/tasks";

export interface IEditTaskFormModal {
  initialData?: ITask | null;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}

export enum FormField {
  SOURCE = "source",
  TARGET = "target",
}

import { TaskType } from "@shared/types/tasks";

export interface IExceptionChoiceModal {
  onClose: () => void;
  onSelect: (mode: TaskType.FILE | TaskType.FOLDER) => void;
}

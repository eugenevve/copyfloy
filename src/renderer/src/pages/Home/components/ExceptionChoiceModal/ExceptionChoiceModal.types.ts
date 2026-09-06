import { TaskType } from "@shared/types/tasks";

export interface IExceptionChoiceModal {
  onClose: () => void;
  onSelect: (mode: TaskType.FOLDER | TaskType.FILE) => void;
}

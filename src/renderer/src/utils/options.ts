import { TaskType } from "@shared/types/tasks";

export const TYPE_OPTIONS_FILTER = [
  { label: "All", value: "all" },
  { label: "Files", value: TaskType.FILE },
  { label: "Folders", value: TaskType.FOLDER },
];

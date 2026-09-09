import { IRadioOption } from "@app/ui/RadioGroup/RadioGroup.types";
import { ScheduleType } from "@shared/types/schedule";
import { TaskType } from "@shared/types/tasks";

export const TYPE_OPTIONS_EDIT: IRadioOption<TaskType>[] = [
  { label: "Folder", value: TaskType.FOLDER },
  { label: "File", value: TaskType.FILE },
];

export const TYPE_OPTIONS_FILTER = [
  { label: "All", value: "all" },
  { label: "Files", value: TaskType.FILE },
  { label: "Folders", value: TaskType.FOLDER },
];

export const TYPE_OPTIONS_SCHEDULE = [
  { label: "Disabled", value: ScheduleType.DISABLED },
  { label: "Every day", value: ScheduleType.DAILY },
  { label: "Every hour", value: ScheduleType.HOURLY },
  { label: "Every N minutes", value: ScheduleType.MINUTES },
  { label: "By day of week", value: ScheduleType.WEEKLY },
];

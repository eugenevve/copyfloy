import { IRadioOption } from "@app/ui/RadioGroup/RadioGroup.types";
import { ScheduleType } from "@shared/types/schedule";
import { TaskType, RepositoryProvider, RepositoryVisibility } from "@shared/types/tasks";

export const TYPE_OPTIONS_EDIT: IRadioOption<TaskType>[] = [
  { label: "Folder", value: TaskType.FOLDER },
  { label: "File", value: TaskType.FILE },
  { label: "Repository", value: TaskType.REPOSITORY },
];

export const REPOSITORY_PROVIDER_OPTIONS = [
  { label: "GitHub", value: RepositoryProvider.GITHUB },
  { label: "GitLab", value: RepositoryProvider.GITLAB },
];

export const VISIBILITY_OPTIONS = [
  { label: "Public", value: RepositoryVisibility.PUBLIC },
  { label: "Private", value: RepositoryVisibility.PRIVATE },
];

export const TYPE_OPTIONS_FILTER = [
  { label: "All", value: "all" },
  { label: "Files", value: TaskType.FILE },
  { label: "Folders", value: TaskType.FOLDER },
  { label: "Repositories", value: TaskType.REPOSITORY },
];

export const TYPE_OPTIONS_SCHEDULE = [
  { label: "Disabled", value: ScheduleType.DISABLED },
  { label: "Every day", value: ScheduleType.DAILY },
  { label: "Every hour", value: ScheduleType.HOURLY },
  { label: "Every N minutes", value: ScheduleType.MINUTES },
  { label: "By day of week", value: ScheduleType.WEEKLY },
];

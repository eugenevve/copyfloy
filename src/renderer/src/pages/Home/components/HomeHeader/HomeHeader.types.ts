import type { TaskType } from "@shared/types/tasks";

export interface IHomeHeader {
  count: number;
  onAddTask: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: TaskType | "all";
  onTypeFilterChange: (value: TaskType | "all") => void;
}

import { ITask, TaskType } from "@shared/types/tasks";
import { useState } from "react";

export const useTaskFilter = (tasks: ITask[]) => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TaskType | "all">("all");

  const filteredTasks = tasks.filter((task) => {
    const matchesType = typeFilter === "all" || task.type === typeFilter;
    const matchesSearch = task.name.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return {
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    filteredTasks,
  };
};

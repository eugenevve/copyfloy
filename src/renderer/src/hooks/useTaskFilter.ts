import { ITask, TaskType } from "@shared/types/tasks";
import { useState } from "react";

export const useTaskFilter = (tasks: ITask[]) => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TaskType | "all">("all");
  const [selectedLabelIds, setSelectedLabelIds] = useState<number[]>([]);

  const toggleLabel = (id: number) => {
    setSelectedLabelIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesType = typeFilter === "all" || task.type === typeFilter;
    const matchesSearch = task.name.toLowerCase().includes(search.toLowerCase());
    const matchesLabels = selectedLabelIds.length === 0 || selectedLabelIds.some((id) => task.labelsIds?.includes(id));
    return matchesType && matchesSearch && matchesLabels;
  });

  return {
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    selectedLabelIds,
    toggleLabel,
    filteredTasks,
  };
};

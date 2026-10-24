import { ITask } from "@shared/types/tasks";
import { useEffect, useState } from "react";

export const useTasks = () => {
  const [tasks, setTasks] = useState<ITask[]>([]);

  const fetchTasks = async () => {
    const data = await window.api.tasks.get();
    setTasks(data);
  };

  const runTask = async (task: ITask) => {
    await window.api.tasks.run(task);
  };

  const deleteTask = async (id: number) => {
    const updatedTasks = await window.api.tasks.delete(id);
    setTasks(updatedTasks);
  };

  const updateTask = async (task: ITask) => {
    const updatedTasks = await window.api.tasks.update(task);
    setTasks(updatedTasks);
  };

  const reorderTasks = async (ids: number[]) => {
    setTasks((prev) => prev.toSorted((a, b) => ids.indexOf(b.id) - ids.indexOf(a.id)));
    await window.api.tasks.reorder(ids);
  };

  useEffect(() => {
    void window.api.tasks.get().then(setTasks);
  }, []);

  return {
    tasks,
    fetchTasks,
    runTask,
    deleteTask,
    updateTask,
    reorderTasks,
  };
};

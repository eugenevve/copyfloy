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

  useEffect(() => {
    void window.api.tasks.get().then(setTasks);
  }, []);

  return {
    tasks,
    fetchTasks,
    runTask,
    deleteTask,
  };
};

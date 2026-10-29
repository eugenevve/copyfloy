import { ITask } from "@shared/types/tasks";
import { useEffect, useState } from "react";

export const useTasks = () => {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [progress, setProgress] = useState<Record<number, number>>({});
  const [gitAvailable, setGitAvailable] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    const data = await window.api.tasks.get();
    setTasks(data);
  };

  const runTask = async (task: ITask) => {
    await window.api.tasks.run(task);
  };

  const stopTask = async (id: number) => {
    await window.api.tasks.stop(id);
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
    void window.api.tasks
      .get()
      .then(setTasks)
      .finally(() => setIsLoading(false));
    void window.api.tasks.getRunning().then(setProgress);
    void window.api.tasks
      .isGitAvailable()
      .then(setGitAvailable)
      .catch(() => setGitAvailable(false));

    return window.api.tasks.onProgress(({ taskId, percent }) => {
      setProgress((prev) => {
        const next = { ...prev };

        if (percent === null) {
          delete next[taskId];
        } else {
          next[taskId] = percent;
        }

        return next;
      });
    });
  }, []);

  return {
    tasks,
    progress,
    gitAvailable,
    isLoading,
    fetchTasks,
    runTask,
    stopTask,
    deleteTask,
    updateTask,
    reorderTasks,
  };
};

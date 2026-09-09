import { PageWrapper } from "@app/components/PageWrapper";
import { useModal } from "@app/hooks/useModal";
import { Button } from "@app/ui/Button";
import { ITask } from "@shared/types/tasks";
import { FC, useEffect, useState } from "react";

import { EditSchedulerFormModal } from "./components/EditSchedulerFormModal";
import { EditTaskFormModal } from "./components/EditTaskFormModal";
import { InfoApp } from "./components/InfoApp";
import { TaskList } from "./components/TaskList";
import styles from "./Home.module.css";

export const Home: FC = () => {
  const { showConfirm } = useModal();
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [isTaskOpen, setTaskOpen] = useState(false);
  const [isInitTask, setInitTask] = useState<ITask | null>(null);
  const [isInitScheduling, setInitScheduling] = useState<ITask | null>(null);

  const fetchTasks = async () => {
    const data = await window.api.tasks.get();
    setTasks(data);
  };

  useEffect(() => {
    void window.api.tasks.get().then(setTasks);
  }, []);

  const handleRun = (task: ITask) => {
    try {
      void window.api.tasks.run(task);
    } catch (error) {
      console.error("Error running task:", error);
    }
  };

  // Modal Schedule
  const handleSchedule = (task: ITask) => {
    setInitScheduling(task);
  };

  const handleCloseSchedule = () => {
    setInitScheduling(null);
  };

  const handleSaveSchedule = async () => {
    await fetchTasks();
    handleCloseSchedule();
  };

  // Modal Task
  const handleTask = (task: ITask) => {
    setInitTask(task);
    setTaskOpen(true);
  };

  const handleCloseTask = () => {
    setInitTask(null);
    setTaskOpen(false);
  };

  const handleSaveTask = async () => {
    await fetchTasks();
    setTaskOpen(false);
    setInitTask(null);
  };

  const handleDelete = (id: number) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    const taskName = taskToDelete ? `"${taskToDelete.name}"` : "task";

    showConfirm(
      "Delete task?",
      `Are you sure you want to delete the task: ${taskName}? This action cannot be undone.`,
      async () => {
        try {
          const updatedTasks = await window.api.tasks.delete(id);
          setTasks(updatedTasks);
        } catch (error) {
          console.error("Error deleting task:", error);
        }
      }
    );
  };

  return (
    <>
      <PageWrapper>
        <div className={styles.container}>
          <div className={styles.header}>
            <InfoApp count={tasks.length} />
            <Button onClick={() => setTaskOpen(true)}>Add task</Button>
          </div>
          <TaskList
            items={tasks}
            onRun={handleRun}
            onSchedule={handleSchedule}
            onEdit={handleTask}
            onDelete={(task) => handleDelete(task.id)}
          />
        </div>
      </PageWrapper>
      {isTaskOpen && <EditTaskFormModal initialData={isInitTask} onClose={handleCloseTask} onSaved={handleSaveTask} />}
      {isInitScheduling && (
        <EditSchedulerFormModal
          initialData={isInitScheduling}
          onClose={handleCloseSchedule}
          onSaved={handleSaveSchedule}
        />
      )}
    </>
  );
};

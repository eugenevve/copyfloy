import { PageWrapper } from "@app/components/PageWrapper";
import { useModal } from "@app/hooks/useModal";
import { Button } from "@app/ui/Button";
import { ITask } from "@shared/types/tasks";
import { FC, useEffect, useState } from "react";

import { EditTaskFormModal } from "./components/EditTaskFormModal";
import { InfoApp } from "./components/InfoApp";
import { TaskList } from "./components/TaskList";
import styles from "./Home.module.css";

export const Home: FC = () => {
  const { showConfirm } = useModal();
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [isTaskOpen, setTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ITask | null>(null);
  // const [isScheduleOpen, setScheduleOpen] = useState(false);
  // const [schedulingTask, setSchedulingTask] = useState<ITask | null>(null);

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

  // const handleSchedule = (task: ITask) => {
  //   setSchedulingTask(task);
  //   setScheduleOpen(true);
  // };

  const handleEdit = (task: ITask) => {
    setEditingTask(task);
    setTaskOpen(true);
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
            onSchedule={() => {}}
            onEdit={handleEdit}
            onDelete={(task) => handleDelete(task.id)}
          />
        </div>
      </PageWrapper>
      {isTaskOpen && (
        <EditTaskFormModal
          initialData={editingTask}
          onClose={() => {
            setTaskOpen(false);
            setEditingTask(null);
          }}
          onSaved={async () => {
            await fetchTasks();
            setTaskOpen(false);
            setEditingTask(null);
          }}
        />
      )}
      {/* TODO: Modal Scheduler */}
      {/* {isScheduleOpen && <></>} */}
    </>
  );
};

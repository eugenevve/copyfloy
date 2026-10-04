import { PageWrapper } from "@app/components/PageWrapper";
import { useLabels } from "@app/hooks/useLabels";
import { useModal } from "@app/hooks/useModal";
import { useTaskFilter } from "@app/hooks/useTaskFilter";
import { useTasks } from "@app/hooks/useTasks";
import { ITask } from "@shared/types/tasks";
import { FC, useState } from "react";

import { EditSchedulerFormModal } from "./components/EditSchedulerFormModal";
import { EditTaskFormModal } from "./components/EditTaskFormModal";
import { HomeHeader } from "./components/HomeHeader";
import { TaskList } from "./components/TaskList";
import styles from "./Home.module.css";

export const Home: FC = () => {
  const { showConfirm } = useModal();

  const [isTaskModal, setTaskModal] = useState<{
    open: boolean;
    task: ITask | null;
  }>({
    open: false,
    task: null,
  });
  const [isInitScheduling, setInitScheduling] = useState<ITask | null>(null);
  const { tasks, fetchTasks, runTask, deleteTask } = useTasks();
  const { labels } = useLabels();
  const { search, setSearch, typeFilter, setTypeFilter, filteredTasks } = useTaskFilter(tasks);

  const handleRunTask = (task: ITask) => {
    try {
      void runTask(task);
    } catch (error) {
      console.error("Error running task:", error);
    }
  };

  // Modal Schedule
  const handleScheduleTask = (task: ITask) => {
    setInitScheduling(task);
  };

  const handleCloseScheduleTask = () => {
    setInitScheduling(null);
  };

  const handleSaveScheduleTask = async () => {
    await fetchTasks();
    handleCloseScheduleTask();
  };

  // Modal Task
  const handleAddTask = () => {
    setTaskModal({
      open: true,
      task: null,
    });
  };

  const handleEditTask = (task: ITask) => {
    setTaskModal({
      open: true,
      task,
    });
  };

  const handleCloseTask = () => {
    setTaskModal({
      open: false,
      task: null,
    });
  };

  const handleSaveTask = async () => {
    await fetchTasks();
    handleCloseTask();
  };

  const handleDeleteTask = (id: number) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    const taskName = taskToDelete ? `"${taskToDelete.name}"` : "task";

    showConfirm(
      "Delete task?",
      `Are you sure you want to delete the task: ${taskName}? This action cannot be undone.`,
      async () => {
        try {
          await deleteTask(id);
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
          <HomeHeader
            count={filteredTasks.length}
            onAddTask={handleAddTask}
            search={search}
            onSearchChange={setSearch}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
          />
          <TaskList
            items={filteredTasks}
            labels={labels}
            onRun={handleRunTask}
            onSchedule={handleScheduleTask}
            onEdit={handleEditTask}
            onDelete={(task) => handleDeleteTask(task.id)}
          />
        </div>
      </PageWrapper>
      {isTaskModal.open && (
        <EditTaskFormModal initialData={isTaskModal.task} onClose={handleCloseTask} onSaved={handleSaveTask} />
      )}
      {isInitScheduling && (
        <EditSchedulerFormModal
          initialData={isInitScheduling}
          onClose={handleCloseScheduleTask}
          onSaved={handleSaveScheduleTask}
        />
      )}
    </>
  );
};

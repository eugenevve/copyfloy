import { HeaderTools } from "@app/components/HeaderTools";
import { PageWrapper } from "@app/components/PageWrapper";
import { useLabels } from "@app/hooks/useLabels";
import { useModal } from "@app/hooks/useModal";
import { useTaskFilter } from "@app/hooks/useTaskFilter";
import { useTasks } from "@app/hooks/useTasks";
import stylesGlobal from "@app/styles/page.module.css";
import { Loader } from "@app/ui/Loader";
import { TYPE_OPTIONS_FILTER } from "@app/utils/options";
import { MAX_LIST_ITEMS } from "@shared/constants/limits";
import { ITask } from "@shared/types/tasks";
import { FC, useState } from "react";

import { EditSchedulerFormModal } from "./components/EditSchedulerFormModal";
import { EditTaskFormModal } from "./components/EditTaskFormModal";
import { RunTasksModal } from "./components/RunTasksModal";
import { TaskList } from "./components/TaskList";

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
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [isRunTasksModalOpen, setRunTasksModalOpen] = useState(false);

  const {
    tasks,
    isLoading,
    progress,
    gitAvailable,
    fetchTasks,
    runTask,
    stopTask,
    deleteTask,
    updateTask,
    reorderTasks,
  } = useTasks();
  const { labels } = useLabels();
  const { search, setSearch, typeFilter, setTypeFilter, selectedLabelIds, toggleLabel, filteredTasks } =
    useTaskFilter(tasks);

  const handleRunTask = (task: ITask) => {
    try {
      runTask(task);
    } catch (error) {
      console.error("Error running task:", error);
    }
  };

  // Run multiple tasks at once
  const handleRunTasks = async (tasksToRun: ITask[]) => {
    setRunTasksModalOpen(false);
    setIsRunningAll(true);

    const orderedTasks = tasksToRun
      .toReversed()
      .toSorted((first, second) => Number(Boolean(second.isPinned)) - Number(Boolean(first.isPinned)));

    try {
      for (const task of orderedTasks) {
        try {
          await runTask(task);
        } catch (error) {
          console.error(`Error running task "${task.name}":`, error);
        }
      }
    } finally {
      setIsRunningAll(false);
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

  const header = (
    <HeaderTools
      title="Tasks"
      count={filteredTasks.length}
      addText="Add task"
      onAdd={handleAddTask}
      addDisabled={tasks.length >= MAX_LIST_ITEMS}
      onRunTasks={() => setRunTasksModalOpen(true)}
      runTasksDisabled={isRunningAll || tasks.length === 0}
      search={search}
      onSearchChange={setSearch}
      filter={{
        options: TYPE_OPTIONS_FILTER,
        value: typeFilter,
        onChange: (value) => setTypeFilter(value as typeof typeFilter),
      }}
      labelsFilter={{ labels, selectedIds: selectedLabelIds, onToggle: toggleLabel }}
    />
  );

  return (
    <>
      <PageWrapper header={header}>
        <div className={stylesGlobal.container}>
          {isLoading ? (
            <Loader label="Loading tasks..." />
          ) : (
            <TaskList
              items={filteredTasks}
              labels={labels}
              reorder={!search.trim() && typeFilter === "all" && selectedLabelIds.length === 0}
              progress={progress}
              gitAvailable={gitAvailable}
              onRun={handleRunTask}
              onStop={(task) => stopTask(task.id)}
              onSchedule={handleScheduleTask}
              onEdit={handleEditTask}
              onDelete={(task) => handleDeleteTask(task.id)}
              onPin={(task) => updateTask({ ...task, isPinned: !task.isPinned })}
              onReorder={(orderedIds) => reorderTasks(orderedIds)}
            />
          )}
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
      {isRunTasksModalOpen && (
        <RunTasksModal
          allTasks={tasks}
          matchingTasks={filteredTasks}
          onClose={() => setRunTasksModalOpen(false)}
          onRun={handleRunTasks}
        />
      )}
    </>
  );
};

import { ScheduleType } from "@shared/types/schedule";
import { Task } from "@shared/types/tasks";
import cron, { ScheduledTask } from "node-cron";

import { convertToCron } from "./ScheduleUtils";

// Service responsible for scheduling tasks
export class SchedulerService {
  // Active cron jobs: task ID -> cron job
  private readonly jobs = new Map<number, ScheduledTask>();

  constructor(private readonly onTaskScheduled: (task: Task) => void) {}

  // Initialize the scheduler
  init(tasks: Task[]): void {
    this.rescheduleAll(tasks);
  }

  // Restarts the schedule for all provided tasks
  rescheduleAll(tasks: Task[]): void {
    this.stopAll();

    for (const task of tasks) {
      if (!task.schedule || task.schedule.type === ScheduleType.DISABLED) {
        continue;
      }

      this.scheduleTask(task);
    }
  }

  // Stops all active cron jobs
  stopAll(): void {
    for (const job of this.jobs.values()) {
      void job.stop();
    }

    this.jobs.clear();
  }

  // Creates a cron job for a specific task
  private scheduleTask(task: Task): void {
    if (!task.schedule) {
      return;
    }

    const expression = convertToCron(task.schedule);

    if (!expression) {
      console.warn(`[SchedulerService] Invalid schedule for task "${task.name}".`);
      return;
    }

    const job = cron.schedule(expression, () => {
      console.log(`[SchedulerService] Scheduled task started: "${task.name}"`);

      this.onTaskScheduled(task);
    });

    this.jobs.set(task.id, job);
  }
}

import fs from "node:fs";
import path from "node:path";

import { IPC_CHANNELS } from "@shared/constants/ipc";
import { ISchedule, ScheduleType } from "@shared/types/schedule";
import { ITask } from "@shared/types/tasks";
import { app, ipcMain } from "electron";

import { ReportStorage } from "../ReportService/ReportStorage";
import { TaskStorage } from "../TaskService/TaskStorage";

// Returns the latest scheduled time (ms) that is not later than `now`, or null if it cannot be determined
export function getLastScheduledTime(schedule: ISchedule, now: Date): number | null {
  const { type, hours = 0, minutes = 0, days = [] } = schedule;

  switch (type) {
    case ScheduleType.HOURLY: {
      const date = new Date(now);
      date.setMinutes(minutes, 0, 0);

      if (date > now) {
        date.setHours(date.getHours() - 1);
      }

      return date.getTime();
    }

    case ScheduleType.DAILY:
    case ScheduleType.WEEKLY: {
      const allowedDays = new Set(days.map((day) => day % 7));

      for (let offset = 0; offset <= 7; offset++) {
        const date = new Date(now);
        date.setDate(date.getDate() - offset);
        date.setHours(hours, minutes, 0, 0);

        if (date > now) {
          continue;
        }

        if (type === ScheduleType.DAILY || allowedDays.has(date.getDay())) {
          return date.getTime();
        }
      }

      return null;
    }

    default:
      return null;
  }
}

// Detects scheduled runs missed while the app was closed and offers to run them
export class MissedTaskService {
  private pending: ITask[] | null = null;
  private readonly dismissedPath = path.join(app.getPath("userData"), "missed-dismissed.json");

  constructor(
    private readonly taskStorage: TaskStorage,
    private readonly reportStorage: ReportStorage
  ) {}

  // Computes missed tasks on startup; the renderer takes them once when it is ready
  init(): void {
    this.pending = this.findMissed();

    ipcMain.handle(IPC_CHANNELS.tasks.getMissed, () => {
      const result = this.pending ?? [];
      this.pending = null;

      return result;
    });

    ipcMain.handle(IPC_CHANNELS.tasks.dismissMissed, (_, taskId: number) => {
      const dismissed = this.loadDismissed();
      dismissed[taskId] = Date.now();

      try {
        fs.writeFileSync(this.dismissedPath, JSON.stringify(dismissed), "utf-8");
      } catch {
        // Worst case the prompt shows again on next start
      }
    });
  }

  private loadDismissed(): Record<number, number> {
    try {
      return JSON.parse(fs.readFileSync(this.dismissedPath, "utf-8")) as Record<number, number>;
    } catch {
      return {};
    }
  }

  findMissed(now = new Date()): ITask[] {
    const lastRuns = new Map<number, number>();
    const dismissed = this.loadDismissed();

    for (const record of this.reportStorage.load()) {
      lastRuns.set(record.taskId, Math.max(lastRuns.get(record.taskId) ?? 0, record.startedAt));
    }

    return this.taskStorage.load().filter((task) => {
      if (
        !task.schedule ||
        task.schedule.type === ScheduleType.DISABLED ||
        task.schedule.type === ScheduleType.MINUTES
      ) {
        return false;
      }

      const scheduledAt = getLastScheduledTime(task.schedule, now);

      // Task id is its creation timestamp, used when the task has never run
      const lastRun = Math.max(lastRuns.get(task.id) ?? task.id, dismissed[task.id] ?? 0);

      return scheduledAt !== null && scheduledAt > lastRun;
    });
  }
}

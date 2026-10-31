import { TaskIpc } from "./TaskIpc";
import { TaskStorage } from "./TaskStorage";
import { CopyService } from "../CopyService/CopyService";
import { LabelStorage } from "../LabelService/LabelStorage";
import { ReportStorage } from "../ReportService/ReportStorage";
import { MissedTaskService } from "../SchedulerService/MissedTaskService";
import { SchedulerService } from "../SchedulerService/SchedulerService";

// Service responsible for coordinating task-related services
export class TaskService {
  private readonly taskStorage: TaskStorage;
  private readonly copyService: CopyService;
  private readonly scheduler: SchedulerService;
  private readonly taskIpc: TaskIpc;
  private readonly missedTasks: MissedTaskService;

  constructor() {
    this.taskStorage = new TaskStorage();
    this.copyService = new CopyService();

    this.scheduler = new SchedulerService((task) => {
      void this.copyService.run(task);
    });

    this.taskIpc = new TaskIpc(this.taskStorage, this.copyService, this.scheduler, new LabelStorage());
    this.missedTasks = new MissedTaskService(this.taskStorage, new ReportStorage());
  }

  // Initializes the task system
  init(): void {
    this.taskIpc.init();
    this.missedTasks.init();

    const tasks = this.taskStorage.load();
    this.scheduler.init(tasks);
  }
}

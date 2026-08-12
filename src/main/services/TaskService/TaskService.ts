import { TaskIpc } from "./TaskIpc";
import { TaskStorage } from "./TaskStorage";
import { CopyService } from "../CopyService/CopyService";
import { SchedulerService } from "../SchedulerService/SchedulerService";

// Service responsible for coordinating task-related services
export class TaskService {
  private readonly taskStorage: TaskStorage;
  private readonly copyService: CopyService;
  private readonly scheduler: SchedulerService;
  private readonly taskIpc: TaskIpc;

  constructor() {
    this.taskStorage = new TaskStorage();
    this.copyService = new CopyService();

    this.scheduler = new SchedulerService((task) => {
      void this.copyService.run(task);
    });

    this.taskIpc = new TaskIpc(this.taskStorage, this.copyService, this.scheduler);
  }

  // Initializes the task system
  init(): void {
    this.taskIpc.init();

    const tasks = this.taskStorage.load();
    this.scheduler.init(tasks);
  }
}

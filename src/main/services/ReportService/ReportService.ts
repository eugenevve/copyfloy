import { ReportIpc } from "./ReportIpc";
import { ReportStorage } from "./ReportStorage";
import { TaskStorage } from "../TaskService/TaskStorage";

export class ReportService {
  private readonly reportIpc: ReportIpc;

  constructor(taskStorage: TaskStorage) {
    this.reportIpc = new ReportIpc(new ReportStorage(), taskStorage);
  }

  init() {
    this.reportIpc.init();
  }
}

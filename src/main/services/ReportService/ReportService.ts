import { ReportIpc } from "./ReportIpc";
import { ReportStorage } from "./ReportStorage";
import { TaskStorage } from "../TaskService/TaskStorage";

export class ReportService {
  private readonly reportIpc: ReportIpc;

  constructor() {
    this.reportIpc = new ReportIpc(new ReportStorage(), new TaskStorage());
  }

  init(): void {
    this.reportIpc.init();
  }
}

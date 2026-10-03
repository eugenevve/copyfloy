import { LabelIpc } from "./LabelIpc";
import { LabelStorage } from "./LabelStorage";
import { TaskStorage } from "../TaskService/TaskStorage";

export class LabelService {
  private readonly labelStorage: LabelStorage;
  private readonly labelIpc: LabelIpc;

  constructor() {
    this.labelStorage = new LabelStorage();
    this.labelIpc = new LabelIpc(this.labelStorage, new TaskStorage());
  }

  init(): void {
    this.labelIpc.init();
  }
}

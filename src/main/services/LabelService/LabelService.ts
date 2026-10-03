import { LabelIpc } from "./LabelIpc";
import { LabelStorage } from "./LabelStorage";

export class LabelService {
  private readonly labelStorage: LabelStorage;
  private readonly labelIpc: LabelIpc;

  constructor() {
    this.labelStorage = new LabelStorage();
    this.labelIpc = new LabelIpc(this.labelStorage);
  }

  init(): void {
    this.labelIpc.init();
  }
}

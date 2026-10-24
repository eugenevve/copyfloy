export interface ICopyEntry {
  source: string;
  destination: string;
  isDirectory: boolean;
  size: number;
}

export interface IRunningTask {
  controller: AbortController;
  percent: number;
}

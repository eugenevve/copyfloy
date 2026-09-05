export interface IExceptionsList {
  items: string[];
  sourcePath: string;
  onRemove: (path: string) => void;
}

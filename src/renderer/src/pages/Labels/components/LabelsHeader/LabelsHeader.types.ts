export interface ILabelsHeader {
  count: number;
  onAddLabel: () => void;
  search: string;
  onSearchChange: (value: string) => void;
}

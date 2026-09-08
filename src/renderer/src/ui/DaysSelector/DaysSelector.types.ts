export interface IDaysSelector {
  selectedDays: number[];
  onChange: (days: number[]) => void;
}

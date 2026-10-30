import { ISelectOption } from "@app/ui/Select/Select.types";
import { ILabel } from "@shared/types/labels";

export interface IHeaderTools {
  title: string;
  count: number;
  addText: string;
  onAdd: () => void;
  addDisabled?: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  filter?: IHeaderToolsFilter;
  labelsFilter?: IHeaderToolsLabelsFilter;
}

interface IHeaderToolsLabelsFilter {
  labels: ILabel[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}

interface IHeaderToolsFilter {
  options: ISelectOption[];
  value: string;
  onChange: (value: string) => void;
}

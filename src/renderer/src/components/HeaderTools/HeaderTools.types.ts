import { ISelectOption } from "@app/ui/Select/Select.types";

export interface IHeaderTools {
  title: string;
  count: number;
  addText: string;
  onAdd: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  filter?: IHeaderToolsFilter;
}

interface IHeaderToolsFilter {
  options: ISelectOption[];
  value: string;
  onChange: (value: string) => void;
}

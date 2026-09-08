export interface ISelect {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: ISelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export interface ISelectOption {
  label: string;
  value: string;
}

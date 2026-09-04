export interface IRadioGroup<T> {
  value: T;
  onChange: (value: T) => void;
  options: IRadioOption<T>[];
  className?: string;
  disabled?: boolean;
}

export interface IRadioOption<T> {
  value: T;
  label: string;
}

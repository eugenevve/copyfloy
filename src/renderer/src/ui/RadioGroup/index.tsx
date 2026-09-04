import { InputRadio } from "@app/ui/InputRadio";
import { classNames } from "@app/utils/classNames";

import styles from "./RadioGroup.module.css";
import { IRadioGroup } from "./RadioGroup.types";

export const RadioGroup = <T extends string>({ options, value, onChange, className, disabled }: IRadioGroup<T>) => {
  return (
    <div className={classNames(styles.container, className || "")}>
      {options.map((option) => (
        <InputRadio
          key={option.value}
          value={option.value}
          onChange={(event) => onChange(event.target.value as T)}
          checked={value === option.value}
          label={option.label}
          disabled={disabled}
        />
      ))}
    </div>
  );
};

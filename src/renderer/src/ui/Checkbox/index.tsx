import { classNames } from "@app/utils/classNames";
import { FC } from "react";

import styles from "./Checkbox.module.css";
import { ICheckbox } from "./Checkbox.types";
import { CheckIcon } from "../Icons";

export const Checkbox: FC<ICheckbox> = ({ disabled, label, ...props }) => {
  return (
    <label className={classNames(styles.container, (disabled && styles.disabled) || "")}>
      <input type="checkbox" {...props} disabled={disabled} className={styles.input} />
      <div className={styles.checkbox}>{props.checked && <CheckIcon className={styles.check} />}</div>
      <div className={styles.label}>{label}</div>
    </label>
  );
};

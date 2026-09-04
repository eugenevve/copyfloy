import { classNames } from "@app/utils/classNames";
import { FC } from "react";

import styles from "./InputRadio.module.css";
import { IInputRadio } from "./InputRadio.types";

export const InputRadio: FC<IInputRadio> = ({ disabled, label, ...props }) => {
  return (
    <label className={classNames(styles.container, (label && styles.label) || "", (disabled && styles.disabled) || "")}>
      <input type="radio" {...props} disabled={disabled} className={styles.input} />
      {label}
    </label>
  );
};

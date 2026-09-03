import { classNames } from "@app/utils/classNames";
import { FC } from "react";

import styles from "./Input.module.css";
import { IInput } from "./Input.types";

export const Input: FC<IInput> = ({ disabled, icon, className, ...props }) => {
  return (
    <div
      className={classNames(
        styles.container,
        className || "",
        (icon && styles.icon) || "",
        (disabled && styles.disabled) || ""
      )}
    >
      <input {...props} disabled={disabled} className={styles.input} />
      {icon}
    </div>
  );
};

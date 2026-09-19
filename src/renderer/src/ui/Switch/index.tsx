import { classNames } from "@app/utils/classNames";
import { FC } from "react";

import styles from "./Switch.module.css";
import { ISwitch } from "./Switch.types";

export const Switch: FC<ISwitch> = ({ disabled, label, ...props }) => {
  return (
    <label className={classNames(styles.container, disabled ? styles.disabled : "")}>
      <input type="checkbox" {...props} disabled={disabled} className={styles.input} />
      <div className={styles.switch}>
        <div className={styles.thumb} />
      </div>
      <div className={styles.label}>{label}</div>
    </label>
  );
};

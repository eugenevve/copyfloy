import { classNames } from "@app/utils/classNames";
import { FC } from "react";

import styles from "./Input.module.css";
import { IInput } from "./Input.types";
import { Button } from "../Button";
import { ButtonKind } from "../Button/Button.types";

export const Input: FC<IInput> = ({ label, disabled, className, icon, onClick, ...props }) => {
  return (
    <div className={classNames(styles.container, className || "")}>
      {label && <div className={styles.label}>{label}</div>}
      <div className={classNames(styles.content, className || "", (disabled && styles.disabled) || "")}>
        <input {...props} disabled={disabled} className={styles.input} />
        {icon && (
          <Button kind={ButtonKind.SECONDARY} className={styles.button} onClick={onClick} icon>
            {icon}
          </Button>
        )}
      </div>
    </div>
  );
};

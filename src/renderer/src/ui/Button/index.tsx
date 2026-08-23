import { classNames } from "@app/utils/classNames";
import type { FC } from "react";

import styles from "./Button.module.css";
import { ButtonKind, type IButton } from "./Button.types";

export const Button: FC<IButton> = ({ kind = ButtonKind.PRIMARY, className, children, icon, ...props }) => {
  const style = classNames(icon ? styles.icon : styles.container, styles[kind], className || "");

  return (
    <button {...props} className={style}>
      {children}
    </button>
  );
};

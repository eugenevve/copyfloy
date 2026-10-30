import { classNames } from "@app/utils/classNames";
import type { FC } from "react";

import { Tooltip } from "../Tooltip";
import styles from "./Button.module.css";
import { ButtonKind, type IButton } from "./Button.types";

export const Button: FC<IButton> = ({
  kind = ButtonKind.PRIMARY,
  className,
  children,
  icon,
  disabled,
  position,
  tooltip,
  tooltipPlacement,
  ...props
}) => {
  const style = classNames(icon ? styles.icon : styles.container, styles[kind], className || "");

  return (
    <Tooltip content={tooltip} placement={tooltipPlacement}>
      <button {...props} disabled={disabled} className={style} style={icon ? {} : { justifyContent: position }}>
        {children}
      </button>
    </Tooltip>
  );
};

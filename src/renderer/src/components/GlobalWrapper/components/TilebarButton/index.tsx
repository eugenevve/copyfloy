import { Tooltip } from "@app/ui/Tooltip";
import { classNames } from "@app/utils/classNames";
import { FC } from "react";

import styles from "./TilebarButton.module.css";
import { ITilebarButton, TilebarButtonKind } from "./TilebarButton.types";

export const TilebarButton: FC<ITilebarButton> = ({
  kind = TilebarButtonKind.PRIMARY,
  children,
  tooltip,
  tooltipPlacement,
  ...props
}) => {
  const style = classNames(styles.container, styles[kind]);

  return (
    <Tooltip content={tooltip} placement={tooltipPlacement}>
      <button className={style} {...props}>
        <div className={styles.content}>{children}</div>
      </button>
    </Tooltip>
  );
};

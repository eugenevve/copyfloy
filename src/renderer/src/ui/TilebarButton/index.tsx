import { classNames } from "@app/utils/classNames";
import { FC } from "react";

import styles from "./TilebarButton.module.css";
import { ITilebarButton, TilebarButtonKind } from "./TilebarButton.types";

export const TilebarButton: FC<ITilebarButton> = ({ kind = TilebarButtonKind.PRIMARY, children, ...props }) => {
  const style = classNames(styles.container, styles[kind]);

  return (
    <button className={style} {...props}>
      <div className={styles.content}>{children}</div>
    </button>
  );
};

import { Button } from "@app/ui/Button";
import { ButtonKind } from "@app/ui/Button/Button.types";
import { FC } from "react";

import styles from "./ShowMoreButton.module.css";
import { IShowMoreButton } from "./ShowMoreButton.types";

export const ShowMoreButton: FC<IShowMoreButton> = ({ onClick }) => {
  return (
    <div className={styles.container}>
      <Button kind={ButtonKind.SECONDARY} onClick={onClick}>
        Show more...
      </Button>
    </div>
  );
};

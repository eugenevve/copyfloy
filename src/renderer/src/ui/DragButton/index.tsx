import { Button } from "@app/ui/Button";
import { DotsVerticalIcon } from "@app/ui/Icons";
import { FC } from "react";

import styles from "./DragButton.module.css";

export const DragButton: FC = (props) => {
  return (
    <Button {...props} className={styles.container}>
      <DotsVerticalIcon className={styles.icon} />
    </Button>
  );
};

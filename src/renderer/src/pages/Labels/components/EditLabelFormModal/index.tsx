import { useModal } from "@app/hooks/useModal";
import { Button } from "@app/ui/Button";
import { ColorCircle } from "@app/ui/ColorCircle";
import { Input } from "@app/ui/Input";
import { LabelChip } from "@app/ui/LabelChip";
import { Modal } from "@app/ui/Modal";
import { LABEL_COLORS } from "@shared/types/labels";
import { FC, useState } from "react";

import styles from "./EditLabelFormModal.module.css";
import { IEditLabelFormModal } from "./EditLabelFormModal.types";

export const EditLabelFormModal: FC<IEditLabelFormModal> = ({ initialData, onClose, onSaved }) => {
  const { showConfirm } = useModal();

  const initialValues = {
    name: initialData?.name || "",
    color: initialData?.color || LABEL_COLORS[0],
  };

  const [name, setName] = useState(initialValues.name);
  const [color, setColor] = useState(initialValues.color);

  const isEditMode = !!initialData?.id;

  const isDirty = name !== initialValues.name || color !== initialValues.color;

  const handleSubmit = async (): Promise<void> => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    if (initialData) {
      await window.api.labels.update({
        ...initialData,
        name: trimmedName,
        color,
      });
    } else {
      await window.api.labels.save({
        name: trimmedName,
        color,
      });
    }

    void onSaved();
  };

  const handleClose = () => {
    if (!isDirty) {
      onClose();
    } else {
      showConfirm("Unsaved changes", "You have made changes. Close the form without saving?", onClose);
    }
  };

  return (
    <Modal title={isEditMode ? "Edit label" : "Create label"} onClose={handleClose}>
      <div className={styles.container}>
        <Input
          label="Label name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Example: work"
        />
        <div className={styles.section}>
          {LABEL_COLORS.map((labelColor) => (
            <ColorCircle
              key={labelColor}
              color={labelColor}
              selected={color === labelColor}
              onClick={() => setColor(labelColor)}
            />
          ))}
        </div>
        <LabelChip name={name || "Label"} color={color} />
        <Button disabled={!name} onClick={() => void handleSubmit()} className={styles.button}>
          Save
        </Button>
      </div>
    </Modal>
  );
};

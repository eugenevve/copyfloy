import { useModal } from "@app/hooks/useModal";
import { Button } from "@app/ui/Button";
import { ButtonKind } from "@app/ui/Button/Button.types";
import { Input } from "@app/ui/Input";
import { Modal } from "@app/ui/Modal";
import { RadioGroup } from "@app/ui/RadioGroup";
import { TYPE_OPTIONS_EDIT } from "@app/utils/options";
import { ScheduleType } from "@shared/types/schedule";
import { TaskType } from "@shared/types/tasks";
import { useState, type ChangeEvent, type FC } from "react";

import styles from "./EditTaskFormModal.module.css";
import { FormField, IEditTaskFormModal } from "./EditTaskFormModal.types";
import { ExceptionChoiceModal } from "../ExceptionChoiceModal";
import { ExceptionsList } from "../ExceptionsList";

export const EditTaskFormModal: FC<IEditTaskFormModal> = ({ initialData, onClose, onSaved }) => {
  const { showConfirm } = useModal();
  const [isChoiceOpen, setChoiceOpen] = useState(false);

  const initialValues = {
    name: initialData?.name || "",
    type: initialData?.type || TaskType.FOLDER,
    source: initialData?.source || "",
    target: initialData?.target || "",
    exceptions: initialData?.exceptions || [],
  };

  const [name, setName] = useState(initialValues.name);
  const [type, setType] = useState(initialValues.type);
  const [source, setSource] = useState(initialValues.source);
  const [target, setTarget] = useState(initialValues.target);
  const [exceptions, setExceptions] = useState(initialValues.exceptions);

  const isEditMode = !!initialData?.id;

  const isDirty =
    name !== initialValues.name ||
    type !== initialValues.type ||
    source !== initialValues.source ||
    target !== initialValues.target ||
    JSON.stringify(exceptions) !== JSON.stringify(initialValues.exceptions);

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleTypeChange = (val: TaskType) => {
    setType(val);
    setSource("");
    setExceptions([]);
  };

  const handleSelectPath = async (targetField: FormField) => {
    const path = await window.api.tasks.openDialog(targetField === FormField.SOURCE ? type : TaskType.FOLDER);
    if (!path) return;

    if (targetField === FormField.SOURCE) {
      setSource(path);
    } else {
      setTarget(path);
    }
  };

  const handleAddException = async (mode: TaskType.FOLDER | TaskType.FILE) => {
    setChoiceOpen(false);
    if (!source) return;

    const paths = await window.api.tasks.openExceptionDialog(source, mode);
    if (!paths) return;

    setExceptions((prev) => {
      const newPaths = paths.filter((path) => !prev.includes(path));
      return [...prev, ...newPaths];
    });
  };

  const handleRemoveException = (path: string) => {
    setExceptions((prev) => prev.filter((p) => p !== path));
  };

  const handleSubmit = async () => {
    const schedule = initialData?.schedule || { notify: false, type: ScheduleType.DISABLED };
    const taskData = { name, type, source, target, exceptions, schedule };

    if (initialData?.id) {
      await window.api.tasks.update({ ...taskData, id: initialData.id });
    } else {
      await window.api.tasks.save(taskData);
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
    <>
      <Modal title={isEditMode ? "Edit task" : "New task"} onClose={handleClose}>
        <div className={styles.container}>
          <Input label="Task name" value={name} onChange={handleNameChange} placeholder="Example: Photo backup" />
          <RadioGroup
            options={TYPE_OPTIONS_EDIT}
            value={type}
            disabled={isEditMode}
            onChange={handleTypeChange}
            className={styles.radioGroup}
          />
          <div className={styles.group}>
            <Input
              label="Original path"
              value={source}
              placeholder={type === TaskType.FOLDER ? "Folder path" : "File path"}
              readOnly
            />
            <Button kind={ButtonKind.PRIMARY} onClick={() => void handleSelectPath(FormField.SOURCE)}>
              Review
            </Button>
          </div>
          <div className={styles.group}>
            <Input label="Destination Path" value={target} readOnly placeholder="Folder path" />
            <Button kind={ButtonKind.PRIMARY} onClick={() => void handleSelectPath(FormField.TARGET)}>
              Review
            </Button>
          </div>
          {type === TaskType.FOLDER && (
            <div className={styles.section}>
              <div>Exceptions</div>
              <ExceptionsList items={exceptions} sourcePath={source} onRemove={handleRemoveException} />
              {source && (
                <Button
                  kind={ButtonKind.SECONDARY}
                  onClick={() => setChoiceOpen(true)}
                  disabled={!source}
                  className={styles.button}
                >
                  Add a file or folder
                </Button>
              )}
            </div>
          )}
        </div>
        <div className={styles.section}>
          {!isEditMode && <div className={styles.hint}>The schedule can be configured after saving the task</div>}
          <Button onClick={() => void handleSubmit()} disabled={!name || !source || !target} className={styles.button}>
            Save
          </Button>
        </div>
      </Modal>
      {isChoiceOpen && (
        <ExceptionChoiceModal onClose={() => setChoiceOpen(false)} onSelect={(mode) => void handleAddException(mode)} />
      )}
    </>
  );
};

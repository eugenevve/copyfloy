import { useLabels } from "@app/hooks/useLabels";
import { useModal } from "@app/hooks/useModal";
import { Button } from "@app/ui/Button";
import { ButtonKind } from "@app/ui/Button/Button.types";
import { Input } from "@app/ui/Input";
import { LabelChip } from "@app/ui/LabelChip";
import { Modal } from "@app/ui/Modal";
import { RadioGroup } from "@app/ui/RadioGroup";
import { Select } from "@app/ui/Select";
import { REPOSITORY_PROVIDER_OPTIONS, TYPE_OPTIONS_EDIT, VISIBILITY_OPTIONS } from "@app/utils/options";
import { ScheduleType } from "@shared/types/schedule";
import { RepositoryProvider, RepositoryVisibility, TaskType } from "@shared/types/tasks";
import { useEffect, useState, type ChangeEvent, type FC } from "react";

import styles from "./EditTaskFormModal.module.css";
import { FormField, IEditTaskFormModal } from "./EditTaskFormModal.types";
import { ExceptionChoiceModal } from "../ExceptionChoiceModal";
import { ExceptionsList } from "../ExceptionsList";

export const EditTaskFormModal: FC<IEditTaskFormModal> = ({ initialData, onClose, onSaved }) => {
  const { showConfirm } = useModal();
  const { labels } = useLabels();
  const [isChoiceOpen, setChoiceOpen] = useState(false);
  const [gitAvailable, setGitAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    void window.api.tasks
      .isGitAvailable()
      .then(setGitAvailable)
      .catch(() => setGitAvailable(false));
  }, []);

  const initialValues = {
    name: initialData?.name || "",
    labelsIds: initialData?.labelsIds || [],
    type: initialData?.type || TaskType.FOLDER,
    source: initialData?.source || "",
    target: initialData?.target || "",
    exceptions: initialData?.exceptions || [],
    repositoryProvider: initialData?.repositoryProvider || RepositoryProvider.GITHUB,
    isPrivate: initialData?.isPrivate || false,
    accessToken: initialData?.accessToken || "",
  };

  const [name, setName] = useState(initialValues.name);
  const [type, setType] = useState(initialValues.type);
  const [source, setSource] = useState(initialValues.source);
  const [target, setTarget] = useState(initialValues.target);
  const [exceptions, setExceptions] = useState(initialValues.exceptions);
  const [labelsIds, setLabelsIds] = useState(initialValues.labelsIds);
  const [repositoryProvider, setRepositoryProvider] = useState(initialValues.repositoryProvider);
  const [isPrivate, setIsPrivate] = useState(initialValues.isPrivate);
  const [accessToken, setAccessToken] = useState(initialValues.accessToken);

  const isEditMode = !!initialData?.id;

  const isDirty =
    name !== initialValues.name ||
    type !== initialValues.type ||
    source !== initialValues.source ||
    target !== initialValues.target ||
    repositoryProvider !== initialValues.repositoryProvider ||
    isPrivate !== initialValues.isPrivate ||
    accessToken !== initialValues.accessToken ||
    labelsIds.length !== initialValues.labelsIds.length ||
    exceptions.length !== initialValues.exceptions.length;

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleLabelChange = (id: number) => {
    setLabelsIds((prev) => (prev.includes(id) ? prev.filter((labelId) => labelId !== id) : [...prev, id]));
  };

  const handleTypeChange = (val: TaskType) => {
    setType(val);
    setSource("");
    setExceptions([]);
  };

  const isValidRepositoryUrl = () => {
    if (type !== TaskType.REPOSITORY) return true;

    try {
      const url = new URL(source);
      const expectedHost = repositoryProvider === RepositoryProvider.GITHUB ? "github.com" : "gitlab.com";
      const repositoryParts = url.pathname.split("/").filter(Boolean);
      return (
        url.protocol === "https:" &&
        url.hostname.toLowerCase() === expectedHost &&
        !url.username &&
        !url.password &&
        repositoryParts.length >= 2
      );
    } catch {
      return false;
    }
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
    const taskData = {
      name,
      type,
      source,
      target,
      exceptions,
      labelsIds,
      schedule,
      isPinned: initialData?.isPinned,
      ...(type === TaskType.REPOSITORY
        ? { repositoryProvider, isPrivate, accessToken: isPrivate ? accessToken : "" }
        : {}),
    };

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
          <div className={styles.section}>
            <div>Labels</div>
            {labels.length > 0 ? (
              <div className={styles.labels}>
                {labels.toReversed().map((label) => (
                  <LabelChip
                    key={label.id}
                    selected={labelsIds.includes(label.id)}
                    name={label.name}
                    color={label.color}
                    onClick={() => handleLabelChange(label.id)}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.hint}>No labels created</div>
            )}
          </div>
          <RadioGroup
            options={TYPE_OPTIONS_EDIT.map((option) => ({
              ...option,
              disabled: option.value === TaskType.REPOSITORY && gitAvailable === false,
            }))}
            value={type}
            disabled={isEditMode}
            onChange={handleTypeChange}
            className={styles.radioGroup}
          />
          {gitAvailable === false && (
            <div className={styles.hint}>
              To access the Repository functionality, install Git and ensure it is available in your PATH.
            </div>
          )}
          {type === TaskType.REPOSITORY ? (
            <>
              <Select
                label="Service"
                value={repositoryProvider}
                options={REPOSITORY_PROVIDER_OPTIONS}
                onChange={(value) => setRepositoryProvider(value as RepositoryProvider)}
              />
              <RadioGroup
                options={VISIBILITY_OPTIONS}
                value={isPrivate ? RepositoryVisibility.PRIVATE : RepositoryVisibility.PUBLIC}
                onChange={(value) => setIsPrivate(value === RepositoryVisibility.PRIVATE)}
                className={styles.radioGroup}
              />
              <Input
                label="Repository HTTPS URL"
                value={source}
                onChange={(event) => setSource(event.target.value)}
                placeholder="https://github.com/owner/repository.git"
              />
              {isPrivate && (
                <Input
                  type="password"
                  label="Access token"
                  value={accessToken}
                  onChange={(event) => setAccessToken(event.target.value)}
                  placeholder="Personal access token"
                />
              )}
            </>
          ) : (
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
          )}
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
          <Button
            onClick={() => void handleSubmit()}
            disabled={
              !name ||
              !source ||
              !target ||
              !isValidRepositoryUrl() ||
              (type === TaskType.REPOSITORY && isPrivate && !accessToken)
            }
            className={styles.button}
          >
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

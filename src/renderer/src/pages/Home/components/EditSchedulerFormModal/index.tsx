import { useModal } from "@app/hooks/useModal";
import { Button } from "@app/ui/Button";
import { Checkbox } from "@app/ui/Checkbox";
import { DaysSelector } from "@app/ui/DaysSelector";
import { Input } from "@app/ui/Input";
import { Line } from "@app/ui/Line";
import { Modal } from "@app/ui/Modal";
import { Select } from "@app/ui/Select";
import { TYPE_OPTIONS_SCHEDULE } from "@app/utils/options";
import { ScheduleType } from "@shared/types/schedule";
import { ITask } from "@shared/types/tasks";
import { ChangeEvent, FC, useState } from "react";

import styles from "./EditSchedulerFormModal.module.css";
import { IEditSchedulerFormModal } from "./EditSchedulerFormModal.types";

export const EditSchedulerFormModal: FC<IEditSchedulerFormModal> = ({ initialData, onClose, onSaved }) => {
  const { showConfirm } = useModal();

  const initialValues = {
    type: initialData.schedule?.type || ScheduleType.DISABLED,
    hours: String(initialData.schedule?.hours ?? 12),
    minutes: String(initialData.schedule?.minutes ?? 0),
    interval: String(initialData.schedule?.interval ?? 5),
    days: initialData.schedule?.days || [],
    notify: initialData.schedule?.notify ?? true,
  };

  const [type, setType] = useState(initialValues.type);
  const [hours, setHours] = useState(initialValues.hours);
  const [minutes, setMinutes] = useState(initialValues.minutes);
  const [interval, setInterval] = useState(initialValues.interval);
  const [days, setDays] = useState(initialValues.days);
  const [notify, setNotify] = useState(initialValues.notify);

  const isDirty =
    type !== initialValues.type ||
    hours !== initialValues.hours ||
    minutes !== initialValues.minutes ||
    interval !== initialValues.interval ||
    notify !== initialValues.notify ||
    JSON.stringify(days) !== JSON.stringify(initialValues.days);

  const handleNumericChange = (event: ChangeEvent<HTMLInputElement>, max: number, setter: (v: string) => void) => {
    const raw = event.target.value.replace(/\D/g, "");

    if (!raw) {
      setter("");
      return;
    }

    if (Number(raw) <= max) {
      setter(raw);
    }
  };

  const handleSubmit = async () => {
    const schedule: NonNullable<ITask["schedule"]> = { type, notify };

    switch (type) {
      case ScheduleType.DAILY:
        schedule.hours = parseInt(hours) || 0;
        schedule.minutes = parseInt(minutes) || 0;
        break;
      case ScheduleType.HOURLY:
        schedule.minutes = parseInt(minutes) || 0;
        break;
      case ScheduleType.MINUTES:
        schedule.interval = parseInt(interval) || 5;
        break;
      case ScheduleType.WEEKLY:
        schedule.hours = parseInt(hours) || 0;
        schedule.minutes = parseInt(minutes) || 0;
        schedule.days = days;
        break;
      case ScheduleType.DISABLED:
        break;
    }

    await window.api.tasks.update({ ...initialData, schedule });
    await onSaved();
  };

  const handleClose = () => {
    if (!isDirty) {
      onClose();
    } else {
      showConfirm("Unsaved changes", "You have made changes. Close the form without saving?", onClose);
    }
  };

  return (
    <Modal title={`Schedule: ${initialData.name}`} onClose={handleClose}>
      <Select
        label="Schedule type"
        value={type}
        onChange={(value) => setType(value as ScheduleType)}
        options={TYPE_OPTIONS_SCHEDULE}
      />
      {(type === ScheduleType.DAILY || type === ScheduleType.WEEKLY) && (
        <>
          <Input label="Hours" value={hours} onChange={(e) => handleNumericChange(e, 23, setHours)} />
          <Input label="Minutes" value={minutes} onChange={(e) => handleNumericChange(e, 59, setMinutes)} />
        </>
      )}
      {type === ScheduleType.HOURLY && (
        <Input label="Minute of the hour" value={minutes} onChange={(e) => handleNumericChange(e, 59, setMinutes)} />
      )}
      {type === ScheduleType.MINUTES && (
        <Input label="Interval (1-60 min)" value={interval} onChange={(e) => handleNumericChange(e, 60, setInterval)} />
      )}
      {type === ScheduleType.WEEKLY && <DaysSelector selectedDays={days} onChange={setDays} />}
      <Line />
      <Checkbox label="System notification?" checked={notify} onChange={() => setNotify((prev) => !prev)} />
      <Button onClick={() => void handleSubmit()} className={styles.button}>
        Save
      </Button>
    </Modal>
  );
};

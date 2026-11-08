import { useModal } from "@app/hooks/useModal";
import { Button } from "@app/ui/Button";
import { Checkbox } from "@app/ui/Checkbox";
import { Line } from "@app/ui/Line";
import { Modal } from "@app/ui/Modal";
import { Select } from "@app/ui/Select";
import { getDateTimeFormat, subscribeDateTimeFormat } from "@app/utils/dateTimeFormatState";
import { TYPE_OPTIONS_SCHEDULE } from "@app/utils/options";
import {
  SCHEDULE_HOUR_OPTIONS_12,
  SCHEDULE_HOUR_OPTIONS_24,
  SCHEDULE_MERIDIEM_OPTIONS,
  SCHEDULE_MINUTE_OPTIONS,
  ScheduleMeridiemEnum,
} from "@app/utils/scheduleTimeOptions";
import { ScheduleType } from "@shared/types/schedule";
import { TimeFormat } from "@shared/types/settings";
import { ITask } from "@shared/types/tasks";
import { FC, useState, useSyncExternalStore } from "react";

import styles from "./EditSchedulerFormModal.module.css";
import { IEditSchedulerFormModal } from "./EditSchedulerFormModal.types";
import { DaysSelector } from "../DaysSelector";

export const EditSchedulerFormModal: FC<IEditSchedulerFormModal> = ({ initialData, onClose, onSaved }) => {
  const { showConfirm } = useModal();
  const dateTimeFormat = useSyncExternalStore(subscribeDateTimeFormat, getDateTimeFormat);
  const isTwelveHour = dateTimeFormat.timeFormat === TimeFormat.TWELVE_HOUR;
  const storedHours = initialData.schedule?.hours ?? (isTwelveHour ? 0 : 12);
  const initialMeridiem: ScheduleMeridiemEnum = storedHours < 12 ? ScheduleMeridiemEnum.AM : ScheduleMeridiemEnum.PM;
  const initialTwelveHour = storedHours % 12 || 12;

  const initialValues = {
    type: initialData.schedule?.type || ScheduleType.DISABLED,
    hours: isTwelveHour ? String(initialTwelveHour) : String(storedHours),
    meridiem: initialMeridiem,
    minutes: String(initialData.schedule?.minutes ?? 0),
    interval: String(Math.min(Math.max(initialData.schedule?.interval ?? 5, 1), 59)),
    days: initialData.schedule?.days || [],
    notify: initialData.schedule?.notify ?? true,
  };

  const [type, setType] = useState(initialValues.type);
  const [hours, setHours] = useState(initialValues.hours);
  const [meridiem, setMeridiem] = useState(initialValues.meridiem);
  const [minutes, setMinutes] = useState(initialValues.minutes);
  const [interval, setInterval] = useState(initialValues.interval);
  const [days, setDays] = useState(initialValues.days);
  const [notify, setNotify] = useState(initialValues.notify);

  const isDirty =
    type !== initialValues.type ||
    hours !== initialValues.hours ||
    meridiem !== initialValues.meridiem ||
    minutes !== initialValues.minutes ||
    interval !== initialValues.interval ||
    notify !== initialValues.notify ||
    JSON.stringify(days) !== JSON.stringify(initialValues.days);

  const handleMeridiemChange = (value: string) => {
    setMeridiem(value === String(ScheduleMeridiemEnum.PM) ? ScheduleMeridiemEnum.PM : ScheduleMeridiemEnum.AM);
  };

  const getScheduleHours = () => {
    if (!isTwelveHour) {
      return Number(hours);
    }

    if (meridiem === ScheduleMeridiemEnum.AM) {
      return Number(hours) % 12;
    }

    return Number(hours) === 12 ? 12 : Number(hours) + 12;
  };

  const handleSubmit = async () => {
    const schedule: NonNullable<ITask["schedule"]> = { type, notify };

    switch (type) {
      case ScheduleType.DAILY:
        schedule.hours = getScheduleHours();
        schedule.minutes = parseInt(minutes) || 0;
        break;
      case ScheduleType.HOURLY:
        schedule.minutes = parseInt(minutes) || 0;
        break;
      case ScheduleType.MINUTES:
        schedule.interval = Math.min(Math.max(parseInt(interval) || 5, 1), 59);
        break;
      case ScheduleType.WEEKLY:
        schedule.hours = getScheduleHours();
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
          <div className={styles.inputs}>
            <Select
              label="Hour"
              value={hours}
              onChange={setHours}
              options={isTwelveHour ? SCHEDULE_HOUR_OPTIONS_12[meridiem] : SCHEDULE_HOUR_OPTIONS_24}
              className={styles.selectHour}
            />
            {isTwelveHour && (
              <Select
                label="AM/PM"
                value={meridiem}
                onChange={handleMeridiemChange}
                options={SCHEDULE_MERIDIEM_OPTIONS}
                className={styles.selectFormate}
              />
            )}
          </div>
          <Select label="Minutes" value={minutes} onChange={setMinutes} options={SCHEDULE_MINUTE_OPTIONS} />
        </>
      )}
      {type === ScheduleType.HOURLY && (
        <Select label="Minute of the hour" value={minutes} onChange={setMinutes} options={SCHEDULE_MINUTE_OPTIONS} />
      )}
      {type === ScheduleType.MINUTES && (
        <Select label="Interval" value={interval} onChange={setInterval} options={SCHEDULE_MINUTE_OPTIONS.slice(1)} />
      )}
      {type === ScheduleType.WEEKLY && <DaysSelector selectedDays={days} onChange={setDays} />}
      <Line />
      <Checkbox label="System notification?" checked={notify} onChange={() => setNotify((prev) => !prev)} />
      <Button onClick={() => handleSubmit()} className={styles.button}>
        Save
      </Button>
    </Modal>
  );
};

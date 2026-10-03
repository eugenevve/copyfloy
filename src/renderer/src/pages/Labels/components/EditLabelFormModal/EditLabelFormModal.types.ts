import { ILabel } from "@shared/types/labels";

export interface IEditLabelFormModal {
  initialData: ILabel | null;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}

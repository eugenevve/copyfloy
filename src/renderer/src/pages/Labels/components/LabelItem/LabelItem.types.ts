import { ILabel } from "@shared/types/labels";

export interface ILabelItem {
  label: ILabel;
  onEdit: () => void;
  onDelete: () => void;
}

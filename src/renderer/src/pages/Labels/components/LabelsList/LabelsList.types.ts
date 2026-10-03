import { ILabel } from "@shared/types/labels";

export interface ILabelsList {
  items: ILabel[];
  onEdit: (label: ILabel) => void;
  onDelete: (label: ILabel) => void;
}

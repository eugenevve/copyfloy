import { ILabel } from "@shared/types/labels";

export interface ILabelsList {
  items: ILabel[];
  reorder: boolean;
  onEdit: (label: ILabel) => void;
  onDelete: (label: ILabel) => void;
  onReorder: (ids: number[]) => void;
}

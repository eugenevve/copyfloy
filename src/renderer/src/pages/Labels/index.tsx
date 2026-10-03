import { PageWrapper } from "@app/components/PageWrapper";
import { useLabelFilter } from "@app/hooks/useLabelFilter";
import { useLabels } from "@app/hooks/useLabels";
import { useModal } from "@app/hooks/useModal";
import { ILabel } from "@shared/types/labels";
import { FC, useState } from "react";

import { EditLabelFormModal } from "./components/EditLabelFormModal";
import { LabelsHeader } from "./components/LabelsHeader";
import { LabelsList } from "./components/LabelsList";
import styles from "./Labels.module.css";

export const Labels: FC = () => {
  const { showConfirm } = useModal();

  const [isLabelModal, setLabelModal] = useState<{
    open: boolean;
    label: ILabel | null;
  }>({
    open: false,
    label: null,
  });
  const { labels, fetchLabels, deleteLabel } = useLabels();
  const { search, setSearch, filteredLabels } = useLabelFilter(labels);

  // Modal Label
  const handleAddLabel = (): void => {
    setLabelModal({
      open: true,
      label: null,
    });
  };

  const handleEditLabel = (label: ILabel): void => {
    setLabelModal({
      open: true,
      label,
    });
  };

  const handleCloseLabel = (): void => {
    setLabelModal({
      open: false,
      label: null,
    });
  };

  const handleSaveLabel = async () => {
    await fetchLabels();
    handleCloseLabel();
  };

  const handleDeleteLabel = (id: number): void => {
    const labelToDelete = labels.find((label) => label.id === id);
    const labelName = labelToDelete ? `"${labelToDelete.name}"` : "label";

    showConfirm(
      "Delete label?",
      `Are you sure you want to delete the label: ${labelName}? This action cannot be undone.`,
      async () => {
        try {
          await deleteLabel(id);
        } catch (error) {
          console.error("Error deleting label:", error);
        }
      }
    );
  };

  return (
    <>
      <PageWrapper>
        <div className={styles.container}>
          <LabelsHeader
            count={filteredLabels.length}
            onAddLabel={handleAddLabel}
            search={search}
            onSearchChange={setSearch}
          />
          <LabelsList
            items={filteredLabels}
            onEdit={handleEditLabel}
            onDelete={(label) => handleDeleteLabel(label.id)}
          />
        </div>
      </PageWrapper>
      {isLabelModal.open && (
        <EditLabelFormModal initialData={isLabelModal.label} onClose={handleCloseLabel} onSaved={handleSaveLabel} />
      )}
    </>
  );
};

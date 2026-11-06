import { HeaderTools } from "@app/components/HeaderTools";
import { PageWrapper } from "@app/components/PageWrapper";
import { useKeyboardShortcuts } from "@app/hooks/useKeyboardShortcuts";
import { useLabelFilter } from "@app/hooks/useLabelFilter";
import { useLabels } from "@app/hooks/useLabels";
import { useModal } from "@app/hooks/useModal";
import stylesGlobal from "@app/styles/page.module.css";
import { Loader } from "@app/ui/Loader";
import { MAX_LIST_ITEMS } from "@shared/constants/limits";
import { ILabel } from "@shared/types/labels";
import { FC, useState } from "react";

import { EditLabelFormModal } from "./components/EditLabelFormModal";
import { LabelsList } from "./components/LabelsList";

export const Labels: FC = () => {
  const { showConfirm } = useModal();

  const [isLabelModal, setLabelModal] = useState<{
    open: boolean;
    label: ILabel | null;
  }>({
    open: false,
    label: null,
  });
  const { labels, isLoading, fetchLabels, deleteLabel, reorderLabels } = useLabels();
  const { search, setSearch, filteredLabels } = useLabelFilter(labels);

  useKeyboardShortcuts([
    {
      key: "mod+f",
      enabled: !isLabelModal.open,
      action: () => document.getElementById("label-search")?.focus(),
    },
    {
      key: "mod+n",
      enabled: !isLabelModal.open && labels.length < MAX_LIST_ITEMS,
      ignoreInputs: true,
      action: () => setLabelModal({ open: true, label: null }),
    },
  ]);

  // Modal Label
  const handleAddLabel = () => {
    setLabelModal({
      open: true,
      label: null,
    });
  };

  const handleEditLabel = (label: ILabel) => {
    setLabelModal({
      open: true,
      label,
    });
  };

  const handleCloseLabel = () => {
    setLabelModal({
      open: false,
      label: null,
    });
  };

  const handleSaveLabel = async () => {
    await fetchLabels();
    handleCloseLabel();
  };

  const handleDeleteLabel = (id: number) => {
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

  const header = (
    <HeaderTools
      title="Labels"
      count={filteredLabels.length}
      addText="Add label"
      onAdd={handleAddLabel}
      addDisabled={labels.length >= MAX_LIST_ITEMS}
      searchId="label-search"
      search={search}
      onSearchChange={setSearch}
    />
  );

  return (
    <>
      <PageWrapper header={header}>
        <div className={stylesGlobal.container}>
          {isLoading ? (
            <Loader label="Loading labels..." />
          ) : (
            <LabelsList
              items={filteredLabels}
              reorder={!search.trim()}
              onEdit={handleEditLabel}
              onDelete={(label) => handleDeleteLabel(label.id)}
              onReorder={(orderedIds) => reorderLabels(orderedIds)}
            />
          )}
        </div>
      </PageWrapper>
      {isLabelModal.open && (
        <EditLabelFormModal initialData={isLabelModal.label} onClose={handleCloseLabel} onSaved={handleSaveLabel} />
      )}
    </>
  );
};

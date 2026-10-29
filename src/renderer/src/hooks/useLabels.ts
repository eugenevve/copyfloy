import { ILabel } from "@shared/types/labels";
import { useEffect, useState } from "react";

export const useLabels = () => {
  const [labels, setLabels] = useState<ILabel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLabels = async () => {
    const data = await window.api.labels.get();
    setLabels(data);
  };

  const deleteLabel = async (id: number) => {
    const updatedLabels = await window.api.labels.delete(id);
    setLabels(updatedLabels);
  };

  const reorderLabels = async (ids: number[]) => {
    setLabels((prev) => prev.toSorted((a, b) => ids.indexOf(b.id) - ids.indexOf(a.id)));
    await window.api.labels.reorder(ids);
  };

  useEffect(() => {
    void window.api.labels
      .get()
      .then(setLabels)
      .finally(() => setIsLoading(false));
  }, []);

  return {
    labels,
    isLoading,
    fetchLabels,
    deleteLabel,
    reorderLabels,
  };
};

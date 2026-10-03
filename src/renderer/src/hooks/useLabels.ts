import { ILabel } from "@shared/types/labels";
import { useEffect, useState } from "react";

export const useLabels = () => {
  const [labels, setLabels] = useState<ILabel[]>([]);

  const fetchLabels = async () => {
    const data = await window.api.labels.get();
    setLabels(data);
  };

  const deleteLabel = async (id: number) => {
    const updatedTasks = await window.api.labels.delete(id);
    setLabels(updatedTasks);
  };

  useEffect(() => {
    void window.api.labels.get().then(setLabels);
  }, []);

  return {
    labels,
    fetchLabels,
    deleteLabel,
  };
};

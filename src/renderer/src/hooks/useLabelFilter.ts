import { ILabel } from "@shared/types/labels";
import { useState } from "react";

export const useLabelFilter = (labels: ILabel[]) => {
  const [search, setSearch] = useState("");

  const filteredLabels = labels.filter((label) => {
    const matchesSearch = label.name.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return {
    search,
    setSearch,
    filteredLabels,
  };
};

import { PAGE_ITEMS } from "@shared/constants/limits";
import { useState } from "react";

export const usePagination = <T>(items: T[]) => {
  const [limit, setLimit] = useState(PAGE_ITEMS);

  return {
    visibleItems: items.slice(0, limit),
    hasMore: items.length > limit,
    showMore: () => setLimit((prev) => prev + PAGE_ITEMS),
  };
};

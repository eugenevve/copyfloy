export const reorderByDisplayIds = <T extends { id: number }>(items: T[], orderedIds: number[]): T[] | null => {
  const itemsById = new Map(items.map((item) => [item.id, item]));

  if (
    !Array.isArray(orderedIds) ||
    orderedIds.length !== items.length ||
    new Set(orderedIds).size !== items.length ||
    orderedIds.some((id) => !itemsById.has(id))
  ) {
    return null;
  }

  return orderedIds.toReversed().map((id) => itemsById.get(id)!);
};

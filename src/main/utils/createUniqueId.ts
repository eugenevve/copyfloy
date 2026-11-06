export const createUniqueId = (usedIds: Set<number>): number => {
  let id = Date.now();
  while (usedIds.has(id)) {
    id += 1;
  }

  usedIds.add(id);
  return id;
};

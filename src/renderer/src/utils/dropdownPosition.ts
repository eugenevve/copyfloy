export interface IDropdownPosition {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
}

const VIEWPORT_PADDING = 8;
const MAX_DROPDOWN_HEIGHT = 200;

export const getFixedDropdownPosition = (
  anchor: DOMRect,
  viewportWidth: number,
  viewportHeight: number
): IDropdownPosition => {
  const spaceBelow = viewportHeight - anchor.bottom - VIEWPORT_PADDING;
  const maxHeight = Math.max(0, Math.min(MAX_DROPDOWN_HEIGHT, spaceBelow));
  const width = Math.min(anchor.width, Math.max(0, viewportWidth - VIEWPORT_PADDING * 2));
  const left = Math.max(VIEWPORT_PADDING, Math.min(anchor.left, viewportWidth - width - VIEWPORT_PADDING));

  return {
    top: anchor.bottom + VIEWPORT_PADDING,
    left,
    width,
    maxHeight,
  };
};

export const STANDART_ZOOM = 1.0; // Standart 100%
export const MAX_ZOOM = 3.0; // Max 300%
export const MIN_ZOOM = 0.5; // Min 50%
export const ZOOM_STEP = 0.1; // Step 10%

export const clampZoom = (value: number): number => Number(Math.min(Math.max(value, MIN_ZOOM), MAX_ZOOM).toFixed(2));

/** Pure helpers shared by the website arch and the PDF portrait frame. */

export type Focus = { x: number; y: number };
export type CropBox = { left: number; top: number; width: number; height: number };

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * Crop window (in photo pixels) for a portrait frame of aspect `ratio`:
 * start from the largest frame-shaped window that fits the photo (what
 * CSS `object-fit: cover` shows), make it `zoom` times smaller, centre it on
 * `focus` (percentages of the photo) and keep it inside the photo.
 */
export function portraitCrop(
  width: number,
  height: number,
  ratio: number,
  focus: Focus = { x: 50, y: 50 },
  zoom = 1,
): CropBox {
  const z = Math.max(1, zoom);
  const baseWidth = Math.min(width, height * ratio);
  const cropWidth = baseWidth / z;
  const cropHeight = cropWidth / ratio;
  return {
    left: clamp((focus.x / 100) * width - cropWidth / 2, 0, width - cropWidth),
    top: clamp((focus.y / 100) * height - cropHeight / 2, 0, height - cropHeight),
    width: cropWidth,
    height: cropHeight,
  };
}

/**
 * CSS `object-position` (and matching `transform-origin`) percentages that
 * reproduce `crop` when the image uses `object-fit: cover` plus `scale(zoom)`.
 */
export function cropToObjectPosition(width: number, height: number, crop: CropBox): Focus {
  const slackX = width - crop.width;
  const slackY = height - crop.height;
  return {
    x: slackX > 0.5 ? (crop.left / slackX) * 100 : 50,
    y: slackY > 0.5 ? (crop.top / slackY) * 100 : 50,
  };
}

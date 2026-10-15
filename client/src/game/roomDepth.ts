/** World y grows upward. Lower feet are closer to the viewer and draw last. */
export function roomDepthIndex(footY: number, attachment = false) {
  return 10000 - footY * 100 + (attachment ? 0.01 : 0);
}

export function decorationDepthIndex(id: string, centerY: number, size: number, rotationDegrees: number) {
  if (id.includes('tapete')) return -2; // A flat rug stays under contact shadows and paws.
  const angle = rotationDegrees * Math.PI / 180;
  const bottomOffset = size * 0.46 * (Math.abs(Math.cos(angle)) + Math.abs(Math.sin(angle)));
  return roomDepthIndex(centerY - bottomOffset);
}

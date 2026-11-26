/** Percent offsets inside the scope for a polar position (degrees clockwise from 12 o'clock, 0-1 of the radius). */
export const polarToPercent = (angle: number, radius: number) => {
  const rad = (angle * Math.PI) / 180;
  return {
    left: 50 + radius * 50 * Math.sin(rad),
    top: 50 - radius * 50 * Math.cos(rad),
  };
};

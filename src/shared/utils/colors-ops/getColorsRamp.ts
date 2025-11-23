function rgbToHex(r: number, g: number, b: number) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    }
    : null;
}

/**
 * Color steps between two colors
 * 
 * @source Решение задачи получения промежуточных цветов в соотв. с заданным отрезком и количеству шагов
 *
 * @export
 * @param {string} startColor 
 * @param {string} endColor 
 * @param {number} steps 
 * @returns {string[]} An array of startColor, colors between according to steps, and endColor
 */
export function getColorsRamp(startColor: string, endColor: string, steps: number) {
  const ramp = [];

  ramp.push(startColor);

  const _defaultColor = {
    r: 0,
    g: 0,
    b: 0,
  }

  const startColorRgb = hexToRgb(startColor) || _defaultColor;
  const endColorRgb = hexToRgb(endColor) || _defaultColor;

  const rInc = Math.round((endColorRgb.r - startColorRgb.r) / (steps + 1));
  const gInc = Math.round((endColorRgb.g - startColorRgb.g) / (steps + 1));
  const bInc = Math.round((endColorRgb.b - startColorRgb.b) / (steps + 1));

  for (let i = 0; i < steps; i++) {
    if (!!startColorRgb) {
      startColorRgb.r += rInc;
      startColorRgb.g += gInc;
      startColorRgb.b += bInc;
    }
    ramp.push(rgbToHex(startColorRgb.r, startColorRgb.g, startColorRgb.b));
  }
  ramp.push(endColor);

  return ramp;
}
import chroma from 'chroma-js';

export function hsvToHsl(h: number, s: number, v: number) {
  return chroma(h, s, v, 'hsv').hsl();
}

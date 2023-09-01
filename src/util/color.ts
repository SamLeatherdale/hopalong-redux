import chroma from 'chroma-js';

export function hsvToHsl(h: number, s: number, v: number): [number, number, number] {
  const [hue, sat, light] = chroma(h, s, v, 'hsv').hsl();
  return [hue, sat, light];
}

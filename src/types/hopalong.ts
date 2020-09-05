import { Vector3 } from 'three';

export type OrbitParams<T> = {
  a: T;
  b: T;
  c: T;
  d: T;
  e: T;
};
export type Orbit<T> = {
  subsets: SubsetPoint[][];
  xMin: T;
  xMax: T;
  yMin: T;
  yMax: T;
  scaleX: T;
  scaleY: T;
};
export type SubsetPoint = {
  x: number;
  y: number;
  vertex: Vector3;
};

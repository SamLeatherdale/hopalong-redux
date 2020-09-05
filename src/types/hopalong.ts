import { BufferGeometry, Geometry, Material, Points, Vector3 } from 'three';

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
export type ParticleSet<
  TGeometry extends Geometry | BufferGeometry,
  TMaterial extends Material | Material[]
> = {
  myMaterial: TMaterial;
  myLevel: number;
  mySubset: number;
  needsUpdate: boolean;
  particles: Points<TGeometry, TMaterial>;
};

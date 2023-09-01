import { Material, Points, Vector3 } from 'three';

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
export type ParticleSet<TMaterial extends Material | Material[]> = {
  /** The material/colour used to draw this ParticleSet */
  myMaterial: TMaterial;
  /** Index of the level this ParticleSet belongs to */
  myLevel: number;
  /** Index of the subset this ParticleSet belongs to */
  mySubset: number;
  /** Whether the colour has been updated since last render */
  needsUpdate: boolean;
  /** The underlying location data of the particles */
  particles: Points;
};
/** Settings that can be adjusted while the simulation is running */
export type SimpleMenuSettings = {
  speed: number;
  rotationSpeed: number;
  cameraFov: number;
};
export type SimpleSettings = SimpleMenuSettings & Omit<ToolbarSettings, 'isPlaying'>;
/** Settings that require recreating the simulation */
export type AdvancedSettings = {
  pointsPerSubset: number;
  subsetCount: number;
  levelCount: number;
};

export type MenuSettings = SimpleMenuSettings & AdvancedSettings;
export type ToolbarSettings = {
  mouseLocked: boolean;
  isPlaying: boolean;
};
export type Settings = MenuSettings & ToolbarSettings;
export type OnSettingsChange<T> = (settings: Partial<T>) => unknown;

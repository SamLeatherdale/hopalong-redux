/*
 * AUTHOR: Iacopo Sassarini
 * Updated by Sam Leatherdale
 */
import autoBind from 'auto-bind';
import {
  AdditiveBlending,
  BufferGeometry,
  FogExp2,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  Texture,
  Vector3,
  WebGLRenderer,
} from 'three';
import {
  AdvancedSettings,
  Orbit,
  OrbitParams,
  ParticleSet,
  Settings,
  SimpleSettings,
  SubsetPoint,
} from './types/hopalong';
import { hsvToHsl } from './util/color';

const SCALE_FACTOR = 1500;
const CAMERA_BOUND = 200;

const LEVEL_DEPTH = 600;

const DEF_BRIGHTNESS = 1;
const DEF_SATURATION = 0.8;

const SPRITE_SIZE = 5;

// Orbit parameters constraints
const A_MIN = -30;
const A_MAX = 30;
const B_MIN = 0.2;
const B_MAX = 1.8;
const C_MIN = 5;
const C_MAX = 17;
const D_MIN = 0;
const D_MAX = 10;
const E_MIN = 0;
const E_MAX = 12;

export const DEFAULT_SPEED = 8;
export const DEFAULT_ROTATION_SPEED = 0.005;
export const DEFAULT_FOV = 60;

export const DEFAULT_POINTS_SUBSET = 4000;
export const DEFAULT_SUBSETS = 7;
export const DEFAULT_LEVELS = 7;

type HopalongParticleSet = ParticleSet<PointsMaterial>;

type ConstructorProps = {
  advancedSettings: Partial<AdvancedSettings>;
  canvas: HTMLCanvasElement;
  texture: Texture;
  stats: Stats;
  onSettingsUpdate: (settings: Settings) => unknown;
};

export default class Hopalong {
  // Orbit parameters
  orbitParams: OrbitParams<number> = {
    a: 0,
    b: 0,
    c: 0,
    d: 0,
    e: 0,
  };

  texture: Texture;
  camera: PerspectiveCamera;
  scene: Scene;
  renderer: WebGLRenderer;
  stats: Stats;
  onSettingsUpdate: (settings: SimpleSettings) => unknown;

  hueValues: number[] = [];

  mouseX = 0;
  mouseY = 0;
  mouseLocked = false;

  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  speed = DEFAULT_SPEED;
  speedDelta = 0.5;
  rotationSpeed = DEFAULT_ROTATION_SPEED;
  rotationSpeedDelta = 0.001;

  numPointsSubset = DEFAULT_POINTS_SUBSET;
  numSubsets = DEFAULT_SUBSETS;
  numLevels = DEFAULT_LEVELS;

  // Orbit data
  orbit: Orbit<number> = {
    subsets: [],
    xMin: 0,
    xMax: 0,
    yMin: 0,
    yMax: 0,
    scaleX: 0,
    scaleY: 0,
  };
  particleSets: HopalongParticleSet[] = [];
  updateIntervalKey: number;
  destroyed = false;

  constructor({ advancedSettings, canvas, texture, stats, onSettingsUpdate }: ConstructorProps) {
    autoBind(this);

    const { subsetCount, levelCount, pointsPerSubset } = advancedSettings;
    this.numSubsets = subsetCount || DEFAULT_SUBSETS;
    this.numLevels = levelCount || DEFAULT_LEVELS;
    this.numPointsSubset = pointsPerSubset || DEFAULT_POINTS_SUBSET;
    this.texture = texture;
    this.stats = stats;
    this.initOrbit();
    this.init(canvas);
    this.animate();
    this.onSettingsUpdate = onSettingsUpdate;
    this.fireSettingsChange();
  }

  destroy() {
    window.clearInterval(this.updateIntervalKey);
    this.renderer.dispose();
    this.destroyed = true;
  }

  initOrbit() {
    // Initialize data points
    for (let i = 0; i < this.numSubsets; i++) {
      const subsetPoints: SubsetPoint[] = [];
      for (let j = 0; j < this.numPointsSubset; j++) {
        subsetPoints[j] = {
          x: 0,
          y: 0,
          vertex: new Vector3(0, 0, 0),
        };
      }
      this.orbit.subsets.push(subsetPoints);
    }
  }

  init(canvas: HTMLCanvasElement) {
    // Setup renderer and effects
    this.renderer = new WebGLRenderer({
      canvas,
      antialias: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setClearColor(0x000000);
    this.renderer.setClearAlpha(1);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);

    this.camera = new PerspectiveCamera(
      DEFAULT_FOV,
      window.innerWidth / window.innerHeight,
      1,
      3 * SCALE_FACTOR
    );
    this.camera.position.set(0, 0, SCALE_FACTOR / 2);

    this.scene = new Scene();
    this.scene.fog = new FogExp2(0x000000, 0.001);

    this.generateOrbit();
    this.generateHues();

    // Create particle systems
    for (let k = 0; k < this.numLevels; k++) {
      for (let s = 0; s < this.numSubsets; s++) {
        // Updating from Geometry to BufferGeometry
        // https://github.com/mrdoob/three.js/pull/21031
        // https://discourse.threejs.org/t/three-geometry-will-be-removed-from-core-with-r125/22401
        const vertices = this.orbit.subsets[s].map(({ vertex }) => vertex)
        const geometry = new BufferGeometry();
        geometry.setFromPoints(vertices);

        // Updating from ParticleSystem to points
        // https://github.com/mrdoob/three.js/issues/4065
        const materials = new PointsMaterial({
          size: SPRITE_SIZE,
          map: this.texture,
          blending: AdditiveBlending,
          depthTest: false,
          transparent: false,
        });

        materials.color.setHSL(...hsvToHsl(this.hueValues[s], DEF_SATURATION, DEF_BRIGHTNESS));

        const particles = new Points(geometry, materials);
        particles.position.x = 0;
        particles.position.y = 0;
        particles.position.z =
          -LEVEL_DEPTH * k - (s * LEVEL_DEPTH) / this.numSubsets + SCALE_FACTOR / 2;

        const particleSet: HopalongParticleSet = {
          myMaterial: materials,
          myLevel: k,
          mySubset: s,
          needsUpdate: false,
          particles,
        };

        this.scene.add(particles);
        this.particleSets.push(particleSet);
      }
    }

    this.addEventListeners();
    this.onWindowResize();

    // Schedule orbit regeneration
    this.updateIntervalKey = window.setInterval(this.updateOrbit, 3000);
  }

  addEventListeners() {
    // Setup listeners
    document.addEventListener('mousemove', this.onDocumentMouseMove, false);
    document.addEventListener('touchstart', this.onDocumentTouchStart, false);
    document.addEventListener('touchmove', this.onDocumentTouchMove, false);
    document.addEventListener('keydown', this.onKeyDown, false);
    window.addEventListener('resize', this.onWindowResize, false);
  }

  animate() {
    if (this.destroyed) {
      // This function will continue to run as long as it requests animation frames,
      // so we must stop it
      return;
    }
    requestAnimationFrame(this.animate);
    this.stats.begin();
    this.render();
    this.stats.end();
  }

  render() {
    if (this.camera.position.x >= -CAMERA_BOUND && this.camera.position.x <= CAMERA_BOUND) {
      this.camera.position.x += (this.getMouseX() - this.camera.position.x) * 0.05;
      if (this.camera.position.x < -CAMERA_BOUND) {
        this.camera.position.x = -CAMERA_BOUND;
      }
      if (this.camera.position.x > CAMERA_BOUND) {
        this.camera.position.x = CAMERA_BOUND;
      }
    }
    if (this.camera.position.y >= -CAMERA_BOUND && this.camera.position.y <= CAMERA_BOUND) {
      this.camera.position.y += (-this.getMouseY() - this.camera.position.y) * 0.05;
      if (this.camera.position.y < -CAMERA_BOUND) {
        this.camera.position.y = -CAMERA_BOUND;
      }
      if (this.camera.position.y > CAMERA_BOUND) {
        this.camera.position.y = CAMERA_BOUND;
      }
    }

    this.camera.lookAt(this.scene.position);

    // update particle positions
    // for (let i = 0; i < this.scene.children.length; i++) {
    for (const particleSet of this.particleSets) {
      const { particles, myMaterial, mySubset } = particleSet;
      particles.position.z += this.speed;
      particles.rotation.z += this.rotationSpeed;

      // if the particle level has passed the fade distance
      if (particles.position.z > this.camera.position.z) {
        // move the particle level back in front of the camera
        particles.position.z = -(this.numLevels - 1) * LEVEL_DEPTH;

        if (particleSet.needsUpdate) {
          // update the geometry and color
          const vertices = this.orbit.subsets[mySubset].map(({ vertex }) => vertex)
          const geometry = particleSet.particles.geometry;

          geometry.setFromPoints(vertices);
          particles.geometry.attributes.position.needsUpdate = true;

          myMaterial.color.setHSL(
            ...hsvToHsl(this.hueValues[mySubset], DEF_SATURATION, DEF_BRIGHTNESS)
          );
          particleSet.needsUpdate = false;
        }
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  ///////////////////////////////////////////////
  // Hopalong Orbit Generator
  ///////////////////////////////////////////////

  updateOrbit() {
    this.generateOrbit();
    this.generateHues();
    for (const particleSet of this.particleSets.values()) {
      particleSet.needsUpdate = true;
    }
  }

  generateHues() {
    for (let s = 0; s < this.numSubsets; s++) {
      this.hueValues[s] = Math.random();
    }
  }

  generateOrbit() {
    let x, y, z, x1;

    this.prepareOrbit();

    const { a, b, c, d, e } = this.orbitParams;
    // Using local vars should be faster
    const al = a;
    const bl = b;
    const cl = c;
    const dl = d;
    const el = e;
    const subsets = this.orbit.subsets;
    const num_points_subset_l = this.numPointsSubset;
    const scale_factor_l = SCALE_FACTOR;

    let xMin = 0,
      xMax = 0,
      yMin = 0,
      yMax = 0;
    const choice = Math.random();

    for (let s = 0; s < this.numSubsets; s++) {
      // Use a different starting point for each orbit subset
      x = s * 0.005 * (0.5 - Math.random());
      y = s * 0.005 * (0.5 - Math.random());

      const curSubset = subsets[s];

      for (let i = 0; i < num_points_subset_l; i++) {
        // Iteration formula (generalization of the Barry Martin's original one)

        if (choice < 0.5) {
          z = dl + Math.sqrt(Math.abs(bl * x - cl));
        } else if (choice < 0.75) {
          z = dl + Math.sqrt(Math.sqrt(Math.abs(bl * x - cl)));
        } else {
          z = dl + Math.log(2 + Math.sqrt(Math.abs(bl * x - cl)));
        }

        if (x > 0) {
          x1 = y - z;
        } else if (x == 0) {
          x1 = y;
        } else {
          x1 = y + z;
        }
        y = al - x;
        x = x1 + el;

        curSubset[i].x = x;
        curSubset[i].y = y;

        if (x < xMin) {
          xMin = x;
        } else if (x > xMax) {
          xMax = x;
        }
        if (y < yMin) {
          yMin = y;
        } else if (y > yMax) {
          yMax = y;
        }
      }
    }

    const scaleX = (2 * scale_factor_l) / (xMax - xMin);
    const scaleY = (2 * scale_factor_l) / (yMax - yMin);

    this.orbit.xMin = xMin;
    this.orbit.xMax = xMax;
    this.orbit.yMin = yMin;
    this.orbit.yMax = yMax;
    this.orbit.scaleX = scaleX;
    this.orbit.scaleY = scaleY;

    // Normalize and update vertex data
    for (let s = 0; s < this.numSubsets; s++) {
      const curSubset = subsets[s];
      for (let i = 0; i < num_points_subset_l; i++) {
        curSubset[i].vertex.setX(scaleX * (curSubset[i].x - xMin) - scale_factor_l);
        curSubset[i].vertex.setY(scaleY * (curSubset[i].y - yMin) - scale_factor_l);
      }
    }
  }

  prepareOrbit() {
    this.shuffleParams();
    this.orbit.xMin = 0;
    this.orbit.xMax = 0;
    this.orbit.yMin = 0;
    this.orbit.yMax = 0;
  }

  shuffleParams() {
    this.orbitParams = {
      a: A_MIN + Math.random() * (A_MAX - A_MIN),
      b: B_MIN + Math.random() * (B_MAX - B_MIN),
      c: C_MIN + Math.random() * (C_MAX - C_MIN),
      d: D_MIN + Math.random() * (D_MAX - D_MIN),
      e: E_MIN + Math.random() * (E_MAX - E_MIN),
    };
  }

  ///////////////////////////////////////////////
  // Event listeners
  ///////////////////////////////////////////////

  onDocumentMouseMove(event: MouseEvent) {
    if (this.mouseLocked) {
      return;
    }
    this.mouseX = event.clientX - this.windowHalfX;
    this.mouseY = event.clientY - this.windowHalfY;
  }

  onDocumentTouchStart(event: TouchEvent) {
    if (this.mouseLocked) {
      return;
    }
    if (event.touches.length == 1) {
      this.mouseX = event.touches[0].pageX - this.windowHalfX;
      this.mouseY = event.touches[0].pageY - this.windowHalfY;
    }
  }

  onDocumentTouchMove(event: TouchEvent) {
    if (this.mouseLocked) {
      return;
    }
    if (event.touches.length == 1) {
      this.mouseX = event.touches[0].pageX - this.windowHalfX;
      this.mouseY = event.touches[0].pageY - this.windowHalfY;
    }
  }

  setMouseLock(locked?: boolean) {
    if (typeof locked === 'undefined') {
      this.mouseLocked = !this.mouseLocked;
    } else {
      this.mouseLocked = locked;
    }
    this.fireSettingsChange();
  }

  recenterCamera() {
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.mouseX = 0;
    this.mouseY = 0;

    this.setMouseLock();
  }

  getMouseX() {
    return this.mouseX;
  }
  getMouseY() {
    return this.mouseY;
  }

  applySettings({ speed, rotationSpeed, mouseLocked, cameraFov }: Partial<SimpleSettings>) {
    if (typeof speed !== 'undefined') {
      this.speed = speed;
    }
    if (typeof rotationSpeed !== 'undefined') {
      this.rotationSpeed = rotationSpeed;
    }
    if (typeof mouseLocked !== 'undefined') {
      this.mouseLocked = mouseLocked;
    }
    if (typeof cameraFov !== 'undefined') {
      this.setCameraFOV(cameraFov);
    }
    this.fireSettingsChange();
  }

  fireSettingsChange() {
    this.onSettingsUpdate(this.getSettings());
  }

  getSettings(): SimpleSettings {
    const { speed, rotationSpeed, mouseLocked } = this;
    return {
      speed,
      rotationSpeed,
      mouseLocked,
      cameraFov: this.camera.fov,
    };
  }

  changeSpeed(delta: number) {
    const newSpeed = this.speed + delta;
    if (newSpeed >= 0) {
      this.speed = newSpeed;
    } else {
      this.speed = 0;
    }
    this.fireSettingsChange();
  }

  changeRotationSpeed(delta: number) {
    this.rotationSpeed += delta;
    this.fireSettingsChange();
  }

  resetDefaults() {
    this.speed = DEFAULT_SPEED;
    this.rotationSpeed = DEFAULT_ROTATION_SPEED;
    this.camera.fov = DEFAULT_FOV;
    this.fireSettingsChange();
  }

  onKeyDown(event: KeyboardEvent) {
    const { key } = event;
    const keyUpper = key.toUpperCase();

    if (key === 'ArrowUp' || keyUpper === 'W') {
      this.changeSpeed(this.speedDelta);
    } else if (key === 'ArrowDown' || keyUpper === 'S') {
      this.changeSpeed(-this.speedDelta);
    } else if (key === 'ArrowLeft' || keyUpper === 'A') {
      this.changeRotationSpeed(this.rotationSpeedDelta);
    } else if (key === 'ArrowRight' || keyUpper === 'D') {
      this.changeRotationSpeed(this.rotationSpeedDelta);
    } else if (keyUpper === 'R') {
      this.resetDefaults();
    } else if (keyUpper === 'L') {
      this.setMouseLock();
    } else if (keyUpper === 'H') {
      document.body.classList.toggle('hideCursor');
    } else if (keyUpper === 'C') {
      this.recenterCamera();
    }
  }

  onWindowResize() {
    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
  }

  setCameraFOV(fov: number) {
    this.camera.fov = fov;
    this.camera.updateProjectionMatrix();
    this.fireSettingsChange();
  }
}

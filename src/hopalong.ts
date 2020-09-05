/*
 * AUTHOR: Iacopo Sassarini
 * Updated by Sam Leatherdale
 */
import autoBind from 'auto-bind';
import {
  AdditiveBlending,
  BufferAttribute,
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
import { Orbit, OrbitParams, ParticleSet, SubsetPoint } from './types/hopalong';
import UIManager from './UIManager';
import { hsvToHsl } from './util/color';

const SCALE_FACTOR = 1500;
const CAMERA_BOUND = 200;

const NUM_POINTS_SUBSET = 32000;
const NUM_SUBSETS = 7;

const NUM_LEVELS = 7;
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

const DEFAULT_SPEED = 8;
const DEFAULT_ROTATION_SPEED = 0.005;

type HopalongParticleSet = ParticleSet<BufferGeometry, PointsMaterial>;

export default class Hopalong {
  // Orbit parameters
  orbitParams: OrbitParams<number> = {
    a: 0,
    b: 0,
    c: 0,
    d: 0,
    e: 0,
  };

  camera: PerspectiveCamera;
  scene: Scene;
  renderer: WebGLRenderer;
  uiManager: UIManager;
  hueValues: number[] = [];

  mouseX = 0;
  mouseY = 0;

  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  speed = DEFAULT_SPEED;
  speedDelta = 0.5;
  rotationSpeed = DEFAULT_ROTATION_SPEED;
  rotationSpeedDelta = 0.001;

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

  constructor(canvas: HTMLCanvasElement, texture: Texture) {
    autoBind(this);

    this.initOrbit();
    this.init(canvas, texture);
    this.animate();
  }

  initOrbit() {
    // Initialize data points
    for (let i = 0; i < NUM_SUBSETS; i++) {
      const subsetPoints: SubsetPoint[] = [];
      for (let j = 0; j < NUM_POINTS_SUBSET; j++) {
        subsetPoints[j] = {
          x: 0,
          y: 0,
          vertex: new Vector3(0, 0, 0),
        };
      }
      this.orbit.subsets.push(subsetPoints);
    }
  }

  init(canvas: HTMLCanvasElement, texture: Texture) {
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
      60,
      window.innerWidth / window.innerHeight,
      1,
      3 * SCALE_FACTOR
    );
    this.camera.position.set(0, 0, SCALE_FACTOR / 2);

    this.scene = new Scene();
    this.scene.fog = new FogExp2(0x000000, 0.001);

    this.generateOrbit();

    for (let s = 0; s < NUM_SUBSETS; s++) {
      this.hueValues[s] = Math.random();
    }

    // Create particle systems
    const POINTS_PER_VERTEX = 3;
    for (let k = 0; k < NUM_LEVELS; k++) {
      for (let s = 0; s < NUM_SUBSETS; s++) {
        const geometry = new BufferGeometry();
        const vertices = new Float32Array(
          NUM_POINTS_SUBSET * POINTS_PER_VERTEX
        );
        for (let i = 0; i < NUM_POINTS_SUBSET; i++) {
          const vertex = this.orbit.subsets[s][i].vertex.toArray();
          for (let v = 0; v < vertex.length; v++) {
            vertices[i * POINTS_PER_VERTEX + v] = vertex[v];
          }
        }
        geometry.setAttribute(
          'position',
          new BufferAttribute(vertices, POINTS_PER_VERTEX)
        );

        // Updating from ParticleSystem to points
        // https://github.com/mrdoob/three.js/issues/4065
        const materials = new PointsMaterial({
          size: SPRITE_SIZE,
          map: texture,
          blending: AdditiveBlending,
          depthTest: false,
          transparent: false,
        });

        materials.color.setHSL(
          ...hsvToHsl(this.hueValues[s], DEF_SATURATION, DEF_BRIGHTNESS)
        );

        const particles = new Points(geometry, materials);
        particles.position.x = 0;
        particles.position.y = 0;
        particles.position.z =
          -LEVEL_DEPTH * k - (s * LEVEL_DEPTH) / NUM_SUBSETS + SCALE_FACTOR / 2;

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

    this.uiManager = new UIManager(this);
    this.addEventListeners();
    this.onWindowResize();

    // Schedule orbit regeneration
    setInterval(this.updateOrbit, 3000);
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
    requestAnimationFrame(this.animate);
    this.render();
    this.uiManager.updateStats();
  }

  render() {
    if (
      this.camera.position.x >= -CAMERA_BOUND &&
      this.camera.position.x <= CAMERA_BOUND
    ) {
      this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.05;
      if (this.camera.position.x < -CAMERA_BOUND) {
        this.camera.position.x = -CAMERA_BOUND;
      }
      if (this.camera.position.x > CAMERA_BOUND) {
        this.camera.position.x = CAMERA_BOUND;
      }
    }
    if (
      this.camera.position.y >= -CAMERA_BOUND &&
      this.camera.position.y <= CAMERA_BOUND
    ) {
      this.camera.position.y += (-this.mouseY - this.camera.position.y) * 0.05;
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
      const { particles } = particleSet;
      particles.position.z += this.speed;
      particles.rotation.z += this.rotationSpeed;

      // if the particle level has passed the fade distance
      if (particles.position.z > this.camera.position.z) {
        // move the particle level back in front of the camera
        particles.position.z = -(NUM_LEVELS - 1) * LEVEL_DEPTH;

        if (particleSet.needsUpdate) {
          // update the geometry and color
          particleSet.myMaterial.color.setHSL(
            ...hsvToHsl(particleSet.mySubset, DEF_SATURATION, DEF_BRIGHTNESS)
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
    for (let s = 0; s < NUM_SUBSETS; s++) {
      this.hueValues[s] = Math.random();
    }
    for (const particleSet of this.particleSets.values()) {
      particleSet.needsUpdate = true;
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
    const num_points_subset_l = NUM_POINTS_SUBSET;
    const scale_factor_l = SCALE_FACTOR;

    let xMin = 0,
      xMax = 0,
      yMin = 0,
      yMax = 0;
    const choice = Math.random();

    for (let s = 0; s < NUM_SUBSETS; s++) {
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
    for (let s = 0; s < NUM_SUBSETS; s++) {
      const curSubset = subsets[s];
      for (let i = 0; i < num_points_subset_l; i++) {
        curSubset[i].vertex.setX(
          scaleX * (curSubset[i].x - xMin) - scale_factor_l
        );
        curSubset[i].vertex.setY(
          scaleY * (curSubset[i].y - yMin) - scale_factor_l
        );
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
    this.mouseX = event.clientX - this.windowHalfX;
    this.mouseY = event.clientY - this.windowHalfY;
  }

  onDocumentTouchStart(event: TouchEvent) {
    if (event.touches.length == 1) {
      // event.preventDefault();
      this.mouseX = event.touches[0].pageX - this.windowHalfX;
      this.mouseY = event.touches[0].pageY - this.windowHalfY;
    }
  }

  onDocumentTouchMove(event: TouchEvent) {
    if (event.touches.length == 1) {
      // event.preventDefault();
      this.mouseX = event.touches[0].pageX - this.windowHalfX;
      this.mouseY = event.touches[0].pageY - this.windowHalfY;
    }
  }

  changeSpeed(delta: number) {
    const newSpeed = this.speed + delta;
    if (newSpeed >= 0) {
      this.speed = newSpeed;
    } else {
      this.speed = 0;
    }
  }

  changeRotationSpeed(delta: number) {
    this.rotationSpeed += delta;
  }

  resetDefaultSpeed() {
    this.speed = DEFAULT_SPEED;
    this.rotationSpeed = DEFAULT_ROTATION_SPEED;
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowUp' || event.key.toUpperCase() === 'W') {
      this.changeSpeed(this.speedDelta);
    } else if (event.key === 'ArrowDown' || event.key.toUpperCase() === 'S') {
      this.changeSpeed(-this.speedDelta);
    } else if (event.key === 'ArrowLeft' || event.key.toUpperCase() === 'A') {
      this.changeRotationSpeed(this.rotationSpeedDelta);
    } else if (event.key === 'ArrowRight' || event.key.toUpperCase() === 'D') {
      this.changeRotationSpeed(this.rotationSpeedDelta);
    } else if (event.key.toUpperCase() === 'R') {
      this.resetDefaultSpeed();
    } else if (event.key.toUpperCase() === 'H' || event.key === '8') {
      this.uiManager.toggleVisuals();
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
}

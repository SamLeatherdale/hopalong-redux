/*
 * AUTHOR: Iacopo Sassarini
 * Updated by Sam Leatherdale
 */
import autoBind from 'auto-bind';
import {
  AdditiveBlending,
  FogExp2,
  Geometry,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  TextureLoader,
  Vector3,
  WebGLRenderer,
} from 'three';
import { ColorConverter } from 'three/examples/jsm/math/ColorConverter';
import { Orbit, OrbitParams, ParticleSet, SubsetPoint } from './types/hopalong';
import UI from './ui';
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

type MyParticleSet = ParticleSet<Geometry, PointsMaterial>;

export default class Hopalong {
  // Orbit parameters
  orbitParams: OrbitParams<number> = {
    a: 0,
    b: 0,
    c: 0,
    d: 0,
    e: 0,
  };

  container: HTMLElement;
  camera: PerspectiveCamera;
  scene: Scene;
  renderer: WebGLRenderer;
  UI: UI;
  hueValues: number[] = [];

  mouseX = 0;
  mouseY = 0;

  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;
  speed = 8;
  rotationSpeed = 0.005;

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
  particleSets: MyParticleSet[] = [];

  constructor() {
    autoBind(this);
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

    this.init();
    this.animate();
  }

  init() {
    const galaxyTexture = new TextureLoader().load('galaxy.png');

    this.container = document.createElement('div');
    document.body.appendChild(this.container);

    this.camera = new PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      3 * SCALE_FACTOR
    );
    this.camera.position.z = SCALE_FACTOR / 2;

    this.scene = new Scene();
    this.scene.fog = new FogExp2(0x000000, 0.001);

    this.generateOrbit();

    for (let s = 0; s < NUM_SUBSETS; s++) {
      this.hueValues[s] = Math.random();
    }

    // Create particle systems
    for (let k = 0; k < NUM_LEVELS; k++) {
      for (let s = 0; s < NUM_SUBSETS; s++) {
        const geometry = new Geometry();
        for (let i = 0; i < NUM_POINTS_SUBSET; i++) {
          geometry.vertices.push(this.orbit.subsets[s][i].vertex);
        }

        // Updating from ParticleSystem to points
        // https://github.com/mrdoob/three.js/issues/4065
        const materials = new PointsMaterial({
          size: SPRITE_SIZE,
          map: galaxyTexture,
          blending: AdditiveBlending,
          depthTest: false,
          transparent: true,
        });
        materials.color.setHSL(
          ...hsvToHsl(this.hueValues[s], DEF_SATURATION, DEF_BRIGHTNESS)
        );

        const particles = new Points(geometry, materials);
        particles.position.x = 0;
        particles.position.y = 0;
        particles.position.z =
          -LEVEL_DEPTH * k - (s * LEVEL_DEPTH) / NUM_SUBSETS + SCALE_FACTOR / 2;
        const particleSet: MyParticleSet = {
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

    // Setup renderer and effects
    this.renderer = new WebGLRenderer({
      // clearColor: 0x000000,
      // clearAlpha: 1,
      antialias: false,
    });
    this.renderer.setClearColor(0x000000);
    this.renderer.setClearAlpha(1);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    //this.renderer.setPixelRatio(window.devicePixelRatio || 1);

    this.container.appendChild(this.renderer.domElement);

    // init ui
    this.UI = new UI(this);
    this.addEventListeners();

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
    this.UI.updateStats();
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
          particles.geometry.verticesNeedUpdate = true;
          ColorConverter.setHSV(
            particleSet.myMaterial.color,
            particleSet.mySubset,
            DEF_SATURATION,
            DEF_BRIGHTNESS
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
    for (const particleSet of this.particleSets) {
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

  onKeyDown(event: KeyboardEvent) {
    if (event.keyCode == 38 && this.speed < 20) {
      this.speed += 0.5;
    } else if (event.keyCode == 40 && this.speed > 0) {
      this.speed -= 0.5;
    } else if (event.keyCode == 37) {
      this.rotationSpeed += 0.001;
    } else if (event.keyCode == 39) {
      this.rotationSpeed -= 0.001;
    } else if (event.keyCode == 72 || event.keyCode == 104) {
      this.UI.toggleVisuals();
    }
  }

  onWindowResize() {
    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

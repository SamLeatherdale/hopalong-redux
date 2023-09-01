import autoBind from 'auto-bind';
import React from 'react';
import { render } from 'react-dom';
import 'reset.css';
import './main.css';
import { debounce, pick } from 'lodash';
import Stats from 'stats.js';
import { TextureLoader } from 'three';
import App from './components/App';
import Hopalong, {
  DEFAULT_FOV,
  DEFAULT_LEVELS,
  DEFAULT_POINTS_SUBSET,
  DEFAULT_ROTATION_SPEED,
  DEFAULT_SPEED,
  DEFAULT_SUBSETS,
} from './hopalong';
import textureUrl from './images/galaxy.png';
import { AdvancedSettings, Settings } from './types/hopalong';
import Detector from './util/Detector';

class Program {
  hopalong: Hopalong;
  texture = new TextureLoader().load(textureUrl);
  stats = new Stats();
  settings: Settings = {
    pointsPerSubset: DEFAULT_POINTS_SUBSET,
    levelCount: DEFAULT_LEVELS,
    subsetCount: DEFAULT_SUBSETS,
    speed: DEFAULT_SPEED,
    rotationSpeed: DEFAULT_ROTATION_SPEED,
    cameraFov: DEFAULT_FOV,
    isPlaying: false,
    mouseLocked: false,
  };
  debounceCreateHopalong = debounce(this.createHopalong, 1000);

  constructor() {
    autoBind(this);
    this.createHopalong();
  }

  createHopalong(advancedSettings: Partial<AdvancedSettings> = {}) {
    if (this.hopalong) {
      this.hopalong.destroy();
    }
    const canvas = document.getElementById('render-canvas');
    if (typeof canvas !== 'object' || !(canvas instanceof HTMLCanvasElement)) {
      throw new Error('Unable to find canvas.');
    }

    this.hopalong = new Hopalong({
      advancedSettings,
      canvas,
      texture: this.texture,
      stats: this.stats,
      onSettingsUpdate: (settings) => this.renderReact(settings),
    });

    // Apply any saved settings from last instance
    this.hopalong.applySettings(this.settings);
  }

  renderReact(settings: Settings) {
    const reactRoot = document.getElementById('react-root');
    if (!reactRoot) {
      throw new Error('Unable to find React root.');
    }
    render(
      <App
        stats={this.stats}
        settings={{ ...this.settings, ...settings }}
        onSettingsChange={this.applySettings}
        onCenter={() => this.hopalong.recenterCamera()}
        onReset={() => this.hopalong.resetDefaults()}
      />,
      reactRoot
    );
  }

  applySettings(partialSettings: Partial<Settings>) {
    const { pointsPerSubset, levelCount, subsetCount, isPlaying, ...simpleSettings } =
      partialSettings;
    const advancedSettings: Partial<AdvancedSettings> = {
      pointsPerSubset,
      levelCount,
      subsetCount,
    };
    const newAdvancedSettings: Partial<AdvancedSettings> = pick(
      advancedSettings,
      Object.entries(advancedSettings)
        .filter(([, v]) => typeof v !== 'undefined')
        .map(([k]) => k)
    );
    this.hopalong.applySettings(simpleSettings);
    const settings: Settings = {
      ...this.settings,
      ...this.hopalong.getSettings(),
      ...newAdvancedSettings,
      isPlaying: isPlaying ?? this.settings.isPlaying,
    };
    this.settings = settings;

    if (Object.keys(newAdvancedSettings).length > 0) {
      // We need to create a new instance for advanced settings
      this.debounceCreateHopalong(newAdvancedSettings);
      // In the meantime, update settings with latest changes
      this.renderReact(settings);
    }
  }
}
document.addEventListener('DOMContentLoaded', () => {
  const detector = new Detector();
  if (!detector.webgl) {
    detector.addGetWebGLMessage();
  }
  new Program();
});

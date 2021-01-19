import autoBind from 'auto-bind';
import React from 'react';
import { render } from 'react-dom';
import 'reset.css';
import './main.css';
import { debounce, pick } from 'lodash';
import Stats from 'stats.js';
import { TextureLoader } from 'three';
import App from './components/App';
import Hopalong, { DEFAULT_LEVELS, DEFAULT_POINTS_SUBSET, DEFAULT_SUBSETS } from './hopalong';
import textureUrl from './images/galaxy.png';
import { AdvancedSettings, Settings } from './types/hopalong';
import Detector from './util/Detector';

class Program {
  hopalong: Hopalong;
  texture = new TextureLoader().load(textureUrl);
  stats = new Stats();
  settings: Partial<Settings> = {
    pointsPerSubset: DEFAULT_POINTS_SUBSET,
    levelCount: DEFAULT_LEVELS,
    subsetCount: DEFAULT_SUBSETS,
    isPlaying: false,
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

    (window as any).hopalong = this.hopalong;
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

  applySettings(settings: Partial<Settings>) {
    const { pointsPerSubset, levelCount, subsetCount, isPlaying, ...simpleSettings } = settings;
    const advancedSettings: Partial<AdvancedSettings> = {
      pointsPerSubset,
      levelCount,
      subsetCount,
    };
    const newAdvancedSettings: Partial<AdvancedSettings> = pick(
      advancedSettings,
      Object.entries(advancedSettings)
        .filter(([k, v]) => typeof v !== 'undefined')
        .map(([k]) => k)
    );
    this.hopalong.applySettings(simpleSettings);
    this.settings = {
      ...this.settings,
      ...this.hopalong.getSettings(),
      ...newAdvancedSettings,
      isPlaying,
    };

    if (Object.keys(newAdvancedSettings).length > 0) {
      // We need to create a new instance for advanced settings
      this.debounceCreateHopalong(newAdvancedSettings);
      // In the meantime, update settings with latest changes
      this.renderReact(this.settings);
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

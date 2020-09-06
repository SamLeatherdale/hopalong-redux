import React from 'react';
import { render } from 'react-dom';
import 'reset.css';
import './main.css';
import Stats from 'stats.js';
import { TextureLoader } from 'three';
import App from './components/App';
import Hopalong from './hopalong';
import textureUrl from './images/galaxy.png';
import { Settings } from './types/hopalong';
import Detector from './util/Detector';

let hopalong: Hopalong;
function main() {
  const detector = new Detector();
  if (!detector.webgl) {
    detector.addGetWebGLMessage();
  }

  const canvas = document.getElementById('render-canvas');
  if (typeof canvas !== 'object' || !(canvas instanceof HTMLCanvasElement)) {
    throw new Error('Unable to find canvas.');
  }

  const texture = new TextureLoader().load(textureUrl);
  const stats = new Stats();
  hopalong = new Hopalong({
    canvas,
    texture,
    stats,
    onSettingsUpdate: (settings) => renderReact(stats, settings),
  });
  (window as any).hopalong = hopalong;
}
function renderReact(stats: Stats, settings: Settings) {
  const reactRoot = document.getElementById('react-root');
  if (!reactRoot) {
    throw new Error('Unable to find React root.');
  }
  render(<App stats={stats} settings={settings} onSettingsChange={applySettings} />, reactRoot);
}
function applySettings(settings: Settings) {
  hopalong.applySettings(settings);
}
document.addEventListener('DOMContentLoaded', main);

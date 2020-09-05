import React from 'react';
import { render } from 'react-dom';
import 'reset.css';
import './main.css';
import Stats from 'stats.js';
import { TextureLoader } from 'three';
import App from './components/App';
import Hopalong from './hopalong';
import textureUrl from './images/galaxy.png';
import Detector from './util/Detector';

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
  (window as any).hopalong = new Hopalong(canvas, texture, stats);

  const reactRoot = document.getElementById('react-root');
  if (!reactRoot) {
    throw new Error('Unable to find React root.');
  }
  render(<App stats={stats} />, reactRoot);
}
document.addEventListener('DOMContentLoaded', main);

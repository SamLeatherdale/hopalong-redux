import { TextureLoader } from 'three';
import Hopalong from './hopalong';
import Detector from './util/Detector';
import textureUrl from './images/galaxy.png';

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
  (window as any).hopalong = new Hopalong(canvas, texture);
}
document.addEventListener('DOMContentLoaded', main);

import Hopalong from './hopalong';
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

  (window as any).hopalong = new Hopalong(canvas);
}
document.addEventListener('DOMContentLoaded', main);

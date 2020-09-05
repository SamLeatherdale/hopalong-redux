import Hopalong from './hopalong';
import Detector from './util/Detector';
import textureUrl from './images/galaxy.png';
import loadTexturePromise from './util/textureLoader';

async function main() {
  const detector = new Detector();
  if (!detector.webgl) {
    detector.addGetWebGLMessage();
  }

  const canvas = document.getElementById('render-canvas');
  if (typeof canvas !== 'object' || !(canvas instanceof HTMLCanvasElement)) {
    throw new Error('Unable to find canvas.');
  }

  try {
    const texture = await loadTexturePromise(textureUrl, console.log);
    (window as any).hopalong = new Hopalong(canvas, texture);
  } catch (e) {
    console.error(e);
  }
}
document.addEventListener('DOMContentLoaded', main);

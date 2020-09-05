import Hopalong from './hopalong';
import Detector from './util/Detector';

const detector = new Detector();
if (!detector.webgl) {
  detector.addGetWebGLMessage();
}

(window as any).hopalong = new Hopalong();

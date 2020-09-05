import './hopalong';
import Detector from './util/Detector';

const detector = new Detector();
if (!detector.webgl) {
  detector.addGetWebGLMessage();
}

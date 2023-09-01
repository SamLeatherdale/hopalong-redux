/**
 * @author alteredq / http://alteredqualia.com/
 * @author mr.doob / http://mrdoob.com/
 */

export default class Detector {
  canvas: boolean;
  webgl: boolean;
  workers: boolean;
  fileapi: boolean;

  constructor() {
    this.canvas = !!window.CanvasRenderingContext2D;
    this.webgl = this.detectWebgl();
    this.workers = !!window.Worker;
    this.fileapi = !!(window.File && window.FileReader && window.FileList && window.Blob);
  }

  detectWebgl() {
    try {
      return (
        !!window.WebGLRenderingContext &&
        !!document.createElement('canvas').getContext('experimental-webgl')
      );
    } catch (e) {
      return false;
    }
  }

  getWebGLErrorMessage() {
    const domElement = document.createElement('div');

    domElement.style.fontFamily = 'monospace';
    domElement.style.fontSize = '13px';
    domElement.style.textAlign = 'center';
    domElement.style.background = '#eee';
    domElement.style.color = '#000';
    domElement.style.padding = '1em';
    domElement.style.width = '475px';
    domElement.style.margin = '5em auto 0';

    if (!this.webgl) {
      domElement.innerHTML = [
        `Your ${
          window.WebGLRenderingContext ? 'graphics card' : 'browser'
        } does not seem to support <a href="https://get.webgl.org/get-a-webgl-implementation/">WebGL</a>.<br />`,
        'Find out how to get it <a href="https://get.webgl.org/">here</a>.',
      ].join('\n');
    }

    return domElement;
  }

  addGetWebGLMessage(parameters: { parent?: HTMLElement; id?: string } = {}) {
    parameters = parameters || {};

    const parent = parameters.parent !== undefined ? parameters.parent : document.body;
    const id = parameters.id !== undefined ? parameters.id : 'oldie';

    const domElement = this.getWebGLErrorMessage();
    domElement.id = id;

    parent.appendChild(domElement);
  }
}

import Stats from 'stats.js';
import Hopalong from './hopalong';

export default class UIManager {
  hopalong: Hopalong;
  stats: Stats;
  visualsVisible = true;

  constructor(hopalong: Hopalong) {
    this.hopalong = hopalong;
    this.init();
  }

  init() {
    this.stats = new Stats();
    this.stats.dom.style.position = 'absolute';
    this.stats.dom.style.top = '5px';
    this.stats.dom.style.right = '5px';
    this.getElementById('stats').appendChild(this.stats.dom);
  }

  getElementById(id: string): HTMLElement {
    const el = document.getElementById(id);
    if (!el) {
      throw new Error(`Unable to find element #${id}`);
    }
    return el;
  }

  updateStats() {
    this.stats.update();
  }

  showHideAbout() {
    if (this.getElementById('about').style.display == 'block') {
      this.getElementById('about').style.display = 'none';
    } else {
      this.getElementById('about').style.display = 'block';
    }
  }

  toggleVisuals() {
    if (this.visualsVisible) {
      this.getElementById('aboutlink').style.display = 'none';
      this.getElementById('about').style.display = 'none';
      this.getElementById('info').style.display = 'none';
      this.getElementById('chaosnebula').style.display = 'none';
      this.stats.dom.style.display = 'none';
      this.hopalong.renderer.domElement.style.cursor = 'none';
      this.visualsVisible = false;
    } else {
      this.getElementById('aboutlink').style.display = 'block';
      this.getElementById('info').style.display = 'block';
      this.getElementById('chaosnebula').style.display = 'block';
      this.stats.dom.style.display = 'block';
      this.hopalong.renderer.domElement.style.cursor = '';
      this.visualsVisible = true;
    }
  }
}

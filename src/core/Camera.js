import * as THREE from 'three';

export class Camera {
  /** @type {THREE.PerspectiveCamera} */
  instance;

  constructor() {
    this.instance = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.instance.position.set(8, 6, 12);
    this.instance.lookAt(0, 0, 0);
  }

  resize() {
    this.instance.aspect = window.innerWidth / window.innerHeight;
    this.instance.updateProjectionMatrix();
  }
}

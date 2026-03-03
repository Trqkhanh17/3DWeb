import * as THREE from 'three';

/**
 * Raycaster-based object picker.
 * Emits 'select' events on the window.
 */
export class Picker {
  #raycaster = new THREE.Raycaster();
  #pointer   = new THREE.Vector2();
  #camera;
  #objects;

  constructor(camera, objects, domElement) {
    this.#camera  = camera;
    this.#objects = objects;
    domElement.addEventListener('click', this.#onClick);
  }

  #onClick = (e) => {
    this.#pointer.x =  (e.clientX / window.innerWidth)  * 2 - 1;
    this.#pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    this.#raycaster.setFromCamera(this.#pointer, this.#camera);
    const intersects = this.#raycaster.intersectObjects(this.#objects.map(o => o.mesh));
    const hit = intersects[0];
    window.dispatchEvent(new CustomEvent('object-select', {
      detail: hit ? hit.object.name : null,
    }));
  };
}

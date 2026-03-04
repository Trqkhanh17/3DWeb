import * as THREE from 'three';

/**
 * Raycaster-based object picker.
 * Emits 'object-select' events on the window.
 */
export class Picker {
  #raycaster = new THREE.Raycaster();
  #pointer   = new THREE.Vector2();
  #camera;
  #objects;
  #domElement;

  constructor(camera, objects, domElement) {
    this.#camera     = camera;
    this.#objects    = objects;
    this.#domElement = domElement;
    domElement.addEventListener('click', this.#onClick);
  }

  dispose() {
    this.#domElement.removeEventListener('click', this.#onClick);
  }

  #onClick = (e) => {
    const rect = this.#domElement.getBoundingClientRect();
    this.#pointer.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
    this.#pointer.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;

    this.#raycaster.setFromCamera(this.#pointer, this.#camera);
    const intersects = this.#raycaster.intersectObjects(this.#objects.map(o => o.mesh));
    let selectedName = null;

    if (intersects.length > 0) {
      const firstHit = intersects[0];
      const { x, y, z } = firstHit.point;
      console.log(`%c[Picker] Click at: (${x.toFixed(3)}, ${y.toFixed(3)}, ${z.toFixed(3)})`, 'color: #00ff00; font-weight: bold');
      
      // Group hits by object name
      const groupedHits = new Map();
      intersects.forEach((hit) => {
        const obj = this.#objects.find(o => o.mesh === hit.object);
        const name = obj ? obj.name : hit.object.name;
        if (!groupedHits.has(name)) {
          groupedHits.set(name, { name, count: 0, minDist: hit.distance, maxDist: hit.distance, meshName: hit.object.name });
        }
        const data = groupedHits.get(name);
        data.count++;
        data.minDist = Math.min(data.minDist, hit.distance);
        data.maxDist = Math.max(data.maxDist, hit.distance);
      });

      const hitNames = Array.from(groupedHits.keys());
      hitNames.forEach((name, i) => {
        const h = groupedHits.get(name);
        const obj = this.#objects.find(o => o.name === name);
        const label = obj ? obj.label : 'Khác';
        const distStr = h.minDist === h.maxDist ? h.minDist.toFixed(4) : `${h.minDist.toFixed(4)} - ${h.maxDist.toFixed(4)}`;
        console.log(`  Hit [${i}]: ${name} (${label}) | ${h.count} hits | Mesh: ${h.meshName} | Dist: ${distStr}`);
      });

      selectedName = this.#objects.find(o => o.mesh === firstHit.object)?.name || firstHit.object.name;

      window.dispatchEvent(new CustomEvent('debug-intersects', {
        detail: hitNames
      }));
    }

    window.dispatchEvent(new CustomEvent('object-select', {
      detail: selectedName,
    }));
  };
}

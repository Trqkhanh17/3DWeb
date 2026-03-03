import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { MaterialLibrary } from '../materials/MaterialLibrary.js';

/**
 * ObjectManager – loads the optimized Living Room GLB model (Draco compressed),
 * auto-discovers meshes and groups them by material for UI control.
 */
export class ObjectManager {
  objects = [];

  #scene;
  #onProgress = null;
  #onLoaded   = null;

  /** Match glTF node patterns to User-facing names */
  static #NODE_NAMES = [
    { pattern: 'Burnt_Log',         name: 'Khúc gỗ trang trĩ' },
    { Pattern: 'Patterned_Floor',   name: 'Sàn nhà' },
    { pattern: 'Studded_Leather',    name: 'Bọc da sofa' },
    { pattern: 'Wooden_Bowl',        name: 'Bát gỗ trang trí' },
    { pattern: 'Lamp_',              name: 'Đèn cây' },
    { pattern: 'Plywood',            name: 'Kệ tivi/làm việc' },
    { pattern: 'Book',               name: 'Sách gỗ/Kệ' },
    { pattern: 'Solid_Wood',         name: 'Sofa gỗ/Chân' },
    { pattern: 'Wooden_Beam',        name: 'Gờ gỗ/Khung' },
    { pattern: 'Wood_Pattern',       name: 'Gỗ ghép' },
    { pattern: 'Small_Rocks',        name: 'Chậu cây' },
    { pattern: 'Plastic_Matte',      name: 'Chi tiết nhựa' },
    { pattern: 'Mat',                name: 'Các loại chân/viền khác' }
  ];

  /** Original Material names fallback */
  static #MATERIAL_NAMES = {
    'Burnt_Log_vcsaeeyfa':        'Khúc gỗ trang trĩ',
    'Patterned_Floor_tksmdiycw':  'Sàn nhà',
    'Studded_Leather_tlooadar':   'Bọc da sofa',
    'Wooden_Bowl_tfpcbhnra.1':    'Bát gỗ trang trí',
    'material':                   'Đèn cây',
    'Mat.1':                      'Đệm ngồi',
    'Mat.2':                      'Bàn trà',
    'Mat.3':                      'Gối vuông',
    'Mat.4':                      'Thảm',
    'Mat.4_1':                    'Ngăn kéo gỗ',
    'Mat.4_2':                    'Ghế đẩu',
    'Mat.4_3':                    'Sofa/Nệm phụ',
    'Mat.5':                      'Tường',
    'Mat.6':                      'Cửa nhôm/kính',
    'Plywood_vdcjfiw.1':          'Ghế bành gỗ',
    'Plywood_vdcjfiw.1_1':        'Kệ sách gỗ',
    'Small_Rocks_ulludayiw':      'Chậu cây',
    'White_And_Blue_vdkvbea':     'Gối trang trĩ',
    'Wooden_Beam_tgngdibfa':      'Kệ treo',
    'Wooden_Beam_tgnhde0fa':      'Kệ TV',
    'Mat_1':                      'Vật nhỏ khác',
    'Brown_Book_vgbkedfjw':       'Sách'
  };

  static #GROUP_COLORS = {
    'Sách':              '#654321',
    'Khúc gỗ trang trí':'#5C4033',
    'Đèn cây':           '#FFD700',
    'Đệm ngồi':        '#333333',
    'Bàn trà':           '#8B7355',
    'Gối vuông':        '#444444',
    'Thảm trải':        '#444444',
    'Tủ ngăn kéo':      '#A0522D',
    'Ghế đẩu':          '#696969',
    'Ghế Sofa Da':       '#2d2d2d',
    'Tường':            '#666666',
    'Khung cửa':        '#555555',
    'Ghế đẩu 2':        '#808080',
    'Sàn nhà':          '#3a3a3a',
    'Ghế bành gỗ':      '#C4A882',
    'Kệ sách gỗ':       '#DEB887',
    'Chậu cây cảnh':     '#228B22',
    'Bọc da sofa':       '#1a1a1a',
    'Gối trang trí':     '#4488cc',
    'Kệ gỗ treo tường': '#A0522D',
    'Kệ TV gỗ':         '#8B4513',
    'Bát gỗ trang trí':  '#D2691E',
    'Vật dụng khác':    '#999999',
    'Sàn gỗ':            '#4a3a2a',
    'Bàn ghế gỗ':        '#6B4226',
    'Chân ghế kim loại':  '#A0A0A0',
  };

  constructor(scene, { onProgress, onLoaded } = {}) {
    this.#scene      = scene;
    this.#onProgress = onProgress;
    this.#onLoaded   = onLoaded;
  }

  async load() {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    dracoLoader.setDecoderConfig({ type: 'js' }); // JS decoder (works everywhere)

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    return new Promise((resolve, reject) => {
      loader.load(
        '/model/living_room/scene_opt.glb',

        (gltf) => {
          const model = gltf.scene;

          // Group meshes by their material name
          /** @type {Map<string, THREE.Mesh[]>} */
          const groupMap = new Map();

          model.traverse((child) => {
            if (!child.isMesh) return;
            child.castShadow    = false;
            child.receiveShadow = false;
            child.frustumCulled = true;

            // Downgrade PBR → Lambert for GPU performance
            const origMat = child.material;
            if (origMat.isMeshStandardMaterial || origMat.isMeshPhysicalMaterial) {
              const lambertMat = new THREE.MeshLambertMaterial({
                map:        origMat.map,
                color:      origMat.color,
                emissive:   origMat.emissive,
                emissiveMap: origMat.emissiveMap,
                normalMap:  origMat.normalMap,
                alphaMap:   origMat.alphaMap,
                transparent: origMat.transparent,
                opacity:    origMat.opacity,
                side:       origMat.side,
                name:       origMat.name,
              });
              child.material = lambertMat;
            }

            // Save material for restore
            child.__origMaterial = child.material;

            // Determine group name primarily from Material matched to our predefined list
            const matName = origMat?.name ?? 'default';
            const nodeName = child.name || 'default';

            let groupName = ObjectManager.#MATERIAL_NAMES[matName];
            if (!groupName) {
               // Try matching by node name
               const matched = ObjectManager.#NODE_NAMES.find(n => nodeName.includes(n.pattern));
               groupName = matched ? matched.name : (matName !== 'default' ? matName : child.name);
            }

            if (!groupMap.has(groupName)) groupMap.set(groupName, []);
            groupMap.get(groupName).push(child);
          });

          // Freeze matrices (static scene)
          model.updateMatrixWorld(true);
          model.traverse((child) => { child.matrixAutoUpdate = false; });

          // Build objects list
          for (const [name, meshes] of groupMap) {
            this.objects.push({
              name,
              color:    ObjectManager.#GROUP_COLORS[name] ?? '#888',
              meshes,
              visible:  true,
              _matType: 'original',
            });
          }

          this.#scene.add(model);

          // Cleanup Draco decoder
          dracoLoader.dispose();

          if (this.#onLoaded) this.#onLoaded();
          resolve();
        },

        (xhr) => {
          if (xhr.total > 0 && this.#onProgress) {
            this.#onProgress(Math.round((xhr.loaded / xhr.total) * 100));
          }
        },

        (err) => { console.error('GLB load error:', err); reject(err); }
      );
    });
  }

  /**
   * Apply material to all meshes of a furniture group.
   * 'original' → restore original material.
   */
  applyMaterial(name, type, color, roughness, metalness) {
    const obj = this.objects.find(o => o.name === name);
    if (!obj) return;

    for (const mesh of obj.meshes) {
      if (type === 'original') {
        if (mesh.__origMaterial) {
          if (mesh.material !== mesh.__origMaterial) mesh.material.dispose();
          mesh.material = mesh.__origMaterial;
        }
      } else if (type === obj._matType && mesh.material.color != null) {
        mesh.material.color.set(color);
        if (mesh.material.roughness !== undefined) mesh.material.roughness = roughness;
        if (mesh.material.metalness !== undefined) mesh.material.metalness = metalness;
        mesh.material.needsUpdate = true;
      } else {
        const newMat = MaterialLibrary.create(type, color, roughness, metalness);
        if (mesh.material !== mesh.__origMaterial) mesh.material.dispose();
        mesh.material = newMat;
      }
    }
    obj._matType = type;
  }

  setVisible(name, visible) {
    const obj = this.objects.find(o => o.name === name);
    if (!obj) return;
    obj.visible = visible;
    obj.meshes.forEach(m => (m.visible = visible));
  }

  update(_delta) {}
}

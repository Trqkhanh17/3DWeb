import './styles/main.css';
import { Renderer }       from './core/Renderer.js';
import { SceneSetup }     from './core/Scene.js';
import { Camera }         from './core/Camera.js';
import { OrbitControls }  from './controls/OrbitControls.js';
import { LightSystem }    from './lights/LightSystem.js';
import { ObjectManager }  from './objects/ObjectManager.js';
import { UIPanel }        from './ui/UIPanel.js';
import { Performance }    from './utils/Performance.js';
import { Picker }         from './utils/Picker.js';

class App {
  constructor() {
    this.#init();
  }

  async #init() {
    // ── Core ──────────────────────────────────────
    const canvas   = document.getElementById('three-canvas');
    const renderer = new Renderer(canvas);
    const { instance: scene }  = new SceneSetup();
    const { instance: camera } = new Camera();

    // ── Controls ──────────────────────────────────
    const controls = new OrbitControls(camera, canvas);

    // ── Lights ────────────────────────────────────
    this.#setProgress(20, 'Xây dựng hệ thống ánh sáng...');
    const lightSystem = new LightSystem(scene);

    // ── Load 3D Model ─────────────────────────────
    this.#setProgress(30, 'Đang tải mô hình 3D...');
    const objectManager = new ObjectManager(scene, {
      onProgress: (pct) => {
        const mapped = 30 + Math.round(pct * 0.5); // 30-80%
        this.#setProgress(mapped, `Đang tải mô hình 3D... ${pct}%`);
      },
      onLoaded: () => {
        this.#setProgress(85, 'Mô hình đã tải xong!');
      },
    });

    try {
      await objectManager.load();
    } catch (e) {
      console.error('Failed to load model:', e);
      this.#setProgress(100, 'Lỗi khi tải mô hình!');
      return;
    }

    // ── Picker ────────────────────────────────────
    // Flatten all meshes for raycaster
    const allMeshes = objectManager.objects.flatMap(o =>
      o.meshes.map(mesh => ({ mesh, name: o.name }))
    );
    new Picker(camera, allMeshes, canvas);

    // ── Performance ───────────────────────────────
    const perf = new Performance();

    // ── Resize ────────────────────────────────────
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.resize();
    });

    // ── UI ────────────────────────────────────────
    this.#setProgress(90, 'Khởi tạo giao diện...');
    new UIPanel(objectManager, lightSystem);

    // Pre-compile all shaders (avoid first-frame stutter)
    renderer.instance.compile(scene, camera);

    // ── Start render loop ─────────────────────────
    this.#setProgress(100, 'Sẵn sàng!');
    setTimeout(() => {
      document.getElementById('loading-screen')?.classList.add('hidden');
    }, 600);

    const r = renderer.instance;
    const tick = () => {
      requestAnimationFrame(tick);
      controls.update();
      r.render(scene, camera);
      perf.update(renderer);
    };
    tick();
  }

  #setProgress(pct, text) {
    const bar = document.getElementById('loader-bar');
    const txt = document.getElementById('loader-text');
    if (bar) bar.style.width = `${pct}%`;
    if (txt) txt.textContent = text;
  }
}

new App();

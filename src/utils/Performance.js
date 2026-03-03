/**
 * Performance tracker – wraps renderer.info + Stats.js fallback
 */
export class Performance {
  #fpsDisplay;
  #dcDisplay;
  #frames = 0;
  #lastTime = performance.now();

  constructor() {
    this.#fpsDisplay = document.getElementById('fps-display');
    this.#dcDisplay  = document.getElementById('dc-display');
  }

  update(renderer) {
    this.#frames++;
    const now = performance.now();
    if (now - this.#lastTime >= 500) {
      const fps = Math.round(this.#frames / ((now - this.#lastTime) / 1000));
      const dc  = renderer.drawCalls;
      if (this.#fpsDisplay) this.#fpsDisplay.textContent = `${fps} FPS`;
      if (this.#dcDisplay)  this.#dcDisplay.textContent  = `${dc} DC`;
      this.#frames = 0;
      this.#lastTime = now;
    }
    renderer.resetInfo();
  }
}

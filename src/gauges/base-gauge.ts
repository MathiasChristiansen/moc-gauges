interface GaugeOptions {
  backgroundColor?: string;
}

abstract class GaugeBase {
  protected canvas: HTMLCanvasElement;
  protected ctx: CanvasRenderingContext2D;
  protected options: Required<GaugeOptions>;
  protected parentElement: HTMLElement;
  protected data: any;

  constructor(parentElement: HTMLElement, options: GaugeOptions = {}) {
    this.parentElement = parentElement;

    // Create and append the canvas
    this.canvas = document.createElement("canvas");
    this.parentElement.appendChild(this.canvas);

    const context = this.canvas.getContext("2d");
    if (!context) {
      throw new Error("Failed to get 2D context");
    }
    this.ctx = context;

    // Merge default options with user-provided ones
    this.options = {
      backgroundColor: "#ffffff",
      ...options,
    };

    // Initialize size and scale
    this.resizeCanvas();
    window.addEventListener("resize", this.resizeCanvas.bind(this));

    // Placeholder for current data
    this.data = null;

    // Initialize rendering
    this.init();
  }

  protected init(): void {
    // Optional setup logic for child classes
  }

  private resizeCanvas(): void {
    // Get size from parent element
    const rect = this.parentElement.getBoundingClientRect();
    const devicePixelRatio = window.devicePixelRatio || 1;

    this.canvas.width = rect.width * devicePixelRatio;
    this.canvas.height = rect.height * devicePixelRatio;
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;

    this.ctx.scale(devicePixelRatio, devicePixelRatio);
    this.clear();
  }

  protected clear(): void {
    const { backgroundColor } = this.options;
    const { width, height } = this.canvas;
    this.ctx.fillStyle = backgroundColor;
    this.ctx.fillRect(
      0,
      0,
      width / window.devicePixelRatio,
      height / window.devicePixelRatio
    );
  }

  public setData(data: any): void {
    this.data = data;
    this.render();
  }

  protected abstract render(): void;

  public destroy(): void {
    window.removeEventListener("resize", this.resizeCanvas.bind(this));
    this.parentElement.removeChild(this.canvas);
  }
}

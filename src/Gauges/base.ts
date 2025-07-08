export interface GaugeOptions {
  backgroundColor?: string;
  autoRender?: boolean;
  easingFactor?: number;
  skin?: string;
}

export type SkinRenderFunction<TOptions> = (
  ctx: CanvasRenderingContext2D,
  options: Required<TOptions>,
  state: any,
  parentElement: HTMLElement
) => void;

export interface GaugeMetadata {
  type: string;
  availableSkins: string[];
  animatedProperties: string[];
  description?: string;
}

export abstract class GaugeBase {
  protected canvas: HTMLCanvasElement;
  protected ctx: CanvasRenderingContext2D;
  protected options: Required<GaugeOptions>;
  protected parentElement: HTMLElement;
  protected data: any;

  protected actualState: any = {};
  protected animationState: any = {};

  private animationFrameId: number | null = null;

  // Class-level skin registry - each subclass will have its own
  private static skinRegistries: Map<string, Record<string, SkinRenderFunction<any>>> = new Map();
  private renderFunction: SkinRenderFunction<any>;

  // Abstract properties that subclasses must define
  protected abstract gaugeType: string;
  protected abstract animatedProperties: string[];

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
      backgroundColor: "rgba(0, 0, 0, 0)",
      autoRender: false,
      easingFactor: 0.1,
      skin: "default",
      ...options,
    };

    // Initialize size and scale
    this.resizeCanvas();
    window.addEventListener("resize", this.resizeCanvas.bind(this));

    // Initialize rendering
    this.init();

    this.renderFunction =
      (this.getSkin(this.options.skin) ?? this.defaultRender.bind(this)) as SkinRenderFunction<any>;

    if (this.options.autoRender) {
      this.animate();
    }
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
    this.ctx.clearRect(0, 0, width, height);
  }

  public setOptions(options: GaugeOptions): void {
    this.options = { ...this.options, ...options };
  }

  public setData(data: any): void {
    this.actualState = { ...this.actualState, ...data };

    if (this.options.autoRender) {
      this.update();
    }
  }

  private animate(): void {
    this.animationFrameId = requestAnimationFrame(() => {
      this.updateAnimationState();
      this.render();
      this.animate();
    });
  }

  protected updateAnimationState(): void {
    const easingFactor = this.options.easingFactor;

    for (const key in this.actualState) {
      if (this.actualState.hasOwnProperty(key)) {
        const actualValue = this.actualState[key];
        const animationValue = this.animationState[key] || 0;

        const difference = actualValue - animationValue;
        this.animationState[key] = animationValue + difference * easingFactor;
      }
    }
  }

  public update(): void {
    this.updateAnimationState();
    this.render();
  }

  protected render(): void {
    this.renderFunction(
      this.ctx,
      this.options,
      this.animationState,
      this.parentElement
    );
  }

  protected abstract defaultRender(
    ctx: CanvasRenderingContext2D,
    options: Required<GaugeOptions>,
    state: any,
    parentElement: HTMLElement
  ): void;

  public static registerSkin<TOptions>(
    gaugeType: string,
    name: string,
    renderFunction: SkinRenderFunction<TOptions>
  ): void {
    if (!GaugeBase.skinRegistries.has(gaugeType)) {
      GaugeBase.skinRegistries.set(gaugeType, {});
    }
    const registry = GaugeBase.skinRegistries.get(gaugeType)!;
    registry[name] = renderFunction as SkinRenderFunction<any>;
  }

  public static getAvailableSkins(gaugeType: string): string[] {
    const registry = GaugeBase.skinRegistries.get(gaugeType);
    return registry ? Object.keys(registry) : [];
  }

  private getSkin(skinName: string): SkinRenderFunction<any> | null {
    const registry = GaugeBase.skinRegistries.get(this.gaugeType);
    return registry ? registry[skinName] : null;
  }

  public setSkin(skin: string): void {
    const newRenderFunction = this.getSkin(skin);
    this.renderFunction = (newRenderFunction ?? this.defaultRender.bind(this)) as SkinRenderFunction<any>;
    this.options.skin = skin;
  }

  public getMetadata(): GaugeMetadata {
    return {
      type: this.gaugeType,
      availableSkins: GaugeBase.getAvailableSkins(this.gaugeType),
      animatedProperties: this.animatedProperties,
      description: this.getDescription()
    };
  }

  protected getDescription(): string | undefined {
    return undefined; // Subclasses can override
  }

  public destroy(): void {
    window.removeEventListener("resize", this.resizeCanvas.bind(this));
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.parentElement.removeChild(this.canvas);
  }
}

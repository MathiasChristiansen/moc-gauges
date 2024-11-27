interface SpeedometerOptions extends GaugeOptions {
  min?: number;
  max?: number;
  value?: number;
  needleColor?: string;
  backgroundColor?: string;
}

class SpeedometerGauge extends GaugeBase {
  protected options: Required<SpeedometerOptions>;

  constructor(parentElement: HTMLElement, options: SpeedometerOptions = {}) {
    super(parentElement, {
      min: 0,
      max: 100,
      value: 0,
      backgroundColor: "#ffffff",
      ...options,
    });
    this.options = {
      min: 0,
      max: 100,
      value: 0,
      needleColor: "#ff0000",
      backgroundColor: "#ffffff",
      ...options,
    };
  }

  protected render(): void {
    const rect = this.parentElement.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const { min, max, value, needleColor } = this.options;

    this.clear();

    // Draw the speedometer arc
    this.ctx.beginPath();
    this.ctx.arc(
      width / 2,
      height / 2,
      Math.min(width, height) / 3,
      Math.PI,
      2 * Math.PI
    );
    this.ctx.strokeStyle = "#000";
    this.ctx.lineWidth = 5;
    this.ctx.stroke();

    // Draw the needle
    const angle = Math.PI + ((value - min) / (max - min)) * Math.PI;
    const needleLength = Math.min(width, height) / 3;
    const x = width / 2 + needleLength * Math.cos(angle);
    const y = height / 2 + needleLength * Math.sin(angle);

    this.ctx.beginPath();
    this.ctx.moveTo(width / 2, height / 2);
    this.ctx.lineTo(x, y);
    this.ctx.strokeStyle = needleColor;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }
}

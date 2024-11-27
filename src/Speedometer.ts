import { GaugeBase, GaugeOptions } from "./BaseGauge.js";

export interface SpeedometerOptions extends GaugeOptions {
  min?: number;
  max?: number;
  easingFactor?: number;
  needleColor?: string;
  backgroundColor?: string;
}

export class SpeedometerGauge extends GaugeBase {
  protected options: Required<SpeedometerOptions>;

  constructor(parentElement: HTMLElement, options: SpeedometerOptions = {}) {
    super(parentElement, {
      min: 0,
      max: 100,
      easingFactor: 0.1,
      backgroundColor: "#ffffff",
      ...options,
    });
    this.options = {
      min: 0,
      max: 100,
      easingFactor: 0.1,
      needleColor: "#ff0000",
      backgroundColor: "#ffffff",
      autoRender: false,
      ...options,
    };

    this.animationState = { value: 0 };
    this.actualState = { value: 0 };
  }

  protected render(): void {
    const rect = this.parentElement.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const { min, max, needleColor } = this.options;

    const { value } = this.animationState;

    this.clear();

    const aspectRatio = width / height;

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

    // Draw the needle cap
    this.ctx.beginPath();
    this.ctx.arc(width / 2, height / 2, 5, 0, 2 * Math.PI);
    this.ctx.fillStyle = needleColor;
    this.ctx.fill();

    // Draw the speedometer value
    this.ctx.font = "20px Arial";
    this.ctx.fillStyle = "#000";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(
      `${value.toFixed(2)}`,
      width / 2,
      height / 2 + 25
    );

    // Draw the speedometer min/max values
    this.ctx.font = "10px Arial";
    this.ctx.fillStyle = "#000";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(`${min}`, width / 2 - needleLength, height / 2 + 10);
    this.ctx.fillText(`${max}`, width / 2 + needleLength, height / 2 + 10);
  }
}

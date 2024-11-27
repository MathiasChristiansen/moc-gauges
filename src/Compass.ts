import { GaugeBase, GaugeOptions } from "./BaseGauge.js";

interface CompassOptions extends GaugeOptions {
  needleColor?: string;
  textColor?: string;
  borderColor?: string;
  easingFactor?: number;
  autoRender?: boolean;
  fontSize?: number;
  backgroundColor?: string;
}

export class CompassGauge extends GaugeBase {
  protected options: Required<CompassOptions>;

  constructor(parentElement: HTMLElement, options: CompassOptions = {}) {
    super(parentElement, {
      needleColor: "#ff0000",
      textColor: "#000000",
      borderColor: "#000000",
      fontSize: 16,
      ...options,
    });
    this.options = {
      needleColor: "#ff0000",
      textColor: "#000000",
      easingFactor: 0.1,
      borderColor: "#000000",
      autoRender: false,
      backgroundColor: "#ffffff",
      fontSize: 16,
      ...options,
    };

    // Initialize animation state
    this.animationState = { heading: 0 };
    this.actualState = { heading: 0 };
  }

  protected render(): void {
    const rect = this.parentElement.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const { needleColor, textColor, borderColor, fontSize } = this.options;
    const heading = this.animationState.heading;

    this.clear();

    // Center of the compass
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2 - 10;

    // Draw compass circle
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    this.ctx.strokeStyle = borderColor;
    this.ctx.lineWidth = 5;
    this.ctx.stroke();

    // Draw cardinal directions (N, E, S, W)
    const cardinalPoints = ["N", "E", "S", "W"];
    this.ctx.fillStyle = textColor;
    this.ctx.font = `${fontSize}px Arial`;
    cardinalPoints.forEach((point, index) => {
      const angle = (index * Math.PI) / 2; // 0, 90, 180, 270 degrees
      const textX = cx + radius * 0.8 * Math.cos(angle);
      const textY = cy + radius * 0.8 * Math.sin(angle) + fontSize / 3;
      this.ctx.fillText(
        point,
        textX - this.ctx.measureText(point).width / 2,
        textY
      );
    });

    // Draw needle
    const needleAngle = (heading * Math.PI) / 180 - Math.PI / 2; // Convert heading to radians
    const needleLength = radius * 0.9;

    // Needle line
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy);
    this.ctx.lineTo(
      cx + needleLength * Math.cos(needleAngle),
      cy + needleLength * Math.sin(needleAngle)
    );
    this.ctx.strokeStyle = needleColor;
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    // Draw a center dot
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 5, 0, 2 * Math.PI);
    this.ctx.fillStyle = needleColor;
    this.ctx.fill();
  }
}

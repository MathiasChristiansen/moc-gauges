import { GaugeBase, GaugeOptions } from "../base.js";
import { FuturisticWindArrow } from "./skins/FuturisticWindArrow.js";
import { HorizontalBarSpeedDirection } from "./skins/HorizontalBarSpeedDirection.js";

export interface WindGaugeOptions extends GaugeOptions {
  needleColor?: string;
  textColor?: string;
  fontSize?: number;
  easingFactor?: number;
  unit?: string;
  skin?: string;
  backgroundColor?: string;
}

export class WindGauge extends GaugeBase {
  protected options: Required<WindGaugeOptions>;
  protected gaugeType = "wind";
  protected animatedProperties = ["direction", "speed"];

  constructor(parentElement: HTMLElement, options: WindGaugeOptions = {}) {
    super(parentElement, {
      needleColor: "#007bff",
      textColor: "#000000",
      backgroundColor: "#ffffff",
      easingFactor: 0.1,
      fontSize: 16,
      ...options,
    });
    this.options = {
      needleColor: "#007bff",
      textColor: "#000000",
      backgroundColor: "rgba(0, 0, 0, 0)",
      autoRender: false,
      easingFactor: 0.1,
      unit: "knots",
      skin: "default",
      fontSize: 16,
      ...options,
    };

    // Initialize animation state
    this.animationState = { direction: 0, speed: 0 };
    this.actualState = { direction: 0, speed: 0 };
  }

  protected updateAnimationState(): void {
    const easingFactor = 0.1; // Determines the speed of animation

    for (const key in this.actualState) {
      if (this.actualState.hasOwnProperty(key)) {
        const actualValue = this.actualState[key];
        const animationValue = this.animationState[key] || 0;

        // Smooth transition for both direction and speed
        const diff = actualValue - animationValue;
        const wrappedDiff =
          key === "direction" ? ((diff + 180) % 360) - 180 : diff;
        this.animationState[key] = animationValue + wrappedDiff * easingFactor;
      }
    }
  }

  protected defaultRender(
    ctx: CanvasRenderingContext2D,
    options: Required<GaugeOptions>,
    state: any,
    parentElement: HTMLElement
  ): void {
    const rect = parentElement.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const { needleColor, textColor, fontSize } = this.options;
    const direction = this.animationState.direction;
    const speed = this.animationState.speed;

    this.clear();

    // Center of the gauge
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2 - 10;

    // Draw compass circle
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw cardinal directions (N, E, S, W)
    const cardinalPoints = ["N", "E", "S", "W"];
    ctx.fillStyle = textColor;
    ctx.font = `${fontSize}px Arial`;
    cardinalPoints.forEach((point, index) => {
      const angle = (index * Math.PI) / 2; // 0, 90, 180, 270 degrees
      const textX = cx + radius * 0.8 * Math.cos(angle);
      const textY = cy + radius * 0.8 * Math.sin(angle) + fontSize / 3;
      ctx.fillText(point, textX - ctx.measureText(point).width / 2, textY);
    });

    // Draw needle for wind direction
    const needleAngle = (direction * Math.PI) / 180 - Math.PI / 2; // Convert direction to radians
    const needleLength = radius * 0.9;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(
      cx + needleLength * Math.cos(needleAngle),
      cy + needleLength * Math.sin(needleAngle)
    );
    ctx.strokeStyle = needleColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw a center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, 2 * Math.PI);
    ctx.fillStyle = needleColor;
    ctx.fill();

    // Draw wind speed in the center
    ctx.fillStyle = textColor;
    ctx.font = `${fontSize * 1.2}px Arial`;
    const speedText = `${Math.round(speed)} knots`;
    ctx.fillText(
      speedText,
      cx - ctx.measureText(speedText).width / 2,
      cy + fontSize * 2
    );
  }

  protected getDescription(): string {
    return "A wind gauge that displays both wind direction and speed";
  }
}

WindGauge.registerSkin("wind", "default", FuturisticWindArrow);
WindGauge.registerSkin("wind", "horizontal-bar", HorizontalBarSpeedDirection);

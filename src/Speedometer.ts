import { GaugeBase, GaugeOptions } from "./BaseGauge.js";

export interface SpeedometerOptions extends GaugeOptions {
  min?: number;
  max?: number;
  easingFactor?: number;
  needleColor?: string;
  unit?: string;
  skin?: string;
  decimals?: number;
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
      unit: "%",
      skin: "default",
      decimals: 2,
      autoRender: false,
      ...options,
    };

    this.animationState = { value: 0 };
    this.actualState = { value: 0 };
  }

  protected defaultRender(
    ctx: CanvasRenderingContext2D,
    options: Required<SpeedometerOptions>,
    state: any,
    parentElement: HTMLElement
  ): void {
    const rect = parentElement.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const { min, max, needleColor } = this.options;

    const { value } = this.animationState;

    ctx.clearRect(0, 0, width, height);

    // Draw the speedometer arc
    ctx.beginPath();
    ctx.arc(
      width / 2,
      height / 2,
      Math.min(width, height) / 3,
      Math.PI,
      2 * Math.PI
    );
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 5;
    ctx.stroke();

    // Draw the needle
    const angle = Math.PI + ((value - min) / (max - min)) * Math.PI;
    const needleLength = Math.min(width, height) / 3;
    const x = width / 2 + needleLength * Math.cos(angle);
    const y = height / 2 + needleLength * Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(width / 2, height / 2);
    ctx.lineTo(x, y);
    ctx.strokeStyle = needleColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw the needle cap
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 5, 0, 2 * Math.PI);
    ctx.fillStyle = needleColor;
    ctx.fill();

    // Draw the speedometer value
    ctx.font = "20px Arial";
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      `${value.toFixed(options.decimals)}${options.unit}`,
      width / 2,
      height / 2 + 25
    );

    // Draw the speedometer min/max values
    ctx.font = "10px Arial";
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${min}`, width / 2 - needleLength, height / 2 + 10);
    ctx.fillText(`${max}`, width / 2 + needleLength, height / 2 + 10);
  }
}

SpeedometerGauge.registerSkin<SpeedometerOptions>(
  "futuristic",
  (ctx, options, state, parentElement) => {
    const rect = parentElement.getBoundingClientRect();

    /**
     * TODO: Maybe add preconfig function to the registerSkin method that registers
     *       functions that should be called before the skin is applied.
     *
     *       This way we can ensure that the parentElement has the correct styles, and
     *       avoid having to set them in the skin function.
     */
    parentElement.style.borderRadius = "50%";
    parentElement.style.border = "2px solid rgba(0, 0, 0, 0.5)";
    parentElement.style.overflow = "hidden";

    const width = rect.width;
    const height = rect.height;

    const { min, max, needleColor, decimals, unit } = options;
    const { value } = state;

    // Clear the canvas
    ctx.clearRect(0, 0, width, height);

    // Draw gradient background
    const gradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      10,
      width / 2,
      height / 2,
      width / 2
    );
    gradient.addColorStop(0, "#001f3f");
    gradient.addColorStop(1, "rgba(0, 0, 0, 1)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(100, 100, 100, 0.5)";

    // Grey arc background
    ctx.beginPath();
    ctx.arc(
      width / 2,
      height / 2,
      Math.min(width, height) / 3,
      Math.PI,
      2 * Math.PI
    );

    ctx.strokeStyle = "rgba(100, 100, 100, 0.25)";
    ctx.lineWidth = 16;
    ctx.stroke();

    // Draw glowing speedometer arc
    ctx.beginPath();
    ctx.arc(
      width / 2,
      height / 2,
      Math.min(width, height) / 3,
      Math.PI,
      Math.PI + ((value - min) / (max - min)) * Math.PI
    );

    // Draw the needle
    // const angle = Math.PI + ((value - min) / (max - min)) * Math.PI;
    const needleLength = Math.min(width, height) / 3;
    // const x = width / 2 + needleLength * Math.cos(angle);
    // const y = height / 2 + needleLength * Math.sin(angle);

    const color = `rgba(${(1 - value / max) * 255}, ${
      (value / max) * 255
    }, 0, 1)`;

    ctx.strokeStyle = color; // Glow color
    ctx.lineWidth = 16;
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;
    ctx.stroke();
    ctx.shadowBlur = 0; // Reset shadow

    // ctx.beginPath();
    // ctx.moveTo(width / 2, height / 2);
    // ctx.lineTo(x, y);
    // ctx.strokeStyle = needleColor;
    // ctx.lineWidth = 4;
    // ctx.stroke();

    // Draw needle cap with glow
    // ctx.beginPath();
    // ctx.arc(width / 2, height / 2, 7, 0, 2 * Math.PI);
    // ctx.fillStyle = needleColor;
    // ctx.shadowColor = needleColor;
    // ctx.shadowBlur = 10;
    // ctx.fill();
    // ctx.shadowBlur = 0;

    // Draw the speedometer unit
    ctx.font = "12px Arial";
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${unit}`, width / 2, height / 2);

    // Draw the speedometer value
    ctx.font = "24px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${value.toFixed(decimals)}`, width / 2, height / 2 + 32);

    // Draw min and max values
    ctx.font = "12px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`${min}`, width / 2 - needleLength, height / 2 + 20);
    ctx.fillText(`${max}`, width / 2 + needleLength, height / 2 + 20);
  }
);
SpeedometerGauge.registerSkin<SpeedometerOptions>(
  "futuristic-enhanced",
  (ctx, options, state, parentElement) => {
    const rect = parentElement.getBoundingClientRect();

    parentElement.style.borderRadius = "50%";
    parentElement.style.border = "2px solid rgba(0, 0, 0, 0.5)";
    parentElement.style.overflow = "hidden";

    const width = rect.width;
    const height = rect.height;

    const { min, max, needleColor, decimals, unit } = options;
    const { value } = state;

    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2.5;
    const outerRadius = radius * 1;
    const innerRadius = radius * 0.8;

    // Define angle range
    const startAngle = (5 * Math.PI) / 6;
    const endAngle = (13 * Math.PI) / 6;

    // Draw gradient background
    const gradient = ctx.createRadialGradient(cx, cy, 10, cx, cy, radius * 2);
    gradient.addColorStop(0, "#001f3f");
    gradient.addColorStop(1, "rgba(0, 0, 0, 1)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Glowing outer circle
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.4, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 2;
    ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
    ctx.shadowBlur = 20;
    ctx.stroke();
    ctx.shadowBlur = 0; // Reset shadow

    // Draw decorative circles
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    for (let r = innerRadius; r <= outerRadius; r += radius * 0.1) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw speedometer ticks
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const totalAngle = endAngle - startAngle;

    for (let i = 0; i <= 12; i++) {
      const fraction = i / 12; // Fraction along the range
      const angle = startAngle + fraction * totalAngle;
      const isMajorTick = i % 2 === 0;

      // Tick positions
      const x1 = cx + radius * Math.cos(angle);
      const y1 = cy + radius * Math.sin(angle);
      const x2 = cx + (radius - (isMajorTick ? 15 : 10)) * Math.cos(angle);
      const y2 = cy + (radius - (isMajorTick ? 15 : 10)) * Math.sin(angle);

      // Draw tick
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = isMajorTick ? 2 : 1;
      ctx.stroke();

      // Draw tick label
      if (isMajorTick) {
        const labelValue = min + fraction * (max - min);
        const textX = cx + (radius - 25) * Math.cos(angle);
        const textY = cy + (radius - 25) * Math.sin(angle);

        ctx.save();
        ctx.translate(textX, textY);
        ctx.rotate(angle + Math.PI / 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fillText(labelValue.toFixed(0), 0, 0);
        ctx.restore();
      }
    }

    // Draw glowing speedometer arc
    const valueFraction = (value - min) / (max - min);
    const valueAngle = startAngle + valueFraction * totalAngle;

    ctx.beginPath();
    ctx.arc(cx, cy, radius - 7, startAngle, valueAngle);
    const color = `rgba(${(1 - value / max) * 255}, ${
      (value / max) * 255
    }, 0, 1)`;
    ctx.strokeStyle = color;
    ctx.lineWidth = 14;
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw less noticeable needle
    const needleLength = radius - 20;

    const needleX = cx + needleLength * Math.cos(valueAngle);
    const needleY = cy + needleLength * Math.sin(valueAngle);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(needleX, needleY);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)"; // Subtle needle
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw needle cap with slight glow
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw speedometer value and unit
    ctx.font = "12px Arial";
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fillText(`${unit}`, cx, cy + radius * 0.85);

    ctx.font = "20px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`${value.toFixed(decimals)}`, cx, cy + radius * 0.55);
  }
);

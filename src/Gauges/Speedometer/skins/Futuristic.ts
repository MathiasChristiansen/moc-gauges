import { SpeedometerGauge, SpeedometerOptions } from "../index.js";

export const Futuristic = (
  ctx: CanvasRenderingContext2D,
  options: Required<SpeedometerOptions>,
  state: any,
  parentElement: HTMLElement
) => {
  // SpeedometerGauge.registerSkin<SpeedometerOptions>(
  //   "futuristic",
  //   (ctx, options, state, parentElement) => {
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
};
// );

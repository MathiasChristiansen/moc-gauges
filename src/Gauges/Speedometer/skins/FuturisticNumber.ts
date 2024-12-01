import { SpeedometerGauge, SpeedometerOptions } from "../index.js";

export const FuturisticNumber = (
  ctx: CanvasRenderingContext2D,
  options: Required<SpeedometerOptions>,
  state: any,
  parentElement: HTMLElement
) => {
  // SpeedometerGauge.registerSkin<SpeedometerOptions>(
  //   "futuristic-number",
  //   (ctx, options, state, parentElement) => {
  const rect = parentElement.getBoundingClientRect();

  const width = rect.width;
  const height = rect.height;

  const { min, max, decimals, unit } = options;
  const { value } = state;

  ctx.clearRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;

  // Define LED display area
  const ledWidth = width;
  const ledHeight = height;
  const ledX = (width - ledWidth) / 2;
  const ledY = (height - ledHeight) / 2;

  const backgroundCradient = ctx.createLinearGradient(0, 0, width, height);
  backgroundCradient.addColorStop(0, "#001f3f");
  backgroundCradient.addColorStop(1, "rgba(0, 0, 0, 1)");

  // Draw LED background
  ctx.fillStyle = backgroundCradient;
  ctx.fillRect(ledX, ledY, ledWidth, ledHeight);

  // const detailColor = "rgba(100, 128, 205, 0.5)";

  // Draw glowing border
  // ctx.strokeStyle = detailColor;
  // ctx.lineWidth = Math.min(ledWidth, ledHeight) * 0.03;
  // ctx.shadowColor = detailColor;
  // ctx.shadowBlur = 15;
  // ctx.strokeRect(ledX, ledY, ledWidth, ledHeight);
  // ctx.shadowBlur = 0;

  // Configure LED-style number display
  ctx.font = `bold ${ledHeight * 0.25}px 'Courier New', monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Dynamic color for value based on proportion (red to green gradient)
  // const color = `rgba(${(1 - value / max) * 255}, ${
  //   (value / max) * 255
  // }, 50, 1)`;
  let color = "";
  if (options.invertColors) {
    color = `rgba(${(value / max) * 255}, ${(1 - value / max) * 255}, 0, 1)`;
  } else {
    color = `rgba(${(1 - value / max) * 255}, ${(value / max) * 255}, 0, 1)`;
  }
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 4;

  // Draw the value
  ctx.fillText(value.toFixed(decimals), cx, cy);

  // Reset shadow
  ctx.shadowBlur = 0;

  // Draw min/max values in corners of the LED display
  ctx.font = `bold ${ledHeight * 0.12}px 'Courier New', monospace`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.textAlign = "left";
  ctx.fillText(
    `${min}`,
    ledX + ledWidth * 0.05,
    ledY + ledHeight - ledHeight * 0.1
  );

  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.textAlign = "right";
  ctx.fillText(
    `${max}`,
    ledX + ledWidth - ledWidth * 0.05,
    ledY + ledHeight - ledHeight * 0.1
  );
  // Draw unit below the number
  ctx.font = `bold ${ledHeight * 0.1}px Arial, monospace`;
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.fillText(unit, cx, ledY + ledHeight * 0.75);
};
// );

import { SpeedometerGauge, SpeedometerOptions } from "../index.js";

export const FuturisticBar = (
  ctx: CanvasRenderingContext2D,
  options: Required<SpeedometerOptions>,
  state: any,
  parentElement: HTMLElement
) => {
  // SpeedometerGauge.registerSkin<SpeedometerOptions>(
  //   "futuristic-bar",
  //   (ctx, options, state, parentElement) => {
  const rect = parentElement.getBoundingClientRect();

  const width = rect.width;
  const height = rect.height;

  const { min, max, decimals, unit } = options;
  const { value } = state;
  const isVertical = options.vertical || false; // Default to horizontal if not specified

  ctx.clearRect(0, 0, width, height);

  // Dimensions for the bar
  const barThickness = Math.max(width, height);
  // const padding = barThickness * 0;
  const padding = 0;

  // Determine bar layout based on orientation
  const barLength = isVertical ? height - padding * 2 : width - padding * 2;
  const barX = isVertical ? (width - barThickness) / 2 : padding;
  const barY = isVertical ? padding : (height - barThickness) / 2;

  // Calculate active bar length based on value
  const fraction = (value - min) / (max - min);
  const activeLength = Math.max(0, Math.min(fraction, 1)) * barLength;

  // Background gradient for the bar
  const gradient = isVertical
    ? ctx.createLinearGradient(barX, barY + barLength, barX, barY)
    : ctx.createLinearGradient(barX, barY, barX + barLength, barY);
  gradient.addColorStop(0, "#001d3d");
  gradient.addColorStop(1, "rgba(0, 0, 0, 1)");

  // Draw bar background
  ctx.fillStyle = gradient;
  ctx.fillRect(
    barX,
    barY,
    isVertical ? barThickness : barLength,
    isVertical ? barLength : barThickness
  );

  // Glowing active bar
  // const color = `rgba(${(1 - fraction) * 255}, ${fraction * 255}, 50, 1)`;
  let color = "";
  if (options.invertColors) {
    color = `rgba(${(value / max) * 255}, ${(1 - value / max) * 255}, 0, 1)`;
  } else {
    color = `rgba(${(1 - value / max) * 255}, ${(value / max) * 255}, 0, 1)`;
  }
  const shadowColor = `rgba(${(1 - fraction) * 255}, ${
    fraction * 255
  }, 50, 0.5)`;

  ctx.fillStyle = color;
  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = 15;
  if (isVertical) {
    ctx.fillRect(
      barX,
      barY + (barLength - activeLength),
      barThickness,
      activeLength
    );
  } else {
    ctx.fillRect(barX, barY, activeLength, barThickness);
  }
  ctx.shadowBlur = 0;

  // Draw bar border
  // ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  // ctx.lineWidth = Math.min(width, height) * 0.02;
  // ctx.strokeRect(
  //   barX,
  //   barY,
  //   isVertical ? barThickness : barLength,
  //   isVertical ? barLength : barThickness
  // );

  // Ticks
  const tickSpacing = Math.max(barLength / 10, 20); // Ensure a sensible tick spacing
  const tickCount = Math.floor(barLength / tickSpacing);
  const tickStep = (max - min) / tickCount;

  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";

  for (let i = 0; i <= tickCount; i++) {
    const tickValue = min + i * tickStep;
    const tickFraction = (tickValue - min) / (max - min);
    const tickPosition = tickFraction * barLength;

    if (isVertical) {
      const y = barY + barLength - tickPosition;

      // Draw tick
      ctx.beginPath();
      ctx.moveTo(barX + barThickness * (i % 2 ? 0.75 : 0.8), y); // Tick extends outside the bar
      ctx.lineTo(barThickness, y);
      ctx.stroke();

      // Draw tick label
      ctx.font = `${Math.min(width, height) * 0.05}px Arial`;
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(
        tickValue.toFixed(0),
        barThickness * 0.98,
        y - height * 0.025
      );
    } else {
      const x = barX + tickPosition;

      // Draw tick
      ctx.beginPath();
      ctx.moveTo(x, height); // Tick extends below the bar
      ctx.lineTo(x, height * (i % 2 ? 0.7 : 0.75));
      ctx.stroke();

      // Draw tick label
      ctx.font = `${Math.min(width, height) * 0.05}px Arial`;
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(tickValue.toFixed(0), x + 16, height * 0.95);
    }
  }

  // Draw value text
  ctx.font = `${Math.min(width, height) * 0.2}px Arial`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 5;
  const valueText = `${value.toFixed(decimals)} ${unit}`;
  if (isVertical) {
    ctx.fillText(valueText, width / 2, height / 2);
  } else {
    ctx.fillText(valueText, barX + barLength / 2, height / 2);

    // Draw min/max labels for horizontal
    // ctx.font = `${Math.min(width, height) * 0.08}px Arial`;
    // ctx.textAlign = "left";
    // ctx.fillText(`${min}`, barX, barY + barThickness + padding);
    // ctx.textAlign = "right";
    // ctx.fillText(`${max}`, barX + barLength, barY + barThickness + padding);
  }

  ctx.shadowBlur = 0;
};
// );

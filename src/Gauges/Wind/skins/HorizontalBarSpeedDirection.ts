import { WindGaugeOptions, WindGauge } from "../index.js";

export const HorizontalBarSpeedDirection = (
  ctx: CanvasRenderingContext2D,
  options: Required<WindGaugeOptions>,
  state: any,
  parentElement: HTMLElement
) => {
  // WindGauge.registerSkin<WindGaugeOptions>(
  //   "horizontal-bar-speed-direction",
  //   (ctx, options, state, parentElement) => {
  const rect = parentElement.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  ctx.clearRect(0, 0, width, height);

  const { textColor, fontSize, unit } = options;
  const direction = state.direction;
  const speed = state.speed;

  // Bar dimensions
  const barHeight = height; // Bar fills the entire canvas height
  const barWidth = width;

  // Ticks and cardinal definitions
  const majorTickSpacingDegrees = 90; // Degrees between major ticks
  const totalDegrees = 360; // Total degrees in the gauge
  const minorTicksPerMajor = 6; // Minor ticks between each major tick
  const minorTickSpacingDegrees = majorTickSpacingDegrees / minorTicksPerMajor;

  const pixelsPerDegree = barWidth / totalDegrees;

  // Offset for infinite scrolling
  const directionOffsetPx = (direction % totalDegrees) * pixelsPerDegree;
  const totalBarWidthPx = totalDegrees * pixelsPerDegree;

  // Background gradient for the bar
  const barGradient = ctx.createLinearGradient(0, 0, 0, barHeight);
  barGradient.addColorStop(0, "rgba(0, 15, 30, 1)");
  barGradient.addColorStop(1, "rgba(0, 30, 60, 1)");

  // Draw bar background
  ctx.fillStyle = barGradient;
  ctx.fillRect(0, 0, barWidth, barHeight);

  // Draw ticks and labels
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${fontSize || barHeight * 0.15}px Arial`;
  ctx.fillStyle = textColor || "rgba(255, 255, 255, 0.8)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 1;

  for (
    let degree = -totalDegrees;
    degree <= totalDegrees * 2;
    degree += minorTickSpacingDegrees
  ) {
    const tickPx =
      (degree * pixelsPerDegree - directionOffsetPx) % totalBarWidthPx;

    if (tickPx < -pixelsPerDegree || tickPx > barWidth + pixelsPerDegree) {
      // Skip ticks that are outside the visible range
      continue;
    }

    // Major tick
    if (degree % majorTickSpacingDegrees === 0) {
      const isCardinal = degree % 90 === 0;

      // Draw major tick
      const majorTickLength = barHeight * 0.25; // Half the bar height
      ctx.beginPath();
      ctx.moveTo(tickPx, barHeight);
      ctx.lineTo(tickPx, barHeight - majorTickLength);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw label
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      const label = isCardinal
        ? { 0: "N", 90: "E", 180: "S", 270: "W" }[
            (degree + totalDegrees / 2) % totalDegrees
          ] || ((degree + totalDegrees) % totalDegrees).toString()
        : ((degree + totalDegrees) % totalDegrees).toString();
      ctx.fillText(
        label,
        tickPx,
        barHeight - majorTickLength - barHeight * 0.05
      );
    } else {
      // Draw minor tick
      const isSemimajor = degree % 45 === 0;
      const minorTickLength = barHeight * (isSemimajor ? 0.2 : 0.15); // One-quarter the bar height
      ctx.beginPath();
      ctx.moveTo(tickPx, barHeight);
      ctx.lineTo(tickPx, barHeight - minorTickLength);
      ctx.strokeStyle = `rgba(255, 255, 255, ${isSemimajor ? 0.4 : 0.2})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw label
      if (isSemimajor) {
        const label = { 45: "NE", 135: "SE", 225: "SW", 315: "NW" }[
          (degree + totalDegrees) % totalDegrees
        ] as string;
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.font = `${(fontSize || barHeight * 0.15) * 0.8}px Arial`;
        ctx.fillText(
          label,
          tickPx,
          barHeight - minorTickLength - barHeight * 0.05
        );
        ctx.font = `${fontSize || barHeight * 0.15}px Arial`;
      }
    }
  }

  // Draw the heading indicator, arrow at bottom pointing up
  ctx.fillStyle = "rgba(0, 127, 255, 1)";
  ctx.beginPath();
  ctx.moveTo(barWidth / 2, barHeight * 0.85);
  ctx.lineTo(barWidth / 2 - barHeight * 0.075, barHeight);
  ctx.lineTo(barWidth / 2, barHeight);
  ctx.fill();

  ctx.fillStyle = "rgba(0, 50, 150, 0.8)";
  ctx.beginPath();
  ctx.moveTo(barWidth / 2, barHeight * 0.85);
  ctx.lineTo(barWidth / 2 + barHeight * 0.075, barHeight);
  ctx.lineTo(barWidth / 2, barHeight);
  ctx.fill();

  // Display the wind speed in the center
  ctx.font = `${barHeight * 0.18}px Arial`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.fillText(`${Math.round(speed)} ${unit}`, barWidth / 2, barHeight * 0.4);

  // Draw the current direction in the bottom-right corner
  ctx.font = `${barHeight * 0.1}px Arial`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.textAlign = "right";
  ctx.fillText(
    `${Math.round(direction)}°`,
    barWidth - barHeight * 0.1,
    barHeight * 0.1
  );
};
// );

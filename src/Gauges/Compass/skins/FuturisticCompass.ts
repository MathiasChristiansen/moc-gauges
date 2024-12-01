import { CompassGauge, CompassOptions } from "../index.js";

export const FuturisticCompass = (
  ctx: CanvasRenderingContext2D,
  options: CompassOptions,
  state: any,
  parentElement: HTMLElement
) => {
  const rect = parentElement.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  const { needleColor, textColor, fontSize } = options;
  const heading = state.heading;

  ctx.clearRect(0, 0, width, height);

  // Center of the compass
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2 - 8;

  // Draw gradient background
  const gradient = ctx.createRadialGradient(cx, cy, 10, cx, cy, radius);
  gradient.addColorStop(0, "#001f3f");
  gradient.addColorStop(1, "rgba(0, 0, 0, 1)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Draw glowing outer ring
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = "rgba(0, 255, 255, 0.8)"; // Cyan glow
  ctx.lineWidth = 6;
  ctx.shadowColor = "rgba(0, 255, 255, 0.5)";
  ctx.shadowBlur = 20;
  ctx.stroke();
  ctx.shadowBlur = 0; // Reset shadow

  // Draw glowing border circle
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 2;
  ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
  ctx.shadowBlur = 10;
  ctx.stroke();
  ctx.shadowBlur = 0; // Reset shadow

  // Draw cardinal directions (N, E, S, W) with futuristic style
  const cardinalPoints = ["N", "E", "S", "W"];
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.font = `${fontSize}px Arial`;
  cardinalPoints.forEach((point, index) => {
    const angle = (index * Math.PI) / 2; // 0, 90, 180, 270 degrees
    const textX = cx + radius * 0.8 * Math.cos(angle);
    const textY = cy + radius * 0.8 * Math.sin(angle) + (fontSize ?? 20) / 3;

    // Add a subtle glowing effect for the cardinal points
    ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
    ctx.shadowBlur = 10;
    ctx.fillText(point, textX - ctx.measureText(point).width / 2, textY);
    ctx.shadowBlur = 0; // Reset shadow
  });

  // Draw directional ticks (10-degree increments)
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  for (let i = 0; i < 360; i += 10) {
    const tickAngle = (i * Math.PI) / 180 - Math.PI / 2;
    const innerTickRadius = radius * 0.85;
    const outerTickRadius = radius * 0.9;
    const x1 = cx + innerTickRadius * Math.cos(tickAngle);
    const y1 = cy + innerTickRadius * Math.sin(tickAngle);
    const x2 = cx + outerTickRadius * Math.cos(tickAngle);
    const y2 = cy + outerTickRadius * Math.sin(tickAngle);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = i % 30 === 0 ? 2 : 1; // Highlight 30-degree increments
    ctx.stroke();
  }

  // Draw glowing needle
  const needleAngle = (heading * Math.PI) / 180 - Math.PI / 2; // Convert heading to radians
  const needleLength = radius * 0.9;

  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(
    cx + needleLength * Math.cos(needleAngle),
    cy + needleLength * Math.sin(needleAngle)
  );
  ctx.strokeStyle = "rgba(255, 0, 0, 0.8)"; // Glowing red needle
  ctx.lineWidth = 3;
  ctx.shadowColor = "rgba(255, 0, 0, 0.5)";
  ctx.shadowBlur = 15;
  ctx.stroke();
  ctx.shadowBlur = 0; // Reset shadow

  // Draw a glowing center dot
  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, 2 * Math.PI);
  ctx.fillStyle = "rgba(255, 0, 0, 0.8)";
  ctx.shadowColor = "rgba(255, 0, 0, 0.5)";
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Display the heading value
  ctx.font = "20px Arial";
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${Math.round(heading)}°`, cx, cy + radius * 0.6);
};

// CompassGauge.registerSkin<CompassOptions>(
//   "futuristic-compass",
//   (ctx, options, state, parentElement) => {}
// );

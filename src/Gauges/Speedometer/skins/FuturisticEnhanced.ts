import { SpeedometerGauge, SpeedometerOptions } from "../index.js";

export const FuturisticEnhanced = (
  ctx: CanvasRenderingContext2D,
  options: Required<SpeedometerOptions>,
  state: any,
  parentElement: HTMLElement
) => {
  // SpeedometerGauge.registerSkin<SpeedometerOptions>(
  //   "futuristic-enhanced",
  //   (ctx, options, state, parentElement) => {
  const rect = parentElement.getBoundingClientRect();

  // parentElement.style.borderRadius = "50%";
  // parentElement.style.border = "2px solid rgba(0, 0, 0, 0.5)";
  // parentElement.style.overflow = "hidden";

  const width = rect.width;
  const height = rect.height;

  const { min, max, needleColor, decimals, unit } = options;
  const { value } = state;

  ctx.clearRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2 - 8;
  const outerRadius = radius * 0.9;
  const innerRadius = radius * 0.7;

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
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
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
  ctx.font = `${radius * 0.1}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const totalAngle = endAngle - startAngle;

  for (let i = 0; i <= 12; i++) {
    const fraction = i / 12; // Fraction along the range
    const angle = startAngle + fraction * totalAngle;
    const isMajorTick = i % 2 === 0;

    // Tick positions
    const x1 = cx + outerRadius * Math.cos(angle);
    const y1 = cy + outerRadius * Math.sin(angle);
    const x2 = cx + innerRadius * (isMajorTick ? 0.9 : 0.85) * Math.cos(angle);
    const y2 = cy + innerRadius * (isMajorTick ? 0.9 : 0.85) * Math.sin(angle);

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
      const textX = cx + innerRadius * 0.75 * Math.cos(angle);
      const textY = cy + innerRadius * 0.75 * Math.sin(angle);

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

  const arcThckness = outerRadius * 0.2;

  ctx.beginPath();
  ctx.arc(cx, cy, outerRadius - arcThckness / 2, startAngle, valueAngle);
  let color = "";
  if (options.invertColors) {
    color = `rgba(${(value / max) * 255}, ${(1 - value / max) * 255}, 0, 1)`;
  } else {
    color = `rgba(${(1 - value / max) * 255}, ${(value / max) * 255}, 0, 1)`;
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = arcThckness;
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
  ctx.font = `${radius * 0.12}px Arial`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.fillText(`${unit}`, cx, cy + radius * 0.75);

  ctx.font = `${radius * 0.2}px Arial`;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(`${value.toFixed(decimals)}`, cx, cy + radius * 0.55);
};
// );

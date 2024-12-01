import { WindGaugeOptions, WindGauge } from "../index.js";

export const FuturisticWindArrow = (
  ctx: CanvasRenderingContext2D,
  options: Required<WindGaugeOptions>,
  state: any,
  parentElement: HTMLElement
) => {
  // WindGauge.registerSkin<WindGaugeOptions>(
  //   "futuristic-wind-arrow",
  //   (ctx, options, state, parentElement) => {
  const rect = parentElement.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  // parentElement.style.borderRadius = "100%";
  // parentElement.style.border = "2px solid rgba(0, 0, 0, 0.5)";
  // parentElement.style.overflow = "hidden";

  const { needleColor, textColor, fontSize, unit } = options;
  const direction = state.direction;
  const speed = state.speed;

  ctx.clearRect(0, 0, width, height);

  // Center of the wind gauge
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2 - 8;
  const outerRadius = radius * 0.85;
  const centerRadius = outerRadius * 0.6; // Radius of the smaller center circle

  // Draw gradient background
  const gradient = ctx.createRadialGradient(cx, cy, 10, cx, cy, outerRadius);
  gradient.addColorStop(0, "#001f3f");
  gradient.addColorStop(1, "rgba(0, 0, 0, 1)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Draw glowing outer ring
  ctx.beginPath();
  ctx.arc(cx, cy, outerRadius, 0, 2 * Math.PI);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  ctx.lineWidth = 2;
  ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
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

  // Draw directional ticks and degree values
  const degreeRadius = outerRadius * 0.95; // Position for degree values
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.font = `${outerRadius * 0.1}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let i = 0; i < 360; i += 10) {
    const tickAngle = (i * Math.PI) / 180 - Math.PI / 2;
    const innerTickRadius = outerRadius * 0.85;
    const outerTickRadius = outerRadius * 0.9;
    const x1 = cx + innerTickRadius * Math.cos(tickAngle);
    const y1 = cy + innerTickRadius * Math.sin(tickAngle);
    const x2 = cx + outerTickRadius * Math.cos(tickAngle);
    const y2 = cy + outerTickRadius * Math.sin(tickAngle);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = i % 30 === 0 ? 2 : 1;
    ctx.stroke();

    // Draw degree text (only at 30-degree intervals)
    if (i % 30 === 0) {
      const textX = cx + degreeRadius * Math.cos(tickAngle);
      const textY = cy + degreeRadius * Math.sin(tickAngle);

      ctx.save(); // Save the current context state
      ctx.translate(textX, textY); // Move to the text position
      ctx.rotate(tickAngle + Math.PI / 2); // Rotate to align with the tick
      ctx.fillText(`${i}`, 0, (innerTickRadius - outerTickRadius) * 2.5); // Draw text at the rotated position
      ctx.restore(); // Restore the context to the previous state
    }
  }

  // Draw smaller center circle
  ctx.beginPath();
  ctx.arc(cx, cy, centerRadius, 0, 2 * Math.PI);
  ctx.fillStyle = "rgba(100, 100, 100, 0.1)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw cardinal directions inside the center circle
  const cardinalDirections = { N: 0, E: 90, S: 180, W: 270 };
  ctx.font = `${outerRadius * 0.14}px Arial`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  Object.entries(cardinalDirections).forEach(([dir, angle]) => {
    const dirAngle = (angle * Math.PI) / 180 - Math.PI / 2;
    const dirX = cx + centerRadius * 0.7 * Math.cos(dirAngle);
    const dirY = cy + centerRadius * 0.7 * Math.sin(dirAngle);
    ctx.fillText(dir, dirX, dirY);
  });

  // Draw wind direction arrow
  const needleAngle = (direction * Math.PI) / 180 - Math.PI / 2; // Convert direction to radians
  const arrowBaseRadius = centerRadius; // Base of the arrow aligns with the center circle's perimeter
  const arrowTipRadius = centerRadius + (outerRadius - centerRadius) * 0.4; // Arrow tip reaches outward
  const arrowWidth = centerRadius * 0.25; // Width of the arrow base

  // Arrow tip coordinates
  const tipX = cx + arrowTipRadius * Math.cos(needleAngle);
  const tipY = cy + arrowTipRadius * Math.sin(needleAngle);

  // Base center point (tangential to the inner circle)
  const baseCenterX = cx + arrowBaseRadius * Math.cos(needleAngle);
  const baseCenterY = cy + arrowBaseRadius * Math.sin(needleAngle);

  // Calculate left and right base corners
  const baseLeftX =
    baseCenterX + (arrowWidth / 2) * Math.cos(needleAngle + Math.PI / 2);
  const baseLeftY =
    baseCenterY + (arrowWidth / 2) * Math.sin(needleAngle + Math.PI / 2);
  const baseRightX =
    baseCenterX + (arrowWidth / 2) * Math.cos(needleAngle - Math.PI / 2);
  const baseRightY =
    baseCenterY + (arrowWidth / 2) * Math.sin(needleAngle - Math.PI / 2);

  // Draw left triangle (lighter blue)
  ctx.beginPath();
  ctx.moveTo(tipX, tipY); // Tip of the arrow
  ctx.lineTo(baseCenterX, baseCenterY); // Base center point
  ctx.lineTo(baseLeftX, baseLeftY); // Base left corner
  ctx.fillStyle = "rgba(0, 127, 255, 0.8)";
  ctx.closePath();
  ctx.fill();

  // Draw right triangle (darker blue)
  ctx.beginPath();
  ctx.moveTo(tipX, tipY); // Tip of the arrow
  ctx.lineTo(baseCenterX, baseCenterY); // Base center point
  ctx.lineTo(baseRightX, baseRightY); // Base right corner
  ctx.closePath();
  ctx.fillStyle = "rgba(0, 50, 150, 0.8)";
  ctx.fill();

  // Display wind speed in the center
  ctx.font = `${outerRadius * 0.25}px Arial`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  const speedText = `${Math.round(speed)}`;
  ctx.fillText(speedText, cx, cy);

  // Display unit (knots) below the wind speed
  ctx.font = `${outerRadius * 0.14}px Arial`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.fillText(unit, cx, cy + outerRadius * 0.2);

  // Display degrees slightly up and to the right of the wind speed
  ctx.font = `${outerRadius * 0.1}px Arial`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  const degreeText = `${Math.round(direction)}°`;
  ctx.fillText(degreeText, cx, cy - outerRadius * 0.2);
};
// );

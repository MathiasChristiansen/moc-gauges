import { GaugeBase, GaugeOptions } from "./BaseGauge.js";

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
}

WindGauge.registerSkin<WindGaugeOptions>(
  "futuristic-wind-arrow",
  (ctx, options, state, parentElement) => {
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
  }
);

WindGauge.registerSkin<WindGaugeOptions>(
  "horizontal-bar-speed-direction",
  (ctx, options, state, parentElement) => {
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
    const minorTickSpacingDegrees =
      majorTickSpacingDegrees / minorTicksPerMajor;

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
        const majorTickLength = barHeight * 0.5; // Half the bar height
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
        const minorTickLength = barHeight * (degree % 45 === 0 ? 0.35 : 0.25); // One-quarter the bar height
        ctx.beginPath();
        ctx.moveTo(tickPx, barHeight);
        ctx.lineTo(tickPx, barHeight - minorTickLength);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 1;
        ctx.stroke();
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
    ctx.fillText(`${Math.round(speed)} ${unit}`, barWidth / 2, barHeight * 0.2);

    // Draw the current direction in the bottom-right corner
    ctx.font = `${barHeight * 0.1}px Arial`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.textAlign = "right";
    ctx.fillText(
      `${Math.round(direction)}°`,
      barWidth - barHeight * 0.1,
      barHeight * 0.1
    );
  }
);

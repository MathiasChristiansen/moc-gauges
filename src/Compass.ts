import { GaugeBase, GaugeOptions } from "./BaseGauge.js";

interface CompassOptions extends GaugeOptions {
  needleColor?: string;
  textColor?: string;
  borderColor?: string;
  easingFactor?: number;
  backgroundColor?: string;
  fontSize?: number;
}

export class CompassGauge extends GaugeBase {
  protected options: Required<CompassOptions>;

  constructor(parentElement: HTMLElement, options: CompassOptions = {}) {
    super(parentElement, {
      ...options,
    });

    // Merge specific options
    this.options = {
      needleColor: "#ff0000",
      textColor: "#000000",
      borderColor: "#000000",
      easingFactor: 0.1,
      autoRender: false,
      skin: "default",
      backgroundColor: "#ffffff",
      fontSize: 16,
      ...options,
    };

    // Initialize animation state
    this.animationState = { heading: 0 }; // Animated state for rendering
    this.actualState = { heading: 0 }; // Target state
  }

  protected defaultRender(
    ctx: CanvasRenderingContext2D,
    options: Required<CompassOptions>,
    state: any,
    parentElement: HTMLElement
  ): void {
    const rect = parentElement.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const { needleColor, textColor, borderColor, fontSize } = options;
    const heading = state.heading;

    ctx.clearRect(0, 0, width, height);

    // Center of the compass
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2 - 10;

    // Draw compass circle
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 5;
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

    // Draw needle
    const needleAngle = (heading * Math.PI) / 180 - Math.PI / 2; // Convert heading to radians
    const needleLength = radius * 0.9;

    // Needle line
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
  }

  // protected render(): void {
  //   const rect = this.parentElement.getBoundingClientRect();
  //   const width = rect.width;
  //   const height = rect.height;

  //   const { needleColor, textColor, borderColor, fontSize } = this.options;
  //   const heading = this.animationState.heading;

  //   this.clear();

  //   // Center of the compass
  //   const cx = width / 2;
  //   const cy = height / 2;
  //   const radius = Math.min(width, height) / 2 - 10;

  //   // Draw compass circle
  //   this.ctx.beginPath();
  //   this.ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
  //   this.ctx.strokeStyle = borderColor;
  //   this.ctx.lineWidth = 5;
  //   this.ctx.stroke();

  //   // Draw cardinal directions (N, E, S, W)
  //   const cardinalPoints = ["N", "E", "S", "W"];
  //   this.ctx.fillStyle = textColor;
  //   this.ctx.font = `${fontSize}px Arial`;
  //   cardinalPoints.forEach((point, index) => {
  //     const angle = (index * Math.PI) / 2; // 0, 90, 180, 270 degrees
  //     const textX = cx + radius * 0.8 * Math.cos(angle);
  //     const textY = cy + radius * 0.8 * Math.sin(angle) + fontSize / 3;
  //     this.ctx.fillText(
  //       point,
  //       textX - this.ctx.measureText(point).width / 2,
  //       textY
  //     );
  //   });

  //   // Draw needle
  //   const needleAngle = (heading * Math.PI) / 180 - Math.PI / 2; // Convert heading to radians
  //   const needleLength = radius * 0.9;

  //   // Needle line
  //   this.ctx.beginPath();
  //   this.ctx.moveTo(cx, cy);
  //   this.ctx.lineTo(
  //     cx + needleLength * Math.cos(needleAngle),
  //     cy + needleLength * Math.sin(needleAngle)
  //   );
  //   this.ctx.strokeStyle = needleColor;
  //   this.ctx.lineWidth = 3;
  //   this.ctx.stroke();

  //   // Draw a center dot
  //   this.ctx.beginPath();
  //   this.ctx.arc(cx, cy, 5, 0, 2 * Math.PI);
  //   this.ctx.fillStyle = needleColor;
  //   this.ctx.fill();
  // }

  // Overwrite the updateAnimationState to handle compass-specific behavior
  protected updateAnimationState(): void {
    const easingFactor = this.options.easingFactor;
    const actualHeading = this.actualState.heading;
    const animatedHeading = this.animationState.heading || 0;

    // Calculate shortest angular difference
    let difference = actualHeading - animatedHeading;

    // Wrap difference to the range [-180, 180]
    if (difference > 180) {
      difference -= 360;
    } else if (difference < -180) {
      difference += 360;
    }

    // Smoothly update animation state
    this.animationState.heading = animatedHeading + difference * easingFactor;
  }
}

CompassGauge.registerSkin<CompassOptions>(
  "futuristic-compass",
  (ctx, options, state, parentElement) => {
    const rect = parentElement.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const { needleColor, textColor, fontSize } = options;
    const heading = state.heading;

    ctx.clearRect(0, 0, width, height);

    // Center of the compass
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2 - 10;

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

    // Draw cardinal directions (N, E, S, W) with futuristic style
    const cardinalPoints = ["N", "E", "S", "W"];
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.font = `${fontSize}px Arial`;
    cardinalPoints.forEach((point, index) => {
      const angle = (index * Math.PI) / 2; // 0, 90, 180, 270 degrees
      const textX = cx + radius * 0.8 * Math.cos(angle);
      const textY = cy + radius * 0.8 * Math.sin(angle) + fontSize / 3;

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
  }
);

CompassGauge.registerSkin<CompassOptions>(
  "futuristic-compass-arrow",
  (ctx, options, state, parentElement) => {
    const rect = parentElement.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    parentElement.style.borderRadius = "50%";
    parentElement.style.border = "2px solid rgba(0, 0, 0, 0.5)";
    parentElement.style.overflow = "hidden";

    const { needleColor, textColor, fontSize } = options;
    const heading = state.heading;

    ctx.clearRect(0, 0, width, height);

    // Center of the compass
    const cx = width / 2;
    const cy = height / 2;
    const outerRadius = Math.min(width, height) / 2 - 15;
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

    // Draw directional ticks and degree values
    const degreeRadius = outerRadius * 0.95; // Position for degree values
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = `${fontSize * 0.5}px Arial`;
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
        ctx.fillText(`${i}`, 0, -10); // Draw text at the rotated position
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
    ctx.font = `${fontSize * 0.6}px Arial`;
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

    // Draw arrow needle
    const needleAngle = (heading * Math.PI) / 180 - Math.PI / 2; // Convert heading to radians
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

    // Draw left triangle (lighter red)
    ctx.beginPath();
    ctx.moveTo(tipX, tipY); // Tip of the arrow
    ctx.lineTo(baseCenterX, baseCenterY); // Base center point
    ctx.lineTo(baseLeftX, baseLeftY); // Base left corner
    ctx.fillStyle = "rgba(180, 0, 0, 0.8)";
    ctx.closePath();
    ctx.fill();

    // Draw right triangle (darker red)
    ctx.beginPath();
    ctx.moveTo(tipX, tipY); // Tip of the arrow
    ctx.lineTo(baseCenterX, baseCenterY); // Base center point
    ctx.lineTo(baseRightX, baseRightY); // Base right corner
    ctx.closePath();
    ctx.fillStyle = "rgba(255, 80, 80, 0.8)";
    ctx.fill();

    ctx.fillStyle = "rgba(255, 0, 0, 0.8)";
    ctx.shadowColor = "rgba(255, 0, 0, 0.5)";
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Display the heading value
    ctx.font = "20px Arial";
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${Math.round(heading)}°`, cx, cy);
  }
);

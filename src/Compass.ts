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

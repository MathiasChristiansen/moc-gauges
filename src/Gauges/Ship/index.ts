import { GaugeBase, GaugeOptions } from "../base.js";
import { MarineDisplay } from "./skins/MarineDisplay.js";
import { MinimalShipDisplay } from "./skins/MinimalShipDisplay.js";
import { YoungWindTracker } from "./skins/YoungWindTracker.js";

export interface ShipGaugeOptions extends GaugeOptions {
  needleColor?: string;
  textColor?: string;
  fontSize?: number;
  easingFactor?: number;
  unit?: string;
  backgroundColor?: string;
  showCOG?: boolean; // Show Course Over Ground
  showSOG?: boolean; // Show Speed Over Ground
  showWindCone?: boolean; // Show wind direction cone
  showWake?: boolean; // Show ship wake trail
  shipColor?: string; // Color of the ship
  windColor?: string; // Color of wind indicators
  cogColor?: string; // Color of course over ground line
  wakeColor?: string; // Color of wake trail
}

export class ShipGauge extends GaugeBase {
  protected options: Required<ShipGaugeOptions>;
  protected gaugeType = "ship";
  protected animatedProperties = [
    "heading",
    "cog",
    "sog",
    "windDirection",
    "windSpeed",
  ];

  constructor(parentElement: HTMLElement, options: ShipGaugeOptions = {}) {
    super(parentElement, {
      needleColor: "#007bff",
      textColor: "#ffffff",
      backgroundColor: "rgba(0, 0, 0, 0)",
      easingFactor: 0.1,
      fontSize: 12,
      ...options,
    });

    this.options = {
      needleColor: "#007bff",
      textColor: "#ffffff",
      backgroundColor: "rgba(0, 0, 0, 0)",
      autoRender: false,
      easingFactor: 0.1,
      unit: "knots",
      fontSize: 12,
      skin: "default",
      showCOG: true,
      showSOG: true,
      showWindCone: true,
      showWake: true,
      shipColor: "#4a90e2",
      windColor: "#32cd32",
      cogColor: "#ff6b35",
      wakeColor: "#87ceeb",
      ...options,
    };

    // Initialize animation state
    this.animationState = {
      heading: 0, // Ship's heading (bow direction)
      cog: 0, // Course over ground
      sog: 0, // Speed over ground
      windDirection: 0, // True wind direction
      windSpeed: 0, // Wind speed
    };
    this.actualState = {
      heading: 0,
      cog: 0,
      sog: 0,
      windDirection: 0,
      windSpeed: 0,
    };
  }

  protected getDescription(): string {
    return "A marine navigation display showing ship outline with heading, course over ground, wind direction, and speed vectors";
  }

  protected updateAnimationState(): void {
    const easingFactor = this.options.easingFactor;

    for (const key in this.actualState) {
      if (this.actualState.hasOwnProperty(key)) {
        const actualValue = this.actualState[key];
        const animationValue = this.animationState[key] || 0;

        // Handle circular values (angles) differently
        if (key === "heading" || key === "cog" || key === "windDirection") {
          // Calculate the shortest angular distance
          let diff = actualValue - animationValue;
          if (diff > 180) diff -= 360;
          if (diff < -180) diff += 360;

          this.animationState[key] = animationValue + diff * easingFactor;

          // Normalize to 0-360 range
          if (this.animationState[key] < 0) this.animationState[key] += 360;
          if (this.animationState[key] >= 360) this.animationState[key] -= 360;
        } else {
          // Linear interpolation for non-angular values
          this.animationState[key] =
            animationValue + (actualValue - animationValue) * easingFactor;
        }
      }
    }
  }

  protected defaultRender(
    ctx: CanvasRenderingContext2D,
    options: Required<ShipGaugeOptions>,
    state: any,
    parentElement: HTMLElement
  ): void {
    const rect = parentElement.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const { textColor, fontSize, shipColor } = this.options;
    const { heading, cog, sog, windDirection, windSpeed } = this.animationState;

    ctx.clearRect(0, 0, width, height);

    // Center of the display
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2 - 20;

    // Draw background circle
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw cardinal directions
    const cardinalPoints = ["N", "E", "S", "W"];
    ctx.fillStyle = textColor;
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    cardinalPoints.forEach((point, index) => {
      const angle = (index * Math.PI) / 2 - Math.PI / 2; // 0, 90, 180, 270 degrees
      const textX = cx + radius * 0.85 * Math.cos(angle);
      const textY = cy + radius * 0.85 * Math.sin(angle);
      ctx.fillText(point, textX, textY);
    });

    // Draw simple ship outline (triangle pointing up)
    const shipSize = radius * 0.15;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((heading * Math.PI) / 180);

    ctx.beginPath();
    ctx.moveTo(0, -shipSize); // Bow
    ctx.lineTo(-shipSize * 0.5, shipSize * 0.7); // Port stern
    ctx.lineTo(shipSize * 0.5, shipSize * 0.7); // Starboard stern
    ctx.closePath();

    ctx.fillStyle = shipColor;
    ctx.fill();
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();

    // Draw speed and direction text
    ctx.fillStyle = textColor;
    ctx.font = `${fontSize * 0.8}px Arial`;
    ctx.textAlign = "left";
    ctx.fillText(`HDG: ${heading.toFixed(0)}°`, 10, 20);
    ctx.fillText(`COG: ${cog.toFixed(0)}°`, 10, 40);
    ctx.fillText(`SOG: ${sog.toFixed(1)} ${this.options.unit}`, 10, 60);
    ctx.fillText(
      `Wind: ${windDirection.toFixed(0)}° @ ${windSpeed.toFixed(1)} ${
        this.options.unit
      }`,
      10,
      80
    );
  }
}

GaugeBase.registerSkin("ship", "default", MarineDisplay);
GaugeBase.registerSkin("ship", "minimal", MinimalShipDisplay);
GaugeBase.registerSkin("ship", "windTracker", YoungWindTracker);

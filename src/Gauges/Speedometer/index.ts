import { GaugeBase, GaugeOptions } from "../base.js";
import { Futuristic } from "./skins/Futuristic.js";
import { FuturisticBar } from "./skins/FuturisticBar.js";
import { FuturisticEnhanced } from "./skins/FuturisticEnhanced.js";
import { FuturisticNumber } from "./skins/FuturisticNumber.js";

export interface SpeedometerOptions extends GaugeOptions {
  min?: number;
  max?: number;
  easingFactor?: number;
  needleColor?: string;
  unit?: string;
  skin?: string;
  vertical?: boolean;
  invertColors?: boolean;
  decimals?: number;
  backgroundColor?: string;
}

export class SpeedometerGauge extends GaugeBase {
  protected options: Required<SpeedometerOptions>;
  protected gaugeType = "speedometer";
  protected animatedProperties = ["value"];

  constructor(parentElement: HTMLElement, options: SpeedometerOptions = {}) {
    super(parentElement, {
      min: 0,
      max: 100,
      easingFactor: 0.1,
      backgroundColor: "#ffffff",
      ...options,
    });
    this.options = {
      min: 0,
      max: 100,
      easingFactor: 0.1,
      needleColor: "#ff0000",
      backgroundColor: "#ffffff",
      unit: "%",
      skin: "default",
      vertical: false,
      invertColors: false,
      decimals: 2,
      autoRender: false,
      ...options,
    };

    this.animationState = { value: 0 };
    this.actualState = { value: 0 };
  }

  protected defaultRender(
    ctx: CanvasRenderingContext2D,
    options: Required<SpeedometerOptions>,
    state: any,
    parentElement: HTMLElement
  ): void {
    const rect = parentElement.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const { min, max, needleColor } = this.options;

    const { value } = this.animationState;

    ctx.clearRect(0, 0, width, height);

    // Draw the speedometer arc
    ctx.beginPath();
    ctx.arc(
      width / 2,
      height / 2,
      Math.min(width, height) / 3,
      Math.PI,
      2 * Math.PI
    );
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 5;
    ctx.stroke();

    // Draw the needle
    const angle = Math.PI + ((value - min) / (max - min)) * Math.PI;
    const needleLength = Math.min(width, height) / 3;
    const x = width / 2 + needleLength * Math.cos(angle);
    const y = height / 2 + needleLength * Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(width / 2, height / 2);
    ctx.lineTo(x, y);
    ctx.strokeStyle = needleColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw the needle cap
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 5, 0, 2 * Math.PI);
    ctx.fillStyle = needleColor;
    ctx.fill();

    // Draw the speedometer value
    ctx.font = "20px Arial";
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      `${value.toFixed(options.decimals)}${options.unit}`,
      width / 2,
      height / 2 + 25
    );

    // Draw the speedometer min/max values
    ctx.font = "10px Arial";
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${min}`, width / 2 - needleLength, height / 2 + 10);
    ctx.fillText(`${max}`, width / 2 + needleLength, height / 2 + 10);
  }

  protected getDescription(): string {
    return "A speedometer gauge that displays a numeric value with customizable range and styling";
  }
}

SpeedometerGauge.registerSkin("speedometer", "default", FuturisticEnhanced);
SpeedometerGauge.registerSkin("speedometer", "minimal", Futuristic);
SpeedometerGauge.registerSkin("speedometer", "bar", FuturisticBar);
SpeedometerGauge.registerSkin("speedometer", "number", FuturisticNumber);

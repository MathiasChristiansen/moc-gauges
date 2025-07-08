import { GaugeBase, GaugeOptions } from "../base.js";
import { ArrowIndicator } from "./skins/ArrowIndicator.js";
import { BarIndicator } from "./skins/BarIndicator.js";

export interface TrendGaugeOptions extends GaugeOptions {
  bufferSize?: number;       // Maximum number of values to keep in the buffer
  upColor?: string;          // Color for upward trend arrows
  downColor?: string;        // Color for downward trend arrows
  minGlowIntensity?: number; // Minimum glow intensity (0-1)
  maxGlowIntensity?: number; // Maximum glow intensity (0-1)
  upArrowCount?: number;     // Number of up arrows to display
  downArrowCount?: number;   // Number of down arrows to display
  maxTrendValue?: number;    // Maximum trend value (used for scaling arrow intensity)
  trendThresholds?: {        // Thresholds for determining arrow intensity
    minimal: number;         // Minimal trend that registers any movement
    low: number;             // Low trend threshold (1 arrow)
    medium: number;          // Medium trend threshold (2 arrows)
    high: number;            // High trend threshold (2 arrows with max glow)
  };
}

export class TrendGauge extends GaugeBase {
  protected options: Required<TrendGaugeOptions>;
  protected gaugeType = "trend";
  protected animatedProperties = ["trend", "trendStrength"];
  private valueBuffer: number[] = [];
  
  constructor(parentElement: HTMLElement, options: TrendGaugeOptions = {}) {
    super(parentElement, {
      ...options,
    });
    
    // Set default options
    this.options = {
      bufferSize: 10,  // Default buffer size, but can be overridden
      upColor: "#00cc00",
      downColor: "#cc0000",
      minGlowIntensity: 0.2,
      maxGlowIntensity: 0.8,
      upArrowCount: 2,       // Default number of up arrows
      downArrowCount: 2,     // Default number of down arrows
      maxTrendValue: 2,      // Default max trend value
      trendThresholds: {
        minimal: 0.001,   // Almost flat
        low: 0.01,        // Slight trend
        medium: 0.05,     // Moderate trend
        high: 0.1         // Strong trend
      },
      autoRender: false,
      skin: "default",
      backgroundColor: "rgba(0, 0, 0, 0)",
      easingFactor: 0.1,
      ...options
    };
    
    // Initialize state
    this.animationState = { 
      trend: 0, 
      trendStrength: 0,
      upTrendIntensity: 0,  // Add new state for up trend
      downTrendIntensity: 0 // Add new state for down trend
    };
    this.actualState = { 
      trend: 0, 
      trendStrength: 0,
      upTrendIntensity: 0,
      downTrendIntensity: 0
    };
  }
  
  // Override setData to handle trend-specific logic
  public setData(data: any): void {
    // Check if data contains a value property
    if (data.value !== undefined) {
      // Add to buffer
      this.valueBuffer.push(data.value);
      
      // Maintain buffer size
      if (this.valueBuffer.length > this.options.bufferSize) {
        this.valueBuffer.shift();
      }
      
      // Calculate trend if we have enough data points
      if (this.valueBuffer.length >= 2) {
        const { slope, strength } = this.calculateTrend();
        this.actualState.trend = slope;
        this.actualState.trendStrength = this.calculateTrendStrength(Math.abs(slope));
        
        // Add direction-specific intensities
        this.actualState.upTrendIntensity = slope > 0 ? this.actualState.trendStrength : 0;
        this.actualState.downTrendIntensity = slope < 0 ? this.actualState.trendStrength : 0;
      }
    } else if (data.values !== undefined && Array.isArray(data.values)) {
      // Handle array of values
      this.valueBuffer = [];
      for (const value of data.values.slice(-this.options.bufferSize)) {
        this.valueBuffer.push(value);
      }
      
      // Calculate trend
      if (this.valueBuffer.length >= 2) {
        const { slope, strength } = this.calculateTrend();
        this.actualState.trend = slope;
        this.actualState.trendStrength = this.calculateTrendStrength(Math.abs(slope));
        
        // Add direction-specific intensities
        this.actualState.upTrendIntensity = slope > 0 ? this.actualState.trendStrength : 0;
        this.actualState.downTrendIntensity = slope < 0 ? this.actualState.trendStrength : 0;
      }
    } else {
      // Handle direct state setting (for testing/debugging)
      super.setData(data);
    }
    
    if (this.options.autoRender) {
      this.update();
    }
  }
  
  // Add a method to get the current buffer
  public getBuffer(): number[] {
    return [...this.valueBuffer];
  }
  
  // Add a method to set the buffer size
  public setBufferSize(size: number): void {
    if (size < 2) {
      console.warn('Buffer size must be at least 2. Setting to 2.');
      size = 2;
    }
    
    this.options.bufferSize = size;
    
    // Trim buffer if it's longer than the new size
    if (this.valueBuffer.length > size) {
      this.valueBuffer = this.valueBuffer.slice(-size);
      
      // Recalculate trend based on the new buffer
      if (this.valueBuffer.length >= 2) {
        const { slope, strength } = this.calculateTrend();
        this.actualState.trend = slope;
        this.actualState.trendStrength = this.calculateTrendStrength(Math.abs(slope));
        this.actualState.upTrendIntensity = slope > 0 ? this.actualState.trendStrength : 0;
        this.actualState.downTrendIntensity = slope < 0 ? this.actualState.trendStrength : 0;
      }
      
      if (this.options.autoRender) {
        this.update();
      }
    }
  }
  
  // Calculate linear regression to determine trend
  private calculateTrend(): { slope: number, strength: number } {
    const n = this.valueBuffer.length;
    
    // Calculate means
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (let i = 0; i < n; i++) {
      const x = i;
      const y = this.valueBuffer[i];
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    }
    
    const meanX = sumX / n;
    const meanY = sumY / n;
    
    // Calculate slope (a in ax + b)
    const numerator = sumXY - n * meanX * meanY;
    const denominator = sumXX - n * meanX * meanX;
    
    // Avoid division by zero
    const slope = denominator === 0 ? 0 : numerator / denominator;
    
    // Calculate coefficient of determination (R^2) for strength
    let totalVariation = 0;
    let explainedVariation = 0;
    for (let i = 0; i < n; i++) {
      const x = i;
      const y = this.valueBuffer[i];
      const yHat = slope * x + (meanY - slope * meanX);
      totalVariation += Math.pow(y - meanY, 2);
      explainedVariation += Math.pow(yHat - meanY, 2);
    }
    
    const strength = totalVariation === 0 ? 0 : explainedVariation / totalVariation;
    
    return { slope, strength };
  }
  
  // Map the trend value to strength categories based on thresholds
  private calculateTrendStrength(trendValue: number): number {
    const { minimal, low, medium, high } = this.options.trendThresholds;
    
    if (trendValue < minimal) return 0;
    if (trendValue < low) return 0.25;
    if (trendValue < medium) return 0.5;
    if (trendValue < high) return 0.75;
    return 1;
  }
  
  // Basic rendering function that will be replaced by skins
  protected defaultRender(
    ctx: CanvasRenderingContext2D,
    options: Required<TrendGaugeOptions>,
    state: any,
    parentElement: HTMLElement
  ): void {
    const rect = parentElement.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    ctx.clearRect(0, 0, width, height);
    
    const { trend, trendStrength } = state;
    const { upColor, downColor } = options;
    
    // Draw a simple indicator
    ctx.fillStyle = trend >= 0 ? upColor : downColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${height * 0.15}px Arial`;
    
    // Show trend direction and strength
    const indicator = trend >= 0 ? "▲" : "▼";
    const repetitions = Math.max(1, Math.ceil(trendStrength * 3));
    ctx.fillText(indicator.repeat(repetitions), width / 2, height / 2);
    
    // Show trend value
    ctx.font = `${height * 0.1}px Arial`;
    ctx.fillText(`Trend: ${trend.toFixed(4)}`, width / 2, height * 0.75);
  }
  
  protected getDescription(): string {
    return "A trend gauge that displays directional trends using arrows or bars based on historical data";
  }
}

TrendGauge.registerSkin("trend", "arrow-indicator", ArrowIndicator);
TrendGauge.registerSkin("trend", "bar-indicator", BarIndicator);
import { TrendGaugeOptions } from "../index.js";

export const BarIndicator = (
  ctx: CanvasRenderingContext2D,
  options: Required<TrendGaugeOptions>,
  state: any,
  parentElement: HTMLElement
) => {
  const rect = parentElement.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Extract state and options
  const { trend, trendStrength } = state;
  const { 
    upColor, 
    downColor, 
    minGlowIntensity, 
    maxGlowIntensity, 
    upArrowCount, 
    downArrowCount, 
    maxTrendValue 
  } = options;

  // Draw background
  const gradient = ctx.createRadialGradient(
    width / 2, height / 2, width * 0.05,
    width / 2, height / 2, width * 0.5
  );
  gradient.addColorStop(0, "#001f3f");
  gradient.addColorStop(1, "rgba(0, 0, 0, 1)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Calculate normalized trend values
  const normalizedUpTrend = trend > 0 ? Math.min(Math.abs(trend), maxTrendValue) / maxTrendValue : 0;
  const normalizedDownTrend = trend < 0 ? Math.min(Math.abs(trend), maxTrendValue) / maxTrendValue : 0;
  
  // Calculate spacing with increased padding
  const edgePadding = height * 0.08; // 8% padding at top and bottom edges
  const middleSectionHeight = height * 0.10; // 10% for middle value display
  
  // Calculate available height after padding
  const availableHeight = height - (edgePadding * 2);
  
  // Divide available space between up bars, middle section, and down bars
  const upBarsAreaHeight = (availableHeight - middleSectionHeight) * 0.5;
  const downBarsAreaHeight = (availableHeight - middleSectionHeight) * 0.5;
  
  // Add padding within bar areas
  const barAreaPadding = height * 0.01; // 1% padding within bar areas
  const usableUpBarArea = upBarsAreaHeight - (barAreaPadding * 2);
  const usableDownBarArea = downBarsAreaHeight - (barAreaPadding * 2);
  
  // Calculate spacing for bars within their usable areas
  const upBarSpacing = upArrowCount > 0 ? usableUpBarArea / upArrowCount : 0;
  const downBarSpacing = downArrowCount > 0 ? usableDownBarArea / downArrowCount : 0;
  
  // Middle Y position (center of canvas)
  const middleY = height / 2;
  
  // Calculate bar width and height
  const barWidth = width * 0.7; // 70% of width
  const barHeight = Math.min(upBarSpacing, downBarSpacing) * 0.65;
  
  // Calculate horizontal padding to center the bars
  const horizontalPadding = (width - barWidth) / 2;
  
  // Draw up bars
  for (let i = 0; i < upArrowCount; i++) {
    // Calculate position within up bars area (with padding)
    const position = i + 0.5; // Center in each slot (0.5, 1.5, 2.5...)
    const barY = edgePadding + barAreaPadding + (position * upBarSpacing) - barHeight / 2;
    
    // Calculate intensity based on trend direction and normalized value
    const upIntensity = trend > 0 
      ? Math.max(0, Math.min(1, normalizedUpTrend * (upArrowCount - i) / upArrowCount))
      : 0.05; // minimal intensity when trend <= 0
    
    // Draw up bar
    drawLEDBar(
      ctx, 
      horizontalPadding,
      barY, 
      barWidth,
      barHeight,
      upColor, 
      upIntensity,
      minGlowIntensity,
      maxGlowIntensity
    );
  }
  
  // Draw down bars
  for (let i = 0; i < downArrowCount; i++) {
    // Calculate position within down bars area (with padding)
    const position = i + 0.5; // Center in each slot (0.5, 1.5, 2.5...)
    const barY = height - edgePadding - barAreaPadding - (position * downBarSpacing) - barHeight / 2;
    
    // Calculate intensity based on trend direction and normalized value
    const downIntensity = trend < 0 
      ? Math.max(0, Math.min(1, normalizedDownTrend * (downArrowCount - i) / downArrowCount))
      : 0.05; // minimal intensity when trend >= 0
    
    // Draw down bar
    drawLEDBar(
      ctx, 
      horizontalPadding,
      barY, 
      barWidth,
      barHeight,
      downColor, 
      downIntensity,
      minGlowIntensity,
      maxGlowIntensity
    );
  }

  // Draw trend value in the middle section - show only the number, no description
  drawTrendValue(ctx, width, middleY, middleSectionHeight, trend, barHeight);
};

// Draw an LED-style bar
function drawLEDBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  intensity: number,
  minGlowIntensity: number,
  maxGlowIntensity: number
) {
  // Ensure intensity is within bounds
  intensity = Math.max(0, Math.min(1, intensity));
  
  // Skip drawing if intensity is too low
  if (intensity < 0.05) return;
  
  // Parse the input color to get RGB components
  let r = 0, g = 0, b = 0;
  if (color.startsWith('#')) {
    // Handle hex color
    const hex = color.slice(1);
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else if (color.startsWith('rgb')) {
    // Handle rgb/rgba color
    const matches = color.match(/\d+/g);
    if (matches && matches.length >= 3) {
      r = parseInt(matches[0]);
      g = parseInt(matches[1]);
      b = parseInt(matches[2]);
    }
  }
  
  // Create intensity-based colors
  const alpha = 0.15 + (intensity * 0.85); // Base alpha slightly higher
  const glowIntensity = minGlowIntensity + (intensity * (maxGlowIntensity - minGlowIntensity));
  
  // Save context state
  ctx.save();
  
  // Create a subtle gradient fill for 3D LED effect
  const ledGradient = ctx.createLinearGradient(
    x,
    y,
    x + width,
    y
  );
  ledGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 0.7})`);
  ledGradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha})`);
  ledGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${alpha * 0.7})`);
  
  // Create rounded rectangle for the bar
  const radius = height * 0.2; // Rounded corners
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  
  // Create glow effect
  ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${glowIntensity * 0.85})`;
  ctx.shadowBlur = height * 0.3 + (glowIntensity * height * 0.6);
  
  // Fill the bar with gradient
  ctx.fillStyle = ledGradient;
  ctx.fill();
  
  // Add a subtle LED outline/edge
  ctx.strokeStyle = `rgba(${r + 40}, ${g + 40}, ${b + 40}, ${intensity * 0.9})`;
  ctx.lineWidth = height * 0.04;
  ctx.stroke();
  
  ctx.restore();
}

// Simplified display with only the trend value, no description
function drawTrendValue(
  ctx: CanvasRenderingContext2D,
  width: number,
  centerY: number,
  sectionHeight: number,
  trend: number,
  barHeight: number // Pass barHeight for proportional text sizing
) {
  // Calculate responsive font size relative to bar height
  const valueFontSize = Math.min(barHeight * 2, sectionHeight * 0.8);
  
  // Format the trend value
  const formattedTrend = trend.toFixed(3);
  
  // Draw trend value with glow effect
  ctx.save();
  ctx.font = `bold ${valueFontSize}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  // Add subtle glow to the text
  ctx.shadowColor = "rgba(180, 220, 255, 0.6)";
  ctx.shadowBlur = valueFontSize * 0.15;
  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  
  // Draw trend value centered in the middle section
  ctx.fillText(`${formattedTrend}`, width / 2, centerY);
  ctx.restore();
}

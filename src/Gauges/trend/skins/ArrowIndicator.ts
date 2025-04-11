import { TrendGaugeOptions } from "../index.js";

export const ArrowIndicator = (
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
  
  // Calculate spacing with increased padding - add more edge padding
  const edgePadding = height * 0.08; // 8% padding at top and bottom edges
  const middleSectionHeight = height * 0.10; // 25% for middle value display
  
  // Calculate available height after padding
  const availableHeight = height - (edgePadding * 2);
  
  // Divide available space between up arrows, middle section, and down arrows
  const upArrowsAreaHeight = (availableHeight - middleSectionHeight) * 0.5;
  const downArrowsAreaHeight = (availableHeight - middleSectionHeight) * 0.5;
  
  // Add padding within arrow areas
  const arrowAreaPadding = height * 0.01; // 1% padding within arrow areas
  const usableUpArrowArea = upArrowsAreaHeight - (arrowAreaPadding * 2);
  const usableDownArrowArea = downArrowsAreaHeight - (arrowAreaPadding * 2);
  
  // Calculate spacing for arrows within their usable areas
  const upArrowSpacing = upArrowCount > 0 ? usableUpArrowArea / upArrowCount : 0;
  const downArrowSpacing = downArrowCount > 0 ? usableDownArrowArea / downArrowCount : 0;
  
  // Middle Y position (center of canvas)
  const middleY = height / 2;
  
  // Calculate arrow sizes based on available space (slightly smaller for better padding)
  const arrowSize = Math.min(
    Math.min(upArrowSpacing, downArrowSpacing) * 0.65, 
    width * 0.12
  );
  
  // Draw up arrows (always upArrowCount arrows pointing up)
  for (let i = 0; i < upArrowCount; i++) {
    // Calculate position within up arrows area (with padding)
    const position = i + 0.5; // Center in each slot (0.5, 1.5, 2.5...)
    const arrowY = edgePadding + arrowAreaPadding + (position * upArrowSpacing);
    
    // Calculate intensity based on trend direction and normalized value
    const upIntensity = trend > 0 
      ? Math.max(0, Math.min(1, normalizedUpTrend * (upArrowCount - i) / upArrowCount))
      : 0.05; // minimal intensity when trend <= 0
    
    // Draw only up arrow
    drawLEDArrow(
      ctx, 
      width / 2, 
      arrowY, 
      arrowSize, 
      true, // true means up direction
      upColor, 
      upIntensity,
      minGlowIntensity,
      maxGlowIntensity
    );
  }
  
  // Draw down arrows (always downArrowCount arrows pointing down)
  for (let i = 0; i < downArrowCount; i++) {
    // Calculate position within down arrows area (with padding)
    const position = i + 0.5; // Center in each slot (0.5, 1.5, 2.5...)
    const arrowY = height - edgePadding - arrowAreaPadding - (position * downArrowSpacing);
    
    // Calculate intensity based on trend direction and normalized value
    const downIntensity = trend < 0 
      ? Math.max(0, Math.min(1, normalizedDownTrend * (downArrowCount - i) / downArrowCount))
      : 0.05; // minimal intensity when trend >= 0
    
    // Draw only down arrow
    drawLEDArrow(
      ctx, 
      width / 2, 
      arrowY, 
      arrowSize, 
      false, // false means down direction
      downColor, 
      downIntensity,
      minGlowIntensity,
      maxGlowIntensity
    );
  }

  // Draw trend value in the middle section - show only the number, no description
  drawTrendValue(ctx, width, middleY, middleSectionHeight, trend, arrowSize);
};

// Draw an LED-style arrow (either up or down)
function drawLEDArrow(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  arrowSize: number,
  isUpDirection: boolean,
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
  
  // Define arrow shape
  ctx.beginPath();
  if (isUpDirection) {
    // Upward pointing part with slightly rounded corners for LED look
    ctx.moveTo(centerX, centerY - arrowSize * 0.55); // Tip slightly extended
    ctx.lineTo(centerX + arrowSize * 0.35, centerY + arrowSize * 0.05); // Right point
    ctx.quadraticCurveTo(centerX, centerY + arrowSize * 0.1, centerX - arrowSize * 0.35, centerY + arrowSize * 0.05); // Bottom curve
  } else {
    // Downward pointing part with slightly rounded corners for LED look
    ctx.moveTo(centerX, centerY + arrowSize * 0.55); // Tip slightly extended
    ctx.lineTo(centerX + arrowSize * 0.35, centerY - arrowSize * 0.05); // Right point
    ctx.quadraticCurveTo(centerX, centerY - arrowSize * 0.1, centerX - arrowSize * 0.35, centerY - arrowSize * 0.05); // Top curve
  }
  ctx.closePath();

  // Create a subtle gradient fill for 3D LED effect
  const ledGradient = ctx.createLinearGradient(
    centerX, 
    isUpDirection ? centerY - arrowSize * 0.5 : centerY + arrowSize * 0.5,
    centerX,
    isUpDirection ? centerY + arrowSize * 0.1 : centerY - arrowSize * 0.1
  );
  ledGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
  ledGradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${alpha * 0.9})`);
  ledGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${alpha * 0.7})`);
  
  // Create glow effect
  ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${glowIntensity * 0.85})`;
  ctx.shadowBlur = arrowSize * 0.3 + (glowIntensity * arrowSize * 0.6);
  
  // Fill the arrow with gradient
  ctx.fillStyle = ledGradient;
  ctx.fill();
  
  // Add a subtle LED outline/edge
  ctx.strokeStyle = `rgba(${r + 40}, ${g + 40}, ${b + 40}, ${intensity * 0.9})`;
  ctx.lineWidth = arrowSize * 0.04;
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
  arrowSize: number // Pass arrowSize for proportional text sizing
) {
  // Calculate responsive font size relative to arrow size
  const valueFontSize = Math.min(arrowSize * 1.6, sectionHeight * 0.7);
  
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

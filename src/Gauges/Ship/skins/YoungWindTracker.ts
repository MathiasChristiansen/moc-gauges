import { ShipGaugeOptions } from "../index.js";

export function YoungWindTracker(
  ctx: CanvasRenderingContext2D,
  options: Required<ShipGaugeOptions>,
  state: any,
  parentElement: HTMLElement
): void {
  const rect = parentElement.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  const { textColor, fontSize, windColor } = options;
  const { heading, sog, windDirection, windSpeed } = state;

  ctx.clearRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2 - 40;

  // Calculate Apparent Wind Speed for display
  const twa = (windDirection - heading) * (Math.PI / 180);
  const tws = windSpeed;
  const boatSpeed = sog;

  const tws_x = tws * Math.cos(twa);
  const tws_y = tws * Math.sin(twa);

  const aws_x = tws_x - boatSpeed;
  const aws_y = tws_y;

  const aws = Math.sqrt(aws_x * aws_x + aws_y * aws_y);
  
  // Use actual wind direction for LED display (not apparent wind)
  const displayWindDirection = windDirection;

  // Draw dark background
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);

  // Draw outer rectangular frame
  ctx.strokeStyle = "#333333";
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // Draw digital displays at top (like in the Biral image)
  const displayWidth = 70;
  const displayHeight = 35;
  const displayY = 20;

  // Left display (current wind speed)
  ctx.fillStyle = "#000000";
  ctx.fillRect(25, displayY, displayWidth, displayHeight);
  ctx.strokeStyle = "#666666";
  ctx.lineWidth = 1;
  ctx.strokeRect(25, displayY, displayWidth, displayHeight);

  // Right display (wind direction) 
  ctx.fillStyle = "#000000";
  ctx.fillRect(width - 95, displayY, displayWidth, displayHeight);
  ctx.strokeStyle = "#666666";
  ctx.lineWidth = 1;
  ctx.strokeRect(width - 95, displayY, displayWidth, displayHeight);

  // Display numbers in red LCD style (like the image)
  ctx.fillStyle = "#FF0000";
  ctx.font = `bold ${fontSize * 1.8}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(aws.toFixed(0), 60, displayY + displayHeight/2);
  ctx.fillText(displayWindDirection.toFixed(0), width - 60, displayY + displayHeight/2);

  // Draw labels below displays
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `${fontSize * 0.6}px Arial`;
  ctx.textAlign = "center";
  ctx.fillText("kt", 60, displayY + displayHeight + 10);
  ctx.fillText("°", width - 60, displayY + displayHeight + 10);

  // Draw main circular dial
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = "#333333";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw LED arc indicators around the perimeter
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  // Draw all LED positions first (off state)
  for (let i = 0; i < 360; i += 3) {
    const angle = (i - 90) * Math.PI / 180; // Start from top (North)
    const dotX = cx + radius * 0.9 * Math.cos(angle);
    const dotY = cy + radius * 0.9 * Math.sin(angle);
    
    ctx.beginPath();
    ctx.arc(dotX, dotY, 2, 0, 2 * Math.PI);
    ctx.fillStyle = "#222222"; // Dark off state
    ctx.fill();
  }
  
  // Light up LEDs based on apparent wind direction
  
  // Light up a range of LEDs around the wind direction
  const ledRange = 15; // Degrees of LEDs to light up
  
  for (let i = 0; i < 360; i += 3) {
    const angle = (i - 90) * Math.PI / 180;
    const dotX = cx + radius * 0.9 * Math.cos(angle);
    const dotY = cy + radius * 0.9 * Math.sin(angle);
    
    // Calculate if this LED should be lit
    // Find the shortest angular distance between LED position and wind direction
    let angleDiff = Math.abs(i - displayWindDirection);
    if (angleDiff > 180) angleDiff = 360 - angleDiff;
    
    if (angleDiff <= ledRange) {
      ctx.beginPath();
      ctx.arc(dotX, dotY, 3, 0, 2 * Math.PI);
      
      // Color based on intensity
      const intensity = Math.max(0.3, 1 - (angleDiff / ledRange));
      
      // Use consistent coloring based on position
      if (i >= 315 || i <= 45) {
        // Top section (around North) - bright yellow
        ctx.fillStyle = `rgba(255, 255, 100, ${intensity})`;
      } else if (i > 45 && i <= 135) {
        // Right section (around East) - green
        ctx.fillStyle = `rgba(100, 255, 100, ${intensity})`;
      } else if (i > 135 && i <= 225) {
        // Bottom section (around South) - orange
        ctx.fillStyle = `rgba(255, 150, 0, ${intensity})`;
      } else {
        // Left section (around West) - red
        ctx.fillStyle = `rgba(255, 100, 100, ${intensity})`;
      }
      
      ctx.fill();
      
      // Add glow effect for active LEDs
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 5;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
  
  // Draw degree labels at key positions
  const keyAngles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  ctx.fillStyle = "#ffffff";
  ctx.font = `${fontSize * 0.7}px Arial`;
  
  keyAngles.forEach(deg => {
    const angle = (deg - 90) * Math.PI / 180;
    const labelX = cx + radius * 0.75 * Math.cos(angle);
    const labelY = cy + radius * 0.75 * Math.sin(angle);
    ctx.fillText(deg.toString().padStart(2, '0'), labelX, labelY);
  });

  // Draw central digital display area (smaller)
  ctx.fillStyle = "#000000";
  ctx.fillRect(cx - 50, cy - 25, 100, 50);
  ctx.strokeStyle = "#333333";
  ctx.lineWidth = 2;
  ctx.strokeRect(cx - 50, cy - 25, 100, 50);
  
  // Display wind speed (large, prominent)
  ctx.fillStyle = "#00FF00";
  ctx.font = `bold ${fontSize * 1.5}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(aws.toFixed(0), cx, cy - 8);
  
  // Display wind direction (smaller, below speed)
  ctx.font = `${fontSize * 1.0}px monospace`;
  ctx.fillText(displayWindDirection.toFixed(0) + "°", cx, cy + 10);
  
  // Add units and labels
  ctx.fillStyle = "#ffffff";
  ctx.font = `${fontSize * 0.6}px Arial`;
  ctx.fillText("kt", cx + 25, cy - 8);
  ctx.fillText("DIR", cx + 25, cy + 10);

  // Draw device branding and labels (moved to bottom left to avoid covering main display)
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `${fontSize * 0.8}px Arial`;
  ctx.textAlign = "left";
  ctx.fillText("BIRAL", 20, height - 60);
  
  ctx.font = `${fontSize * 0.6}px Arial`;
  ctx.fillText("UTD350", 20, height - 45);
  ctx.fillText("WIND SPEED & DIRECTION", 20, height - 30);
  
  // Add status indicators (moved to bottom right corner)
  ctx.font = `${fontSize * 0.6}px Arial`;
  ctx.textAlign = "right";
  ctx.fillText("max", width - 30, height - 60);
  ctx.fillText("2 min", width - 30, height - 45);
  ctx.fillText("10 min", width - 30, height - 30);
  
  // Add small indicator LEDs (bottom right position)
  ctx.fillStyle = "#ff0000";
  ctx.beginPath();
  ctx.arc(width - 20, height - 63, 3, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.fillStyle = "#00ff00";
  ctx.beginPath();
  ctx.arc(width - 20, height - 48, 3, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(width - 20, height - 33, 3, 0, 2 * Math.PI);
  ctx.fill();
}

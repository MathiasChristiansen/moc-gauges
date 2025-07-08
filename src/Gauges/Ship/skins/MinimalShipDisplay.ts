import { ShipGaugeOptions } from "../index.js";

export const MinimalShipDisplay = (
  ctx: CanvasRenderingContext2D,
  options: Required<ShipGaugeOptions>,
  state: any,
  parentElement: HTMLElement
) => {
  const rect = parentElement.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  ctx.clearRect(0, 0, width, height);

  const { 
    textColor, 
    fontSize, 
    shipColor, 
    windColor, 
    cogColor,
    showCOG,
    unit
  } = options;
  
  const { heading, cog, sog, windDirection, windSpeed } = state;

  // Center of the display
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2 - 20;

  // Simple background
  ctx.fillStyle = "rgba(0, 20, 40, 0.1)";
  ctx.fillRect(0, 0, width, height);

  // Draw outer circle
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Draw cardinal directions
  const cardinalPoints = ["N", "E", "S", "W"];
  ctx.fillStyle = textColor;
  ctx.font = `${fontSize}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  cardinalPoints.forEach((point, index) => {
    const angle = (index * Math.PI) / 2 - Math.PI / 2; // Start from North
    const textX = cx + radius * 0.85 * Math.cos(angle);
    const textY = cy + radius * 0.85 * Math.sin(angle);
    ctx.fillText(point, textX, textY);
  });

  // Draw COG line if enabled and different from heading
  if (showCOG && Math.abs(cog - heading) > 2) {
    const cogAngle = (cog - 90) * Math.PI / 180;
    const cogLength = radius * 0.5;
    
    ctx.strokeStyle = cogColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + cogLength * Math.cos(cogAngle), cy + cogLength * Math.sin(cogAngle));
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Draw simple wind arrow
  if (windSpeed > 0.5) {
    const windAngle = (windDirection - 90) * Math.PI / 180;
    const windLength = radius * 0.25;
    
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(windAngle);
    
    ctx.strokeStyle = windColor;
    ctx.lineWidth = 2;
    
    // Wind arrow shaft
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -windLength);
    ctx.stroke();
    
    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(0, -windLength);
    ctx.lineTo(-5, -windLength + 10);
    ctx.moveTo(0, -windLength);
    ctx.lineTo(5, -windLength + 10);
    ctx.stroke();
    
    ctx.restore();
  }

  // Draw simple ship (triangle)
  const shipSize = radius * 0.08;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((heading - 90) * Math.PI / 180);
  
  ctx.beginPath();
  ctx.moveTo(0, -shipSize);                    // Bow
  ctx.lineTo(-shipSize * 0.6, shipSize);       // Port stern
  ctx.lineTo(shipSize * 0.6, shipSize);        // Starboard stern
  ctx.closePath();
  
  ctx.fillStyle = shipColor;
  ctx.fill();
  ctx.strokeStyle = textColor;
  ctx.lineWidth = 1;
  ctx.stroke();
  
  ctx.restore();

  // Draw minimal info display
  ctx.fillStyle = textColor;
  ctx.font = `${fontSize * 0.8}px Arial`;
  ctx.textAlign = "right";
  ctx.textBaseline = "top";
  
  const infoX = width - 10;
  let infoY = 10;
  const lineHeight = fontSize + 2;
  
  ctx.fillText(`${heading.toFixed(0)}°`, infoX, infoY);
  infoY += lineHeight;
  
  if (showCOG) {
    ctx.fillText(`COG ${cog.toFixed(0)}°`, infoX, infoY);
    infoY += lineHeight;
  }
  
  ctx.fillText(`${sog.toFixed(1)} ${unit}`, infoX, infoY);
  infoY += lineHeight;
  
  ctx.fillText(`W: ${windSpeed.toFixed(0)}${unit}`, infoX, infoY);
};

import { ShipGaugeOptions } from "../index.js";

export const MarineDisplay = (
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
    wakeColor,
    showCOG,
    showSOG,
    showWindCone,
    showWake,
    unit
  } = options;
  
  const { heading, cog, sog, windDirection, windSpeed } = state;

  // Center of the display
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2 - 30;

  // Draw dark marine background with radar-style grid
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  gradient.addColorStop(0, "#001122");
  gradient.addColorStop(1, "#000608");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Draw range rings
  ctx.strokeStyle = "rgba(0, 255, 255, 0.2)";
  ctx.lineWidth = 1;
  for (let r = radius * 0.2; r <= radius; r += radius * 0.2) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.stroke();
  }

  // Draw compass rose with degrees
  ctx.strokeStyle = "rgba(0, 255, 255, 0.4)";
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.font = `${fontSize * 0.7}px 'Courier New', monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Draw degree markings every 30 degrees
  for (let degree = 0; degree < 360; degree += 30) {
    const angle = (degree - 90) * Math.PI / 180; // -90 to start from top
    const innerRadius = radius * 0.85;
    const outerRadius = radius * 0.95;
    
    const x1 = cx + innerRadius * Math.cos(angle);
    const y1 = cy + innerRadius * Math.sin(angle);
    const x2 = cx + outerRadius * Math.cos(angle);
    const y2 = cy + outerRadius * Math.sin(angle);
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    // Label major compass points
    const labelRadius = radius * 0.75;
    const labelX = cx + labelRadius * Math.cos(angle);
    const labelY = cy + labelRadius * Math.sin(angle);
    
    if (degree === 0) ctx.fillText("N", labelX, labelY);
    else if (degree === 90) ctx.fillText("E", labelX, labelY);
    else if (degree === 180) ctx.fillText("S", labelX, labelY);
    else if (degree === 270) ctx.fillText("W", labelX, labelY);
    else ctx.fillText(degree.toString(), labelX, labelY);
  }

  // Draw wake trail if enabled
  if (showWake && sog > 0.5) {
    const wakeLength = Math.min(sog * 5, radius * 0.4);
    const wakeAngle = (heading + 180) * Math.PI / 180; // Opposite direction
    
    ctx.strokeStyle = wakeColor;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.6;
    
    for (let i = 0; i < 3; i++) {
      const offset = (i - 1) * 8; // Side offset for wake lines
      const startX = cx + offset * Math.cos(wakeAngle + Math.PI/2);
      const startY = cy + offset * Math.sin(wakeAngle + Math.PI/2);
      const endX = startX + wakeLength * Math.cos(wakeAngle);
      const endY = startY + wakeLength * Math.sin(wakeAngle);
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;
  }

  // Draw COG (Course Over Ground) line if enabled
  if (showCOG && Math.abs(cog - heading) > 1) {
    const cogAngle = (cog - 90) * Math.PI / 180;
    const cogLength = radius * 0.6;
    
    ctx.strokeStyle = cogColor;
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + cogLength * Math.cos(cogAngle), cy + cogLength * Math.sin(cogAngle));
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Draw ship outline (more detailed)
  const shipLength = radius * 0.12;
  const shipWidth = shipLength * 0.4;
  
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((heading - 90) * Math.PI / 180); // -90 to point up initially
  
  // Ship hull
  ctx.beginPath();
  ctx.moveTo(0, -shipLength/2);                    // Bow
  ctx.lineTo(-shipWidth/3, -shipLength/4);         // Port bow
  ctx.lineTo(-shipWidth/2, shipLength/4);          // Port stern
  ctx.lineTo(-shipWidth/4, shipLength/2);          // Port transom
  ctx.lineTo(shipWidth/4, shipLength/2);           // Starboard transom
  ctx.lineTo(shipWidth/2, shipLength/4);           // Starboard stern
  ctx.lineTo(shipWidth/3, -shipLength/4);          // Starboard bow
  ctx.closePath();
  
  ctx.fillStyle = shipColor;
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Ship centerline
  ctx.beginPath();
  ctx.moveTo(0, -shipLength/2);
  ctx.lineTo(0, shipLength/2);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  ctx.lineWidth = 1;
  ctx.stroke();
  
  ctx.restore();

  // Draw wind cone if enabled
  if (showWindCone && windSpeed > 0.5) {
    const windAngle = (windDirection - 90) * Math.PI / 180;
    const windLength = Math.min(windSpeed * 3, radius * 0.4);
    const coneWidth = windLength * 0.3;
    
    ctx.fillStyle = windColor;
    ctx.globalAlpha = 0.7;
    
    // Wind direction arrow/cone
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(windAngle);
    
    ctx.beginPath();
    ctx.moveTo(0, -windLength);           // Tip
    ctx.lineTo(-coneWidth/2, 0);          // Left base
    ctx.lineTo(coneWidth/2, 0);           // Right base
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
    ctx.globalAlpha = 1.0;
  }

  // Draw information panel
  const panelX = 10;
  const panelY = 10;
  const lineHeight = fontSize + 4;
  
  // Semi-transparent background for text
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(panelX - 5, panelY - 5, 150, lineHeight * 6 + 10);
  
  ctx.fillStyle = textColor;
  ctx.font = `${fontSize}px 'Courier New', monospace`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  
  let line = 0;
  ctx.fillText(`HDG: ${heading.toFixed(1)}°`, panelX, panelY + line++ * lineHeight);
  
  if (showCOG) {
    ctx.fillText(`COG: ${cog.toFixed(1)}°`, panelX, panelY + line++ * lineHeight);
  }
  
  if (showSOG) {
    ctx.fillText(`SOG: ${sog.toFixed(1)} ${unit}`, panelX, panelY + line++ * lineHeight);
  }
  
  ctx.fillText(`Wind: ${windDirection.toFixed(0)}°`, panelX, panelY + line++ * lineHeight);
  ctx.fillText(`Speed: ${windSpeed.toFixed(1)} ${unit}`, panelX, panelY + line++ * lineHeight);
  
  // Relative wind bearing
  const relativeWind = ((windDirection - heading + 360) % 360);
  ctx.fillText(`Rel: ${relativeWind.toFixed(0)}°`, panelX, panelY + line * lineHeight);
};

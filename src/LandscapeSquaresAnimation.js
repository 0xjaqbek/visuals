import React, { useEffect, useRef } from 'react';

const UnlimitedLotusGrid = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions to window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Animation timing
    let time = 0;
    let lastTimestamp = 0;
    
    // Perspective grid parameters
    const gridRows = 20;        // Number of horizontal lines
    const gridColumns = 30;     // Increased for wider coverage
    
    // Horizon position
    const horizonY = canvas.height * 0.5;
    const horizonX = canvas.width * 0.5; // Center point
    
    // Colors
    const skyColor = '#6aa2ef';
    const groundColor = '#4aaf4a';
    const gridColor = '#ffffff';
    const lineWidth = 2;
    
    // Draw the scene
    const draw = (timestamp) => {
      // Calculate delta time for smooth animations
      const deltaTime = lastTimestamp ? (timestamp - lastTimestamp) / 1000 : 0;
      lastTimestamp = timestamp;
      
      // Update time for animation
      time += deltaTime * 200; // Faster animation
      
      // Clear canvas
      ctx.fillStyle = skyColor;
      ctx.fillRect(0, 0, canvas.width, horizonY);
      
      ctx.fillStyle = groundColor;
      ctx.fillRect(0, horizonY, canvas.width, canvas.height - horizonY);
      
      // Draw perspective grid
      drawPerspectiveGrid(time);
      
      // Continue animation
      requestAnimationFrame(draw);
    };
    
    // Draw unlimited perspective grid that extends beyond screen edges
    const drawPerspectiveGrid = (time) => {
      // Set line style
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = gridColor;
      
      // Calculate the movement offset (0 to 1)
      const movementOffset = (time % 100) / 100;
      
      // --- DRAW GROUND GRID ---
      
      // Draw horizontal ground lines
      for (let i = 0; i <= gridRows; i++) {
        // Calculate the row position with movement
        const rowPosition = (i + movementOffset) / gridRows;
        
        // Skip if beyond visible area
        if (rowPosition > 1) continue;
        
        // Apply perspective transformation
        // This creates lines that are closer together near the horizon
        const perspectiveY = horizonY + (canvas.height - horizonY) * Math.pow(rowPosition, 2);
        
        // Draw the horizontal line (straight across)
        ctx.beginPath();
        ctx.moveTo(0, perspectiveY);
        ctx.lineTo(canvas.width, perspectiveY);
        ctx.stroke();
      }
      
      // Draw vertical ground lines that create the curved grid
      // These will extend beyond screen edges
      const extendedColumns = gridColumns * 2; // More columns for wider coverage
      const columnWidth = canvas.width / (gridColumns / 2); // Width of each column
      
      // Calculate the starting point (to left of screen)
      const startOffset = -columnWidth * (extendedColumns / 2 - gridColumns / 4);
      
      for (let j = 0; j <= extendedColumns; j++) {
        // Calculate base X position (before perspective)
        const baseX = startOffset + j * columnWidth;
        
        // Skip if completely off screen
        if (baseX < -columnWidth * 2 || baseX > canvas.width + columnWidth * 2) continue;
        
        ctx.beginPath();
        
        // Calculate how far this line is from the center (0 = center, 1 = far edge)
        const distanceFromCenter = Math.abs((baseX - horizonX) / horizonX);
        
        // Start higher on horizon for lines further from center
        const horizonOffset = distanceFromCenter * 20;
        const startY = horizonY - horizonOffset;
        
        // Project the vanishing point depending on position (creates curved effect)
        const vanishingX = horizonX + (baseX - horizonX) * 0.1;
        
        // Start point (at adjusted horizon)
        ctx.moveTo(vanishingX, startY);
        
        // Draw the path from horizon to bottom of screen
        const steps = 20;
        for (let step = 1; step <= steps; step++) {
          const t = step / steps; // 0 to 1
          
          // Calculate Y position with perspective
          const y = horizonY + (canvas.height - horizonY) * Math.pow(t, 1.5);
          
          // Calculate X position with outward curve
          // Lines stay straighter near the center, curve more at edges
          const curveFactor = 0.8 + distanceFromCenter * 0.4; // Stronger curve for edge lines
          const x = vanishingX + (baseX - vanishingX) * Math.pow(t, curveFactor);
          
          ctx.lineTo(x, y);
        }
        
        ctx.stroke();
      }
      
      // --- DRAW SKY GRID ---
      
      // Draw horizontal sky lines
      for (let i = 0; i <= gridRows; i++) {
        // Calculate the row position with movement
        const rowPosition = (i + movementOffset) / gridRows;
        
        // Skip if beyond visible area
        if (rowPosition > 1) continue;
        
        // Apply perspective transformation (mirrored from ground)
        const perspectiveY = horizonY - horizonY * Math.pow(rowPosition, 2);
        
        // Draw the horizontal line (straight across)
        ctx.beginPath();
        ctx.moveTo(0, perspectiveY);
        ctx.lineTo(canvas.width, perspectiveY);
        ctx.stroke();
      }
      
      // Draw vertical sky lines (mirror of ground lines)
      for (let j = 0; j <= extendedColumns; j++) {
        // Calculate base X position (before perspective)
        const baseX = startOffset + j * columnWidth;
        
        // Skip if completely off screen
        if (baseX < -columnWidth * 2 || baseX > canvas.width + columnWidth * 2) continue;
        
        ctx.beginPath();
        
        // Calculate how far this line is from the center (0 = center, 1 = far edge)
        const distanceFromCenter = Math.abs((baseX - horizonX) / horizonX);
        
        // Start lower on horizon for lines further from center
        const horizonOffset = distanceFromCenter * 20;
        const startY = horizonY + horizonOffset;
        
        // Project the vanishing point depending on position (creates curved effect)
        const vanishingX = horizonX + (baseX - horizonX) * 0.1;
        
        // Start point (at adjusted horizon)
        ctx.moveTo(vanishingX, startY);
        
        // Draw the path from horizon to top of screen
        const steps = 20;
        for (let step = 1; step <= steps; step++) {
          const t = step / steps; // 0 to 1
          
          // Calculate Y position with perspective (mirrored from ground)
          const y = horizonY - horizonY * Math.pow(t, 1.5);
          
          // Calculate X position with outward curve
          // Lines stay straighter near the center, curve more at edges
          const curveFactor = 0.8 + distanceFromCenter * 0.4; // Stronger curve for edge lines
          const x = vanishingX + (baseX - vanishingX) * Math.pow(t, curveFactor);
          
          ctx.lineTo(x, y);
        }
        
        ctx.stroke();
      }
    };
    
    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Update horizon position
      const horizonY = canvas.height * 0.5;
      const horizonX = canvas.width * 0.5;
    };
    
    window.addEventListener('resize', handleResize);
    
    // Start animation
    requestAnimationFrame(draw);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <div className="w-full h-screen overflow-hidden">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
      />
    </div>
  );
};

export default UnlimitedLotusGrid;
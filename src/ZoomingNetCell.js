import React, { useEffect, useRef } from 'react';

const ZoomingNetCell = ({ onEscape }) => {
    const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // CRT effect overlay canvas
    const overlayCanvas = document.createElement('canvas');
    const overlayCtx = overlayCanvas.getContext('2d');
    
    // Set canvas dimensions to window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    overlayCanvas.width = window.innerWidth;
    overlayCanvas.height = window.innerHeight;
    
    const baseZoomSpeed = 0.003; // Slower initial speed
    const maxZoomSpeed = 0.01; // Maximum zoom speed (current value)
    let currentZoomSpeed = baseZoomSpeed;
    
    let time = 0;
    let zoomProgress = 0; // Track progress through zoom cycle
    let isRestarting = false; // Flag to track if we're in restart mode
    let transitionProgress = 0; // Track transition progress
    let lastTimestamp = 0; // For timing the transition
    
    // Create CRT screen overlay effects
    const createCRTOverlay = () => {
      // Clear the overlay
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      
      // Create scanlines - MUCH more visible now
      overlayCtx.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Significantly increased opacity
      for (let y = 0; y < overlayCanvas.height; y += 3) { // Increased spacing
        overlayCtx.fillRect(0, y, overlayCanvas.width, 1.5); // Thicker scanlines
      }
      
      // Add RGB pixel structure (phosphor dots effect) - GREATLY ENHANCED
      const pixelSize = 3; // Even larger phosphor dots
      for (let y = 0; y < overlayCanvas.height; y += 3 * pixelSize) {
        for (let x = 0; x < overlayCanvas.width; x += 3 * pixelSize) {
          // Much more visible RGB subpixel pattern with higher opacity
          overlayCtx.fillStyle = 'rgba(255, 30, 30, 0.3)'; // Increased red phosphor opacity
          overlayCtx.fillRect(x, y, pixelSize, pixelSize);
          
          overlayCtx.fillStyle = 'rgba(30, 255, 30, 0.3)'; // Increased green phosphor opacity
          overlayCtx.fillRect(x + pixelSize, y, pixelSize, pixelSize);
          
          overlayCtx.fillStyle = 'rgba(30, 30, 255, 0.3)'; // Increased blue phosphor opacity
          overlayCtx.fillRect(x + 2 * pixelSize, y, pixelSize, pixelSize);
        }
      }
      
      // Add a second row of phosphors with offset for authentic CRT pattern
      for (let y = 0; y < overlayCanvas.height; y += 3 * pixelSize) {
        for (let x = 0; x < overlayCanvas.width; x += 3 * pixelSize) {
          // Offset second row by half a pixel
          const offsetY = y + 1.5 * pixelSize;
          if (offsetY < overlayCanvas.height) {
            overlayCtx.fillStyle = 'rgba(255, 30, 30, 0.3)';
            overlayCtx.fillRect(x + 1.5 * pixelSize, offsetY, pixelSize, pixelSize);
            
            overlayCtx.fillStyle = 'rgba(30, 255, 30, 0.3)';
            overlayCtx.fillRect(x + 2.5 * pixelSize, offsetY, pixelSize, pixelSize);
            
            overlayCtx.fillStyle = 'rgba(30, 30, 255, 0.3)';
            overlayCtx.fillRect(x, offsetY, pixelSize, pixelSize);
          }
        }
      }
      
      // Add vignette effect (darker corners) - MUCH more pronounced
      const gradient = overlayCtx.createRadialGradient(
        overlayCanvas.width / 2, overlayCanvas.height / 2, 0,
        overlayCanvas.width / 2, overlayCanvas.height / 2, overlayCanvas.width / 2.2
      );
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(0.4, 'rgba(0, 0, 0, 0.2)');
      gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.4)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
      
      overlayCtx.fillStyle = gradient;
      overlayCtx.fillRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      
      // Add much more pronounced screen curvature effect
      overlayCtx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      overlayCtx.lineWidth = 10;
      overlayCtx.beginPath();
      
      // Top edge curve - more pronounced
      overlayCtx.moveTo(0, 15);
      overlayCtx.quadraticCurveTo(overlayCanvas.width / 2, -30, overlayCanvas.width, 15);
      
      // Bottom edge curve - more pronounced
      overlayCtx.moveTo(0, overlayCanvas.height - 15);
      overlayCtx.quadraticCurveTo(overlayCanvas.width / 2, overlayCanvas.height + 30, overlayCanvas.width, overlayCanvas.height - 15);
      
      // Left edge curve - more pronounced
      overlayCtx.moveTo(15, 0);
      overlayCtx.quadraticCurveTo(-30, overlayCanvas.height / 2, 15, overlayCanvas.height);
      
      // Right edge curve - more pronounced
      overlayCtx.moveTo(overlayCanvas.width - 15, 0);
      overlayCtx.quadraticCurveTo(overlayCanvas.width + 30, overlayCanvas.height / 2, overlayCanvas.width - 15, overlayCanvas.height);
      
      overlayCtx.stroke();
      
      // Add visible screen border
      overlayCtx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
      overlayCtx.lineWidth = 15;
      overlayCtx.strokeRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    };
    
    // Apply CRT effects to the main canvas
    const applyCRTEffects = (timestamp) => {
      // More frequent random flicker effect
      if (Math.random() > 0.92) { // Increased frequency
        const flickerOpacity = Math.random() * 0.08; // More intense flicker
        ctx.fillStyle = `rgba(255, 255, 255, ${flickerOpacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      // Occasional vertical sync issues (horizontal shifts)
      if (Math.random() > 0.97) {
        const shiftAmount = Math.floor(Math.random() * 8) - 4;
        const y = Math.random() * canvas.height;
        const height = 5 + Math.random() * 20;
        
        const imageData = ctx.getImageData(0, y, canvas.width, height);
        ctx.clearRect(0, y, canvas.width, height);
        ctx.putImageData(imageData, shiftAmount, y);
      }
      
      // Random horizontal noise lines (more frequent)
      if (Math.random() > 0.95) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'; // More visible
        const lineHeight = 1 + Math.random() * 4;
        const y = Math.random() * canvas.height;
        ctx.fillRect(0, y, canvas.width, lineHeight);
      }
      
      // Apply more visible color bleeding on the edges of bright areas
      if (Math.random() > 0.97) {
        const bleedType = Math.floor(Math.random() * 3);
        if (bleedType === 0) {
          // Red color bleeding
          ctx.fillStyle = 'rgba(255, 50, 50, 0.06)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (bleedType === 1) {
          // Green color bleeding
          ctx.fillStyle = 'rgba(50, 255, 50, 0.06)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
          // Blue color bleeding
          ctx.fillStyle = 'rgba(50, 50, 255, 0.06)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
      
      // Add chromatic aberration effect at the edges
      if (Math.random() > 0.96) {
        try {
          // Grab screen content
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Shift red and blue channels slightly
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d');
          tempCanvas.width = canvas.width;
          tempCanvas.height = canvas.height;
          
          // Red channel shift
          tempCtx.fillStyle = 'rgba(255, 0, 0, 0.1)';
          tempCtx.fillRect(0, 0, canvas.width, canvas.height);
          tempCtx.globalCompositeOperation = 'destination-in';
          tempCtx.drawImage(canvas, 0, 0);
          tempCtx.globalCompositeOperation = 'source-over';
          
          // Apply red channel with offset
          ctx.globalAlpha = 0.1;
          ctx.drawImage(tempCanvas, -1, 0);
          
          // Blue channel shift
          tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
          tempCtx.fillStyle = 'rgba(0, 0, 255, 0.1)';
          tempCtx.fillRect(0, 0, canvas.width, canvas.height);
          tempCtx.globalCompositeOperation = 'destination-in';
          tempCtx.drawImage(canvas, 0, 0);
          tempCtx.globalCompositeOperation = 'source-over';
          
          // Apply blue channel with offset
          ctx.drawImage(tempCanvas, 1, 0);
          ctx.globalAlpha = 1.0;
        } catch (e) {
          // Skip effect if there's an issue (e.g., security restrictions)
        }
      }
      
      // Apply the overlay
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(overlayCanvas, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      
      // Add subtle screen glare (fixed position)
      const glareGradient = ctx.createRadialGradient(
        canvas.width * 0.75, canvas.height * 0.2, 0,
        canvas.width * 0.75, canvas.height * 0.2, canvas.width * 0.3
      );
      glareGradient.addColorStop(0, 'rgba(255, 255, 255, 0.06)');
      glareGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.03)');
      glareGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = glareGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    
    const draw = (timestamp) => {
      // Calculate delta time for smooth animations
      const deltaTime = lastTimestamp ? (timestamp - lastTimestamp) / 1000 : 0;
      lastTimestamp = timestamp;
      
      // Clear canvas with each frame
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Handle transition and restart with smoother static transitions
      if (isRestarting) {
        // Clear to black first
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Advance transition progress more slowly for better effect
        transitionProgress += deltaTime * 0.6; // Slower transition (1.66 seconds)
        
        // Updated transition phases:
        // Phase 1: Fade in static (0-35%)
        // Phase 2: Hold static and start bringing in background gray (35-65%)
        // Phase 3: Fade out static while background solidifies (65-90%)
        // Phase 4: Brief white flash (90-100%)
        
        let staticIntensity = 0;
        let grayLevel = 0;
        
        if (transitionProgress < 0.35) {
          // Phase 1: Smooth fade in of static
          // Use a sinusoidal ease-in curve for natural appearance
          staticIntensity = Math.sin((transitionProgress / 0.35) * (Math.PI / 2)) * 0.9;
        } 
        else if (transitionProgress < 0.65) {
          // Phase 2: Full static, start bringing in gray
          staticIntensity = 0.9;
          // Ease in the gray background
          const normalizedGrayProgress = (transitionProgress - 0.35) / 0.3;
          grayLevel = normalizedGrayProgress * 20; // Max 20 during this phase
        }
        else if (transitionProgress < 0.9) {
          // Phase 3: Fade out static as gray increases
          const normalizedProgress = (transitionProgress - 0.65) / 0.25;
          // Sinusoidal ease-out for static
          staticIntensity = 0.9 * Math.cos(normalizedProgress * (Math.PI / 2));
          // Increase gray more rapidly in this phase
          grayLevel = 20 + normalizedProgress * 40; // 20 to 60
        }
        else {
          // Phase 4: White flash at the end
          const normalizedProgress = (transitionProgress - 0.9) / 0.1;
          // Rapidly transition from gray to white
          grayLevel = 60 + normalizedProgress * 195; // 60 to 255 (full white)
          staticIntensity = 0; // No static during white flash
        }
        
        // Draw background color (if in phase 2-4)
        if (transitionProgress >= 0.35) {
          ctx.fillStyle = `rgb(${grayLevel}, ${grayLevel}, ${grayLevel})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        // Draw static with calculated intensity (only if there's static to draw)
        if (staticIntensity > 0) {
          drawTVStatic(staticIntensity);
        }
        
        // When transition is complete, restart
        if (transitionProgress >= 1.0) {
          console.log("Transition complete, restarting animation");
          time = 0;
          zoomProgress = 0;
          currentZoomSpeed = baseZoomSpeed;
          isRestarting = false;
          transitionProgress = 0;
        }
        
        // Apply CRT effects during transition (except during white flash)
        if (transitionProgress < 0.9) {
          applyCRTEffects(timestamp);
        }
        
        requestAnimationFrame(draw);
        return;
      }
      
      // Gradually increase zoom speed as we progress
      zoomProgress = (time % 4) / 4; // Progress through current cycle (0 to 1)
      
      // Calculate current zoom speed (slow at start, faster as we progress)
      currentZoomSpeed = baseZoomSpeed + (maxZoomSpeed - baseZoomSpeed) * zoomProgress;
      
      // Increment time with variable speed
      time += currentZoomSpeed;
      
      // Create a continuous zoom effect with a much larger range
      const zoomFactor = Math.pow(2, (time % 4) * 4);
      
      // Calculate cell size to determine when to reset
      const baseSize = Math.min(canvas.width, canvas.height) * 0.001;
      const cellSize = baseSize * zoomFactor * 4;
      
      // Reset when cells become so large that no lines are visible on screen
      if (cellSize > Math.max(canvas.width, canvas.height) * 10 && !isRestarting) {
        console.log("Starting transition...");
        // Set the restarting flag
        isRestarting = true;
        transitionProgress = 0;
      }
      
      // Pass the current zoom factor to draw the grid
      drawGrid(zoomFactor);
      
      // Apply CRT effects at the end of drawing
      applyCRTEffects(timestamp);
      
      // Animate with timestamp
      requestAnimationFrame(draw);
    };
    
    // Function to draw TV static/snow with smaller pixels
    const drawTVStatic = (intensity) => {
      if (intensity <= 0) return; // Skip drawing if intensity is 0
      
      // Smaller static pixels for finer texture
      const pixelSize = 1; // Reduced from 3 to 1 for much finer grain
      // Increase pixel count to compensate for smaller size (maintain coverage)
      const pixels = Math.floor((canvas.width * canvas.height) / (pixelSize * pixelSize) * 0.6 * intensity); 
      
      // Set composite operation for more visible static
      ctx.globalCompositeOperation = 'screen';
      
      // Add static background noise first - intensity affects opacity
      ctx.fillStyle = `rgba(40, 40, 40, ${intensity * 0.3})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw many fine static particles
      for (let i = 0; i < pixels; i++) {
        const x = Math.floor(Math.random() * canvas.width);
        const y = Math.floor(Math.random() * canvas.height);
        
        // Random brightness with intensity control
        const brightness = Math.floor(100 + Math.random() * 155 * Math.min(1, intensity * 1.2));
        
        // Add subtle color variation to some static pixels
        const r = brightness;
        const g = Math.random() > 0.3 ? brightness : brightness * 0.7;
        const b = Math.random() > 0.3 ? brightness : brightness * 0.7;
        
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x, y, pixelSize, pixelSize);
      }
      
      // Add finer horizontal scan lines to the static
      for (let y = 0; y < canvas.height; y += 3) { // Closer lines
        if (Math.random() > (1 - intensity * 0.2)) {
          const lineOpacity = Math.random() * 0.25 * intensity;
          ctx.fillStyle = `rgba(255, 255, 255, ${lineOpacity})`;
          ctx.fillRect(0, y, canvas.width, 1);
        }
      }
      
      // Add a few larger "glitches" in the static - scale count with intensity
      const glitchCount = Math.floor(12 * intensity);
      for (let i = 0; i < glitchCount; i++) {
        if (Math.random() > 0.7) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          // Reduce width of glitches to better match finer grain
          const width = Math.random() * 30 + 5;
          const height = Math.random() * 3 + 1; // Thinner glitch lines
          
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5 * intensity})`;
          ctx.fillRect(x, y, width, height);
        }
      }
      
      // Reset composite operation
      ctx.globalCompositeOperation = 'source-over';
      
      // Add vertical hold issue simulation - probability scales with intensity
      if (Math.random() > (1 - intensity * 0.1)) {
        const scrollAmount = Math.floor(Math.random() * 15 * intensity) - 7 * intensity;
        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.putImageData(imageData, 0, scrollAmount);
        } catch (e) {
          // Skip if there's an issue
        }
      }
    };
    
    const drawGrid = (zoomFactor) => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Base size of a grid cell - starting with extremely tiny cells
      const baseSize = Math.min(canvas.width, canvas.height) * 0.001;
      
      // Calculate the current grid size based on zoom - allow for much larger expansion
      const gridSize = baseSize * zoomFactor * 4;
      
      // Calculate initial grid position to center the grid
      let startX = centerX - gridSize / 2;
      let startY = centerY - gridSize / 2;
      
      // Adjust position to create continuous zoom effect
      // This moves the grid lines as we zoom to maintain the illusion
      // of zooming into a single cell
      const cellSize = gridSize;
      const offsetX = startX % cellSize;
      const offsetY = startY % cellSize;
      
      // Line thickness varies slightly with zoom
      const lineWidth = Math.max(1, Math.min(3, 2 * (1 - (zoomFactor - 1))));
      
      // Draw the grid with white CRT glow - enhanced glow
      ctx.lineWidth = lineWidth;
      ctx.shadowBlur = 5; // Increased glow
      ctx.shadowColor = 'rgba(255, 255, 255, 0.7)'; // Brighter glow
      
      // Draw vertical lines
      for (let x = offsetX; x <= canvas.width; x += cellSize) {
        const opacity = getLineOpacity(x, centerX, cellSize);
        
        // All lines are pure white, only opacity varies
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      // Draw horizontal lines
      for (let y = offsetY; y <= canvas.height; y += cellSize) {
        const opacity = getLineOpacity(y, centerY, cellSize);
        
        // All lines are pure white, only opacity varies
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      // Reset shadow for other rendering
      ctx.shadowBlur = 0;
    };
    
    // Calculate opacity based on distance from center
    const getLineOpacity = (position, center, cellSize) => {
      // Lines closer to center are more visible
      const distance = Math.abs(position - center);
      return Math.max(0.2, 1 - (distance / (cellSize * 3)));
    };
    
    // Create initial CRT overlay
    createCRTOverlay();
    
    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      overlayCanvas.width = window.innerWidth;
      overlayCanvas.height = window.innerHeight;
      
      // Recreate CRT overlay effects after resize
      createCRTOverlay();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Start animation with timestamp
    requestAnimationFrame(draw);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="w-full h-screen bg-black overflow-hidden">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
      />
    </div>
  );
};

export default ZoomingNetCell;
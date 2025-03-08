import React, { useEffect, useRef } from 'react';

const TunnelCRT = () => {
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
    const maxZoomSpeed = 0.01; // Maximum zoom speed
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
      // Always apply a subtle global color fringing
      ctx.globalCompositeOperation = 'lighten';
      ctx.fillStyle = 'rgba(100, 0, 0, 0.03)';
      ctx.fillRect(2, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0, 0, 100, 0.03)';
      ctx.fillRect(-2, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
      
      // More frequent and more intense random flicker effect
      if (Math.random() > 0.85) { // Significantly increased frequency
        const flickerOpacity = Math.random() * 0.15; // More intense flicker
        ctx.fillStyle = `rgba(255, 255, 255, ${flickerOpacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      // ENHANCED: Much more frequent horizontal shifts (horizontal distortion)
      if (Math.random() > 0.8) { // Greatly increased frequency (from 0.92)
        const shiftAmount = Math.floor(Math.random() * 25) - 12; // More pronounced shift (from 15)
        const y = Math.random() * canvas.height;
        const height = 5 + Math.random() * 40; // Taller affected area (from 30)
        
        try {
          const imageData = ctx.getImageData(0, y, canvas.width, height);
          ctx.clearRect(0, y, canvas.width, height);
          ctx.putImageData(imageData, shiftAmount, y);
        } catch (e) {
          // Skip if there's an issue
        }
      }
      
      // UPDATED: Vertical shifts (vertical distortion) with matching parameters
      if (Math.random() > 0.8) { // Same frequency as horizontal (from 0.85)
        const shiftAmount = Math.floor(Math.random() * 25) - 12; // Same range as horizontal (from 20)
        const x = Math.random() * canvas.width;
        const width = 5 + Math.random() * 40; // Same range as horizontal height
        
        try {
          // Get a vertical strip of the screen
          const imageData = ctx.getImageData(x, 0, width, canvas.height);
          ctx.clearRect(x, 0, width, canvas.height);
          ctx.putImageData(imageData, x, shiftAmount);
        } catch (e) {
          // Skip if there's an issue
        }
      }
      
      // NEW: Random screen jitter (entire screen shift)
      if (Math.random() > 0.95) {
        try {
          const jitterX = Math.floor(Math.random() * 7) - 3;
          const jitterY = Math.floor(Math.random() * 7) - 3;
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.putImageData(imageData, jitterX, jitterY);
        } catch (e) {
          // Skip if there's an issue
        }
      }
      
      // Frequent horizontal noise lines 
      if (Math.random() > 0.8) { // Even more frequent (from 0.85)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'; // Increased visibility (from 0.25)
        const lineHeight = 1 + Math.random() * 4;
        const y = Math.random() * canvas.height;
        ctx.fillRect(0, y, canvas.width, lineHeight);
      }
      
      // NEW: Vertical noise lines
      if (Math.random() > 0.85) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        const lineWidth = 1 + Math.random() * 3;
        const x = Math.random() * canvas.width;
        ctx.fillRect(x, 0, lineWidth, canvas.height);
      }
      
      // Regular color bleeding 
      if (Math.random() > 0.85) { // More frequent
        const bleedType = Math.floor(Math.random() * 3);
        if (bleedType === 0) {
          // Red color bleeding
          ctx.fillStyle = 'rgba(255, 50, 50, 0.12)'; // Doubled opacity
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (bleedType === 1) {
          // Green color bleeding
          ctx.fillStyle = 'rgba(50, 255, 50, 0.12)'; // Doubled opacity
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
          // Blue color bleeding
          ctx.fillStyle = 'rgba(50, 50, 255, 0.12)'; // Doubled opacity
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
      
      // Regular chromatic aberration effect
      if (Math.random() > 0.7) { // Much more frequent
        try {
          // Grab screen content
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Shift red and blue channels slightly
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d');
          tempCanvas.width = canvas.width;
          tempCanvas.height = canvas.height;
          
          // Red channel shift - more pronounced
          tempCtx.fillStyle = 'rgba(255, 0, 0, 0.2)'; // Doubled opacity
          tempCtx.fillRect(0, 0, canvas.width, canvas.height);
          tempCtx.globalCompositeOperation = 'destination-in';
          tempCtx.drawImage(canvas, 0, 0);
          tempCtx.globalCompositeOperation = 'source-over';
          
          // Apply red channel with offset
          ctx.globalAlpha = 0.2; // Doubled opacity
          ctx.drawImage(tempCanvas, -2, 0); // Doubled offset
          
          // Blue channel shift - more pronounced
          tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
          tempCtx.fillStyle = 'rgba(0, 0, 255, 0.2)'; // Doubled opacity
          tempCtx.fillRect(0, 0, canvas.width, canvas.height);
          tempCtx.globalCompositeOperation = 'destination-in';
          tempCtx.drawImage(canvas, 0, 0);
          tempCtx.globalCompositeOperation = 'source-over';
          
          // Apply blue channel with offset
          ctx.drawImage(tempCanvas, 2, 0); // Doubled offset
          ctx.globalAlpha = 1.0;
        } catch (e) {
          // Skip effect if there's an issue
        }
      }
      
      // Apply the overlay
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(overlayCanvas, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      
      // NEW: Vertical blanking effect (horizontal black bar)
      if (Math.random() > 0.96) {
        // Simulate TV vertical blanking interval
        const barHeight = Math.floor(Math.random() * 10) + 5;
        const barY = (timestamp / 20) % canvas.height;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, barY, canvas.width, barHeight);
      }
      
      // Add screen interference patterns (TV signal issues)
      if (Math.random() > 0.97) {
        // Rolling bar effect
        const barHeight = Math.random() * 40 + 20;
        const barY = (timestamp / 20) % (canvas.height * 2) - barHeight;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(0, barY, canvas.width, barHeight);
      }
      
      // Add subtle screen glare (fixed position) - more visible
      const glareGradient = ctx.createRadialGradient(
        canvas.width * 0.75, canvas.height * 0.2, 0,
        canvas.width * 0.75, canvas.height * 0.2, canvas.width * 0.3
      );
      glareGradient.addColorStop(0, 'rgba(255, 255, 255, 0.12)'); // Doubled opacity
      glareGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.06)'); // Doubled opacity
      glareGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = glareGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
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
      
      // Use time for 3D tunnel perspective
      const tunnelProgress = (time % 1) * 15; // Resets every 1 time unit
      
      // Draw the 3D tunnel effect
      drawTunnel(tunnelProgress, timestamp);
      
      // Check if we need to reset based on progress
      if (time % 4 > 3.8 && !isRestarting) {
        console.log("Starting transition...");
        isRestarting = true;
        transitionProgress = 0;
      }
      
      // Apply CRT effects at the end of drawing
      applyCRTEffects(timestamp);
      
      // Animate with timestamp
      requestAnimationFrame(draw);
    };
    
    // Draw 3D tunnel effect
    const drawTunnel = (progress, timestamp) => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Set some style properties for the tunnel
      ctx.lineWidth = 2;
      ctx.shadowBlur = 8; 
      ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
      
      // Number of tunnel segments
      const segments = 20;
      // Number of sides in each polygon
      const sides = 8;
      // Maximum tunnel radius
      const maxRadius = Math.max(canvas.width, canvas.height) * 0.6;
      
      // Create slight oscillating movement to add interest
      const oscillation = Math.sin(timestamp * 0.001) * 10;
      
      // Create a rotation effect
      const rotation = timestamp * 0.0002;
      
      // Draw the tunnel from back to front for proper overlap
      for (let i = segments - 1; i >= 0; i--) {
        // Calculate the depth/perspective
        const depthFactor = (i + progress) / segments;
        const perspective = Math.pow(depthFactor, 1.5); // Non-linear for better depth
        
        // Size decreases with depth (perspective)
        const radius = maxRadius * perspective;
        
        // Calculate color - brighter as it comes closer
        const brightness = Math.floor(255 * (1 - perspective * 0.8));
        const hue = (timestamp * 0.05 + i * 10) % 360; // Rotating colors
        
        // This gives a nice light-streak effect in various colors
        if (i % 3 === 0) {
          ctx.strokeStyle = `hsl(${hue}, 100%, ${brightness * 0.7 + 30}%)`;
          ctx.lineWidth = 3 - 2 * perspective;
        } else {
          ctx.strokeStyle = `rgba(${brightness}, ${brightness}, ${brightness}, ${0.9 - perspective * 0.6})`;
          ctx.lineWidth = 2 - perspective;
        }
        
        // Draw a polygon to create the tunnel segment
        ctx.beginPath();
        
        for (let j = 0; j <= sides; j++) {
          // Calculate points around the polygon
          const angle = (j / sides * Math.PI * 2) + rotation + (i * 0.05);
          
          // Add some waviness to the tunnel
          const waveFactor = 0.1 * Math.sin(angle * 3 + timestamp * 0.001);
          const adjustedRadius = radius * (1 + waveFactor);
          
          // Calculate position with perspective
          const x = centerX + adjustedRadius * Math.cos(angle) + oscillation * perspective;
          const y = centerY + adjustedRadius * Math.sin(angle) * 0.8; // Slightly oval for more 3D feel
          
          if (j === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.closePath();
        ctx.stroke();
        
        // Add cross lines for extra depth perception (for some segments)
        if (i % 2 === 0 && i < segments - 5) {
          ctx.beginPath();
          
          // Draw diagonal cross lines
          for (let j = 0; j < sides / 2; j++) {
            const angle1 = (j / sides * Math.PI * 2) + rotation + (i * 0.05);
            const angle2 = angle1 + Math.PI;
            
            const waveFactor1 = 0.1 * Math.sin(angle1 * 3 + timestamp * 0.001);
            const waveFactor2 = 0.1 * Math.sin(angle2 * 3 + timestamp * 0.001);
            
            const r1 = radius * (1 + waveFactor1);
            const r2 = radius * (1 + waveFactor2);
            
            const x1 = centerX + r1 * Math.cos(angle1) + oscillation * perspective;
            const y1 = centerY + r1 * Math.sin(angle1) * 0.8;
            
            const x2 = centerX + r2 * Math.cos(angle2) + oscillation * perspective;
            const y2 = centerY + r2 * Math.sin(angle2) * 0.8;
            
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
          }
          
          ctx.stroke();
        }
        
        // Add center point light for some segments
        if (i === 0 || i === Math.floor(segments / 2)) {
          // Fix: Ensure glowSize is never negative by using Math.max
          const glowSize = Math.max(1, 20 - perspective * 15);
          
          // Create a radial gradient for the glow
          const glow = ctx.createRadialGradient(
            centerX + oscillation * perspective, centerY, 0,
            centerX + oscillation * perspective, centerY, glowSize
          );
          
          glow.addColorStop(0, `hsla(${hue}, 100%, 80%, 0.9)`);
          glow.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);
          
          ctx.fillStyle = glow;
          ctx.fillRect(
            centerX - glowSize + oscillation * perspective, 
            centerY - glowSize, 
            glowSize * 2, 
            glowSize * 2
          );
        }
      }
      
      // Reset shadow for other rendering
      ctx.shadowBlur = 0;
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

export default TunnelCRT;
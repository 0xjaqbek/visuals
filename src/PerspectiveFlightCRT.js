import React, { useEffect, useRef } from 'react';

const PerspectiveFlightCRT = ({ onEscape }) => {
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
    
    // Initialize starfield points in 3D space
    const pointCount = 1000;
    let points = [];
    
    // Animation timing
    let time = 0;
    let lastTimestamp = 0;
    
    // Initialize starfield with random points
    const initializeStarField = () => {
      points = [];
      for (let i = 0; i < pointCount; i++) {
        // Random position in 3D space
        // For more star density in the center, use a distribution that favors the center
        // z is depth (smaller = further away)
        points.push({
          x: (Math.random() * 2 - 1) * 2000,   // -2000 to 2000
          y: (Math.random() * 2 - 1) * 2000,   // -2000 to 2000
          z: Math.random() * 1000 + 1,         // 1 to 1001 (avoid z=0)
          // Add color properties with different hues for more visual interest
          hue: Math.random() * 60 + 220,       // Blues to purples (220-280)
          brightness: 50 + Math.random() * 50,  // 50-100%
          size: 1 + Math.random() * 3          // Star size varies
        });
      }
    };
    
    // Create CRT screen overlay effects
    const createCRTOverlay = () => {
      // Clear the overlay
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      
      // Create scanlines - reduced visibility
      overlayCtx.fillStyle = 'rgba(0, 0, 0, 0.3)'; // Reduced opacity from 0.7
      for (let y = 0; y < overlayCanvas.height; y += 6) { // Increased spacing from 3 to 6
        overlayCtx.fillRect(0, y, overlayCanvas.width, 1); // Reduced thickness from 1.5 to 1
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
    
    const draw = (timestamp) => {
      // Calculate delta time for smooth animations
      const deltaTime = lastTimestamp ? (timestamp - lastTimestamp) / 1000 : 0;
      lastTimestamp = timestamp;
      
      // Clear canvas with each frame
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Increment time with constant speed - faster
      time += deltaTime * 5; // Increased animation speed factor
      
      // Draw the 3D starfield perspective
      drawStarfield(timestamp);
      
      // Apply CRT effects at the end of drawing
      applyCRTEffects(timestamp);
      
      // Animate with timestamp
      requestAnimationFrame(draw);
    };
    
    // Draw 3D starfield with perspective effect
    const drawStarfield = (timestamp) => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Create a focus point slightly ahead of center for better perspective
      const focalLength = 300; // Perspective strength
      
      // Add subtle oscillation to the scene
      const wobbleX = Math.sin(timestamp * 0.0005) * 10;
      const wobbleY = Math.cos(timestamp * 0.0007) * 8;
      
      // Constant flight speed - INCREASED
      const perspectiveSpeed = 15.0; // 3x faster than before
      
      // Update all points (move them toward viewer)
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        
        // Move point closer (decrease z)
        point.z -= perspectiveSpeed;
        
        // If point is too close, reset it to far away at a random position
        if (point.z < 1) {
          point.x = (Math.random() * 2 - 1) * 2000;
          point.y = (Math.random() * 2 - 1) * 2000;
          point.z = 2000; // Reset to even farther away to account for faster speed
          point.hue = Math.random() * 60 + 220; // Randomize color again
          point.brightness = 50 + Math.random() * 50;
        }
        
        // Calculate perspective projection
        const perspective = focalLength / point.z;
        
        // Project from 3D to 2D with perspective
        const x2d = centerX + point.x * perspective + wobbleX;
        const y2d = centerY + point.y * perspective + wobbleY;
        
        // Calculate perceived size (closer = bigger)
        const size = Math.max(0.1, perspective * point.size * 2);
        
        // Calculate opacity based on distance
        const opacity = Math.min(1, perspective * 1.5);
        
        // Draw point with glow for closer ones
        if (point.z < 200) {
          // Closer points have glow effect
          ctx.shadowBlur = size * 3;
          ctx.shadowColor = `hsla(${point.hue}, 100%, ${point.brightness}%, ${opacity * 0.5})`;
          ctx.fillStyle = `hsla(${point.hue}, 100%, ${point.brightness}%, ${opacity})`;
        } else {
          // Distant points are just dots
          ctx.shadowBlur = 0;
          ctx.fillStyle = `hsla(${point.hue}, 80%, ${point.brightness}%, ${opacity * 0.8})`;
        }
        
        // Draw the point
        ctx.beginPath();
        ctx.arc(x2d, y2d, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add streaks to fast-moving points
        if (point.z < 100 && size > 1.5) {
          // Calculate streak length based on speed (closer = faster)
          const streakLength = Math.min(50, 100 / point.z * 10); // Longer streaks for faster speed
          
          // Draw a line behind the point for speed effect
          ctx.beginPath();
          ctx.moveTo(x2d, y2d);
          // Calculate streak endpoint based on 3D movement
          const prevPerspective = focalLength / (point.z + perspectiveSpeed);
          const prevX2d = centerX + point.x * prevPerspective + wobbleX;
          const prevY2d = centerY + point.y * prevPerspective + wobbleY;
          
          // Create streak effect
          ctx.lineTo(prevX2d, prevY2d);
          ctx.strokeStyle = `hsla(${point.hue}, 100%, ${point.brightness}%, ${opacity * 0.3})`;
          ctx.lineWidth = size * 0.7;
          ctx.stroke();
        }
      }
      
      // Add occasional perspective grid lines for depth perception
      if (Math.random() > 0.95) {
        // Draw a set of perspective grid lines
        const gridLines = 10;
        const gridDistance = 500 + Math.random() * 500; // z-distance for grid
        const gridAngle = Math.random() * Math.PI * 2; // Random rotation
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        
        // Calculate perspective for this grid
        const gridPerspective = focalLength / gridDistance;
        
        // Draw radiating lines from center
        for (let i = 0; i < gridLines; i++) {
          const angle = gridAngle + (i / gridLines) * Math.PI * 2;
          const length = 1000 * gridPerspective;
          
          ctx.beginPath();
          ctx.moveTo(centerX + wobbleX, centerY + wobbleY);
          ctx.lineTo(
            centerX + Math.cos(angle) * length + wobbleX,
            centerY + Math.sin(angle) * length + wobbleY
          );
          ctx.stroke();
        }
        
        // Draw concentric circles for depth
        for (let radius = 100; radius < 1000; radius += 200) {
          const scaledRadius = radius * gridPerspective;
          
          ctx.beginPath();
          ctx.arc(centerX + wobbleX, centerY + wobbleY, scaledRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      
      // Reset shadow for other rendering
      ctx.shadowBlur = 0;
    };
    
    // Initialize starfield
    initializeStarField();
    
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

export default PerspectiveFlightCRT;
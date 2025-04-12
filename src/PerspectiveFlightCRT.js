import React, { useEffect, useRef, useState } from 'react';

const PerspectiveFlightCRT = ({ onEscape }) => {
    const canvasRef = useRef(null);
    
    // Direction control state
    const [direction, setDirection] = useState({ x: 0, y: 0 });
    const [isMobile, setIsMobile] = useState(false);
    const [touchActive, setTouchActive] = useState(false);
    const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });
    
    // Direction control sensitivity
    const controlSensitivity = 2;
    
    // Detect mobile device
    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
      };
      
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, []);

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
    const pointCount = 1600;
    let points = [];
    
    // Add special comet-like fast-moving stars
    const cometCount = 12;
    let comets = [];
    
    // Animation timing
    let time = 0;
    let lastTimestamp = 0;
    
    // Camera position offset (this will be controlled by keyboard/touch)
    let cameraOffsetX = 0;
    let cameraOffsetY = 0;
    
    // Maximum camera offset to prevent going too far off-center
    const maxCameraOffset = 500;
    
    // Nebula cloud parameters
    const nebulaClouds = [];
    const nebulaCloudCount = 15;
    
    // Initialize nebula with continuous flowing clouds of color
    const initializeNebula = () => {
      // Create nebula cloud formations
      for (let i = 0; i < nebulaCloudCount; i++) {
        nebulaClouds.push({
          x: (Math.random() * 2 - 1) * 4000,
          y: (Math.random() * 2 - 1) * 4000,
          z: Math.random() * 3000 + 500,
          size: 300 + Math.random() * 700,
          hue: Math.random() * 60 + 220,
          opacity: 0.1 + Math.random() * 0.15
        });
      }
      
      // Initialize comets (fast-moving stars with tails)
      comets = [];
      for (let i = 0; i < cometCount; i++) {
        createNewComet();
      }
      
      // Initialize starfield with continuous distribution
      points = [];
      for (let i = 0; i < pointCount; i++) {
        // Create a continuous tunnel-like distribution
        // Use cylindrical coordinates for a more tunnel-like effect
        const radius = 50 + Math.random() * 2500;
        const angle = Math.random() * Math.PI * 2;
        // Convert to Cartesian coordinates
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        // z is distributed throughout the entire tunnel
        const z = Math.random() * 4000 + 1;
        
        points.push({
          x: x,
          y: y,
          z: z,
          // Vary color based on position in nebula
          hue: 180 + Math.random() * 180,
          brightness: 50 + Math.random() * 50,
          size: 1 + Math.random() * 3,
          // Add some random velocity variation for swirling effect
          vx: (Math.random() * 2 - 1) * 0.5,
          vy: (Math.random() * 2 - 1) * 0.5
        });
      }
    };
    
    // Create CRT screen overlay effects
    const createCRTOverlay = () => {
      // Clear the overlay
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      
      // Create scanlines
      overlayCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      for (let y = 0; y < overlayCanvas.height; y += 6) {
        overlayCtx.fillRect(0, y, overlayCanvas.width, 1);
      }
      
      // Add RGB pixel structure (phosphor dots effect)
      const pixelSize = 3;
      for (let y = 0; y < overlayCanvas.height; y += 3 * pixelSize) {
        for (let x = 0; x < overlayCanvas.width; x += 3 * pixelSize) {
          overlayCtx.fillStyle = 'rgba(255, 30, 30, 0.3)';
          overlayCtx.fillRect(x, y, pixelSize, pixelSize);
          
          overlayCtx.fillStyle = 'rgba(30, 255, 30, 0.3)';
          overlayCtx.fillRect(x + pixelSize, y, pixelSize, pixelSize);
          
          overlayCtx.fillStyle = 'rgba(30, 30, 255, 0.3)';
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
      
      // Add vignette effect (darker corners)
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
      if (Math.random() > 0.85) {
        const flickerOpacity = Math.random() * 0.15;
        ctx.fillStyle = `rgba(255, 255, 255, ${flickerOpacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      // ENHANCED: Much more frequent horizontal shifts (horizontal distortion)
      if (Math.random() > 0.8) {
        const shiftAmount = Math.floor(Math.random() * 25) - 12;
        const y = Math.random() * canvas.height;
        const height = 5 + Math.random() * 40;
        
        try {
          const imageData = ctx.getImageData(0, y, canvas.width, height);
          ctx.clearRect(0, y, canvas.width, height);
          ctx.putImageData(imageData, shiftAmount, y);
        } catch (e) {
          // Skip if there's an issue
        }
      }
      
      // UPDATED: Vertical shifts (vertical distortion) with matching parameters
      if (Math.random() > 0.8) {
        const shiftAmount = Math.floor(Math.random() * 25) - 12;
        const x = Math.random() * canvas.width;
        const width = 5 + Math.random() * 40;
        
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
      if (Math.random() > 0.8) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
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
      if (Math.random() > 0.85) {
        const bleedType = Math.floor(Math.random() * 3);
        if (bleedType === 0) {
          // Red color bleeding
          ctx.fillStyle = 'rgba(255, 50, 50, 0.12)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (bleedType === 1) {
          // Green color bleeding
          ctx.fillStyle = 'rgba(50, 255, 50, 0.12)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
          // Blue color bleeding
          ctx.fillStyle = 'rgba(50, 50, 255, 0.12)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
      
      // Regular chromatic aberration effect
      if (Math.random() > 0.7) {
        try {
          // Grab screen content
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          // Shift red and blue channels slightly
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d');
          tempCanvas.width = canvas.width;
          tempCanvas.height = canvas.height;
          
          // Red channel shift - more pronounced
          tempCtx.fillStyle = 'rgba(255, 0, 0, 0.2)';
          tempCtx.fillRect(0, 0, canvas.width, canvas.height);
          tempCtx.globalCompositeOperation = 'destination-in';
          tempCtx.drawImage(canvas, 0, 0);
          tempCtx.globalCompositeOperation = 'source-over';
          
          // Apply red channel with offset
          ctx.globalAlpha = 0.2;
          ctx.drawImage(tempCanvas, -2, 0);
          
          // Blue channel shift - more pronounced
          tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
          tempCtx.fillStyle = 'rgba(0, 0, 255, 0.2)';
          tempCtx.fillRect(0, 0, canvas.width, canvas.height);
          tempCtx.globalCompositeOperation = 'destination-in';
          tempCtx.drawImage(canvas, 0, 0);
          tempCtx.globalCompositeOperation = 'source-over';
          
          // Apply blue channel with offset
          ctx.drawImage(tempCanvas, 2, 0);
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
      glareGradient.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
      glareGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.06)');
      glareGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = glareGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    
    // Helper function to create a new comet with random properties
    const createNewComet = () => {
      // Random position at the far end of the tunnel
      const radius = 100 + Math.random() * 2500;
      const angle = Math.random() * Math.PI * 2;
      
      // Create comet with much higher speed than regular stars
      comets.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        z: Math.random() * 2000 + 2000, // Start further out
        speed: 60 + Math.random() * 80,  // Even faster speed
        size: 0.7 + Math.random() * 1.0,   // Much smaller size
        tailLength: 30 + Math.random() * 40, // Long tail
        // White/blue color for comets
        hue: 200 + Math.random() * 40,
        brightness: 85 + Math.random() * 15, // Brighter
        tailSegments: [], // Store previous positions for tail effect
        maxTailLength: 10 + Math.random() * 10 // Shorter tail segments
      });
    };
    
    const draw = (timestamp) => {
      // Calculate delta time for smooth animations
      const deltaTime = lastTimestamp ? (timestamp - lastTimestamp) / 1000 : 0;
      lastTimestamp = timestamp;
      
      // Clear canvas with each frame
      ctx.fillStyle = 'rgb(5, 5, 15)'; // Very dark blue background instead of pure black
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Increment time with constant speed - faster
      time += deltaTime * 5; // Increased animation speed factor
      
      // Update camera offset based on direction state
      // Apply easing for smoother camera movement
      const targetOffsetX = direction.x * maxCameraOffset;
      const targetOffsetY = direction.y * maxCameraOffset;
      
      // Smoothly interpolate camera position (easing)
      cameraOffsetX += (targetOffsetX - cameraOffsetX) * 0.05;
      cameraOffsetY += (targetOffsetY - cameraOffsetY) * 0.05;
      
      // Calculate wobble with added directional control influence
      const wobbleX = Math.sin(timestamp * 0.0005) * 10 + cameraOffsetX;
      const wobbleY = Math.cos(timestamp * 0.0007) * 8 + cameraOffsetY;
      
      // Constant flight speed - CONSISTENT
      const perspectiveSpeed = 15.0;
      
      // Draw the nebula clouds first (background layer)
      drawNebulaClouds(timestamp, wobbleX, wobbleY);
      
      // Draw the stars on top of nebula
      drawStars(timestamp, wobbleX, wobbleY);
      
      // Draw comets (fastest moving elements)
      drawComets(timestamp, wobbleX, wobbleY);
      
      // Apply CRT effects at the end of drawing
      applyCRTEffects(timestamp);
      
      // Draw mobile touch controls if on mobile
      if (isMobile) {
        drawTouchControls();
      }
      
      // Animate with timestamp
      requestAnimationFrame(draw);
    };
    
    // Draw nebula cloud formations with direction control
    const drawNebulaClouds = (timestamp, wobbleX, wobbleY) => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Perspective parameters
      const focalLength = 300;
      const perspectiveSpeed = 10.0;
      
      // Process each nebula cloud
      for (let i = 0; i < nebulaClouds.length; i++) {
        const cloud = nebulaClouds[i];
        
        // Move cloud closer (decrease z)
        cloud.z -= perspectiveSpeed;
        
        // Apply slight horizontal/vertical drift based on direction
        cloud.x += direction.x * 2;
        cloud.y += direction.y * 2;
        
        // If cloud is too close, reset it far away
        if (cloud.z < 1) {
          cloud.x = (Math.random() * 2 - 1) * 4000;
          cloud.y = (Math.random() * 2 - 1) * 4000;
          cloud.z = 4000; // Reset far away
          cloud.size = 300 + Math.random() * 700;
          cloud.hue = Math.random() * 60 + 220; // Blues to purples
          cloud.opacity = 0.1 + Math.random() * 0.15;
        }
        
        // Project cloud to screen space
        const perspective = focalLength / cloud.z;
        const x2d = centerX + cloud.x * perspective + wobbleX;
        const y2d = centerY + cloud.y * perspective + wobbleY;
        const size2d = cloud.size * perspective;
        
        // Only draw if on screen (with some margin)
        if (x2d + size2d > -500 && x2d - size2d < canvas.width + 500 &&
            y2d + size2d > -500 && y2d - size2d < canvas.height + 500) {
            
          // Create colorful nebula gradient
          const gradient = ctx.createRadialGradient(
            x2d, y2d, 0,
            x2d, y2d, size2d
          );
          
          // Nebula color with distance-based opacity
          const opacity = Math.min(cloud.opacity, cloud.opacity * (2000 / cloud.z));
          gradient.addColorStop(0, `hsla(${cloud.hue}, 100%, 70%, ${opacity})`);
          gradient.addColorStop(0.6, `hsla(${cloud.hue + 20}, 90%, 50%, ${opacity * 0.6})`);
          gradient.addColorStop(1, `hsla(${cloud.hue + 40}, 80%, 30%, 0)`);
          
          // Draw the nebula cloud
          ctx.globalCompositeOperation = 'screen'; // Additive blending
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x2d, y2d, size2d, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalCompositeOperation = 'source-over';
        }
      }
    };
    
    // Draw stars with continuous flow effect and direction control
    const drawStars = (timestamp, wobbleX, wobbleY) => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Create a focus point slightly ahead of center for better perspective
      const focalLength = 300; // Perspective strength
      
      // Constant flight speed
      const perspectiveSpeed = 15.0;
      
      // Update all stars
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        
        // Move point closer (decrease z)
        point.z -= perspectiveSpeed;
        
        // Add some drift for swirling effect, enhanced by directional control
        point.x += point.vx + (direction.x * 2);
        point.y += point.vy + (direction.y * 2);
        
        // If point is too close, reset it to far away with continuous distribution
        if (point.z < 1) {
          // Instead of completely random positioning, maintain the tunnel shape
          // Use cylindrical coordinates for more continuous tunnel effect
          const radius = 50 + Math.random() * 2500;
          const angle = Math.random() * Math.PI * 2;
          
          // Reset position
          point.x = Math.cos(angle) * radius;
          point.y = Math.sin(angle) * radius;
          point.z = 4000; // Reset to far away, ALWAYS the same depth for continuity
          
          // Randomize appearance slightly
          point.hue = 180 + Math.random() * 180;
          point.brightness = 50 + Math.random() * 50;
          point.size = 1 + Math.random() * 3;
          
          // Keep small random drift for swirling effect
          point.vx = (Math.random() * 2 - 1) * 0.5;
          point.vy = (Math.random() * 2 - 1) * 0.5;
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
      
      // Reset shadow for other rendering
      ctx.shadowBlur = 0;
    };
    
    // Draw fast-moving comet-like stars with dissolving tails
    const drawComets = (timestamp, wobbleX, wobbleY) => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const focalLength = 300;
      
      // Process each comet
      for (let i = 0; i < comets.length; i++) {
        const comet = comets[i];
        
        // Save current position for tail effect
        if (comet.z < 1500) { // Only start creating tails when close enough to be visible
          comet.tailSegments.unshift({
            x: comet.x,
            y: comet.y,
            z: comet.z,
            size: comet.size
          });
          
          // Limit tail length
          if (comet.tailSegments.length > comet.maxTailLength) {
            comet.tailSegments.pop();
          }
        }
        
        // Move comet closer at high speed
        comet.z -= comet.speed;
        
        // Apply directional control to comets as well
        comet.x += direction.x * 5; // Stronger effect on comets
        comet.y += direction.y * 5;
        
        // If comet is too close or off-screen, reset it
        if (comet.z < 1) {
          // Remove this comet and create a new one
          comets.splice(i, 1);
          createNewComet();
          i--;
          continue;
        }
        
        // Project comet to screen space
        const perspective = focalLength / comet.z;
        const x2d = centerX + comet.x * perspective + wobbleX;
        const y2d = centerY + comet.y * perspective + wobbleY;
        const size = Math.max(0.1, perspective * comet.size * 2);
        
        // Draw comet head (bright white/blue star) - smaller glow
        ctx.shadowBlur = size * 3;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
        ctx.fillStyle = `hsla(${comet.hue}, 90%, ${comet.brightness}%, 1.0)`;
        
        ctx.beginPath();
        ctx.arc(x2d, y2d, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw comet tail (dissolving segments)
        if (comet.tailSegments.length > 0) {
          // Start with a wider glow for the beginning of the tail
          ctx.beginPath();
          
          // Get the head position (first segment)
          const headSegment = comet.tailSegments[0];
          const headPerspective = focalLength / headSegment.z;
          const headX = centerX + headSegment.x * headPerspective + wobbleX;
          const headY = centerY + headSegment.y * headPerspective + wobbleY;
          
          ctx.moveTo(headX, headY);
          
          // Draw tail segments with gradually reducing opacity
          for (let j = 1; j < comet.tailSegments.length; j++) {
            const segment = comet.tailSegments[j];
            const segPerspective = focalLength / segment.z;
            const segX = centerX + segment.x * segPerspective + wobbleX;
            const segY = centerY + segment.y * segPerspective + wobbleY;
            
            // Calculate opacity that fades out along the tail
            const opacity = 1 - (j / comet.tailSegments.length);
            
            // Draw line segment of tail
            ctx.lineWidth = size * (1 - j / comet.tailSegments.length) * 1.5;
            ctx.strokeStyle = `hsla(${comet.hue}, 80%, ${comet.brightness}%, ${opacity * 0.5})`;
            ctx.lineTo(segX, segY);
            ctx.stroke();
            
            // Reset path after each segment for proper opacity gradient
            ctx.beginPath();
            ctx.moveTo(segX, segY);
          }
        }
      }
      
      // Reset shadow effect
      ctx.shadowBlur = 0;
    };
    
    // Draw touch controls for mobile users
    const drawTouchControls = () => {
      // Draw joystick background
      const joyRadius = Math.min(canvas.width, canvas.height) * 0.1; // 10% of screen size
      
      ctx.globalAlpha = touchActive ? 0.4 : 0.2; // Highlight when active
      
      // Draw outer circle
      ctx.beginPath();
      ctx.arc(canvas.width - joyRadius * 1.5, canvas.height - joyRadius * 1.5, joyRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(50, 150, 255, 0.3)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(100, 200, 255, 0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw control stick
      if (touchActive) {
        // Calculate joystick handle position relative to center
        const maxDistance = joyRadius * 0.8;
        const joyCenterX = canvas.width - joyRadius * 1.5;
        const joyCenterY = canvas.height - joyRadius * 1.5;
        
        // Calculate direction vector from center to touch
        const dirX = touchPosition.x - joyCenterX;
        const dirY = touchPosition.y - joyCenterY;
        
        // Calculate distance from center
        const distance = Math.sqrt(dirX * dirX + dirY * dirY);
        
        // Normalize and clamp to max distance
        const normalizedDistance = Math.min(distance, maxDistance);
        const normalizedDirX = (distance > 0) ? (dirX / distance) * normalizedDistance : 0;
        const normalizedDirY = (distance > 0) ? (dirY / distance) * normalizedDistance : 0;
        
        // Draw joystick handle
        ctx.beginPath();
        ctx.arc(
          joyCenterX + normalizedDirX,
          joyCenterY + normalizedDirY,
          joyRadius * 0.4,
          0, Math.PI * 2
        );
        ctx.fillStyle = 'rgba(100, 200, 255, 0.8)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(180, 230, 255, 0.9)';
        ctx.stroke();
      } else {
        // Draw center point when not active
        ctx.beginPath();
        ctx.arc(canvas.width - joyRadius * 1.5, canvas.height - joyRadius * 1.5, joyRadius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(100, 200, 255, 0.5)';
        ctx.fill();
      }
      
      // Reset alpha
      ctx.globalAlpha = 1.0;
      
      // Draw instructional text
      ctx.font = '14px monospace';
      ctx.fillStyle = 'rgba(200, 230, 255, 0.7)';
      ctx.textAlign = 'center';
      ctx.fillText(
        'TOUCH TO STEER', 
        canvas.width - joyRadius * 1.5, 
        canvas.height - joyRadius * 3
      );
    };
    
    // Initialize nebula and starfield
    initializeNebula();
    
    // Create initial CRT overlay
    createCRTOverlay();
    
    // Direction control listeners
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          setDirection(prev => ({ ...prev, x: -1 }));
          break;
        case 'ArrowRight':
          setDirection(prev => ({ ...prev, x: 1 }));
          break;
        case 'ArrowUp':
          setDirection(prev => ({ ...prev, y: -1 }));
          break;
        case 'ArrowDown':
          setDirection(prev => ({ ...prev, y: 1 }));
          break;
      }
    };
    
    const handleKeyUp = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          if (direction.x < 0) setDirection(prev => ({ ...prev, x: 0 }));
          break;
        case 'ArrowRight':
          if (direction.x > 0) setDirection(prev => ({ ...prev, x: 0 }));
          break;
        case 'ArrowUp':
          if (direction.y < 0) setDirection(prev => ({ ...prev, y: 0 }));
          break;
        case 'ArrowDown':
          if (direction.y > 0) setDirection(prev => ({ ...prev, y: 0 }));
          break;
      }
    };
    
    // Touch control handlers
    const handleTouchStart = (e) => {
      const joyCenterX = canvas.width - canvas.width * 0.1 * 1.5;
      const joyCenterY = canvas.height - canvas.height * 0.1 * 1.5;
      const joyRadius = Math.min(canvas.width, canvas.height) * 0.1;
      
      // Get touch position
      const touch = e.touches[0];
      const touchX = touch.clientX;
      const touchY = touch.clientY;
      
      // Check if touch is within joystick area
      const dx = touchX - joyCenterX;
      const dy = touchY - joyCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= joyRadius * 2) {
        setTouchActive(true);
        setTouchPosition({ x: touchX, y: touchY });
        
        // Calculate direction (-1 to 1 range)
        const dirX = dx / (joyRadius * 0.8);
        const dirY = dy / (joyRadius * 0.8);
        
        // Update direction (clamped to -1, 1)
        setDirection({
          x: Math.max(-1, Math.min(1, dirX)),
          y: Math.max(-1, Math.min(1, dirY))
        });
        
        // Prevent default to avoid scrolling
        e.preventDefault();
      }
    };
    
    const handleTouchMove = (e) => {
      if (touchActive) {
        // Get joystick center
        const joyCenterX = canvas.width - canvas.width * 0.1 * 1.5;
        const joyCenterY = canvas.height - canvas.height * 0.1 * 1.5;
        const joyRadius = Math.min(canvas.width, canvas.height) * 0.1;
        
        // Get touch position
        const touch = e.touches[0];
        const touchX = touch.clientX;
        const touchY = touch.clientY;
        
        setTouchPosition({ x: touchX, y: touchY });
        
        // Calculate direction (-1 to 1 range)
        const dx = touchX - joyCenterX;
        const dy = touchY - joyCenterY;
        
        // Calculate normalized direction
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = joyRadius * 0.8;
        
        // Normalize to -1 to 1 range with clamping
        const dirX = (distance > 0) ? (dx / distance) * Math.min(distance / maxDistance, 1) : 0;
        const dirY = (distance > 0) ? (dy / distance) * Math.min(distance / maxDistance, 1) : 0;
        
        // Update direction
        setDirection({
          x: Math.max(-1, Math.min(1, dirX)),
          y: Math.max(-1, Math.min(1, dirY))
        });
        
        // Prevent default to avoid scrolling
        e.preventDefault();
      }
    };
    
    const handleTouchEnd = () => {
      setTouchActive(false);
      // Return to neutral position
      setDirection({ x: 0, y: 0 });
    };
    
    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      overlayCanvas.width = window.innerWidth;
      overlayCanvas.height = window.innerHeight;
      
      // Recreate CRT overlay effects after resize
      createCRTOverlay();
    };
    
    // Set up event listeners
    if (!isMobile) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
    } else {
      // Touch events for mobile
      canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
      canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
      canvas.addEventListener('touchend', handleTouchEnd);
      canvas.addEventListener('touchcancel', handleTouchEnd);
    }
    
    window.addEventListener('resize', handleResize);
    
    // Start animation with timestamp
    requestAnimationFrame(draw);
    
    return () => {
      // Clean up event listeners
      if (!isMobile) {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      } else {
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
        canvas.removeEventListener('touchcancel', handleTouchEnd);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [direction, isMobile, touchActive, touchPosition]);
  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />;
};

export default PerspectiveFlightCRT;
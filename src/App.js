import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import RetroTerminal from './RetroTerminal';
import ZoomingNetCell from './ZoomingNetCell';
import PerspectiveFlightCRT from './PerspectiveFlightCRT';
import LandscapeSquaresAnimation from './LandscapeSquaresAnimation';

const App = () => {
  const [currentView, setCurrentView] = useState('terminal');
  const [isMobile, setIsMobile] = useState(false);
  const [touchCount, setTouchCount] = useState(0);
  const [lastTouchTime, setLastTouchTime] = useState(0);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Touch handling for mobile escape functionality
  useEffect(() => {
    if (!isMobile) return;

    const handleTouchStart = (e) => {
      const currentTime = Date.now();
      
      // Reset touch count if too much time has passed between touches
      if (currentTime - lastTouchTime > 300) {
        setTouchCount(1);
      } else {
        setTouchCount(prev => prev + 1);
      }
      
      setLastTouchTime(currentTime);

      // Three quick touches act as escape
      if (touchCount >= 2 && currentView !== 'terminal') {
        setCurrentView('terminal');
        setTouchCount(0);
      }
    };

    // Add touch event listener only on mobile
    if (isMobile) {
      window.addEventListener('touchstart', handleTouchStart);
      return () => window.removeEventListener('touchstart', handleTouchStart);
    }
  }, [isMobile, currentView, touchCount, lastTouchTime]);

  // Keyboard escape for desktop
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && currentView !== 'terminal') {
        setCurrentView('terminal');
      }
    };

    window.addEventListener('keydown', handleEscapeKey);
    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, [currentView]);

  // Handle visualization selection
  const handleVisualizationSelect = (visualType) => {
    setCurrentView(visualType);
  };

  // Render current view based on state
  const renderCurrentView = () => {
    switch (currentView) {
      case 'net':
        return <ZoomingNetCell />;
      case 'flight':
        return <PerspectiveFlightCRT />;
      case 'landscape':
        return <LandscapeSquaresAnimation />;
      default:
        return <RetroTerminal onVisualizationSelect={handleVisualizationSelect} />;
    }
  };

  return (
    <BrowserRouter>
      {renderCurrentView()}
    </BrowserRouter>
  );
};

export default App;
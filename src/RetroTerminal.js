import React, { useState, useEffect, useRef, useMemo } from 'react';

const RetroTerminal = ({ onVisualizationSelect }) => {
  const inputRef = useRef(null);
  
  // Commands and their responses
  const commands = {
    'help': 'Available commands:\nhelp - Show this help message\n1 or "net" - Launch Zooming Net Cell\n2 or "flight" - Launch Perspective Flight\nclear - Clear terminal\ninfo - Show system information',
    'info': 'SYSTEM: Visualization Terminal v11.0\nCPU: 12.8MHz\nMEMORY: 640K RAM\nVIDEO: CRT-9800 Graphics Accelerator\nOS: TermOS 3.1\n\nESCAPE KEY FUNCTION:\n- Returns to Terminal from Active Visualization\n- Interrupts Current Visual Sequence',
    'clear': '',
    '1': 'Launching Zooming Net Cell...',
    'net': 'Launching Zooming Net Cell...',
    '2': 'Launching Perspective Flight...',
    'flight': 'Launching Perspective Flight...',
    'exit': 'Cannot terminate visualization sequence. Override required.',
    'ls': 'Directory listing:\n> net_cell.vis\n> flight.vis\n> system.cfg [LOCKED]',
    'dir': 'Directory listing:\n> net_cell.vis\n> flight.vis\n> system.cfg [LOCKED]',
  };

  const [isMobile, setIsMobile] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [typedText, setTypedText] = useState('');
  const [showFullText, setShowFullText] = useState(false);
  const [commandHistory, setCommandHistory] = useState([]);

  // Memoized welcome messages for mobile and desktop
  const welcomeMessages = useMemo(() => ({
    mobile: `
  ///////////////////////////////////////
  //                                   //
  //   SYSTEM V11.0                    //
  //   (c) 1985-2025 jaqbek Visuals    //
  //                                   //
  //   {'>'}LOADING MODULE...          //
  //   {'>'}ACCESS GRANTED             //
  //                                   //
  ///////////////////////////////////////
  
  SELECT VISUALIZATION:
  
  [1] NET CELL 
  [2] SPACE FLIGHT
  
  TAP SCREEN FAST 3 TIMES TO RETURN
  
  INPUT SELECTION:`,
    desktop: `
  /////////////////////////////////////////////////////////////
  //                                                         //
  //   SYSTEM V11.0                                          //
  //   (c) 1985-2025 jaqbek Visuals                          //
  //                                                         //
  //   {'>'}LOADING VISUAL SEQUENCE MODULE...                //
  //   {'>'}ACCESS GRANTED                                   //
  //                                                         //
  /////////////////////////////////////////////////////////////
  
  SELECT VISUALIZATION SEQUENCE:
  
  [1] ZOOMING NET CELL - Infinite grid zoom with CRT effects
  [2] PERSPECTIVE FLIGHT - Space flight through star field
  
  INFO: PRESS [ESC] TO RETURN TO TERMINAL DURING VISUALIZATION
  
  INPUT SELECTION AND PRESS ENTER:`
  }), []);

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);
  
  // Simulate typing effect for the welcome message
  useEffect(() => {
    const welcomeMessage = isMobile ? welcomeMessages.mobile : welcomeMessages.desktop;

    if (typedText.length < welcomeMessage.length && !showFullText) {
      const timeout = setTimeout(() => {
        setTypedText(welcomeMessage.slice(0, typedText.length + 1));
      }, 5); // Fast typing speed
      return () => clearTimeout(timeout);
    }
  }, [typedText, showFullText, isMobile, welcomeMessages]);
  
  // Skip typing animation
  const handleSkip = () => {
    const welcomeMessage = isMobile ? welcomeMessages.mobile : welcomeMessages.desktop;
    setShowFullText(true);
    setTypedText(welcomeMessage);
  };

  // Focus on the input field
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [typedText]);
  
  // Handle terminal command input
  const handleCommand = (e) => {
    e.preventDefault();
    const command = e.target.command.value.toLowerCase().trim();
    
    if (command) {
      // Add command to history
      setCommandHistory([...commandHistory, `{'>'}${command}`]);
      
      // Process command
      if (commands[command]) {
        setCommandHistory(prev => [...prev, commands[command]]);
        
        // Handle special commands
        if (command === 'clear') {
          setCommandHistory([]);
        } else if (command === '1' || command === 'net') {
          onVisualizationSelect('net');
        } else if (command === '2' || command === 'flight') {
          onVisualizationSelect('flight');
        }
      } else {
        setCommandHistory(prev => [...prev, `Command not recognized: ${command}`]);
      }
      
      // Clear input
      e.target.command.value = '';
    }
  };
  
  return (
    <div 
      className={`
        min-h-screen 
        bg-black 
        p-2 
        md:p-4 
        font-mono 
        text-green-500 
        flex 
        flex-col
        ${isMobile ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'}
      `}
      onClick={() => inputRef.current && inputRef.current.focus()}
    >
      {/* CRT effect overlay */}
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-transparent to-green-900 opacity-10"></div>
      <div className="pointer-events-none fixed inset-0">
        {/* Scanlines */}
        {Array.from({ length: 100 }).map((_, i) => (
          <div 
            key={i} 
            className="w-full h-px bg-black opacity-10" 
            style={{ position: 'absolute', top: `${i * 10}px` }}
          ></div>
        ))}
      </div>
      
      {/* Screen flicker */}
      <div className="pointer-events-none fixed inset-0 bg-green-900 opacity-5 animate-[flicker_8s_infinite]"></div>
      
      {/* Main terminal content */}
      <div className="z-10 flex-1 overflow-auto">
        {/* Display typed text or full welcome message */}
        <pre 
          className={`
            whitespace-pre-wrap 
            ${isMobile ? 'text-xs' : 'text-sm sm:text-base'}
          `} 
          onClick={handleSkip}
        >
          {showFullText 
            ? (isMobile ? welcomeMessages.mobile : welcomeMessages.desktop)
            : typedText}
        </pre>
        
        {/* Command history */}
        {commandHistory.map((line, index) => (
          <div 
            key={index} 
            className={`
              mt-1 
              ${isMobile ? 'text-xs' : 'text-sm sm:text-base'} 
              whitespace-pre-wrap
            `}
          >
            {line}
          </div>
        ))}
        
        {/* Command input */}
        <form onSubmit={handleCommand} className="mt-2 flex items-center">
          <span className={isMobile ? 'text-xs' : 'text-sm sm:text-base'}>{'>'}</span>
          <input
            ref={inputRef}
            type="text"
            name="command"
            className={`
              flex-1 
              bg-transparent 
              border-none 
              outline-none 
              text-green-500 
              ml-2 
              ${isMobile ? 'text-xs' : 'text-sm sm:text-base'}
            `}
            autoComplete="off"
            autoFocus
          />
          <span 
            className={`
              h-3 w-1.5 
              bg-green-500 
              ml-0.5 
              ${cursorVisible ? 'opacity-100' : 'opacity-0'}
              ${isMobile ? 'h-2 w-1' : 'h-5 w-2.5'}
            `}
          ></span>
        </form>
      </div>
      
      {/* Footer info */}
      <div 
        className={`
          mt-4 
          border-t 
          border-green-900 
          pt-2 
          text-green-700 
          ${isMobile ? 'text-xs' : 'text-xs'}
        `}
      >
        {isMobile ? 'MEMORY: 640K | ESC TO RETURN' : 'MEMORY: 640K OK | PRESS [ESC] TO RETURN | SYS-REF: VT-25/CL'}
      </div>
    </div>
  );
};

export default RetroTerminal;
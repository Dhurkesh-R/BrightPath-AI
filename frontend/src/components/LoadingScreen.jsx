import React, { useState, useEffect } from 'react';

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Artificial progress bar logic
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 30) return prev + 1;    // Fast start
        if (prev < 80) return prev + 0.5;  // Slow middle
        if (prev < 95) return prev + 0.1;  // Crawl near the end
        return prev;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-white">
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="relative z-10 flex flex-col items-center max-w-md px-6 text-center">
        {/* Animated Icon */}
        <div className="mb-8 relative">
          <div className="w-20 h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <span className="text-2xl">⚡</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2 tracking-tight">
          Waking up BrightPath AI
        </h1>
        <p className="text-slate-400 mb-8 text-sm leading-relaxed">
          We use eco-friendly servers that sleep when not in use. 
          Hang tight while we power things up for you...
        </p>

        {/* Progress Bar Container */}
        <div className="w-full bg-slate-800 rounded-full h-2 mb-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between w-full text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
          <span>Initializing</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
      
      {/* Subtle Footer Quote */}
      <div className="absolute bottom-10 text-slate-500 text-xs italic">
        "Great things take a few seconds to load."
      </div>
    </div>
  );
};

export default LoadingScreen;

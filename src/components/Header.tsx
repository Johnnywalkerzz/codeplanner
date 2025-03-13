'use client';

import { useState, useEffect } from 'react';
import { FaMoon, FaSun, FaCode, FaGithub } from 'react-icons/fa';

const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if mobile on mount and window resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    // Initial check
    checkIfMobile();
    
    // Listen for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  // Handle theme toggle
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    // Apply dark mode to document
    if (newMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('bg-slate-950');
      document.body.classList.remove('bg-slate-100');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('bg-slate-950');
      document.body.classList.add('bg-slate-100');
    }
    
    // Save preference
    try {
      localStorage.setItem('darkMode', newMode ? 'dark' : 'light');
    } catch (e) {
      console.error('Failed to save theme preference:', e);
    }
  };
  
  // Apply saved theme preference on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('darkMode');
      if (savedTheme) {
        const prefersDark = savedTheme === 'dark';
        setIsDarkMode(prefersDark);
        
        if (prefersDark) {
          document.documentElement.classList.add('dark');
          document.body.classList.add('bg-slate-950');
          document.body.classList.remove('bg-slate-100');
        } else {
          document.documentElement.classList.remove('dark');
          document.body.classList.remove('bg-slate-950');
          document.body.classList.add('bg-slate-100');
        }
      }
    } catch (e) {
      console.error('Failed to load theme preference:', e);
    }
  }, []);
  
  // Toggle code generation panel
  const handleGenerateCode = () => {
    try {
      const event = new CustomEvent('toggleCodeGeneration', {
        detail: { action: 'show' }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error dispatching event:', error);
    }
  };

  return (
    <header className="flex justify-between items-center py-4 mb-8 border-b border-slate-800 dark:border-slate-800 border-opacity-50 flex-wrap gap-4">
      <div className="flex items-center">
        <FaCode className="text-indigo-500 text-2xl mr-2" />
        <h1 className="text-xl sm:text-2xl font-bold text-white dark:text-white">
          <span className="text-indigo-400">Code</span>Planner
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={handleGenerateCode}
          className="btn btn-primary text-sm sm:text-base py-1 px-3 sm:py-2 sm:px-4"
        >
          Generate Code
        </button>
        
        <a 
          href="https://github.com/Johnnywalkerzz/codeplanner" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-slate-400 hover:text-indigo-400 transition-colors"
          aria-label="GitHub Repository"
        >
          <FaGithub className="text-xl" />
        </a>
        
        <button
          onClick={toggleDarkMode}
          className="text-slate-400 hover:text-indigo-400 transition-colors p-2 rounded-full hover:bg-slate-800"
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>
    </header>
  );
};

export default Header;
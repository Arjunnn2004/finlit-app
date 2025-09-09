import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';

export default function SettingsPanel() {
  const { theme, currentTheme, currentFont, fonts, toggleTheme, changeFont } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg ${theme.cardBg} ${theme.border} border ${theme.shadow} hover:scale-105 transition-all duration-200`}
        title="Settings"
      >
        <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${theme.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className={`absolute right-0 top-12 w-72 sm:w-80 ${theme.cardBg} ${theme.border} border ${theme.shadow} rounded-xl p-4 sm:p-6 z-50 transition-all duration-200 max-h-[80vh] overflow-y-auto`}>
            <h3 className={`text-base sm:text-lg font-semibold ${theme.text} mb-3 sm:mb-4`}>Settings</h3>
            
            {/* Theme Toggle */}
            <div className="mb-4 sm:mb-6">
              <label className={`block text-sm font-medium ${theme.text} mb-2 sm:mb-3`}>
                Theme
              </label>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={toggleTheme}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border transition-all duration-200 text-sm ${
                    currentTheme === 'light' 
                      ? `${theme.accent} text-white border-transparent` 
                      : `${theme.cardBg} ${theme.text} ${theme.border} hover:bg-gray-50 dark:hover:bg-gray-700`
                  }`}
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="text-xs sm:text-sm">Light</span>
                </button>
                <button
                  onClick={toggleTheme}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border transition-all duration-200 text-sm ${
                    currentTheme === 'dark' 
                      ? `${theme.accent} text-white border-transparent` 
                      : `${theme.cardBg} ${theme.text} ${theme.border} hover:bg-gray-50 dark:hover:bg-gray-700`
                  }`}
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <span className="text-xs sm:text-sm">Dark</span>
                </button>
              </div>
            </div>

            {/* Font Selection */}
            <div>
              <label className={`block text-sm font-medium ${theme.text} mb-2 sm:mb-3`}>
                Font Family
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(fonts).map(([key, font]) => (
                  <button
                    key={key}
                    onClick={() => changeFont(key)}
                    className={`p-2 sm:p-3 rounded-lg border text-left transition-all duration-200 text-sm ${
                      currentFont === key 
                        ? `${theme.accent} text-white border-transparent` 
                        : `${theme.cardBg} ${theme.text} ${theme.border} hover:bg-gray-50 dark:hover:bg-gray-700`
                    }`}
                    style={{ fontFamily: font.name }}
                  >
                    <div className="font-medium text-sm">{font.name}</div>
                    <div className="text-xs opacity-75 mt-1">Aa Bb Cc</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className={`mt-6 w-full py-2 ${theme.text} ${theme.border} border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200`}
            >
              Close
            </button>
          </div>
        </>
      )}
    </div>
  );
}

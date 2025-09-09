import React, { useState, useEffect } from 'react';
import { ThemeContext } from './ThemeContextBase';

const themes = {
  light: {
    name: 'light',
    bg: 'bg-gray-50',
    cardBg: 'bg-white',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    border: 'border-gray-200',
    shadow: 'shadow-md',
    accent: 'bg-blue-600',
    accentHover: 'hover:bg-blue-700',
    nav: 'bg-white',
    navShadow: 'shadow-sm'
  },
  dark: {
    name: 'dark',
    bg: 'bg-gray-900',
    cardBg: 'bg-gray-800',
    text: 'text-gray-100',
    textSecondary: 'text-gray-300',
    border: 'border-gray-700',
    shadow: 'shadow-xl',
    accent: 'bg-blue-500',
    accentHover: 'hover:bg-blue-600',
    nav: 'bg-gray-800',
    navShadow: 'shadow-lg'
  }
};

const fonts = {
  inter: { name: 'Inter', class: 'font-inter' },
  roboto: { name: 'Roboto', class: 'font-roboto' },
  poppins: { name: 'Poppins', class: 'font-poppins' },
  system: { name: 'System', class: 'font-sans' }
};

export default function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState('light');
  const [currentFont, setCurrentFont] = useState('inter');

  // Load saved preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem('finlit-theme') || 'light';
    const savedFont = localStorage.getItem('finlit-font') || 'inter';
    setCurrentTheme(savedTheme);
    setCurrentFont(savedFont);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('finlit-theme', currentTheme);
  }, [currentTheme]);

  // Apply font to document
  useEffect(() => {
    document.documentElement.className = document.documentElement.className
      .replace(/font-\w+/g, '')
      .concat(` ${fonts[currentFont].class}`);
    localStorage.setItem('finlit-font', currentFont);
  }, [currentFont]);

  const toggleTheme = () => {
    setCurrentTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const changeFont = (fontKey) => {
    setCurrentFont(fontKey);
  };

  const value = {
    theme: themes[currentTheme],
    currentTheme,
    currentFont,
    fonts,
    toggleTheme,
    changeFont
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

import React from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useTheme } from '../hooks/useTheme';
import SettingsPanel from './SettingsPanel';

export default function TopNav(){
  const auth = getAuth();
  const user = auth.currentUser;
  const { theme } = useTheme();
  
  const logout = async () => { 
    await signOut(auth); 
    // Navigation will happen automatically via onAuthStateChanged in App.jsx
  }
  
  return (
    <div className={`${theme.nav} ${theme.navShadow} border-b ${theme.border}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className={`text-xl sm:text-2xl font-bold ${theme.accent.replace('bg-', 'text-')} flex items-center gap-1 sm:gap-2`}>
            <span className="text-2xl sm:text-3xl">🎮</span>
            <span className="hidden xs:inline">FinLit Quest</span>
            <span className="xs:hidden">FinLit</span>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
            <span>⚡</span>
            <span>Gamified Finance</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          {user && (
            <>
              {/* User Level Display */}
              <div className="hidden sm:flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 sm:px-3 py-1 sm:py-2 rounded-full">
                <span className="text-xs sm:text-sm">🏆</span>
                <span className="text-xs sm:text-sm font-bold">Level 1</span>
              </div>
              
              {/* Mobile Level Display (Compact) */}
              <div className="sm:hidden bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full">
                <span className="text-xs font-bold">L1</span>
              </div>
              
              {/* User Info */}
              <div className="flex items-center gap-2 sm:gap-3">
                {user.photoURL ? (
                  <div className="relative">
                    <img 
                      src={user.photoURL} 
                      alt="Profile" 
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-yellow-400"
                    />
                    <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-xs">✓</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                    {user.displayName?.[0] || user.email?.[0] || '?'}
                  </div>
                )}
                <div className="hidden sm:block">
                  <div className={`text-sm font-medium ${theme.text}`}>
                    {user.displayName || 'Player'}
                  </div>
                  <div className={`text-xs ${theme.textSecondary} flex items-center gap-1`}>
                    <span>🪙</span>
                    <span>100 coins</span>
                  </div>
                </div>
                
                {/* Mobile Coins Display */}
                <div className="sm:hidden">
                  <div className={`text-xs ${theme.textSecondary} flex items-center gap-1`}>
                    <span>🪙</span>
                    <span>100</span>
                  </div>
                </div>
              </div>
            </>
          )}
          
          <SettingsPanel />
          
          <button 
            onClick={logout} 
            className={`text-xs sm:text-sm ${theme.textSecondary} hover:${theme.text} px-2 sm:px-4 py-2 rounded-lg hover:${theme.cardBg} transition-all duration-200 border ${theme.border} flex items-center gap-1 sm:gap-2 hover:scale-105`}
          >
            <span>🚪</span>
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

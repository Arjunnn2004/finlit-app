import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useTheme } from '../hooks/useTheme';

export default function Login(){
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { theme } = useTheme();

  const login = async () => {
    setLoading(true);
    setError('');
    
    try {
      const provider = new GoogleAuthProvider();
      // Add additional scopes if needed
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(auth, provider);
      console.log('Sign-in successful:', result.user);
      // Navigation will happen automatically via onAuthStateChanged in App.jsx
    } catch (err) {
      console.error('Login error:', err);
      
      // Provide specific error messages
      if (err.code === 'auth/configuration-not-found') {
        setError('Google Sign-In is not configured. Please enable Google authentication in Firebase Console.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled. Please try again.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Pop-up was blocked by your browser. Please allow pop-ups for this site.');
      } else {
        setError(err.message || 'Failed to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${theme.bg} px-4 sm:px-6 lg:px-8`} style={{
      backgroundImage: `
        radial-gradient(circle at 20% 20%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(120, 198, 121, 0.3) 0%, transparent 50%)
      `
    }}>
      <div className={`w-full max-w-md p-6 sm:p-8 ${theme.cardBg} rounded-2xl ${theme.shadow} border ${theme.border} backdrop-blur-sm bg-opacity-95`}>
        {/* Gamified Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="text-5xl sm:text-6xl mb-4">🎮</div>
          <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${theme.text} bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
            FinLit Quest
          </h1>
          <p className={`${theme.textSecondary} text-base sm:text-lg`}>
            Your Financial Adventure Awaits!
          </p>
          
          {/* Feature Highlights */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4 sm:mt-6">
            <div className={`${theme.cardBg} p-2 sm:p-3 rounded-lg border ${theme.border}`}>
              <div className="text-xl sm:text-2xl mb-1">🏆</div>
              <div className={`text-xs ${theme.textSecondary}`}>Earn XP</div>
            </div>
            <div className={`${theme.cardBg} p-2 sm:p-3 rounded-lg border ${theme.border}`}>
              <div className="text-xl sm:text-2xl mb-1">🎯</div>
              <div className={`text-xs ${theme.textSecondary}`}>Achievements</div>
            </div>
            <div className={`${theme.cardBg} p-2 sm:p-3 rounded-lg border ${theme.border}`}>
              <div className="text-xl sm:text-2xl mb-1">🪙</div>
              <div className={`text-xs ${theme.textSecondary}`}>Collect Coins</div>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="text-center mb-6 sm:mb-8">
          <h3 className={`text-lg sm:text-xl font-semibold ${theme.text} mb-2`}>
            Ready to Level Up Your Finances? 🚀
          </h3>
          <p className={`${theme.textSecondary} text-sm sm:text-base`}>
            Track expenses, unlock achievements, and master your money management skills!
          </p>
        </div>
        
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span className="text-sm sm:text-base">{error}</span>
          </div>
        )}
        
        {/* Enhanced Sign-in Button */}
        <button 
          onClick={login} 
          disabled={loading}
          className={`w-full py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl text-sm sm:text-base`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-lg">🎮</span>
              Starting Quest...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-lg">🚀</span>
              Start Your Financial Quest
              <span className="text-lg">🎯</span>
            </>
          )}
        </button>
        
        {/* Benefits Section */}
        <div className="mt-8 space-y-3">
          <h4 className={`text-center font-semibold ${theme.text} mb-4`}>
            What Awaits You Inside? ✨
          </h4>
          
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
              <span className="text-2xl">📊</span>
              <div>
                <div className={`text-sm font-medium ${theme.text}`}>Smart Expense Tracking</div>
                <div className={`text-xs ${theme.textSecondary}`}>Categorize and visualize your spending</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
              <span className="text-2xl">🎮</span>
              <div>
                <div className={`text-sm font-medium ${theme.text}`}>Gamified Experience</div>
                <div className={`text-xs ${theme.textSecondary}`}>Earn XP, unlock achievements, collect coins</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
              <span className="text-2xl">📈</span>
              <div>
                <div className={`text-sm font-medium ${theme.text}`}>Real-time Analytics</div>
                <div className={`text-xs ${theme.textSecondary}`}>Interactive charts and insights</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Fun Footer */}
        <div className="mt-8 text-center">
          <p className={`text-xs ${theme.textSecondary} mb-2`}>
            Join thousands of players already mastering their finances! 🌟
          </p>
          <div className="flex justify-center items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <span>👥</span>
              <span className={theme.textSecondary}>Active Community</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🔒</span>
              <span className={theme.textSecondary}>Secure & Private</span>
            </div>
          </div>
        </div>
        
        {error && error.includes('configuration-not-found') && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded">
            <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">Setup Required:</p>
            <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
              1. Go to Firebase Console → Authentication → Sign-in method<br/>
              2. Enable Google provider<br/>
              3. Add localhost to authorized domains
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

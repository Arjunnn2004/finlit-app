import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import ExpenseForm from '../components/ExpenseForm';
import EnhancedCoinsView from '../components/CoinsView';
import LeaderBoard from '../components/LeaderBoard';
import AdvancedChartView from '../components/AdvancedChartView';
import ErrorBoundary from '../components/ErrorBoundary';
import TopNav from '../components/TopNav';
import GameStats from '../components/GameStats';
import FinancialGames from '../components/FinancialGames';

export default function Dashboard(){
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'games', label: 'Games', icon: '🎮' },
    { id: 'leaderboard', label: 'Rankings', icon: '🏆' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
            {/* Main Content */}
            <div className="xl:col-span-3 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Expense Form */}
                <div className={`${theme.cardBg} p-4 sm:p-6 rounded-xl ${theme.shadow} border ${theme.border} transition-all duration-200 hover:shadow-xl hover:scale-[1.02]`}>
                  <ExpenseForm/>
                </div>
                
                {/* Game Stats */}
                <div className={`${theme.cardBg} p-4 sm:p-6 rounded-xl ${theme.shadow} border ${theme.border} transition-all duration-200 hover:shadow-xl hover:scale-[1.02]`}>
                  <GameStats/>
                </div>
              </div>
              
              {/* Quick Analytics Overview */}
              <div className={`${theme.cardBg} p-4 sm:p-6 rounded-xl ${theme.shadow} border ${theme.border} transition-all duration-200 hover:shadow-xl hover:scale-[1.02]`}>
                <h3 className={`${theme.text} text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2`}>
                  <span>📊</span>
                  Quick Analytics
                </h3>
                <p className={`${theme.textSecondary} mb-4 text-sm sm:text-base`}>
                  View detailed analytics and ML insights in the Analytics tab.
                </p>
                <button 
                  onClick={() => setActiveTab('analytics')}
                  className={`${theme.accent} text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm sm:text-base`}
                >
                  View Full Analytics
                </button>
              </div>
            </div>
            
            {/* Sidebar - Stack on mobile, side on desktop */}
            <aside className="space-y-4 sm:space-y-6 xl:mt-0 mt-6">
              <div className={`${theme.cardBg} p-4 sm:p-6 rounded-xl ${theme.shadow} border ${theme.border} transition-all duration-200 hover:shadow-xl hover:scale-[1.02]`}>
                <EnhancedCoinsView/>
              </div>
              <div className={`${theme.cardBg} p-4 sm:p-6 rounded-xl ${theme.shadow} border ${theme.border} transition-all duration-200 hover:shadow-xl hover:scale-[1.02]`}>
                <LeaderBoard/>
              </div>
            </aside>
          </div>
        );
      
      case 'analytics':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center">
              <h2 className={`${theme.text} text-2xl sm:text-3xl font-bold mb-4`}>📈 Advanced Analytics</h2>
              <p className={`${theme.textSecondary} text-base sm:text-lg px-4`}>
                ML-powered insights, predictions, and detailed spending analysis
              </p>
            </div>
                      {activeTab === 'analytics' && (
            <ErrorBoundary>
              <AdvancedChartView />
            </ErrorBoundary>
          )}
          </div>
        );
      
      case 'games':
        return <FinancialGames />;
      
      case 'leaderboard':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center">
              <h2 className={`${theme.text} text-2xl sm:text-3xl font-bold mb-4`}>🏆 Leaderboards</h2>
              <p className={`${theme.textSecondary} text-base sm:text-lg px-4`}>
                See how you rank against other players in the financial fitness challenge!
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Main Leaderboard */}
              <div className={`${theme.cardBg} p-4 sm:p-6 rounded-xl ${theme.shadow} border ${theme.border}`}>
                <LeaderBoard/>
              </div>
              
              {/* Leaderboard Stats */}
              <div className={`${theme.cardBg} p-4 sm:p-6 rounded-xl ${theme.shadow} border ${theme.border}`}>
                <h3 className={`${theme.text} text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2`}>
                  <span>📊</span>
                  Your Ranking Stats
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center">
                    <span className={`${theme.textSecondary} text-sm sm:text-base`}>Current Rank</span>
                    <span className={`${theme.text} font-bold text-sm sm:text-base`}>#? of ?</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`${theme.textSecondary} text-sm sm:text-base`}>Coins</span>
                    <span className={`text-yellow-500 font-bold text-sm sm:text-base`}>0 🪙</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`${theme.textSecondary} text-sm sm:text-base`}>Level</span>
                    <span className={`${theme.text} font-bold text-sm sm:text-base`}>1</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`${theme.textSecondary} text-sm sm:text-base`}>Achievements</span>
                    <span className={`${theme.text} font-bold text-sm sm:text-base`}>0</span>
                  </div>
                </div>
                
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg">
                  <h4 className={`${theme.text} font-semibold mb-2 text-sm sm:text-base`}>💡 Ranking Tips</h4>
                  <ul className={`${theme.textSecondary} text-xs sm:text-sm space-y-1`}>
                    <li>• Log expenses daily to earn coins</li>
                    <li>• Play games to boost your score</li>
                    <li>• Unlock achievements for bonus points</li>
                    <li>• Maintain healthy spending habits</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className={`min-h-screen ${theme.bg}`}>
      <TopNav/>
      
      {/* Tab Navigation */}
      <div className={`${theme.nav} border-b ${theme.border}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Desktop Tab Navigation */}
          <div className="hidden sm:flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? `border-blue-500 text-blue-600 dark:text-blue-400`
                    : `border-transparent ${theme.textSecondary} hover:${theme.text} hover:border-gray-300`
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Mobile Tab Navigation - Horizontal Scroll */}
          <div className="sm:hidden overflow-x-auto">
            <div className="flex space-x-6 py-2 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-4 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center gap-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? `border-blue-500 text-blue-600 dark:text-blue-400`
                      : `border-transparent ${theme.textSecondary} hover:${theme.text} hover:border-gray-300`
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="text-xs">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {renderTabContent()}
      </div>
    </div>
  )
}

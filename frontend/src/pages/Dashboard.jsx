import React from 'react';
import { useTheme } from '../hooks/useTheme';
import ExpenseForm from '../components/ExpenseForm';
import CoinsView from '../components/CoinsView';
import LeaderBoard from '../components/LeaderBoard';
import ChartView from '../components/ChartView';
import TopNav from '../components/TopNav';
import GameStats from '../components/GameStats';

export default function Dashboard(){
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen ${theme.bg}`}>
      <TopNav/>
      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-3 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expense Form */}
            <div className={`${theme.cardBg} p-6 rounded-xl ${theme.shadow} border ${theme.border} transition-all duration-200 hover:shadow-xl hover:scale-[1.02]`}>
              <ExpenseForm/>
            </div>
            
            {/* Game Stats */}
            <div className={`${theme.cardBg} p-6 rounded-xl ${theme.shadow} border ${theme.border} transition-all duration-200 hover:shadow-xl hover:scale-[1.02]`}>
              <GameStats/>
            </div>
          </div>
          
          {/* Chart View */}
          <div className={`${theme.cardBg} p-6 rounded-xl ${theme.shadow} border ${theme.border} transition-all duration-200 hover:shadow-xl hover:scale-[1.02]`}>
            <ChartView/>
          </div>
        </div>
        
        {/* Sidebar */}
        <aside className="space-y-6">
          <div className={`${theme.cardBg} p-6 rounded-xl ${theme.shadow} border ${theme.border} transition-all duration-200 hover:shadow-xl hover:scale-[1.02]`}>
            <CoinsView/>
          </div>
          <div className={`${theme.cardBg} p-6 rounded-xl ${theme.shadow} border ${theme.border} transition-all duration-200 hover:shadow-xl hover:scale-[1.02]`}>
            <LeaderBoard/>
          </div>
        </aside>
      </div>
    </div>
  )
}

import React, { useEffect, useState } from 'react';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { useTheme } from '../hooks/useTheme';

export default function EnhancedCoinsView() {
  const [coins, setCoins] = useState(0);
  const [coinHistory, setCoinHistory] = useState([]);
  const [dailyEarnings, setDailyEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const { theme } = useTheme();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    // Listen to user stats for coin updates
    const userStatsUnsubscribe = onSnapshot(doc(db, 'userStats', user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setCoins(data.coins || 0);
      } else {
        setCoins(0);
      }
      setLoading(false);
    });

    // Load coin history
    const loadCoinHistory = async () => {
      try {
        const coinHistoryRef = doc(db, 'coinHistory', user.uid);
        const coinHistorySnap = await getDoc(coinHistoryRef);
        
        if (coinHistorySnap.exists()) {
          const history = coinHistorySnap.data().transactions || [];
          setCoinHistory(history.slice(-10)); // Last 10 transactions
          
          // Calculate today's earnings
          const today = new Date().toDateString();
          const todayEarnings = history
            .filter(t => new Date(t.timestamp.toDate()).toDateString() === today)
            .reduce((sum, t) => sum + t.amount, 0);
          setDailyEarnings(todayEarnings);
        }
      } catch (error) {
        console.error('Error loading coin history:', error);
      }
    };

    loadCoinHistory();

    return () => {
      userStatsUnsubscribe();
    };
  }, [auth.currentUser]);

  const getCoinChangeIcon = (amount) => {
    if (amount > 0) return '⬆️';
    if (amount < 0) return '⬇️';
    return '➡️';
  };

  const getCoinChangeColor = (amount) => {
    if (amount > 0) return 'text-green-500';
    if (amount < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const formatCoinReason = (reason) => {
    const reasons = {
      'expense_logged': 'Expense Logged',
      'achievement_unlocked': 'Achievement Unlocked',
      'game_completed': 'Game Completed',
      'daily_bonus': 'Daily Bonus',
      'streak_bonus': 'Streak Bonus',
      'ml_reward': 'Smart Spending',
      'ml_penalty': 'Spending Warning',
      'category_bonus': 'Category Bonus'
    };
    return reasons[reason] || reason;
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className={`h-6 ${theme.cardBg} rounded mb-2`}></div>
        <div className={`h-8 ${theme.cardBg} rounded`}></div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Main Coin Display */}
      <div className={`${theme.cardBg} p-4 sm:p-6 rounded-xl border ${theme.border} text-center relative overflow-hidden`}>
        {/* Background Animation */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-100/20 to-orange-100/20 dark:from-yellow-900/20 dark:to-orange-900/20"></div>
        
        <div className="relative z-10">
          <div className="text-3xl sm:text-4xl mb-2">🪙</div>
          <h3 className={`${theme.text} text-base sm:text-lg font-semibold mb-2`}>Your Coins</h3>
          <div className={`text-2xl sm:text-3xl font-bold text-yellow-500 mb-2`}>
            {coins.toLocaleString()}
          </div>
          
          {dailyEarnings !== 0 && (
            <div className={`text-xs sm:text-sm ${getCoinChangeColor(dailyEarnings)} flex items-center justify-center gap-1`}>
              <span>{getCoinChangeIcon(dailyEarnings)}</span>
              <span>{dailyEarnings > 0 ? '+' : ''}{dailyEarnings} today</span>
            </div>
          )}
        </div>
      </div>

      {/* Coin Level Progress */}
      <div className={`${theme.cardBg} p-4 rounded-lg border ${theme.border}`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`${theme.text} text-sm font-medium`}>Coin Level</span>
          <span className={`${theme.textSecondary} text-sm`}>
            {Math.floor(coins / 100)} / {Math.floor(coins / 100) + 1}
          </span>
        </div>
        <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2`}>
          <div 
            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(coins % 100)}%` }}
          ></div>
        </div>
        <p className={`${theme.textSecondary} text-xs mt-1`}>
          {100 - (coins % 100)} coins to next level
        </p>
      </div>

      {/* Recent Coin Activity */}
      {coinHistory.length > 0 && (
        <div className={`${theme.cardBg} p-4 rounded-lg border ${theme.border}`}>
          <h4 className={`${theme.text} font-semibold mb-3 flex items-center gap-2`}>
            <span>📋</span>
            Recent Activity
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {coinHistory.map((transaction, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{getCoinChangeIcon(transaction.amount)}</span>
                  <div>
                    <p className={`${theme.text} text-sm font-medium`}>
                      {formatCoinReason(transaction.reason)}
                    </p>
                    <p className={`${theme.textSecondary} text-xs`}>
                      {new Date(transaction.timestamp.toDate()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className={`text-sm font-bold ${getCoinChangeColor(transaction.amount)}`}>
                  {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coin Earning Tips */}
      <div className={`${theme.cardBg} p-4 rounded-lg border ${theme.border}`}>
        <h4 className={`${theme.text} font-semibold mb-3 flex items-center gap-2`}>
          <span>💡</span>
          Earn More Coins
        </h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-500">✅</span>
            <span className={theme.textSecondary}>Log daily expenses (+2-10 coins)</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-blue-500">🎮</span>
            <span className={theme.textSecondary}>Play financial games (+20-100 coins)</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-purple-500">🏆</span>
            <span className={theme.textSecondary}>Unlock achievements (+50 coins)</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-yellow-500">🤖</span>
            <span className={theme.textSecondary}>Smart spending habits (ML bonus)</span>
          </div>
        </div>
      </div>

      {/* Milestone Rewards */}
      <div className={`${theme.cardBg} p-4 rounded-lg border ${theme.border}`}>
        <h4 className={`${theme.text} font-semibold mb-3 flex items-center gap-2`}>
          <span>🎯</span>
          Next Milestones
        </h4>
        <div className="space-y-3">
          {[
            { milestone: 500, reward: 'Bronze Badge', unlocked: coins >= 500 },
            { milestone: 1000, reward: 'Silver Badge', unlocked: coins >= 1000 },
            { milestone: 2500, reward: 'Gold Badge', unlocked: coins >= 2500 },
            { milestone: 5000, reward: 'Platinum Badge', unlocked: coins >= 5000 }
          ].map((item, index) => (
            <div key={index} className={`flex items-center justify-between p-2 rounded ${item.unlocked ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-50 dark:bg-gray-800'}`}>
              <div className="flex items-center gap-2">
                <span className={item.unlocked ? 'text-green-500' : 'text-gray-400'}>
                  {item.unlocked ? '🏆' : '🔒'}
                </span>
                <span className={`text-sm ${item.unlocked ? 'text-green-700 dark:text-green-300' : theme.textSecondary}`}>
                  {item.milestone} coins - {item.reward}
                </span>
              </div>
              {item.unlocked && (
                <span className="text-green-500 text-sm font-bold">✓</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

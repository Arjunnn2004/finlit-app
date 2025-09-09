import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useTheme } from '../hooks/useTheme';

export default function GameStats() {
  const { theme } = useTheme();
  const auth = getAuth();
  const [userStats, setUserStats] = useState({
    level: 1,
    experience: 0,
    expenseCount: 0,
    totalSaved: 0,
    coins: 100,
    badges: []
  });
  const [loading, setLoading] = useState(true);
  const [recentAchievement, setRecentAchievement] = useState(null);

  // Simple level calculation functions
  const getLevel = (exp) => Math.floor(exp / 100) + 1;
  const getCurrentLevelExp = (exp) => exp % 100;
  const progressPercentage = (getCurrentLevelExp(userStats.experience) / 100) * 100;

  // Achievement definitions (memoized to prevent dependency changes)
  const achievements = useMemo(() => [
    { id: 'first_expense', name: 'First Step', desc: 'Log your first expense', icon: '🎯' },
    { id: 'expense_5', name: 'Getting Started', desc: 'Log 5 expenses', icon: '📝' },
    { id: 'expense_25', name: 'Habit Builder', desc: 'Log 25 expenses', icon: '🔥' },
    { id: 'expense_100', name: 'Expert Tracker', desc: 'Log 100 expenses', icon: '👑' },
    { id: 'streak_7', name: 'Week Warrior', desc: '7-day logging streak', icon: '⚡' },
    { id: 'streak_30', name: 'Month Master', desc: '30-day logging streak', icon: '🏆' },
    { id: 'saver_100', name: 'Smart Saver', desc: 'Save $100 in a month', icon: '💰' },
    { id: 'category_master', name: 'Category Master', desc: 'Use all expense categories', icon: '🌟' }
  ], []);

  // Load user stats from Firebase
  useEffect(() => {
    const loadUserStats = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userStatsRef = doc(db, 'userStats', user.uid);
        const userStatsSnap = await getDoc(userStatsRef);
        
        if (userStatsSnap.exists()) {
          const stats = userStatsSnap.data();
          setUserStats({
            level: getLevel(stats.experience || 0),
            experience: stats.experience || 0,
            expenseCount: stats.expenseCount || 0,
            totalSaved: stats.totalSaved || 0,
            coins: stats.coins || 100,
            badges: stats.badges || []
          });
        } else {
          // Initialize new user stats
          const initialStats = {
            experience: 0,
            expenseCount: 0,
            totalSaved: 0,
            coins: 100,
            badges: [],
            lastActivity: new Date().toDateString()
          };
          await setDoc(userStatsRef, initialStats);
          setUserStats({
            ...initialStats,
            level: 1
          });
        }
      } catch (error) {
        console.error('Error loading user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserStats();
  }, [auth.currentUser]);

  // Simple achievement checking function
  const checkSimpleAchievements = useCallback(async (stats) => {
    const user = auth.currentUser;
    if (!user) return;

    const newBadges = [...stats.badges];
    let hasNewAchievement = false;

    // Check first expense achievement
    if (stats.expenseCount >= 1 && !newBadges.includes('first_expense')) {
      newBadges.push('first_expense');
      hasNewAchievement = true;
      setRecentAchievement(achievements.find(a => a.id === 'first_expense'));
    }

    // Check 5 expenses achievement
    if (stats.expenseCount >= 5 && !newBadges.includes('expense_5')) {
      newBadges.push('expense_5');
      hasNewAchievement = true;
      setRecentAchievement(achievements.find(a => a.id === 'expense_5'));
    }

    // Check savings achievement
    if (stats.totalSaved >= 100 && !newBadges.includes('saver_100')) {
      newBadges.push('saver_100');
      hasNewAchievement = true;
      setRecentAchievement(achievements.find(a => a.id === 'saver_100'));
    }

    if (hasNewAchievement) {
      // Update user stats in Firebase
      try {
        const userStatsRef = doc(db, 'userStats', user.uid);
        await updateDoc(userStatsRef, {
          badges: newBadges,
          experience: stats.experience + (newBadges.length - stats.badges.length) * 10, // 10 XP per achievement
          coins: stats.coins + (newBadges.length - stats.badges.length) * 50 // 50 coins per achievement
        });
        
        // Update local state
        setUserStats(prev => ({
          ...prev,
          badges: newBadges,
          experience: prev.experience + (newBadges.length - prev.badges.length) * 10,
          level: getLevel(prev.experience + (newBadges.length - prev.badges.length) * 10),
          coins: prev.coins + (newBadges.length - prev.badges.length) * 50
        }));

        // Hide achievement notification after 3 seconds
        setTimeout(() => setRecentAchievement(null), 3000);
      } catch (error) {
        console.error('Error updating achievements:', error);
      }
    }
  }, [auth.currentUser, achievements]); // Add dependencies for useCallback

  // Track expenses in real-time for basic stats
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const expensesQuery = query(
      collection(db, 'expenses'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(expensesQuery, (snapshot) => {
      const expenses = snapshot.docs.map(doc => doc.data());
      const expenseCount = expenses.length;
      
      // Calculate total savings (assuming savings category contributes to savings)
      const totalSaved = expenses
        .filter(exp => exp.category === 'savings')
        .reduce((sum, exp) => sum + (exp.amount || 0), 0);

      // Update stats and check achievements
      setUserStats(prev => {
        const newStats = {
          ...prev,
          expenseCount,
          totalSaved
        };
        
        // Simple achievement checking
        checkSimpleAchievements(newStats);
        return newStats;
      });
    });

    return () => unsubscribe();
  }, [auth.currentUser, checkSimpleAchievements]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <svg className="animate-spin h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Level and XP Display */}
      <div className={`${theme.cardBg} p-4 rounded-lg border ${theme.border}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🎮</div>
            <div>
              <h3 className={`${theme.text} font-bold text-lg`}>Level {userStats.level}</h3>
              <p className={`${theme.textSecondary} text-sm`}>Expense Tracker Pro</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">🪙</span>
              <span className={`${theme.text} font-bold`}>{userStats.coins}</span>
            </div>
          </div>
        </div>
        
        {/* XP Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className={theme.textSecondary}>XP: {getCurrentLevelExp(userStats.experience)}/100</span>
            <span className={theme.textSecondary}>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`${theme.cardBg} p-3 rounded-lg border ${theme.border} text-center`}>
          <div className="text-2xl mb-1">📊</div>
          <div className={`${theme.text} font-bold text-lg`}>{userStats.expenseCount}</div>
          <div className={`${theme.textSecondary} text-xs`}>Expenses Logged</div>
        </div>
        <div className={`${theme.cardBg} p-3 rounded-lg border ${theme.border} text-center`}>
          <div className="text-2xl mb-1">💰</div>
          <div className={`${theme.text} font-bold text-lg`}>${userStats.totalSaved.toFixed(0)}</div>
          <div className={`${theme.textSecondary} text-xs`}>Total Saved</div>
        </div>
      </div>

      {/* Achievements Preview */}
      <div className={`${theme.cardBg} p-4 rounded-lg border ${theme.border}`}>
        <h4 className={`${theme.text} font-bold mb-3 flex items-center gap-2`}>
          <span>🏆</span> Achievements ({userStats.badges.length}/{achievements.length})
        </h4>
        <div className="grid grid-cols-4 gap-2">
          {achievements.map(achievement => {
            const earned = userStats.badges.includes(achievement.id);
            return (
              <div
                key={achievement.id}
                className={`p-2 rounded-lg text-center transition-all duration-200 ${
                  earned 
                    ? `${theme.cardBg} border-2 border-yellow-400 shadow-md` 
                    : `${theme.cardBg} border ${theme.border} opacity-50`
                }`}
                title={`${achievement.name}: ${achievement.desc}`}
              >
                <div className={`text-2xl ${earned ? '' : 'grayscale'}`}>
                  {achievement.icon}
                </div>
                <div className={`text-xs ${theme.textSecondary} mt-1`}>
                  {earned ? achievement.name : 'Locked'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievement Notification */}
      {recentAchievement && (
        <div className="fixed top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg shadow-lg animate-bounce z-50">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{recentAchievement.icon}</span>
            <div>
              <div className="font-bold">Achievement Unlocked!</div>
              <div className="text-sm">{recentAchievement.name}</div>
              <div className="text-xs opacity-90">{recentAchievement.desc}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

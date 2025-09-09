import React, {useEffect, useState} from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useTheme } from '../hooks/useTheme';

export default function Leaderboard(){
  const [rows, setRows] = useState([]);
  const { theme } = useTheme();
  
  useEffect(()=>{
    const q = query(collection(db,'users'), orderBy('coins','desc'), limit(10));
    const unsub = onSnapshot(q, snap => setRows(snap.docs.map(d=>({id:d.id, ...d.data()}))));
    return ()=>unsub();
  }, []);
  
  const getRankEmoji = (index) => {
    switch(index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '🏅';
    }
  };
  
  const getRankColor = (index) => {
    switch(index) {
      case 0: return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 1: return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 2: return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
      default: return `${theme.cardBg} ${theme.text}`;
    }
  };
  
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <h3 className={`${theme.text} text-lg sm:text-xl font-bold`}>🏆 Leaderboard</h3>
        <span className="text-xs sm:text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
          Top Players
        </span>
      </div>
      
      {rows.length === 0 ? (
        <div className={`text-center py-6 sm:py-8 ${theme.cardBg} rounded-xl border-2 border-dashed ${theme.border}`}>
          <div className="text-3xl sm:text-4xl mb-2">🎮</div>
          <p className={`${theme.textSecondary} text-sm sm:text-base`}>Be the first to join the leaderboard!</p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {rows.map((player, index) => (
            <div 
              key={player.id}
              className={`flex items-center justify-between p-3 sm:p-4 rounded-lg border transition-all duration-200 ${getRankColor(index)} ${index < 3 ? 'shadow-lg' : `border ${theme.border} hover:shadow-md`}`}
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="flex-shrink-0">
                  <span className="text-lg sm:text-xl">{getRankEmoji(index)}</span>
                </div>
                <div className="flex-shrink-0 text-sm sm:text-base font-bold">
                  #{index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm sm:text-base truncate">
                    {player.name || player.displayName || 'Anonymous Player'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <span className="text-base sm:text-lg">🪙</span>
                <span className="font-bold text-sm sm:text-base">
                  {(player.coins || 0).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {rows.length > 0 && (
        <div className={`text-center pt-3 sm:pt-4 border-t ${theme.border}`}>
          <p className={`${theme.textSecondary} text-xs sm:text-sm`}>
            🎯 Track expenses to climb the ranks!
          </p>
        </div>
      )}
    </div>
  );
}

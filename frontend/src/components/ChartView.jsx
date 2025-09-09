import React, {useEffect, useState} from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useTheme } from '../hooks/useTheme';

export default function ChartView(){
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const auth = getAuth();
  const { theme } = useTheme();
  
  useEffect(() => {
    const user = auth.currentUser;
    console.log('ChartView: Current user:', user); // Debug log
    
    if (!user) {
      console.log('ChartView: No user found');
      setLoading(false);
      return;
    }

    console.log('ChartView: Setting up query for user:', user.uid); // Debug log
    setLoading(true);
    setError('');

    try {
      // Temporary fix: Use simpler query while index is building
      const q = query(
        collection(db, 'expenses'), 
        where('userId', '==', user.uid)
        // Removed orderBy temporarily - will sort in JavaScript instead
      );
      
      const unsub = onSnapshot(q, 
        (snap) => {
          console.log('ChartView: Received', snap.docs.length, 'documents'); // Debug log
          
          const rows = snap.docs.map((d, index) => {
            const doc = d.data();
            const docId = d.id; // Get document ID for uniqueness
            console.log('ChartView: Processing document:', doc); // Debug log
            
            // Handle different timestamp formats
            let dateStr = '';
            let sortDate = new Date(); // For sorting
            let timeStr = ''; // For making entries unique
            
            if (doc.timestamp) {
              try {
                if (doc.timestamp.toDate) {
                  // Firestore Timestamp
                  const date = doc.timestamp.toDate();
                  dateStr = date.toLocaleDateString();
                  timeStr = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                  sortDate = date;
                } else if (doc.timestamp instanceof Date) {
                  // JavaScript Date
                  dateStr = doc.timestamp.toLocaleDateString();
                  timeStr = doc.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                  sortDate = doc.timestamp;
                } else {
                  // String or other format
                  const date = new Date(doc.timestamp);
                  dateStr = date.toLocaleDateString();
                  timeStr = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                  sortDate = date;
                }
              } catch (err) {
                console.error('Error parsing timestamp:', err);
                dateStr = `Entry ${index + 1}`;
                timeStr = '';
                sortDate = new Date(0); // Very old date for sorting
              }
            } else if (doc.createdAt) {
              // Use createdAt as fallback
              try {
                const date = new Date(doc.createdAt);
                dateStr = date.toLocaleDateString();
                timeStr = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                sortDate = date;
              } catch (error) {
                dateStr = doc.createdAt;
                timeStr = '';
                sortDate = new Date(doc.createdAt);
                console.warn('Error parsing createdAt:', error);
              }
            } else {
              dateStr = `Entry ${index + 1}`;
              timeStr = '';
              sortDate = new Date(0);
            }

            // Create unique display label
            const displayLabel = timeStr ? `${dateStr} ${timeStr}` : `${dateStr} #${index + 1}`;

            return { 
              id: docId, // Unique identifier
              ts: displayLabel, // Unique timestamp with time
              date: dateStr, // Just the date for grouping if needed
              time: timeStr, // Just the time
              amount: parseFloat(doc.amount) || 0,
              category: doc.category || 'unknown',
              description: doc.description || '',
              sortDate: sortDate, // For manual sorting
              index: index // For fallback uniqueness
            };
          });
          
          // Sort manually by date since we can't use orderBy in query
          const sortedRows = rows.sort((a, b) => a.sortDate - b.sortDate);
          
          console.log('ChartView: Processed and sorted data:', sortedRows); // Debug log
          setData(sortedRows);
          setLoading(false);
        },
        (err) => {
          console.error('ChartView: Error fetching expenses:', err);
          setError(`Error loading chart data: ${err.message}`);
          setLoading(false);
        }
      );
      
      return () => {
        console.log('ChartView: Cleaning up listener'); // Debug log
        unsub();
      };
    } catch (err) {
      console.error('ChartView: Error setting up query:', err);
      setError(`Error setting up chart: ${err.message}`);
      setLoading(false);
    }
  }, [auth.currentUser]);

  // Custom tooltip to show more information
  const CustomTooltip = ({ active, payload, label }) => {
    console.log('CustomTooltip props:', { active, payload, label }); // Debug log
    
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      console.log('Tooltip data point:', data); // Debug the specific data point
      
      return (
        <div className={`${theme.cardBg} p-3 border ${theme.border} rounded-lg ${theme.shadow}`}>
          <p className={`${theme.text} font-medium`}>{`Date: ${data.date || label}`}</p>
          {data.time && (
            <p className={`${theme.textSecondary} text-xs`}>{`Time: ${data.time}`}</p>
          )}
          <p className={`${theme.textSecondary}`}>{`Amount: $${data.amount}`}</p>
          <p className={`${theme.textSecondary}`}>{`Category: ${data.category}`}</p>
          {data.description && (
            <p className={`${theme.textSecondary} text-xs`}>{data.description}</p>
          )}
          <p className={`${theme.textSecondary} text-xs opacity-60`}>{`ID: ${data.id}`}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <div className={`${theme.text} flex items-center gap-2`}>
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading chart data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <div className={`${theme.text} text-center`}>
          <p className="text-red-600 mb-2">⚠️ {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <div className={`${theme.textSecondary} text-center`}>
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-lg mb-2">No expense data yet</p>
          <p className="text-sm">Add some expenses to see your spending chart!</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-semibold ${theme.text} flex items-center gap-3`}>
          <span className="text-2xl">📈</span>
          Expense Analytics Dashboard
        </h2>
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            🏆 Pro Insights
          </div>
        </div>
      </div>
      
      <div style={{width:'100%', height:300}}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis 
              dataKey="ts" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke="url(#colorGradient)" 
              strokeWidth={3}
              dot={{ r: 6, fill: '#3182ce', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 8, fill: '#fbbf24', strokeWidth: 3, stroke: '#fff' }}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3182ce" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Enhanced Stats Section */}
      <div className={`mt-6 grid grid-cols-1 md:grid-cols-3 gap-4`}>
        <div className={`${theme.cardBg} p-4 rounded-lg border ${theme.border} text-center bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20`}>
          <div className="text-3xl mb-2">📊</div>
          <div className={`${theme.text} font-bold text-xl`}>{data.length}</div>
          <div className={`${theme.textSecondary} text-sm`}>Total Tracked</div>
          <div className="text-green-600 text-xs mt-1">+{data.length * 10} XP Earned</div>
        </div>
        
        <div className={`${theme.cardBg} p-4 rounded-lg border ${theme.border} text-center bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20`}>
          <div className="text-3xl mb-2">💰</div>
          <div className={`${theme.text} font-bold text-xl`}>
            ${data.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
          </div>
          <div className={`${theme.textSecondary} text-sm`}>Total Spending</div>
          <div className="text-blue-600 text-xs mt-1">Financial Awareness +100%</div>
        </div>
        
        <div className={`${theme.cardBg} p-4 rounded-lg border ${theme.border} text-center bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20`}>
          <div className="text-3xl mb-2">🎯</div>
          <div className={`${theme.text} font-bold text-xl`}>
            {data.length > 0 ? (data.reduce((sum, item) => sum + item.amount, 0) / data.length).toFixed(2) : '0.00'}
          </div>
          <div className={`${theme.textSecondary} text-sm`}>Average Expense</div>
          <div className="text-purple-600 text-xs mt-1">Smart Tracking Bonus</div>
        </div>
      </div>
      
      <div className={`mt-4 text-center ${theme.textSecondary}`}>
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">⭐</span>
            <span>Interactive Charts</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-blue-500">📈</span>
            <span>Real-time Analytics</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-green-500">🎮</span>
            <span>Gamified Experience</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, {useState, useEffect} from 'react';
import { addDoc, collection, serverTimestamp, query, where, orderBy, limit, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { useTheme } from '../hooks/useTheme';

export default function ExpenseForm(){
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const auth = getAuth();
  const { theme } = useTheme();
  
  // Add a safety timeout for loading state
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        console.log('Loading timeout reached, resetting loading state');
        setLoading(false);
        alert('Request timed out. Please try again.');
      }, 10000); // 10 seconds timeout
      
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  // Fetch recent expenses for the current user
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoadingExpenses(false);
      return;
    }

    console.log('Fetching recent expenses for user:', user.uid);
    setLoadingExpenses(true);

    try {
      // Create query for recent expenses
      const expensesQuery = query(
        collection(db, 'expenses'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(10) // Show last 10 expenses
      );

      // Set up real-time listener
      const unsubscribe = onSnapshot(expensesQuery, (snapshot) => {
        const expenses = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('Fetched expenses:', expenses);
        setRecentExpenses(expenses);
        setLoadingExpenses(false);
      }, (error) => {
        console.error('Error fetching expenses:', error);
        setLoadingExpenses(false);
        // Fallback: try without orderBy for composite index issues
        const fallbackQuery = query(
          collection(db, 'expenses'),
          where('userId', '==', user.uid),
          limit(10)
        );
        
        onSnapshot(fallbackQuery, (snapshot) => {
          const expenses = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          // Sort manually by timestamp
          expenses.sort((a, b) => {
            const aTime = a.timestamp?.toDate?.() || new Date(a.createdAt || 0);
            const bTime = b.timestamp?.toDate?.() || new Date(b.createdAt || 0);
            return bTime - aTime;
          });
          console.log('Fetched expenses (fallback):', expenses);
          setRecentExpenses(expenses);
          setLoadingExpenses(false);
        });
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up expenses listener:', error);
      setLoadingExpenses(false);
    }
  }, [auth.currentUser]);

  // Delete expense function
  const deleteExpense = async (expenseId, expenseDescription) => {
    if (!window.confirm(`Are you sure you want to delete this expense: "${expenseDescription}"?`)) {
      return;
    }

    console.log('Deleting expense:', expenseId);
    setDeletingId(expenseId);

    try {
      await deleteDoc(doc(db, 'expenses', expenseId));
      console.log('Expense deleted successfully');
      // The real-time listener will automatically update the list
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert(`Failed to delete expense: ${error.message}`);
    } finally {
      setDeletingId(null);
    }
  };
  
  const addExpense = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    const user = auth.currentUser;
    if (!user) {
      alert('Please sign in first');
      return;
    }
    
    console.log('Starting to add expense...'); // Debug log
    setLoading(true);
    
    try {
      const expenseData = {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email,
        amount: parseFloat(amount),
        category,
        description: description.trim(),
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
      };
      
      console.log('Adding expense data:', expenseData); // Debug log
      
      const docRef = await addDoc(collection(db, 'expenses'), expenseData);
      
      console.log('Expense added successfully with ID:', docRef.id); // Debug log
      
      // Reset form on success
      setAmount('');
      setCategory('food');
      setDescription('');
      
      // Show success message
      alert('Expense added successfully!');
      
    } catch (error) {
      console.error('Error adding expense:', error);
      alert(`Failed to add expense: ${error.message}`);
    } finally {
      console.log('Setting loading to false'); // Debug log
      setLoading(false);
    }
  }
  
  return (
    <div>
      {/* Gamified Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-semibold ${theme.text} flex items-center gap-3`}>
          <span className="text-2xl">💸</span>
          Add Expense
          <span className="text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 rounded-full">
            +10 XP
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-yellow-500 text-lg">🎯</span>
          <span className={`${theme.textSecondary} text-sm`}>Track & Earn Rewards!</span>
        </div>
      </div>

      <form onSubmit={addExpense} className="space-y-4">
        <div>
          <label className={`block text-sm font-medium ${theme.text} mb-2 flex items-center gap-2`}>
            <span className="text-lg">💰</span>
            Amount
          </label>
          <input 
            type="number" 
            step="0.01" 
            value={amount} 
            onChange={e=>setAmount(e.target.value)}
            disabled={loading}
            className={`w-full p-3 border ${theme.border} rounded-lg ${theme.cardBg} ${theme.text} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
            placeholder="e.g. 12.50" 
            required 
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${theme.text} mb-2 flex items-center gap-2`}>
            <span className="text-lg">📝</span>
            Description (Optional)
            <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">+5 XP</span>
          </label>
          <input 
            type="text" 
            value={description} 
            onChange={e=>setDescription(e.target.value)}
            disabled={loading}
            className={`w-full p-3 border ${theme.border} rounded-lg ${theme.cardBg} ${theme.text} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
            placeholder="e.g. Lunch at restaurant" 
            maxLength={100}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${theme.text} mb-2 flex items-center gap-2`}>
            <span className="text-lg">🏷️</span>
            Category
          </label>
          <select 
            value={category} 
            onChange={e=>setCategory(e.target.value)}
            disabled={loading}
            className={`w-full p-3 border ${theme.border} rounded-lg ${theme.cardBg} ${theme.text} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <option value="food">🍕 Food & Dining</option>
            <option value="travel">✈️ Travel & Transport</option>
            <option value="entertainment">🎬 Entertainment & Fun</option>
            <option value="bills">📄 Bills & Utilities</option>
            <option value="savings">💰 Savings & Investment</option>
          </select>
        </div>
        
        {/* Gamified Submit Button */}
        <button 
          type="submit"
          disabled={loading}
          className={`w-full px-4 py-4 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-lg">⚡</span>
              Processing...
            </>
          ) : (
            <>
              <span className="text-lg">🚀</span>
              Track Expense & Earn XP
              <span className="text-lg">🎁</span>
            </>
          )}
        </button>
      </form>

      {/* Recent Expenses Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${theme.text} flex items-center gap-2`}>
            <span className="text-2xl">📊</span>
            Recent Adventures
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full">
              🎮 Track History
            </span>
          </div>
        </div>
        
        {loadingExpenses ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className={`${theme.textSecondary} text-sm`}>Loading your expense journey...</span>
            </div>
          </div>
        ) : recentExpenses.length === 0 ? (
          <div className={`text-center py-12 ${theme.cardBg} rounded-xl border-2 border-dashed ${theme.border}`}>
            <div className="text-6xl mb-4">🎯</div>
            <h4 className={`${theme.text} text-lg font-medium mb-2`}>Ready for Your First Quest?</h4>
            <p className={`${theme.textSecondary} mb-4`}>Start tracking expenses to unlock achievements and earn rewards!</p>
            <div className="flex justify-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span>⭐</span>
                <span className={theme.textSecondary}>Earn XP</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🏆</span>
                <span className={theme.textSecondary}>Unlock Badges</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🪙</span>
                <span className={theme.textSecondary}>Collect Coins</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">{recentExpenses.map((expense, index) => {
              const isDeleting = deletingId === expense.id;
              
              // Format date
              let dateDisplay = 'Unknown date';
              try {
                if (expense.timestamp?.toDate) {
                  dateDisplay = expense.timestamp.toDate().toLocaleDateString();
                } else if (expense.createdAt) {
                  dateDisplay = new Date(expense.createdAt).toLocaleDateString();
                }
              } catch (error) {
                console.warn('Error formatting date:', error);
              }

              // Enhanced category mapping with more visual elements
              const categoryData = {
                food: { emoji: '🍕', color: 'bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/40 dark:to-red-900/40', textColor: 'text-orange-700 dark:text-orange-200', name: 'Food & Dining', bgAccent: 'border-l-orange-500', shadow: 'shadow-orange-200 dark:shadow-orange-900/50' },
                travel: { emoji: '✈️', color: 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40', textColor: 'text-blue-700 dark:text-blue-200', name: 'Travel & Transport', bgAccent: 'border-l-blue-500', shadow: 'shadow-blue-200 dark:shadow-blue-900/50' },
                entertainment: { emoji: '🎬', color: 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/40 dark:to-pink-900/40', textColor: 'text-purple-700 dark:text-purple-200', name: 'Entertainment', bgAccent: 'border-l-purple-500', shadow: 'shadow-purple-200 dark:shadow-purple-900/50' },
                bills: { emoji: '📄', color: 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/40 dark:to-slate-800/40', textColor: 'text-gray-700 dark:text-gray-200', name: 'Bills & Utilities', bgAccent: 'border-l-gray-500', shadow: 'shadow-gray-200 dark:shadow-gray-800/50' },
                savings: { emoji: '💰', color: 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40', textColor: 'text-green-700 dark:text-green-200', name: 'Savings & Investment', bgAccent: 'border-l-green-500', shadow: 'shadow-green-200 dark:shadow-green-900/50' }
              };

              const categoryInfo = categoryData[expense.category] || categoryData.food;

              return (
                <div
                  key={expense.id}
                  className={`${theme.cardBg} border-2 ${theme.border} ${categoryInfo.bgAccent} border-l-8 rounded-r-2xl rounded-l-xl p-6 transition-all duration-500 ${
                    isDeleting 
                      ? 'opacity-50 scale-95 blur-sm' 
                      : `hover:shadow-2xl hover:shadow-${categoryInfo.shadow} hover:scale-[1.05] hover:border-l-[12px] hover:-translate-y-2`
                  } relative group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900`}
                >
                  {/* Header Row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full font-bold text-sm shadow-lg">
                          #{index + 1}
                        </div>
                        <div className={`${categoryInfo.color} px-4 py-2.5 rounded-full flex items-center gap-3 shadow-lg border border-white/50 dark:border-gray-700/50`}>
                          <span className="text-2xl drop-shadow-sm">{categoryInfo.emoji}</span>
                          <span className={`font-bold text-sm ${categoryInfo.textColor} tracking-wide`}>
                            {categoryInfo.name}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Amount - Prominently displayed */}
                    <div className="text-right">
                      <span className={`font-black text-3xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent drop-shadow-lg`}>
                        ${expense.amount?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>

                  {/* Content Row */}
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      {/* Date and Description */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-xl border border-blue-200 dark:border-blue-700">
                          <span className="text-xl">📅</span>
                          <span className={`text-sm font-semibold text-blue-800 dark:text-blue-200`}>
                            {dateDisplay}
                          </span>
                        </div>
                        
                        {expense.description && (
                          <div className="flex items-start gap-3 bg-purple-50 dark:bg-purple-900/30 px-4 py-3 rounded-xl border border-purple-200 dark:border-purple-700">
                            <span className="text-xl mt-0.5">💬</span>
                            <p className={`text-sm text-purple-800 dark:text-purple-200 leading-relaxed font-medium`}>
                              {expense.description}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => deleteExpense(expense.id, expense.description || `$${expense.amount} ${expense.category}`)}
                        disabled={isDeleting}
                        className={`px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 group/btn shadow-lg hover:shadow-red-300 dark:hover:shadow-red-800 opacity-0 group-hover:opacity-100 hover:scale-110 transform`}
                        title="Remove this expense"
                      >
                        {isDeleting ? (
                          <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-sm font-bold">Removing...</span>
                          </>
                        ) : (
                          <>
                            <span className="text-xl group-hover/btn:scale-125 transition-transform duration-200">🗑️</span>
                            <span className="text-sm font-bold tracking-wide">DELETE</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Rewards Footer */}
                  <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-300 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40 px-3 py-2 rounded-full shadow-sm border border-blue-200 dark:border-blue-700">
                          <span className="text-xl">⭐</span>
                          <span className={`text-sm font-bold text-blue-800 dark:text-blue-200`}>+10 XP</span>
                        </div>
                        {expense.description && (
                          <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/40 dark:to-green-800/40 px-3 py-2 rounded-full shadow-sm border border-green-200 dark:border-green-700">
                            <span className="text-xl">🎯</span>
                            <span className={`text-sm font-bold text-green-800 dark:text-green-200`}>+5 XP bonus</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/40 dark:to-yellow-800/40 px-3 py-2 rounded-full shadow-sm border border-yellow-200 dark:border-yellow-700">
                          <span className="text-xl">🪙</span>
                          <span className={`text-sm font-bold text-yellow-800 dark:text-yellow-200`}>+2 coins</span>
                        </div>
                      </div>
                      
                      <div className={`text-sm font-bold bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 px-4 py-2 rounded-full shadow-lg border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200`}>
                        Quest #{index + 1} ✨
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Enhanced Summary Stats */}
            <div className={`${theme.cardBg} border-2 ${theme.border} rounded-2xl p-6 mt-8 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-900/30 dark:via-blue-900/30 dark:to-cyan-900/30 shadow-2xl hover:shadow-purple-200 dark:hover:shadow-purple-900/50 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4 rounded-2xl shadow-lg">
                    <span className="text-3xl">🎯</span>
                  </div>
                  <div>
                    <h4 className={`font-black text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent`}>
                      Quest Progress
                    </h4>
                    <p className={`text-sm font-semibold text-gray-700 dark:text-gray-200`}>
                      Keep tracking to unlock more epic rewards! 🚀
                    </p>
                  </div>
                </div>
                <div className="text-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-4 rounded-2xl shadow-lg">
                  <div className="font-black text-3xl">{recentExpenses.length}</div>
                  <div className="text-sm font-bold tracking-wide">QUESTS COMPLETED</div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-bold text-purple-800 dark:text-purple-200`}>Adventure Level</span>
                  <span className={`text-sm font-bold text-purple-800 dark:text-purple-200`}>{recentExpenses.length}/10</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 h-3 rounded-full transition-all duration-1000 shadow-lg"
                    style={{ width: `${Math.min((recentExpenses.length / 10) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

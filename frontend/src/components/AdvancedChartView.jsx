import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../hooks/useTheme';
import { getAuth } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { mlCoinService } from '../services/mlCoinService';

export default function AdvancedChartView() {
  const { theme } = useTheme();
  const auth = getAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [activeChart, setActiveChart] = useState('overview');
  const [timeframe, setTimeframe] = useState('week');
  const [financialHealth, setFinancialHealth] = useState(null);
  const [spendingPrediction, setSpendingPrediction] = useState(null);

  // Colors for charts
  const colors = useMemo(() => ({
    primary: '#6366f1',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6'
  }), []);

  const categoryColors = useMemo(() => ({
    food: '#10b981',
    transportation: '#3b82f6',
    utilities: '#f59e0b',
    healthcare: '#ef4444',
    education: '#8b5cf6',
    savings: '#059669',
    entertainment: '#ec4899',
    shopping: '#f97316',
    travel: '#06b6d4',
    subscriptions: '#6366f1',
    impulse: '#dc2626',
    other: '#6b7280'
  }), []);

  // Load expenses data with enhanced error handling
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    let unsubscribe = null;
    let retryCount = 0;
    const maxRetries = 3;

    const setupListener = async () => {
      try {
        const expensesQuery = query(
          collection(db, 'expenses'),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc')
        );

        unsubscribe = onSnapshot(
          expensesQuery, 
          (snapshot) => {
            try {
              const expenseData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate() || new Date()
              }));
              setExpenses(expenseData);
              setLoading(false);
              setConnectionError(false);
              retryCount = 0; // Reset retry count on success
            } catch (error) {
              console.error('Error processing snapshot:', error);
              setLoading(false);
            }
          },
          (error) => {
            console.error('Firestore listener error:', error);
            setLoading(false);
            setConnectionError(true);
            
            // Retry logic for Firestore internal errors
            if (error.code === 'internal' && retryCount < maxRetries) {
              retryCount++;
              console.log(`Retrying Firestore connection (attempt ${retryCount}/${maxRetries})...`);
              
              // Exponential backoff
              setTimeout(() => {
                setupListener();
              }, Math.pow(2, retryCount) * 1000);
            }
          }
        );
      } catch (error) {
        console.error('Error setting up Firestore listener:', error);
        setLoading(false);
        
        // Fallback: Try a simpler query without orderBy
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying with simpler query (attempt ${retryCount}/${maxRetries})...`);
          setTimeout(async () => {
            try {
              // Simpler query without orderBy to avoid indexing issues
              const fallbackQuery = query(
                collection(db, 'expenses'),
                where('userId', '==', user.uid)
              );
              
              unsubscribe = onSnapshot(
                fallbackQuery,
                (snapshot) => {
                  try {
                    const expenseData = snapshot.docs
                      .map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        timestamp: doc.data().timestamp?.toDate() || new Date()
                      }))
                      .sort((a, b) => b.timestamp - a.timestamp); // Sort on client side
                    
                    setExpenses(expenseData);
                    setLoading(false);
                    retryCount = 0;
                  } catch (error) {
                    console.error('Error in fallback query processing:', error);
                    setLoading(false);
                  }
                },
                (error) => {
                  console.error('Fallback query error:', error);
                  setLoading(false);
                }
              );
            } catch (fallbackError) {
              console.error('Fallback query setup failed:', fallbackError);
              setLoading(false);
            }
          }, 2000);
        }
      }
    };

    setupListener();

    return () => {
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing from Firestore listener:', error);
        }
      }
    };
  }, [auth.currentUser]);

  // Analyze financial health when expenses change
  useEffect(() => {
    if (expenses.length > 0) {
      const analysis = mlCoinService.analyzeFinancialHealth(expenses);
      setFinancialHealth(analysis);
      
      const prediction = mlCoinService.predictFutureSpending(expenses, 30);
      setSpendingPrediction(prediction);
    }
  }, [expenses]);

  // Process data for different chart types with error handling
  const chartData = useMemo(() => {
    try {
      if (!expenses.length) return {};

      const now = new Date();
    const filteredExpenses = expenses.filter(expense => {
      // Handle both Firestore timestamp and Date objects
      const expenseDate = expense.timestamp?.toDate ? expense.timestamp.toDate() : new Date(expense.timestamp);
      const daysDiff = (now - expenseDate) / (1000 * 60 * 60 * 24);
      
      switch (timeframe) {
        case 'week': return daysDiff <= 7;
        case 'month': return daysDiff <= 30;
        case 'quarter': return daysDiff <= 90;
        case 'year': return daysDiff <= 365;
        default: return true;
      }
    });

    // Daily spending data for line chart
    const dailyData = {};
    // Individual expense timeline data for single curve
    const expenseTimelineData = [];
    
    filteredExpenses.forEach(expense => {
      // Properly handle timestamp conversion
      const expenseDate = expense.timestamp?.toDate ? expense.timestamp.toDate() : new Date(expense.timestamp);
      const dateKey = expenseDate.toDateString();
      const displayDate = expenseDate.toLocaleDateString();
      const displayTime = expenseDate.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }); // Include time in readable format
      
      // Overall daily data (for the first chart)
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { 
          date: displayDate, 
          amount: 0, 
          count: 0,
          fullDate: expenseDate // Keep full date for sorting
        };
      }
      dailyData[dateKey].amount += expense.amount;
      dailyData[dateKey].count += 1;
      
      // Individual expense timeline data (single curve showing all transactions)
      expenseTimelineData.push({
        time: displayTime,
        timestamp: expenseDate.getTime(), // For sorting
        amount: expense.amount,
        category: expense.category || 'other',
        description: expense.description || 'No description'
      });
    });

    // Category spending data for pie chart
    const categoryData = {};
    filteredExpenses.forEach(expense => {
      if (!expense.category) {
        return;
      }
      categoryData[expense.category] = (categoryData[expense.category] || 0) + expense.amount;
    });

    // Weekly comparison data
    const weeklyData = Array.from({ length: 4 }, (_, i) => {
      // Calculate week boundaries more accurately
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - i * 7);
      weekEnd.setHours(23, 59, 59, 999); // End of day
      
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() - 6); // 7 days including end date
      weekStart.setHours(0, 0, 0, 0); // Start of day
      
      const weekExpenses = expenses.filter(expense => {
        const expenseDate = expense.timestamp?.toDate ? expense.timestamp.toDate() : new Date(expense.timestamp);
        return expenseDate >= weekStart && expenseDate <= weekEnd;
      });
      
      const total = weekExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      
      // Create more descriptive week labels
      const weekLabel = i === 0 ? 'This Week' : 
                      i === 1 ? 'Last Week' : 
                      `${i + 1} Weeks Ago`;
      
      return {
        week: weekLabel,
        amount: total,
        count: weekExpenses.length,
        dateRange: `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`
      };
    });

    // Spending trend with prediction - sort by actual date
    const trendData = Object.values(dailyData)
      .sort((a, b) => a.fullDate - b.fullDate)
      .map(item => ({
        date: item.date,
        amount: item.amount,
        count: item.count
      }));
    
    // Timeline data for single curve (sorted by timestamp)
    const categoryTrendData = expenseTimelineData
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(item => ({
        time: item.time,
        amount: item.amount,
        category: item.category,
        description: item.description
      }));
    
    // Add prediction data if available
    if (spendingPrediction && spendingPrediction.prediction > 0) {
      const futureDays = 7; // Show next 7 days
      for (let i = 1; i <= futureDays; i++) {
        const futureDate = new Date(now);
        futureDate.setDate(now.getDate() + i);
        trendData.push({
          date: futureDate.toLocaleDateString(),
          amount: Math.round(spendingPrediction.dailyAverage),
          predicted: true
        });
      }
    }

    const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: Math.round(value * 100) / 100,
      color: categoryColors[name] || colors.info
    }));

    return {
      daily: trendData,
      dailyByCategory: categoryTrendData,
      category: categoryChartData,
      weekly: weeklyData,
      healthScore: financialHealth?.healthScore || 50
    };
    } catch (error) {
      console.error('Error processing chart data:', error);
      setConnectionError(true);
      return {
        daily: [],
        dailyByCategory: [],
        category: [],
        weekly: [],
        healthScore: 50
      };
    }
  }, [expenses, timeframe, spendingPrediction, financialHealth, categoryColors, colors.info]);

  const renderOverviewChart = () => (
    <div className="space-y-6">
      {/* Daily Spending Trend - Overall */}
      <div className={`${theme.cardBg} p-4 sm:p-6 rounded-lg border ${theme.border}`}>
        <h4 className={`${theme.text} font-semibold mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-2`}>
          <div className="flex items-center gap-2">
            <span>📈</span>
            <span className="text-sm sm:text-base">Daily Spending Trend - Overall</span>
          </div>
          {spendingPrediction && (
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-full">
              ML Prediction
            </span>
          )}
        </h4>
        <ResponsiveContainer width="100%" height={200} className="sm:h-[250px]">
          <AreaChart data={chartData.daily}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} className="sm:text-xs" />
            <YAxis tick={{ fontSize: 10 }} className="sm:text-xs" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: theme.cardBg, 
                border: `1px solid ${theme.border}`,
                borderRadius: '8px'
              }}
              formatter={(value, name) => [
                `$${value}`, 
                name === 'amount' ? (chartData.daily.find(d => d.amount === value)?.predicted ? 'Predicted' : 'Actual') : name
              ]}
            />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke={colors.primary} 
              fill={colors.primary} 
              fillOpacity={0.6}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Transaction Timeline - Single Curve */}
      <div className={`${theme.cardBg} p-4 sm:p-6 rounded-lg border ${theme.border}`}>
        <h4 className={`${theme.text} font-semibold mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-2`}>
          <div className="flex items-center gap-2">
            <span>⏰</span>
            <span className="text-sm sm:text-base">Transaction Timeline</span>
          </div>
          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-full">
            All Expenses
          </span>
        </h4>
        <ResponsiveContainer width="100%" height={250} className="sm:h-[350px]">
          <LineChart data={chartData.dailyByCategory}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 8 }}
              interval="preserveStartEnd"
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: theme.cardBg, 
                border: `1px solid ${theme.border}`,
                borderRadius: '8px'
              }}
              formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']}
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  const data = payload[0].payload;
                  return `Time: ${label}\nCategory: ${data.category.charAt(0).toUpperCase() + data.category.slice(1)}\nDescription: ${data.description}`;
                }
                return `Time: ${label}`;
              }}
            />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke={colors.primary} 
              strokeWidth={3}
              dot={(props) => {
                const { payload, cx, cy } = props;
                const categoryColor = categoryColors[payload.category] || colors.primary;
                return (
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={5} 
                    fill={categoryColor} 
                    stroke={categoryColor} 
                    strokeWidth={2}
                  />
                );
              }}
              activeDot={{ 
                r: 8, 
                stroke: colors.primary, 
                strokeWidth: 2 
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderCategoryChart = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* Category Pie Chart */}
      <div className={`${theme.cardBg} p-4 sm:p-6 rounded-lg border ${theme.border}`}>
        <h4 className={`${theme.text} font-semibold mb-4 flex items-center gap-2`}>
          <span>🥧</span>
          <span className="text-sm sm:text-base">Spending by Category</span>
        </h4>
        <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
          <PieChart>
            <Pie
              data={chartData.category}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.category.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Category Bar Chart */}
      <div className={`${theme.cardBg} p-4 sm:p-6 rounded-lg border ${theme.border}`}>
        <h4 className={`${theme.text} font-semibold mb-4 flex items-center gap-2`}>
          <span>📊</span>
          <span className="text-sm sm:text-base">Category Breakdown</span>
        </h4>
        <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
          <BarChart data={chartData.category} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fontSize: 10 }} />
            <YAxis dataKey="name" type="category" width={80} className="sm:w-[100px]" tick={{ fontSize: 10 }} />
            <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
            <Bar dataKey="value" fill={colors.primary} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderTrendsChart = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Weekly Comparison */}
      <div className={`${theme.cardBg} p-4 sm:p-6 rounded-lg border ${theme.border}`}>
        <h4 className={`${theme.text} font-semibold mb-4 flex items-center gap-2`}>
          <span>📅</span>
          <span className="text-sm sm:text-base">Weekly Spending Comparison</span>
        </h4>
        <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
          <BarChart data={chartData.weekly}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [`$${value}`, name === 'amount' ? 'Spent' : 'Transactions']}
              labelFormatter={(label) => {
                const weekData = chartData.weekly.find(w => w.week === label);
                return weekData ? `${label} (${weekData.dateRange})` : label;
              }}
            />
            <Bar dataKey="amount" fill={colors.primary} />
            <Bar dataKey="count" fill={colors.secondary} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ML Insights */}
      {financialHealth && (
        <div className={`${theme.cardBg} p-4 sm:p-6 rounded-lg border ${theme.border}`}>
          <h4 className={`${theme.text} font-semibold mb-4 flex items-center gap-2`}>
            <span>🤖</span>
            <span className="text-sm sm:text-base">ML Insights & Predictions</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h5 className={`${theme.text} font-medium text-sm sm:text-base`}>Key Insights:</h5>
              {financialHealth.insights.map((insight, index) => (
                <p key={index} className={`${theme.textSecondary} text-xs sm:text-sm flex items-start gap-2`}>
                  <span className="text-blue-500">💡</span>
                  {insight}
                </p>
              ))}
            </div>
            <div className="space-y-3">
              <h5 className={`${theme.text} font-medium text-sm sm:text-base`}>Recommendations:</h5>
              {financialHealth.recommendations.map((rec, index) => (
                <p key={index} className={`${theme.textSecondary} text-xs sm:text-sm flex items-start gap-2`}>
                  <span className="text-green-500">✅</span>
                  {rec}
                </p>
              ))}
            </div>
          </div>
          
          {spendingPrediction && spendingPrediction.prediction > 0 && (
            <div className="mt-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg">
              <h6 className={`${theme.text} font-medium mb-2 text-sm sm:text-base`}>30-Day Spending Prediction:</h6>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <span className={theme.textSecondary}>Predicted Total:</span>
                  <p className={`${theme.text} font-bold`}>${spendingPrediction.prediction}</p>
                </div>
                <div>
                  <span className={theme.textSecondary}>Daily Average:</span>
                  <p className={`${theme.text} font-bold`}>${spendingPrediction.dailyAverage}</p>
                </div>
                <div>
                  <span className={theme.textSecondary}>Trend:</span>
                  <p className={`font-bold ${getTrendColor(spendingPrediction.trend)}`}>
                    {spendingPrediction.trend}
                  </p>
                </div>
                <div>
                  <span className={theme.textSecondary}>Confidence:</span>
                  <p className={`font-bold ${getConfidenceColor(spendingPrediction.confidence)}`}>
                    {spendingPrediction.confidence}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'increasing': return 'text-red-500';
      case 'decreasing': return 'text-green-500';
      case 'stable': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'high': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className={`${theme.textSecondary} text-lg`}>Loading analytics...</div>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className={`${theme.cardBg} p-6 sm:p-8 rounded-lg border ${theme.border} text-center`}>
        <div className="text-red-500 text-4xl sm:text-6xl mb-4">⚠️</div>
        <h3 className={`${theme.text} text-lg sm:text-xl font-semibold mb-2`}>Connection Issue</h3>
        <p className={`${theme.textSecondary} mb-4 text-sm sm:text-base`}>
          There was a problem connecting to the database. This might be a temporary issue.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (!expenses.length) {
    return (
      <div className={`${theme.cardBg} p-6 sm:p-8 rounded-lg border ${theme.border} text-center`}>
        <div className="text-4xl sm:text-6xl mb-4">📊</div>
        <h3 className={`${theme.text} text-lg sm:text-xl font-semibold mb-2`}>No Data Yet</h3>
        <p className={`${theme.textSecondary} mb-4 text-sm sm:text-base`}>
          Start adding expenses to see beautiful analytics and ML-powered insights!
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-1">
            <span>🤖</span>
            <span className={theme.textSecondary}>AI Predictions</span>
          </div>
          <div className="flex items-center gap-1">
            <span>📈</span>
            <span className={theme.textSecondary}>Trend Analysis</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🎯</span>
            <span className={theme.textSecondary}>Health Score</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Chart Navigation */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'overview', label: 'Overview', icon: '📊' },
            { key: 'categories', label: 'Categories', icon: '🏷️' },
            { key: 'trends', label: 'Trends & ML', icon: '🤖' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveChart(tab.key)}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm sm:text-base ${
                activeChart === tab.key
                  ? `${theme.accent} text-white shadow-lg`
                  : `${theme.cardBg} ${theme.text} border ${theme.border} hover:${theme.accent} hover:text-white`
              }`}
            >
              <span className="text-sm">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-1 sm:gap-2">
          {[
            { key: 'week', label: '7D' },
            { key: 'month', label: '30D' },
            { key: 'quarter', label: '3M' },
            { key: 'year', label: '1Y' }
          ].map((period) => (
            <button
              key={period.key}
              onClick={() => setTimeframe(period.key)}
              className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition-all duration-200 ${
                timeframe === period.key
                  ? `${theme.accent} text-white`
                  : `${theme.cardBg} ${theme.text} border ${theme.border} hover:${theme.accent} hover:text-white`
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Content */}
      {activeChart === 'overview' && renderOverviewChart()}
      {activeChart === 'categories' && renderCategoryChart()}
      {activeChart === 'trends' && renderTrendsChart()}
    </div>
  );
}

/**
 * ML-based Coin Calculation Service
 * This service evaluates spending habits and calculates coin rewards/penalties
 * based on financial discipline and healthy spending patterns.
 */

export class MLCoinService {
  constructor() {
    // Category weights for ML model (healthy vs unhealthy spending)
    this.categoryWeights = {
      'food': 0.8,
      'transportation': 0.7,
      'utilities': 0.9,
      'healthcare': 1.0,
      'education': 1.0,
      'savings': 1.5,
      'entertainment': 0.4,
      'shopping': 0.3,
      'travel': 0.5,
      'subscriptions': 0.4,
      'impulse': 0.1,
      'other': 0.6
    };

    // Time-based multipliers (spending during appropriate times)
    this.timeMultipliers = {
      morning: 1.0,   // 6-12
      afternoon: 0.9, // 12-18
      evening: 0.7,   // 18-22
      lateNight: 0.3  // 22-6
    };

    // Weekly spending patterns
    this.weeklyPatterns = {
      planned: 1.2,      // Weekday planned expenses
      weekend: 0.8,      // Weekend spending
      impulsive: 0.4     // Unplanned purchases
    };

    // User spending limits (will be personalized later)
    this.defaultLimits = {
      daily: 100,
      weekly: 500,
      monthly: 2000,
      categoryLimits: {
        entertainment: 200,
        shopping: 300,
        impulse: 50
      }
    };
  }

  /**
   * Calculate coin reward/penalty for a single expense
   * @param {Object} expense - The expense data
   * @param {Object} userStats - User's historical data
   * @param {Object} userLimits - User's spending limits
   * @returns {Object} - Coin calculation result
   */
  calculateCoinsForExpense(expense, userStats = {}, userLimits = null) {
    const limits = userLimits || this.defaultLimits;
    const baseCoins = 10; // Base coin reward
    
    try {
      // Factor 1: Category Health Score (40% weight)
      const categoryScore = this.getCategoryScore(expense.category, expense.amount);
      
      // Factor 2: Time-based Score (20% weight)
      const timeScore = this.getTimeScore(expense.timestamp);
      
      // Factor 3: Budget Adherence Score (30% weight)
      const budgetScore = this.getBudgetScore(expense, userStats, limits);
      
      // Factor 4: Spending Pattern Score (10% weight)
      const patternScore = this.getPatternScore(expense, userStats);
      
      // Calculate weighted score
      const totalScore = (
        categoryScore * 0.4 +
        timeScore * 0.2 +
        budgetScore * 0.3 +
        patternScore * 0.1
      );
      
      // Calculate final coins (can be negative for penalties)
      const finalCoins = Math.round(baseCoins * totalScore);
      
      // Cap the penalty to avoid extreme negative coins
      const cappedCoins = Math.max(finalCoins, -20);
      
      return {
        coins: cappedCoins,
        breakdown: {
          categoryScore: Math.round(categoryScore * 100),
          timeScore: Math.round(timeScore * 100),
          budgetScore: Math.round(budgetScore * 100),
          patternScore: Math.round(patternScore * 100),
          totalScore: Math.round(totalScore * 100)
        },
        factors: {
          category: expense.category,
          amount: expense.amount,
          isHealthy: this.categoryWeights[expense.category] >= 0.7,
          withinBudget: budgetScore > 0.5,
          timeAppropriate: timeScore > 0.7
        }
      };
    } catch (error) {
      console.error('Error calculating coins:', error);
      return { coins: 5, breakdown: {}, factors: {} }; // Default safe value
    }
  }

  /**
   * Get category-based score
   */
  getCategoryScore(category, amount) {
    const baseWeight = this.categoryWeights[category] || 0.5;
    
    // Penalty for high amounts in unhealthy categories
    if (baseWeight < 0.7 && amount > 50) {
      return Math.max(baseWeight * 0.5, 0.1);
    }
    
    // Bonus for savings and essential categories
    if (['savings', 'healthcare', 'education'].includes(category)) {
      return Math.min(baseWeight * 1.2, 1.5);
    }
    
    return baseWeight;
  }

  /**
   * Get time-based appropriateness score
   */
  getTimeScore(timestamp) {
    try {
      const hour = new Date(timestamp.toDate ? timestamp.toDate() : timestamp).getHours();
      
      if (hour >= 6 && hour < 12) return this.timeMultipliers.morning;
      if (hour >= 12 && hour < 18) return this.timeMultipliers.afternoon;
      if (hour >= 18 && hour < 22) return this.timeMultipliers.evening;
      return this.timeMultipliers.lateNight;
    } catch (error) {
      return 0.7; // Default neutral score
    }
  }

  /**
   * Get budget adherence score
   */
  getBudgetScore(expense, userStats, limits) {
    try {
      // Get user's spending for current period
      const todaySpending = userStats.todaySpending || 0;
      const weekSpending = userStats.weekSpending || 0;
      const monthSpending = userStats.monthSpending || 0;
      
      // Check daily limit
      const dailyRatio = (todaySpending + expense.amount) / limits.daily;
      
      // Check category limit if applicable
      const categoryLimit = limits.categoryLimits[expense.category];
      let categoryRatio = 1;
      if (categoryLimit) {
        const categorySpending = userStats.categorySpending?.[expense.category] || 0;
        categoryRatio = (categorySpending + expense.amount) / categoryLimit;
      }
      
      // Calculate budget score (1.0 = perfect, 0.0 = way over budget)
      const budgetScore = Math.max(0, Math.min(1, 2 - Math.max(dailyRatio, categoryRatio)));
      
      return budgetScore;
    } catch (error) {
      return 0.7; // Default neutral score
    }
  }

  /**
   * Get spending pattern score (consistency, planning)
   */
  getPatternScore(expense, userStats) {
    try {
      // Check if this follows a consistent pattern
      const hasDescription = expense.description && expense.description.length > 3;
      const isWeekday = new Date(expense.timestamp.toDate ? expense.timestamp.toDate() : expense.timestamp).getDay() < 6;
      
      let score = 0.7; // Base score
      
      // Bonus for detailed descriptions (shows planning)
      if (hasDescription) score += 0.2;
      
      // Bonus for weekday essential spending
      if (isWeekday && ['food', 'transportation', 'utilities'].includes(expense.category)) {
        score += 0.1;
      }
      
      // Check frequency patterns (prevent excessive spending in same category)
      const recentSimilar = userStats.recentExpenses?.filter(e => 
        e.category === expense.category && 
        Math.abs(new Date() - new Date(e.timestamp.toDate ? e.timestamp.toDate() : e.timestamp)) < 24 * 60 * 60 * 1000
      ).length || 0;
      
      if (recentSimilar > 3) score -= 0.3; // Penalty for too frequent similar expenses
      
      return Math.max(0, Math.min(1, score));
    } catch (error) {
      return 0.7; // Default neutral score
    }
  }

  /**
   * Analyze user's overall financial health
   * @param {Array} expenses - User's expense history
   * @param {Object} timeframe - Analysis period
   * @returns {Object} - Financial health analysis
   */
  analyzeFinancialHealth(expenses, timeframe = 'month') {
    try {
      if (!expenses || expenses.length === 0) {
        return {
          healthScore: 50,
          insights: ['Start tracking expenses to get personalized insights!'],
          recommendations: ['Add your first expense to begin your financial journey.']
        };
      }

      // Calculate spending by category
      const categorySpending = {};
      const totalSpending = expenses.reduce((sum, exp) => {
        categorySpending[exp.category] = (categorySpending[exp.category] || 0) + exp.amount;
        return sum + exp.amount;
      }, 0);

      // Calculate health score
      let healthScore = 50; // Base score
      
      // Healthy category spending ratio
      const healthySpending = Object.entries(categorySpending).reduce((sum, [cat, amount]) => {
        return sum + (this.categoryWeights[cat] >= 0.7 ? amount : 0);
      }, 0);
      
      const healthyRatio = healthySpending / totalSpending;
      healthScore += (healthyRatio - 0.5) * 40; // +/- 20 points based on healthy spending

      // Consistency bonus
      const avgDailyExpenses = expenses.length / 30; // Assuming monthly data
      if (avgDailyExpenses >= 1 && avgDailyExpenses <= 5) healthScore += 10;

      // Savings bonus
      const savingsRatio = (categorySpending.savings || 0) / totalSpending;
      healthScore += savingsRatio * 30; // Up to 30 points for savings

      healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));

      // Generate insights
      const insights = this.generateInsights(categorySpending, totalSpending, expenses);
      const recommendations = this.generateRecommendations(categorySpending, totalSpending);

      return {
        healthScore,
        insights,
        recommendations,
        categoryBreakdown: categorySpending,
        totalSpending,
        healthySpendingRatio: Math.round(healthyRatio * 100)
      };
    } catch (error) {
      console.error('Error analyzing financial health:', error);
      return {
        healthScore: 50,
        insights: ['Unable to analyze at this time.'],
        recommendations: ['Keep tracking your expenses for better insights.']
      };
    }
  }

  generateInsights(categorySpending, totalSpending, expenses) {
    const insights = [];
    
    // Top spending category
    const topCategory = Object.entries(categorySpending)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (topCategory) {
      const percentage = Math.round((topCategory[1] / totalSpending) * 100);
      insights.push(`Your top spending category is ${topCategory[0]} (${percentage}%)`);
    }

    // Impulse spending check
    const impulseSpending = categorySpending.impulse || 0;
    if (impulseSpending > 0) {
      insights.push(`You spent $${impulseSpending.toFixed(2)} on impulse purchases this period.`);
    }

    // Savings check
    const savings = categorySpending.savings || 0;
    if (savings > 0) {
      insights.push(`Great job! You saved $${savings.toFixed(2)} this period.`);
    } else {
      insights.push(`Consider adding some money to savings to improve your financial health.`);
    }

    return insights;
  }

  generateRecommendations(categorySpending, totalSpending) {
    const recommendations = [];
    
    // Entertainment spending check
    const entertainment = categorySpending.entertainment || 0;
    if (entertainment / totalSpending > 0.2) {
      recommendations.push('Consider reducing entertainment expenses to improve savings.');
    }

    // Shopping spending check
    const shopping = categorySpending.shopping || 0;
    if (shopping / totalSpending > 0.15) {
      recommendations.push('Try to limit shopping expenses and focus on needs vs wants.');
    }

    // Savings recommendation
    const savings = categorySpending.savings || 0;
    if (savings / totalSpending < 0.1) {
      recommendations.push('Aim to save at least 10% of your income each month.');
    }

    // General recommendation
    recommendations.push('Keep tracking your expenses daily to maintain good financial habits!');

    return recommendations;
  }

  /**
   * Predict future spending based on historical data
   * @param {Array} expenses - Historical expense data
   * @param {number} days - Days to predict ahead
   * @returns {Object} - Prediction results
   */
  predictFutureSpending(expenses, days = 30) {
    try {
      if (!expenses || expenses.length < 7) {
        return {
          prediction: 0,
          confidence: 'low',
          trend: 'insufficient_data'
        };
      }

      // Simple linear regression on daily spending
      const dailySpending = this.aggregateDailySpending(expenses);
      const prediction = this.linearRegression(dailySpending, days);
      
      return prediction;
    } catch (error) {
      console.error('Error predicting spending:', error);
      return { prediction: 0, confidence: 'low', trend: 'error' };
    }
  }

  aggregateDailySpending(expenses) {
    const daily = {};
    expenses.forEach(exp => {
      const date = new Date(exp.timestamp.toDate ? exp.timestamp.toDate() : exp.timestamp)
        .toDateString();
      daily[date] = (daily[date] || 0) + exp.amount;
    });
    return Object.values(daily);
  }

  linearRegression(data, forecastDays) {
    const n = data.length;
    const sumX = data.reduce((sum, _, i) => sum + i, 0);
    const sumY = data.reduce((sum, val) => sum + val, 0);
    const sumXY = data.reduce((sum, val, i) => sum + (i * val), 0);
    const sumXX = data.reduce((sum, _, i) => sum + (i * i), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Predict future values
    const futureSpending = [];
    for (let i = n; i < n + forecastDays; i++) {
      futureSpending.push(Math.max(0, slope * i + intercept));
    }

    const totalPrediction = futureSpending.reduce((sum, val) => sum + val, 0);
    
    // Calculate trend and confidence
    const trend = slope > 1 ? 'increasing' : slope < -1 ? 'decreasing' : 'stable';
    const variance = data.reduce((sum, val, i) => {
      const predicted = slope * i + intercept;
      return sum + Math.pow(val - predicted, 2);
    }, 0) / n;
    
    const confidence = variance < 100 ? 'high' : variance < 500 ? 'medium' : 'low';

    return {
      prediction: Math.round(totalPrediction),
      confidence,
      trend,
      dailyAverage: Math.round(totalPrediction / forecastDays),
      slope: Math.round(slope * 100) / 100
    };
  }
}

// Export singleton instance
export const mlCoinService = new MLCoinService();

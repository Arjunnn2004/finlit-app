import React, { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { getAuth } from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function FinancialGames() {
  const { theme } = useTheme();
  const auth = getAuth();
  const [activeGame, setActiveGame] = useState(null);
  const [gameStats, setGameStats] = useState({
    gamesPlayed: 0,
    totalScore: 0,
    highestScore: 0,
    coinsEarned: 0
  });
  const [loading, setLoading] = useState(false);

  // Load game stats on component mount
  useEffect(() => {
    const loadGameStats = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const gameStatsRef = doc(db, 'gameStats', user.uid);
        const gameStatsSnap = await getDoc(gameStatsRef);
        
        if (gameStatsSnap.exists()) {
          setGameStats(gameStatsSnap.data());
        }
      } catch (error) {
        console.error('Error loading game stats:', error);
      }
    };

    loadGameStats();
  }, [auth.currentUser]);

  // Update game stats after completing a game
  const updateGameStats = async (score, coinsEarned) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const newStats = {
        gamesPlayed: gameStats.gamesPlayed + 1,
        totalScore: gameStats.totalScore + score,
        highestScore: Math.max(gameStats.highestScore, score),
        coinsEarned: gameStats.coinsEarned + coinsEarned
      };

      const gameStatsRef = doc(db, 'gameStats', user.uid);
      await updateDoc(gameStatsRef, newStats);
      setGameStats(newStats);

      // Also update user's main coin balance
      const userStatsRef = doc(db, 'userStats', user.uid);
      const userStatsSnap = await getDoc(userStatsRef);
      
      if (userStatsSnap.exists()) {
        const currentCoins = userStatsSnap.data().coins || 0;
        await updateDoc(userStatsRef, {
          coins: currentCoins + coinsEarned
        });
      }
    } catch (error) {
      console.error('Error updating game stats:', error);
    }
  };

  const games = [
    {
      id: 'budget-balance',
      title: 'Budget Balance Challenge',
      description: 'Balance your monthly budget by making smart spending decisions',
      icon: '⚖️',
      difficulty: 'Easy',
      reward: '20-50 coins',
      color: 'from-green-400 to-blue-500'
    },
    {
      id: 'investment-race',
      title: 'Investment Race',
      description: 'Choose the best investment options to grow your money',
      icon: '📈',
      difficulty: 'Medium',
      reward: '30-70 coins',
      color: 'from-purple-400 to-pink-500'
    },
    {
      id: 'expense-detective',
      title: 'Expense Detective',
      description: 'Find and eliminate unnecessary expenses in daily scenarios',
      icon: '🕵️',
      difficulty: 'Easy',
      reward: '15-40 coins',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      id: 'saving-sprint',
      title: 'Saving Sprint',
      description: 'Race against time to reach your savings goal',
      icon: '💰',
      difficulty: 'Medium',
      reward: '25-60 coins',
      color: 'from-emerald-400 to-teal-500'
    },
    {
      id: 'debt-destroyer',
      title: 'Debt Destroyer',
      description: 'Strategically pay off debts using different methods',
      icon: '🎯',
      difficulty: 'Hard',
      reward: '40-100 coins',
      color: 'from-red-400 to-pink-500'
    },
    {
      id: 'compound-calculator',
      title: 'Compound Magic',
      description: 'Learn the power of compound interest through interactive scenarios',
      icon: '🪄',
      difficulty: 'Medium',
      reward: '35-80 coins',
      color: 'from-indigo-400 to-purple-500'
    }
  ];

  const GameCard = ({ game }) => (
    <div 
      className={`${theme.cardBg} rounded-xl border ${theme.border} overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer`}
      onClick={() => setActiveGame(game.id)}
    >
      <div className={`h-32 bg-gradient-to-br ${game.color} flex items-center justify-center`}>
        <span className="text-6xl">{game.icon}</span>
      </div>
      <div className="p-6">
        <h3 className={`${theme.text} font-bold text-lg mb-2`}>{game.title}</h3>
        <p className={`${theme.textSecondary} text-sm mb-4`}>{game.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className={`text-xs px-2 py-1 rounded-full ${
              game.difficulty === 'Easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
              game.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {game.difficulty}
            </span>
            <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
              🪙 {game.reward}
            </span>
          </div>
          <button className={`${theme.accent} text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity`}>
            Play
          </button>
        </div>
      </div>
    </div>
  );

  // Budget Balance Game Component
  const BudgetBalanceGame = () => {
    const [score, setScore] = useState(0);
    const [currentScenario, setCurrentScenario] = useState(0);
    const [gameComplete, setGameComplete] = useState(false);
    const [selectedChoices, setSelectedChoices] = useState([]);

    const scenarios = [
      {
        situation: "You have $500 left for the month. Your car needs $200 in repairs, and there's a 50% off sale on a laptop you've wanted.",
        choices: [
          { text: "Fix the car immediately", points: 10, explanation: "Smart! Essential repairs should always come first." },
          { text: "Buy the laptop on sale", points: -5, explanation: "While it's a good deal, your car is a necessity." },
          { text: "Split the money equally", points: 5, explanation: "Compromise, but the car repair is more urgent." },
          { text: "Wait and save more money", points: 8, explanation: "Good patience, but the car needs immediate attention." }
        ]
      },
      {
        situation: "You receive a $1,000 bonus at work. You have $500 credit card debt at 18% interest.",
        choices: [
          { text: "Pay off all credit card debt", points: 15, explanation: "Excellent! High-interest debt should be eliminated first." },
          { text: "Pay $300 debt, save $700", points: 8, explanation: "Good balance, but paying off high-interest debt completely is better." },
          { text: "Save it all for emergencies", points: 3, explanation: "Emergency funds are important, but that 18% interest is costly." },
          { text: "Invest it all in stocks", points: -3, explanation: "Risky! Pay off debt before investing." }
        ]
      },
      {
        situation: "Your monthly income is $3,000. How much should you allocate to entertainment?",
        choices: [
          { text: "$150 (5%)", points: 10, explanation: "Perfect! 5-10% for entertainment is a healthy balance." },
          { text: "$300 (10%)", points: 8, explanation: "Good! This is at the upper limit of recommended entertainment spending." },
          { text: "$450 (15%)", points: 3, explanation: "Too high. Try to keep entertainment under 10% of income." },
          { text: "$600 (20%)", points: -5, explanation: "Way too much! This leaves little room for savings and necessities." }
        ]
      }
    ];

    const handleChoice = (choice, index) => {
      const newScore = score + choice.points;
      setScore(newScore);
      setSelectedChoices([...selectedChoices, { choice, index }]);
      
      if (currentScenario < scenarios.length - 1) {
        setTimeout(() => {
          setCurrentScenario(currentScenario + 1);
        }, 2000);
      } else {
        setTimeout(() => {
          setGameComplete(true);
          const coinsEarned = Math.max(20, Math.round(newScore * 2));
          updateGameStats(newScore, coinsEarned);
        }, 2000);
      }
    };

    if (gameComplete) {
      return (
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className={`${theme.text} text-2xl font-bold mb-4`}>Game Complete!</h3>
          <div className="space-y-2 mb-6">
            <p className={`${theme.text} text-lg`}>Final Score: <span className="font-bold">{score}</span></p>
            <p className={`${theme.textSecondary}`}>Coins Earned: <span className="text-yellow-500 font-bold">{Math.max(20, Math.round(score * 2))}</span></p>
          </div>
          <button 
            onClick={() => setActiveGame(null)}
            className={`${theme.accent} text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity`}
          >
            Back to Games
          </button>
        </div>
      );
    }

    const scenario = scenarios[currentScenario];
    const lastChoice = selectedChoices[selectedChoices.length - 1];

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className={`${theme.text} text-xl font-bold mb-2`}>
            Scenario {currentScenario + 1} of {scenarios.length}
          </h3>
          <p className={`${theme.textSecondary} mb-4`}>Current Score: {score}</p>
        </div>

        {lastChoice && (
          <div className={`p-4 rounded-lg ${lastChoice.choice.points > 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'} mb-4`}>
            <p className={`font-medium ${lastChoice.choice.points > 0 ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
              {lastChoice.choice.explanation}
            </p>
            <p className={`text-sm mt-1 ${lastChoice.choice.points > 0 ? 'text-green-600 dark:text-green-300' : 'text-red-600 dark:text-red-300'}`}>
              Points: {lastChoice.choice.points > 0 ? '+' : ''}{lastChoice.choice.points}
            </p>
          </div>
        )}

        <div className={`${theme.cardBg} p-6 rounded-lg border ${theme.border}`}>
          <p className={`${theme.text} text-lg mb-6`}>{scenario.situation}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scenario.choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => handleChoice(choice, index)}
                className={`${theme.cardBg} border ${theme.border} p-4 rounded-lg text-left hover:${theme.accent} hover:text-white transition-all duration-200 group`}
              >
                <span className={`${theme.text} group-hover:text-white`}>{choice.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Investment Race Game Component
  const InvestmentRaceGame = () => {
    const [portfolio, setPortfolio] = useState({ stocks: 0, bonds: 0, crypto: 0, savings: 10000 });
    const [year, setYear] = useState(1);
    const [gameComplete, setGameComplete] = useState(false);
    const [marketEvents, setMarketEvents] = useState([]);
    const [totalValue, setTotalValue] = useState(10000);

    const investmentOptions = [
      { name: 'Stocks', risk: 'High', return: '8-12%', volatility: 0.15 },
      { name: 'Bonds', risk: 'Low', return: '3-5%', volatility: 0.05 },
      { name: 'Crypto', risk: 'Very High', return: '15-25%', volatility: 0.3 },
      { name: 'Savings', risk: 'None', return: '1%', volatility: 0 }
    ];

    const marketScenarios = [
      { event: "Market Bull Run!", effect: { stocks: 1.15, bonds: 1.03, crypto: 1.25, savings: 1.01 } },
      { event: "Economic Downturn", effect: { stocks: 0.85, bonds: 1.02, crypto: 0.7, savings: 1.01 } },
      { event: "Tech Boom", effect: { stocks: 1.12, bonds: 1.02, crypto: 1.3, savings: 1.01 } },
      { event: "Inflation Rise", effect: { stocks: 0.95, bonds: 0.97, crypto: 1.1, savings: 0.99 } },
      { event: "Stable Year", effect: { stocks: 1.08, bonds: 1.04, crypto: 1.15, savings: 1.01 } }
    ];

    const allocateFunds = (type, amount) => {
      if (portfolio.savings >= amount) {
        setPortfolio(prev => ({
          ...prev,
          [type]: prev[type] + amount,
          savings: prev.savings - amount
        }));
      }
    };

    const nextYear = () => {
      // Random market event
      const event = marketScenarios[Math.floor(Math.random() * marketScenarios.length)];
      
      const newPortfolio = {
        stocks: portfolio.stocks * event.effect.stocks,
        bonds: portfolio.bonds * event.effect.bonds,
        crypto: portfolio.crypto * event.effect.crypto,
        savings: portfolio.savings * event.effect.savings
      };

      const newTotal = Object.values(newPortfolio).reduce((sum, val) => sum + val, 0);
      
      setPortfolio(newPortfolio);
      setTotalValue(newTotal);
      setMarketEvents([...marketEvents, { year, event: event.event, value: newTotal }]);
      
      if (year >= 5) {
        setGameComplete(true);
        const score = Math.round((newTotal - 10000) / 100);
        const coinsEarned = Math.max(30, Math.round(score / 10));
        updateGameStats(score, coinsEarned);
      } else {
        setYear(year + 1);
      }
    };

    if (gameComplete) {
      const profit = totalValue - 10000;
      const profitPercent = ((totalValue / 10000 - 1) * 100).toFixed(1);
      
      return (
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className={`${theme.text} text-2xl font-bold mb-4`}>Investment Complete!</h3>
          <div className="space-y-2 mb-6">
            <p className={`${theme.text} text-lg`}>Final Portfolio Value: <span className="font-bold">${totalValue.toFixed(2)}</span></p>
            <p className={`${profit >= 0 ? 'text-green-500' : 'text-red-500'} font-bold`}>
              {profit >= 0 ? 'Profit' : 'Loss'}: ${Math.abs(profit).toFixed(2)} ({profitPercent}%)
            </p>
            <p className={`${theme.textSecondary}`}>Coins Earned: <span className="text-yellow-500 font-bold">{Math.max(30, Math.round(profit / 100))}</span></p>
          </div>
          <button 
            onClick={() => setActiveGame(null)}
            className={`${theme.accent} text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity`}
          >
            Back to Games
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className={`${theme.text} text-xl font-bold mb-2`}>Investment Year {year} of 5</h3>
          <p className={`${theme.textSecondary} mb-4`}>Portfolio Value: ${totalValue.toFixed(2)}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(portfolio).map(([key, value]) => (
            <div key={key} className={`${theme.cardBg} p-4 rounded-lg border ${theme.border} text-center`}>
              <h4 className={`${theme.text} font-semibold capitalize`}>{key}</h4>
              <p className={`${theme.textSecondary} text-lg font-bold`}>${value.toFixed(2)}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {investmentOptions.slice(0, 3).map((option) => (
            <div key={option.name} className={`${theme.cardBg} p-4 rounded-lg border ${theme.border}`}>
              <h4 className={`${theme.text} font-semibold mb-2`}>{option.name}</h4>
              <p className={`${theme.textSecondary} text-sm mb-3`}>
                Risk: {option.risk}<br/>
                Return: {option.return}
              </p>
              <div className="space-y-2">
                {[1000, 2000, 5000].map(amount => (
                  <button
                    key={amount}
                    onClick={() => allocateFunds(option.name.toLowerCase(), amount)}
                    disabled={portfolio.savings < amount}
                    className={`w-full px-3 py-2 rounded text-sm font-medium transition-opacity ${
                      portfolio.savings >= amount 
                        ? `${theme.accent} text-white hover:opacity-90` 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Invest ${amount}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button 
            onClick={nextYear}
            className={`${theme.accent} text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity`}
          >
            Advance to Year {year + 1}
          </button>
        </div>

        {marketEvents.length > 0 && (
          <div className={`${theme.cardBg} p-4 rounded-lg border ${theme.border}`}>
            <h4 className={`${theme.text} font-semibold mb-3`}>Market History</h4>
            <div className="space-y-2">
              {marketEvents.map((event, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className={theme.textSecondary}>Year {event.year}: {event.event}</span>
                  <span className={`font-bold ${theme.text}`}>${event.value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderGameContent = () => {
    switch (activeGame) {
      case 'budget-balance':
        return <BudgetBalanceGame />;
      case 'investment-race':
        return <InvestmentRaceGame />;
      default:
        return (
          <div className="text-center">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className={`${theme.text} text-xl font-bold mb-4`}>Game Coming Soon!</h3>
            <p className={`${theme.textSecondary} mb-6`}>This game is under development. Check back soon!</p>
            <button 
              onClick={() => setActiveGame(null)}
              className={`${theme.accent} text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity`}
            >
              Back to Games
            </button>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className={`${theme.textSecondary} text-lg`}>Loading games...</div>
      </div>
    );
  }

  if (activeGame) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveGame(null)}
            className={`${theme.cardBg} border ${theme.border} px-4 py-2 rounded-lg ${theme.text} hover:${theme.accent} hover:text-white transition-all duration-200`}
          >
            ← Back to Games
          </button>
          <h2 className={`${theme.text} text-2xl font-bold`}>
            {games.find(g => g.id === activeGame)?.title}
          </h2>
        </div>
        
        <div className={`${theme.cardBg} p-8 rounded-lg border ${theme.border}`}>
          {renderGameContent()}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className={`${theme.text} text-3xl font-bold mb-4`}>🎮 Financial Literacy Games</h2>
        <p className={`${theme.textSecondary} text-lg mb-6`}>
          Learn financial concepts through fun, interactive games and earn coins!
        </p>
        
        {/* Game Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className={`${theme.cardBg} p-4 rounded-lg border ${theme.border}`}>
            <div className="text-2xl mb-2">🎯</div>
            <div className={`${theme.text} font-bold text-lg`}>{gameStats.gamesPlayed}</div>
            <div className={`${theme.textSecondary} text-sm`}>Games Played</div>
          </div>
          <div className={`${theme.cardBg} p-4 rounded-lg border ${theme.border}`}>
            <div className="text-2xl mb-2">⭐</div>
            <div className={`${theme.text} font-bold text-lg`}>{gameStats.totalScore}</div>
            <div className={`${theme.textSecondary} text-sm`}>Total Score</div>
          </div>
          <div className={`${theme.cardBg} p-4 rounded-lg border ${theme.border}`}>
            <div className="text-2xl mb-2">🏆</div>
            <div className={`${theme.text} font-bold text-lg`}>{gameStats.highestScore}</div>
            <div className={`${theme.textSecondary} text-sm`}>Best Score</div>
          </div>
          <div className={`${theme.cardBg} p-4 rounded-lg border ${theme.border}`}>
            <div className="text-2xl mb-2">🪙</div>
            <div className={`text-yellow-500 font-bold text-lg`}>{gameStats.coinsEarned}</div>
            <div className={`${theme.textSecondary} text-sm`}>Coins Earned</div>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}

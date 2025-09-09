import React from 'react';
import { useTheme } from '../hooks/useTheme';

export default function DataDebugger({ expenses, title = "Data Debug" }) {
  const { theme } = useTheme();

  if (!expenses || !Array.isArray(expenses)) {
    return (
      <div className={`${theme.cardBg} p-4 rounded-lg border ${theme.border} mb-4`}>
        <h4 className={`${theme.text} font-semibold mb-2`}>🐛 {title}</h4>
        <p className={`${theme.textSecondary}`}>No data or invalid data format</p>
      </div>
    );
  }

  return (
    <div className={`${theme.cardBg} p-4 rounded-lg border ${theme.border} mb-4`}>
      <h4 className={`${theme.text} font-semibold mb-2`}>🐛 {title}</h4>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
        <div>
          <span className={theme.textSecondary}>Total Items:</span>
          <p className={`${theme.text} font-bold`}>{expenses.length}</p>
        </div>
        <div>
          <span className={theme.textSecondary}>With Timestamps:</span>
          <p className={`${theme.text} font-bold`}>
            {expenses.filter(exp => exp.timestamp).length}
          </p>
        </div>
        <div>
          <span className={theme.textSecondary}>Total Amount:</span>
          <p className={`${theme.text} font-bold`}>
            ${expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0).toFixed(2)}
          </p>
        </div>
        <div>
          <span className={theme.textSecondary}>Unique Dates:</span>
          <p className={`${theme.text} font-bold`}>
            {new Set(expenses.map(exp => {
              if (!exp.timestamp) return 'no-date';
              const date = exp.timestamp?.toDate ? exp.timestamp.toDate() : new Date(exp.timestamp);
              return date.toDateString();
            })).size}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <span className={`${theme.textSecondary} text-sm`}>Sample Expenses:</span>
        <div className="max-h-32 overflow-y-auto">
          {expenses.slice(0, 5).map((expense, index) => (
            <div key={index} className={`text-xs ${theme.textSecondary} border-b border-gray-200 dark:border-gray-700 pb-1 mb-1`}>
              <div className="flex justify-between items-center">
                <span>${expense.amount} - {expense.category}</span>
                <span>
                  {expense.timestamp ? 
                    (expense.timestamp?.toDate ? 
                      expense.timestamp.toDate().toLocaleDateString() : 
                      new Date(expense.timestamp).toLocaleDateString()
                    ) : 
                    'No timestamp'
                  }
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {expenses.length > 5 && (
        <p className={`${theme.textSecondary} text-xs mt-2`}>
          ... and {expenses.length - 5} more expenses
        </p>
      )}
    </div>
  );
}

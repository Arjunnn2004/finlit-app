import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function DatabaseTest() {
  const [expenses, setExpenses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testDatabase = async () => {
      try {
        // Test expenses collection
        const expensesSnapshot = await getDocs(collection(db, 'expenses'));
        const expensesData = expensesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setExpenses(expensesData);

        // Test users collection  
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersData);

        console.log('Expenses:', expensesData);
        console.log('Users:', usersData);
      } catch (error) {
        console.error('Database test error:', error);
      } finally {
        setLoading(false);
      }
    };

    testDatabase();
  }, []);

  if (loading) {
    return <div className="p-4">Testing database connection...</div>;
  }

  return (
    <div className="p-4 bg-gray-100 rounded">
      <h3 className="font-bold mb-4">Database Test Results</h3>
      
      <div className="mb-4">
        <h4 className="font-semibold">Expenses Collection ({expenses.length} documents):</h4>
        {expenses.length > 0 ? (
          <ul className="list-disc list-inside">
            {expenses.slice(0, 3).map(expense => (
              <li key={expense.id}>
                ${expense.amount} - {expense.category} - {expense.description}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-red-600">No expenses found. Create some in Firebase Console!</p>
        )}
      </div>

      <div>
        <h4 className="font-semibold">Users Collection ({users.length} documents):</h4>
        {users.length > 0 ? (
          <ul className="list-disc list-inside">
            {users.slice(0, 3).map(user => (
              <li key={user.id}>
                {user.name} - {user.coins} coins
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-red-600">No users found. Create some in Firebase Console!</p>
        )}
      </div>
    </div>
  );
}

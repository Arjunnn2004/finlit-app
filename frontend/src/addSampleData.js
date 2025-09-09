// Sample data script to populate your Firestore database
// Run this in your browser console on your app's page

import { collection, addDoc, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from './src/firebaseConfig.js';

// Sample expenses data
const sampleExpenses = [
  {
    userId: "sample-user-1",
    userEmail: "alice@example.com",
    userName: "Alice Johnson",
    amount: 12.50,
    category: "food",
    description: "Coffee and pastry",
    timestamp: serverTimestamp(),
    createdAt: "2025-09-08"
  },
  {
    userId: "sample-user-1", 
    userEmail: "alice@example.com",
    userName: "Alice Johnson",
    amount: 45.00,
    category: "bills",
    description: "Internet bill",
    timestamp: serverTimestamp(),
    createdAt: "2025-09-07"
  },
  {
    userId: "sample-user-2",
    userEmail: "bob@example.com", 
    userName: "Bob Smith",
    amount: 80.25,
    category: "entertainment",
    description: "Movie tickets",
    timestamp: serverTimestamp(),
    createdAt: "2025-09-06"
  },
  {
    userId: "sample-user-1",
    userEmail: "alice@example.com",
    userName: "Alice Johnson", 
    amount: 200.00,
    category: "savings",
    description: "Monthly savings",
    timestamp: serverTimestamp(),
    createdAt: "2025-09-05"
  }
];

// Sample users data
const sampleUsers = [
  {
    id: "sample-user-1",
    name: "Alice Johnson",
    email: "alice@example.com",
    coins: 250,
    totalExpenses: 257.50,
    expenseCount: 3,
    joinDate: "2025-09-01",
    lastActive: serverTimestamp()
  },
  {
    id: "sample-user-2", 
    name: "Bob Smith",
    email: "bob@example.com",
    coins: 180,
    totalExpenses: 80.25,
    expenseCount: 1,
    joinDate: "2025-09-02",
    lastActive: serverTimestamp()
  },
  {
    id: "sample-user-3",
    name: "Carol Davis", 
    email: "carol@example.com",
    coins: 320,
    totalExpenses: 450.75,
    expenseCount: 8,
    joinDate: "2025-08-28",
    lastActive: serverTimestamp()
  }
];

// Function to add sample data
async function addSampleData() {
  console.log('Adding sample expenses...');
  
  // Add expenses
  for (const expense of sampleExpenses) {
    try {
      const docRef = await addDoc(collection(db, 'expenses'), expense);
      console.log('Added expense with ID: ', docRef.id);
    } catch (error) {
      console.error('Error adding expense: ', error);
    }
  }
  
  console.log('Adding sample users...');
  
  // Add users
  for (const user of sampleUsers) {
    try {
      await setDoc(doc(db, 'users', user.id), {
        name: user.name,
        email: user.email,
        coins: user.coins,
        totalExpenses: user.totalExpenses,
        expenseCount: user.expenseCount,
        joinDate: user.joinDate,
        lastActive: user.lastActive
      });
      console.log('Added user: ', user.name);
    } catch (error) {
      console.error('Error adding user: ', error);
    }
  }
  
  console.log('Sample data added successfully!');
}

// Call the function
addSampleData();

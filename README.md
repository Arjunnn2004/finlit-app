# 🎮 FinQuest - Gamified Expense Tracker

[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.2.1-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.13-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-7.1.2-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)

**Turn your expense tracking into an epic adventure!** 🚀

FinQuest transforms the mundane task of expense tracking into an engaging, gamified experience. Earn XP, unlock achievements, collect coins, and level up while managing your finances responsibly.

![FinQuest Banner](https://via.placeholder.com/800x300/6366f1/ffffff?text=FinQuest+-+Gamified+Expense+Tracker)

## ✨ Features

### 🎯 Core Functionality
- **Smart Expense Tracking** - Add expenses with categories, amounts, and descriptions
- **Real-time Data Sync** - Live updates across all sessions using Firebase
- **Interactive Charts** - Beautiful data visualization with Recharts
- **Category Management** - Pre-defined categories with custom emojis and colors
- **CRUD Operations** - Full create, read, update, delete functionality

### 🎮 Gamification System
- **XP System** - Earn experience points for every expense logged
- **Level Progression** - Advance through levels based on XP earned
- **Achievement Badges** - Unlock achievements for various milestones
- **Coin Economy** - Collect coins as rewards for consistent tracking
- **Quest-themed UI** - Adventure-inspired interface design
- **Real-time Notifications** - Achievement unlocks with animated alerts

### 🎨 User Experience
- **Dark/Light Theme** - Toggle between themes with persistent preferences
- **Responsive Design** - Optimized for desktop, tablet, and mobile
- **Smooth Animations** - Engaging hover effects and transitions
- **Visual Feedback** - Color-coded categories and progress indicators
- **Modern UI** - Clean, intuitive interface with gradients and shadows

### 🔐 Authentication & Security
- **Firebase Authentication** - Secure user registration and login
- **User Data Isolation** - Each user's data is completely private
- **Session Management** - Persistent login sessions
- **Email Verification** - Optional email verification system

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project setup

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Minor
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Firebase Setup**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Create Firestore Database
   - Copy your Firebase config to `frontend/src/firebaseConfig.js`

4. **Configure Firebase Config**
   ```javascript
   // frontend/src/firebaseConfig.js
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id"
   };
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:5173
   ```

## 🏗️ Project Structure

```
Minor/
├── 📁 frontend/                 # React frontend application
│   ├── 📁 src/
│   │   ├── 📁 components/       # Reusable React components
│   │   │   ├── ChartView.jsx    # Data visualization component
│   │   │   ├── ExpenseForm.jsx  # Expense input and list
│   │   │   ├── GameStats.jsx    # Gamification dashboard
│   │   │   ├── LeaderBoard.jsx  # User rankings
│   │   │   └── TopNav.jsx       # Navigation header
│   │   ├── 📁 pages/           # Page components
│   │   │   ├── Dashboard.jsx    # Main dashboard
│   │   │   └── login.jsx        # Authentication page
│   │   ├── 📁 hooks/           # Custom React hooks
│   │   │   └── useTheme.js      # Theme management
│   │   ├── firebaseConfig.js    # Firebase configuration
│   │   ├── App.jsx             # Main application component
│   │   └── main.jsx            # Application entry point
│   ├── package.json            # Dependencies and scripts
│   └── vite.config.js          # Vite configuration
├── 📁 functions/               # Firebase Cloud Functions
├── 📁 dataconnect/            # Firebase Data Connect
├── firestore.rules            # Firestore security rules
├── firestore.indexes.json     # Database indexes
└── README.md                  # This file
```

## 🎮 Gamification Features

### XP & Leveling System
- **Base XP**: +10 XP for each expense logged
- **Bonus XP**: +5 XP for adding descriptions
- **Level Calculation**: Level = floor(XP / 100) + 1
- **Progress Tracking**: Visual progress bars for next level

### Achievement System
| Achievement | Description | Reward |
|-------------|-------------|---------|
| 🎯 First Step | Log your first expense | 10 XP + 50 Coins |
| 📝 Getting Started | Log 5 expenses | 10 XP + 50 Coins |
| 🔥 Habit Builder | Log 25 expenses | 10 XP + 50 Coins |
| 👑 Expert Tracker | Log 100 expenses | 10 XP + 50 Coins |
| ⚡ Week Warrior | 7-day logging streak | 10 XP + 50 Coins |
| 🏆 Month Master | 30-day logging streak | 10 XP + 50 Coins |
| 💰 Smart Saver | Save $100 in a month | 10 XP + 50 Coins |

### Coin Economy
- **Expense Logging**: +2 coins per expense
- **Achievement Unlocks**: +50 coins per achievement
- **Future Features**: Coin shop for themes and rewards

## 🎨 Theme System

The application supports both light and dark themes with:
- **Dynamic Color Schemes**: Automatically adapts all UI elements
- **Persistent Preferences**: Theme choice saved to localStorage
- **Smooth Transitions**: Animated theme switching
- **Category Colors**: Optimized for both light and dark modes

### Color Categories
- 🍕 **Food & Dining**: Orange gradient
- ✈️ **Travel & Transport**: Blue gradient  
- 🎬 **Entertainment**: Purple gradient
- 📄 **Bills & Utilities**: Gray gradient
- 💰 **Savings & Investment**: Green gradient

## 📊 Data Visualization

### Chart Features
- **Interactive Line Charts**: Hover tooltips with expense details
- **Category Breakdown**: Pie charts for spending analysis
- **Time-based Filtering**: Daily, weekly, monthly views
- **Responsive Design**: Adapts to different screen sizes
- **Real-time Updates**: Charts update automatically with new data

### Analytics Dashboard
- **Total Expenses**: Sum of all tracked expenses
- **Category Distribution**: Visual breakdown by category
- **Spending Trends**: Time-based spending patterns
- **Achievement Progress**: Visual progress tracking

## 🔧 Technical Stack

### Frontend
- **React 19.1.1**: Latest React with concurrent features
- **Vite 7.1.2**: Lightning-fast build tool and dev server
- **Tailwind CSS 4.1.13**: Utility-first CSS framework
- **Recharts 3.2.0**: Composable charting library
- **React Router DOM 7.8.2**: Client-side routing

### Backend & Database
- **Firebase 12.2.1**: Full backend-as-a-service
- **Firestore**: NoSQL document database
- **Firebase Authentication**: User management
- **Firebase Hosting**: Web hosting (optional)

### Development Tools
- **ESLint**: Code linting and formatting
- **Vite**: Fast development and build process
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server

# Building
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

### Development Workflow

1. **Component Development**: Create new components in `src/components/`
2. **Styling**: Use Tailwind CSS classes for consistent styling
3. **State Management**: Use React hooks for local state
4. **Firebase Integration**: Use Firebase SDK for backend operations
5. **Testing**: Test components in isolation and integration

### Adding New Features

1. **New Achievement**: Add to achievements array in `GameStats.jsx`
2. **New Category**: Update category data in `ExpenseForm.jsx`
3. **New Chart Type**: Extend `ChartView.jsx` with Recharts components
4. **Theme Colors**: Update theme configuration in `useTheme.js`

## 📱 Mobile Responsiveness

The application is fully responsive with:
- **Mobile-first Design**: Optimized for small screens
- **Touch-friendly Interface**: Large buttons and touch targets
- **Responsive Grid**: Adaptive layout for different screen sizes
- **Mobile Navigation**: Collapsible menu for mobile devices

## 🔐 Security & Privacy

### Data Security
- **Firestore Rules**: Server-side security rules
- **User Isolation**: Each user can only access their own data
- **Authentication Required**: All operations require valid authentication
- **Input Validation**: Client and server-side validation

### Privacy Features
- **No Data Sharing**: User data is completely private
- **Local Storage**: Minimal use of localStorage for preferences only
- **Secure Authentication**: Firebase handles password security
- **GDPR Compliance**: User data can be deleted on request

## 🚀 Deployment

### Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase
firebase init hosting

# Build and deploy
npm run build
firebase deploy
```

### Environment Variables
Create `.env` file for sensitive configuration:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

## 🐛 Troubleshooting

### Common Issues

**Q: Firebase connection errors**
A: Check your `firebaseConfig.js` settings and ensure Firebase project is properly configured.

**Q: Charts not displaying**
A: Verify that expenses exist in the database and check browser console for errors.

**Q: Authentication not working**
A: Ensure Firebase Authentication is enabled in your Firebase console.

**Q: Theme not persisting**
A: Check browser localStorage permissions and clear cache if necessary.

### Debug Mode
Enable debug logging by adding to your environment:
```env
VITE_DEBUG=true
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Contribution Guidelines
- Follow the existing code style
- Add comments for complex logic
- Update documentation for new features
- Test thoroughly before submitting
- Keep commits focused and descriptive

## 📋 Roadmap

### Upcoming Features
- [ ] **Budget Setting**: Monthly budget goals and tracking
- [ ] **Expense Categories**: Custom user-defined categories
- [ ] **Data Export**: CSV/PDF export functionality
- [ ] **Recurring Expenses**: Automated recurring expense tracking
- [ ] **Expense Photos**: Camera integration for receipt photos
- [ ] **Social Features**: Expense sharing and family tracking
- [ ] **AI Insights**: Smart spending analysis and recommendations
- [ ] **Offline Mode**: Progressive Web App with offline support

### Version History
- **v1.0.0**: Initial release with core features
- **v1.1.0**: Added gamification system
- **v1.2.0**: Enhanced UI/UX and theme system
- **v1.3.0**: Real-time achievements and notifications

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Firebase Team**: For the excellent backend infrastructure
- **React Team**: For the amazing frontend framework
- **Tailwind CSS**: For the utility-first CSS framework
- **Recharts**: For beautiful and customizable charts
- **Vite Team**: For the lightning-fast build tool

---

## 📞 Support

If you encounter any issues or have questions:

1. **Check the Documentation**: Review this README and inline comments
2. **Search Issues**: Look for similar issues in the repository
3. **Create an Issue**: Provide detailed information about the problem
4. **Community Support**: Join our Discord/Slack community

---

**Made with ❤️ for better financial tracking through gamification**

*Transform your expense tracking from a chore into an adventure!* 🎮💰

---

### 📊 Project Stats

![GitHub Stars](https://img.shields.io/github/stars/username/finquest?style=social)
![GitHub Forks](https://img.shields.io/github/forks/username/finquest?style=social)
![GitHub Issues](https://img.shields.io/github/issues/username/finquest)
![GitHub License](https://img.shields.io/github/license/username/finquest)

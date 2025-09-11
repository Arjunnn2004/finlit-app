# 🎮 FinQuest - AI-Powered Gamified Expense Tracker

[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.2.1-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.x-FF6F00?style=for-the-badge&logo=tensorflow)](https://tensorflow.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.13-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-7.1.2-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)

**Turn your expense tracking into an epic AI-powered adventure!** 🚀🤖

FinQuest transforms the mundane task of expense tracking into an engaging, gamified experience with intelligent ML predictions. Earn XP, unlock achievements, collect coins predicted by AI, and level up while managing your finances responsibly.

![FinQuest Banner](https://via.placeholder.com/800x300/6366f1/ffffff?text=FinQuest+-+AI+Powered+Expense+Tracker)

## ✨ Features

### 🤖 AI & Machine Learning
- **Smart Coin Prediction** - AI predicts coins earned before expense submission
- **TensorFlow Neural Network** - Trained model on spending behavior patterns
- **Real-time ML Preview** - See predicted rewards as you type
- **Intelligent Insights** - ML-powered spending analysis and recommendations
- **Confidence Scoring** - AI confidence levels for each prediction
- **Fallback System** - Robust rule-based backup when ML model unavailable

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
- Python 3.8+ (for ML API)
- TensorFlow 2.x (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd finlit-app
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Setup ML API (Optional - for AI features)**
   ```bash
   cd ../ml-api
   pip install flask flask-cors tensorflow scikit-learn joblib numpy pandas
   ```

4. **Firebase Setup**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Create Firestore Database
   - Copy your Firebase config to `frontend/src/firebaseConfig.js`

5. **Configure Firebase Config**
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

6. **Start the ML API server (Optional)**
   ```bash
   cd ml-api
   python app.py
   # Server will run on http://127.0.0.1:5000
   ```

7. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```

8. **Open your browser**
   ```
   http://localhost:5173
   ```

## 🏗️ Project Structure

```
finlit-app/
├── 📁 frontend/                 # React frontend application
│   ├── 📁 src/
│   │   ├── 📁 components/       # Reusable React components
│   │   │   ├── ChartView.jsx    # Data visualization component
│   │   │   ├── ExpenseForm.jsx  # Expense input with ML integration
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
├── 📁 ml-api/                  # Machine Learning API Server
│   ├── app.py                  # Flask API with TensorFlow integration
│   └── requirements.txt        # Python dependencies
├── 📁 ml_model/                # ML Model Training & Data
│   ├── train_spending_model.py # TensorFlow model training script
│   ├── finlit_expenses_dataset.csv # Training data (1000+ records)
│   └── 📁 ml_model/           # Generated model files
│       ├── spending_model.h5   # Trained TensorFlow model
│       ├── scaler.pkl          # Feature scaler
│       └── category_encoder.pkl # Category encoder
├── 📁 functions/               # Firebase Cloud Functions
├── 📁 dataconnect/            # Firebase Data Connect
├── firestore.rules            # Firestore security rules
├── firestore.indexes.json     # Database indexes
└── README.md                  # This file
```

## 🤖 AI & Machine Learning Features

### TensorFlow Neural Network
- **Model Architecture**: Multi-layer neural network trained on spending behavior
- **Features**: Amount, category, time patterns, spending velocity, budget ratios
- **Training Data**: 1000+ expense records with behavioral patterns
- **Performance**: Test Loss: 4.55, Test MAE: 1.71

### Real-time ML Predictions
- **Live Preview**: AI predicts coins as users type expense details
- **Confidence Scoring**: Shows prediction confidence (High/Medium/Low)
- **Factor Analysis**: Displays reasoning behind predictions
- **Debounced API**: Smart 500ms delay to prevent excessive API calls

### ML API Architecture
```python
# Flask API Structure
/predict-coins    # Main prediction endpoint
/health          # API health check
/test            # Testing endpoint
/categories      # Available categories
```

### Prediction Algorithm
```python
# Feature Engineering
features = [
    amount,                    # Expense amount
    category_encoded,          # One-hot encoded category
    hour_of_day,              # Time-based patterns
    day_of_week,              # Weekly patterns
    spending_velocity,         # Spending frequency
    category_frequency,        # Category usage patterns
    budget_ratio              # Budget adherence
]

# Neural Network Prediction
coins = model.predict(scaler.transform([features]))
```

### Fallback System
- **Rule-based Backup**: When ML model fails, uses intelligent rules
- **Graceful Degradation**: Seamless fallback without user disruption
- **Health Monitoring**: API health checks ensure system reliability

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
- **AI-Predicted Coins**: ML model predicts coin rewards before submission
- **Base Rewards**: +2 coins per expense (with AI adjustments)
- **Achievement Unlocks**: +50 coins per achievement
- **Smart Adjustments**: AI considers spending patterns and categories
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

### AI & Machine Learning
- **TensorFlow 2.x**: Neural network training and inference
- **Python 3.8+**: ML API backend runtime
- **Flask**: Lightweight API framework
- **NumPy & Pandas**: Data processing and manipulation
- **Scikit-learn**: Data preprocessing and utilities
- **Joblib**: Model serialization and loading

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
# Frontend Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         

# ML API Development
cd ml-api
python app.py        # Start ML API server (port 5000)

# Model Training
cd ml_model
python train_spending_model.py  # Train new ML model
```

### Development Workflow

1. **Component Development**: Create new components in `src/components/`
2. **Styling**: Use Tailwind CSS classes for consistent styling
3. **State Management**: Use React hooks for local state
4. **Firebase Integration**: Use Firebase SDK for backend operations
5. **ML Integration**: Use ML API endpoints for AI predictions
6. **Testing**: Test components in isolation and integration

### Adding New Features

1. **New Achievement**: Add to achievements array in `GameStats.jsx`
2. **New Category**: Update category data in `ExpenseForm.jsx`
3. **New Chart Type**: Extend `ChartView.jsx` with Recharts components
4. **Theme Colors**: Update theme configuration in `useTheme.js`
5. **ML Features**: Extend `ml-api/app.py` for new prediction types

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

### Frontend Deployment (Firebase Hosting)
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

### ML API Deployment
```bash
# For production deployment, consider:
# - Docker containerization
# - Cloud services (AWS, GCP, Azure)
# - Environment variables for model paths
# - Load balancing for high traffic

# Example Docker deployment
docker build -t finlit-ml-api .
docker run -p 5000:5000 finlit-ml-api
```

### Environment Variables
Create `.env` files for sensitive configuration:

**Frontend (.env)**:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_ML_API_URL=http://127.0.0.1:5000
```

**ML API (.env)**:
```env
MODEL_PATH=../ml_model/ml_model/
FLASK_ENV=production
CORS_ORIGINS=https://your-frontend-domain.com
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

**Q: ML API not connecting**
A: Ensure the ML API server is running on port 5000 and check CORS settings.

**Q: AI predictions not working**
A: Check if ML API is running, verify model files exist, and check browser network tab for API errors.

**Q: TensorFlow model loading errors**
A: Ensure TensorFlow version compatibility and check model file integrity.

### Debug Mode
Enable debug logging by adding to your environment:
```env
# Frontend
VITE_DEBUG=true

# ML API
FLASK_DEBUG=true
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
- [ ] **Advanced ML Models**: Deep learning for spending pattern analysis
- [ ] **Personalized AI**: User-specific model training and predictions
- [ ] **Budget Setting**: Monthly budget goals and tracking with AI recommendations
- [ ] **Expense Categories**: Custom user-defined categories with ML categorization
- [ ] **Data Export**: CSV/PDF export functionality
- [ ] **Recurring Expenses**: Automated recurring expense tracking
- [ ] **Expense Photos**: Camera integration for receipt photos with OCR
- [ ] **Social Features**: Expense sharing and family tracking
- [ ] **Enhanced AI Insights**: Advanced spending analysis and recommendations
- [ ] **Offline Mode**: Progressive Web App with offline support
- [ ] **Voice Input**: Voice-to-text expense logging
- [ ] **Predictive Budgeting**: ML-powered budget suggestions

### Version History
- **v1.0.0**: Initial release with core features
- **v1.1.0**: Added gamification system
- **v1.2.0**: Enhanced UI/UX and theme system
- **v1.3.0**: Real-time achievements and notifications
- **v2.0.0**: 🆕 AI Integration with TensorFlow ML predictions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Firebase Team**: For the excellent backend infrastructure
- **React Team**: For the amazing frontend framework
- **TensorFlow Team**: For the powerful machine learning framework
- **Tailwind CSS**: For the utility-first CSS framework
- **Recharts**: For beautiful and customizable charts
- **Vite Team**: For the lightning-fast build tool
- **Flask Team**: For the lightweight Python web framework

---

## 📞 Support

If you encounter any issues or have questions:

1. **Check the Documentation**: Review this README and inline comments
2. **Search Issues**: Look for similar issues in the repository
3. **Create an Issue**: Provide detailed information about the problem
4. **Community Support**: Join our Discord/Slack community

---

**Made with ❤️ for better financial tracking through intelligent gamification**

*Transform your expense tracking from a chore into an AI-powered adventure!* 🎮💰🚀

---

### 📊 Project Stats

![GitHub Stars](https://img.shields.io/github/stars/username/finquest?style=social)
![GitHub Forks](https://img.shields.io/github/forks/username/finquest?style=social)
![GitHub Issues](https://img.shields.io/github/issues/username/finquest)
![GitHub License](https://img.shields.io/github/license/username/finquest)

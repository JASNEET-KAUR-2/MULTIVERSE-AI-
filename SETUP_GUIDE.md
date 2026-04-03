# 🌟 multiverse.ai - Future Self Productivity System

A full-stack, production-ready modern web application focused on productivity, life planning, and habit tracking. This app helps users align daily actions with long-term goals through task management, habit tracking, AI insights, and gamification.

---

## 🎯 Core Features

### ✅ Task Management System
- Create, edit, delete, and mark tasks as complete
- Categories: Work, Study, Health, Personal, Future
- Priority levels: Easy, Medium, Hard
- Deadlines and automatic reminders
- Daily & weekly planner views
- Drag-and-drop task reordering
- Task filtering and search functionality
- XP rewards based on priority

### 📌 Habit Tracker
- Create and track daily habits
- Visual progress bars with target goals
- Streak tracking system (🔥)
- Daily completion tracking
- Automatic habit reset at midnight
- XP rewards for completion
- Habit performance analytics

### 🎯 Long-Term Goals
- Set goals with different time horizons (3 months, 1 year, 5 years)
- Track progress with visual sliders
- Goal status management (On Track, Needs Focus, Completed)
- Progress analytics and insights

### 📔 Daily Journal
- Write and store journal entries
- Mood tracking (Focused, Balanced, Drained, Motivated, Reflective)
- Mood statistics and patterns
- Searchable entry history
- Reflection timestamp tracking

### 🔔 Real-Time Notifications
- Deadline alerts (24 hours and 1 hour before)
- Task completion notifications
- Habit streak notifications
- Achievement unlocks
- Notification center with history
- Mark as read functionality
- Poll-based notification updates

### 📊 Dashboard & Analytics
- Task completion rate tracking
- Category-based task breakdown
- Mood pattern analysis
- Gamification stats (XP, Level, Streak)
- Real-time progress visualization
- Performance metrics

### 🏆 Gamification System
- XP awards: 50 (Easy), 100 (Medium), 150 (Hard)
- Daily streak tracking
- Level progression system
- Achievement system
- Motivational messages
- Daily activity tracking

### 🤖 AI Features
- Task prioritization suggestions
- Productivity insights
- Personalized daily recommendations
- Behavior pattern detection
- Future path planning

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **UI Components**: Custom component library
- **State Management**: React Context API
- **HTTP Client**: Fetch API with custom wrapper

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs for password hashing
- **Middleware**: CORS, Morgan logging

### ML/AI
- **Python**: 3.8+
- **ML Framework**: Scikit-learn
- **Feature Engineering**: Custom pipeline
- **API Integration**: Groq API for advanced LLM features

---

## 📁 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── app.js                 # Express app configuration
│   │   ├── server.js              # Server entry point
│   │   ├── config/
│   │   │   └── db.js              # MongoDB connection
│   │   ├── controllers/           # Route handlers
│   │   │   ├── taskController.js
│   │   │   ├── habitController.js
│   │   │   ├── goalController.js
│   │   │   ├── journalController.js
│   │   │   ├── notificationController.js
│   │   │   ├── questController.js
│   │   │   ├── authController.js
│   │   │   └── ...
│   │   ├── models/
│   │   │   ├── User.js            # User schema with all features
│   │   │   ├── Quest.js
│   │   │   └── ...
│   │   ├── routes/
│   │   │   ├── taskRoutes.js
│   │   │   ├── habitRoutes.js
│   │   │   ├── goalRoutes.js
│   │   │   ├── journalRoutes.js
│   │   │   ├── notificationRoutes.js
│   │   │   └── ...
│   │   ├── middleware/
│   │   │   └── authMiddleware.js
│   │   ├── services/
│   │   │   ├── gamificationService.js
│   │   │   ├── questService.js
│   │   │   └── ...
│   │   └── utils/
│   │       └── validation.js
│   ├── scripts/
│   │   ├── seed-demo.mjs
│   │   └── local-smoke-test.mjs
│   ├── .env                       # Environment variables (not in git)
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── api/
│   │   │   └── client.js          # API client with all endpoints
│   │   ├── components/
│   │   │   ├── NotificationCenter.jsx
│   │   │   ├── PlannerTaskBoard.jsx
│   │   │   ├── ProductivityDashboard.jsx
│   │   │   ├── AppFooter.jsx
│   │   │   └── ...
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/
│   │   │   ├── TaskManagementPage.jsx
│   │   │   ├── HabitTrackerPage.jsx
│   │   │   ├── GoalsPage.jsx
│   │   │   ├── JournalPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   └── ...
│   │   ├── styles/
│   │   │   └── index.css
│   │   └── utils/
│   │       └── progression.js
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
│
├── ml-model/
│   ├── app.py                     # ML API server
│   ├── train_model.py
│   ├── feature_engineering.py
│   ├── requirements.txt
│   └── synthetic_user_behavior.csv
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- MongoDB Atlas account (or local MongoDB)
- Groq API key (for AI features)

### Backend Setup

1. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables** (`.env`):
   ```env
   PORT=5000
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-secure-jwt-secret-key
   CLIENT_URL=http://localhost:5173
   ML_API_URL=http://127.0.0.1:8000
   GROQ_API_KEY=your-groq-api-key
   GROQ_API_URL=https://api.groq.com/openai/v1
   GROQ_MODEL=openai/gpt-oss-20b
   ```

3. **Start the backend**:
   ```bash
   npm run dev    # Development with nodemon
   npm start      # Production
   ```

   Backend runs on `http://localhost:5000`

### Frontend Setup

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Create `.env.local`**:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

   Frontend runs on `http://localhost:5173`

### ML Model Setup (Optional)

1. **Install Python dependencies**:
   ```bash
   cd ml-model
   pip install -r requirements.txt
   ```

2. **Train the model**:
   ```bash
   python train_model.py
   ```

3. **Start ML API server**:
   ```bash
   python app.py
   ```

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks` - Get all tasks (with filters)
- `GET /api/tasks/:taskId` - Get single task
- `PATCH /api/tasks/:taskId` - Update task
- `PATCH /api/tasks/:taskId/complete` - Mark task as complete
- `DELETE /api/tasks/:taskId` - Delete task
- `POST /api/tasks/reorder` - Drag-and-drop reordering
- `GET /api/tasks/search?q=query` - Search tasks

### Habits
- `POST /api/habits` - Create habit
- `GET /api/habits` - Get all habits
- `PATCH /api/habits/:habitId/progress` - Update progress
- `PATCH /api/habits/:habitId/increment` - Increment progress
- `PATCH /api/habits/:habitId/complete-today` - Mark complete
- `DELETE /api/habits/:habitId` - Delete habit

### Goals
- `POST /api/goals` - Create goal
- `GET /api/goals` - Get all goals (with filters)
- `PATCH /api/goals/:goalId` - Update goal
- `DELETE /api/goals/:goalId` - Delete goal

### Journal
- `POST /api/journal` - Create entry
- `GET /api/journal` - Get all entries (with filters)
- `PATCH /api/journal/:entryId` - Update entry
- `DELETE /api/journal/:entryId` - Delete entry
- `GET /api/journal/stats/mood` - Get mood statistics

### Notifications
- `GET /api/notifications` - Get all notifications
- `PATCH /api/notifications/:notificationId/read` - Mark as read
- `DELETE /api/notifications/:notificationId` - Delete notification
- `POST /api/notifications/check-deadlines` - Check and create deadline alerts

### Quests & Gamification
- `POST /api/quests/generate` - Generate daily quests
- `PATCH /api/quests/:questId/complete` - Complete quest

---

## 🎨 Design System

### Color Palette
- **Primary**: Indigo (#6366F1)
- **Secondary**: Emerald (#10B981)
- **Accent**: Amber (#F59E0B)
- **Dark**: Slate (#0F172A)
- **Light**: White (#FFFFFF)

### Typography
- **Font**: System fonts (Inter, Segoe UI)
- **Headings**: Bold, 18-48px
- **Body**: Regular, 12-16px

### Components
- **Border Radius**: 8-16px rounded corners
- **Spacing**: 4px, 8px, 12px, 16px, 24px, 32px
- **Shadows**: Soft shadows with 2-4px blur
- **Animations**: 0.2-0.5s with easing

---

## 🔐 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcryptjs with salt rounds
- **CORS Protection**: Configurable origins
- **Environment Variables**: Sensitive data in .env
- **Input Validation**: Server-side validation on all endpoints
- **Error Handling**: Comprehensive error responses

---

## 📝 Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  username: String,
  xp: Number,
  streak: Number,
  level: Number,
  plannerTasks: [],
  habitTracker: [],
  longTermGoals: [],
  journalEntries: [],
  notifications: [],
  analysis: {},
  behaviorProfile: {},
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🧪 Testing

### Seed Demo Data
```bash
cd backend
npm run seed:demo
```

### API Testing
```bash
npm run test:smoke
```

---

## 🎯 Future Enhancements

- [ ] Face recognition authentication (face-api.js)
- [ ] Real-time WebSocket notifications
- [ ] Browser push notifications with Service Workers
- [ ] Email notification integration
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Integration with calendar APIs
- [ ] Slack/Discord notifications
- [ ] Team collaboration features

---

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 🤝 Contributing

To contribute to this project:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

## 🙏 Acknowledgments

Built with ❤️ by the multiverse.ai team. Inspired by productivity methodologies like GTD, Pomodoro, and goal-setting frameworks.

---

**Design your future, one action at a time.** ✨

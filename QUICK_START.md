# ⚡ Quick Start Checklist

Get the app running in 5 minutes!

---

## ✅ Prerequisites Check

Run this before starting:

- [ ] **Node.js & npm** installed
  ```bash
  node --version  # v18+ required
  npm --version   # v9+ required
  ```

- [ ] **MongoDB** setup (local or cloud)
  - Local: MongoDB installed and running
  - Cloud: MongoDB Atlas account with connection string

- [ ] **Git** repo cloned
  ```bash
  git clone <repo-url>
  cd hackanovate
  ```

---

## 📋 Environment Setup (5 minutes)

### Step 1: Backend Configuration
```bash
cd backend
```

Create `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/hackanovate
# OR for MongoDB Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

JWT_SECRET=your-super-secret-jwt-key-make-it-long
PORT=5000
```

**Copy from example:**
```bash
cp .env.example .env  # if it exists
```

### Step 2: Install Backend Dependencies
```bash
npm install
```

### Step 3: Frontend Configuration
```bash
cd ../frontend
```

Create `.env.local` file:
```
VITE_API_URL=http://localhost:5000
```

### Step 4: Install Frontend Dependencies
```bash
npm install
```

---

## 🚀 Start the Application

### Terminal 1: Start Backend
```bash
cd backend
npm run dev
```

Expected output:
```
MongoDB connected to mongodb://localhost:27017/hackanovate
Server is running on http://localhost:5000
```

### Terminal 2: Start Frontend (new terminal tab)
```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v5.0.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Terminal 3: Test API (optional - new terminal tab)
```bash
curl http://localhost:5000/health 2>/dev/null | head -20
```

---

## 🌐 Access the Application

1. **Open Browser**
   ```
   http://localhost:5173
   ```

2. **You should see:** Home page with login option

3. **Create Account**
   - Email: `test@example.com`
   - Password: `password123`
   - Click "Sign Up"

4. **Verify Login**
   - You should be redirected to dashboard
   - Check browser DevTools (F12) Console tab for errors

---

## 🧪 Quick Feature Test

### Test Task Management
```
1. Click "Tasks" in navigation
2. Click "+ New Task" button
3. Fill in: Title, Description, Category, Priority
4. Click "Create Task"
5. You should see task appear in list
```

### Test Habit Tracking
```
1. Click "Habits" in navigation
2. Create new habit (name: "Meditation", target: 30)
3. Click "+1 Unit" button
4. Click "Complete Today" button
5. Verify progress bar updates
```

### Test Goals
```
1. Click "Goals" in navigation
2. Create new goal (3 Months horizon)
3. Drag progress slider
4. Verify status dropdown changes
```

### Test Journal
```
1. Click "Journal" in navigation
2. Click "+ New Entry" button
3. Select mood emoji
4. Write title and content
5. Click "Save Entry"
```

---

## 🔍 Verify Everything Works

### Check Console for Errors
```
Press F12 → Console tab → Should be clean (0 errors)
```

### Test API Directly
```bash
# Get token from login
TOKEN="your-jwt-token-from-browser"

# Test create task
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Test","category":"Work","priority":"Easy"}'
```

### Check Database
**MongoDB Compass** (GUI):
1. Download: https://www.mongodb.com/products/compass
2. Connect: `mongodb://localhost:27017`
3. Browse: Database `hackanovate` → Collection `users`
4. Verify your account document exists

---

## ⚠️ Troubleshooting

### "Cannot connect to MongoDB"
```bash
# Check if MongoDB is running
mongod

# Or verify connection string
MONGODB_URI=mongodb://localhost:27017/hackanovate
```

### "Cannot GET /api/tasks" (404 Error)
```bash
# Backend not running
# Solution: Run "npm run dev" in backend terminal
cd backend && npm run dev
```

### "Blank page on localhost:5173"
```bash
# Frontend not built
# Solution: Restart Vite
cd frontend && npm run dev
```

### "CORS Error"
```bash
# Backend CORS not configured
# Check: backend/src/app.js has:
import cors from "cors";
app.use(cors());
```

**See TROUBLESHOOTING.md for detailed solutions**

---

## 📁 File Structure Reference

```
hackanovate/
├── backend/                 # Express server
│   ├── src/
│   │   ├── app.js          # Express setup
│   │   ├── controllers/    # Business logic
│   │   ├── routes/         # API routes
│   │   ├── models/         # Database schemas
│   │   └── middleware/     # Auth, error handling
│   ├── server.js           # Entry point
│   ├── .env                # Environment variables
│   └── package.json
│
├── frontend/               # React Vite app
│   ├── src/
│   │   ├── App.jsx         # Main component
│   │   ├── pages/          # Full page components
│   │   ├── components/     # Reusable components
│   │   ├── api/            # API client
│   │   ├── context/        # Auth, Theme state
│   │   └── styles/         # Global CSS
│   ├── index.html          # HTML entry point
│   ├── .env.local          # Local environment
│   └── package.json
│
└── DOCUMENTATION FILES:
    ├── SETUP_GUIDE.md              # Full setup instructions
    ├── IMPLEMENTATION_SUMMARY.md   # What was built
    ├── API_REFERENCE.md            # All API endpoints
    ├── DEVELOPER_GUIDE.md          # Code patterns & structure
    ├── TROUBLESHOOTING.md          # Common issues
    └── QUICK_START.md              # This file!
```

---

## 🎯 Next Steps (After Getting Running)

### 1. Explore the Code
Read DEVELOPER_GUIDE.md for:
- Code structure
- How to add features
- Design patterns used

### 2. View All Endpoints
See API_REFERENCE.md for:
- Complete API documentation
- Request/response examples
- Test with Postman

### 3. Understand What's Built
Check IMPLEMENTATION_SUMMARY.md for:
- Feature overview
- Files created
- What's ready to use

### 4. Deploy to Production
See SETUP_GUIDE.md section "Deployment" for:
- MongoDB Atlas setup
- Backend hosting (Heroku, Railway, DigitalOcean)
- Frontend hosting (Vercel, Netlify)

---

## 🔑 Important Credentials (Development Only)

### Test Account
```
Email: test@example.com
Password: password123
```

Create your own on the signup page.

### MongoDB Connection
```
mongodb://localhost:27017/hackanovate  # Local development
```

### JWT Secret
```bash
# In .env file
JWT_SECRET=dev-secret-key  # Generate a real one for production
```

---

## 🚨 Common Mistakes to Avoid

- ❌ Don't commit `.env` file to git
- ❌ Don't use same password locally and production
- ❌ Don't forget to `npm install` after cloning
- ❌ Don't run backend and frontend in same terminal
- ❌ Don't keep MongoDB running 24/7 on local machine

---

## 💾 Useful NPM Commands

```bash
# Backend
cd backend
npm run dev        # Start dev server with hot reload
npm start          # Start production server
npm test           # Run tests (if available)

# Frontend
cd frontend
npm run dev        # Start Vite dev server
npm run build      # Build for production
npm run preview    # Preview production build
```

---

## 📞 Getting Help

1. **Check TROUBLESHOOTING.md** - 90% of issues covered
2. **Check browser console** (F12) - Errors shown there
3. **Check terminal output** - Backend errors shown in terminal
4. **Read DEVELOPER_GUIDE.md** - If modifying code

---

## ✅ Final Verification

Before considering "up and running":

- [ ] Backend server running on port 5000
- [ ] Frontend accessible at http://localhost:5173
- [ ] Can create user account
- [ ] Can create task and see it in list
- [ ] Can create habit and increment progress
- [ ] Can create goal with progress slider
- [ ] Can create journal entry with mood
- [ ] Browser console has no errors
- [ ] Network tab shows successful API calls

**All checked? You're ready to go! 🎉**

---

## 🎓 Learning Path

1. **First 30 mins:** Get app running (this checklist)
2. **Next 30 mins:** Create test data and explore features
3. **Next hour:** Read DEVELOPER_GUIDE.md and understand code
4. **Next 2 hours:** Try modifying a component or adding a feature
5. **Optional:** Learn about deployment in SETUP_GUIDE.md

---

**Last Updated:** January 2024  
**Time to First Success:** ~5 minutes from here ⚡

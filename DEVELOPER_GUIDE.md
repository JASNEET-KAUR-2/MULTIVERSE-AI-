# 👨‍💻 Developer Quick Reference Guide

## 🎯 Getting Oriented

### First Time Setup
1. Clone the repository
2. Follow SETUP_GUIDE.md for complete setup
3. Read this guide for code structure understanding
4. Check out IMPLEMENTATION_SUMMARY.md for feature overview

---

## 📂 File Structure Quick Navigation

### 🔧 Backend Structure

```
backend/
├── server.js              # Entry point - starts the server
├── src/
│   ├── app.js            # Express app setup (CORS, routes, error handling)
│   ├── config/
│   │   └── db.js         # MongoDB connection setup
│   ├── controllers/      # Request handlers - THIS IS WHERE LOGIC LIVES
│   │   ├── taskController.js      (350+ lines)
│   │   ├── habitController.js     (350+ lines)
│   │   ├── goalController.js      (150+ lines)
│   │   ├── journalController.js   (200+ lines)
│   │   ├── notificationController.js (250+ lines)
│   │   └── ...
│   ├── models/          # MongoDB schemas
│   │   └── User.js      # Main user document with all embedded fields
│   ├── routes/          # API route definitions
│   │   ├── taskRoutes.js
│   │   ├── habitRoutes.js
│   │   ├── goalRoutes.js
│   │   ├── journalRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── ...
│   ├── middleware/      # Express middleware
│   └── services/        # Business logic utilities
├── .env                 # Environment variables (secrets)
└── package.json         # Dependencies
```

### 🎨 Frontend Structure

```
frontend/
├── src/
│   ├── App.jsx          # Main app with routing setup
│   ├── main.jsx         # React entry point
│   ├── api/
│   │   └── client.js    # ALL API calls go through here
│   ├── components/      # Reusable UI components
│   │   ├── NotificationCenter.jsx      (180+ lines)
│   │   ├── ProductivityDashboard.jsx   (250+ lines)
│   │   ├── PlannerTaskBoard.jsx
│   │   └── ...
│   ├── context/         # Global state (Auth, Theme)
│   ├── pages/          # Full-page components
│   │   ├── TaskManagementPage.jsx      (400+ lines)
│   │   ├── HabitTrackerPage.jsx        (380+ lines)
│   │   ├── GoalsPage.jsx               (350+ lines)
│   │   ├── JournalPage.jsx             (320+ lines)
│   │   └── ...
│   └── styles/         # Global CSS
└── package.json
```

---

## 🚀 Adding a New Feature

### Step 1: Design the API
Define your endpoint needs:
```javascript
// Example for new feature: Notifications
GET    /api/notifications         # Get all
POST   /api/notifications         # Create
PATCH  /api/notifications/:id/read # Update
DELETE /api/notifications/:id     # Delete
```

### Step 2: Create the Controller
Create `backend/src/controllers/featureController.js`:
```javascript
export const getFeatures = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }
    res.json({ features: user.features || [] });
  } catch (error) {
    next(error);
  }
};
```

### Step 3: Create the Routes
Create `backend/src/routes/featureRoutes.js`:
```javascript
import { Router } from "express";
import { getFeatures, createFeature } from "../controllers/featureController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();
router.get("/", authMiddleware, getFeatures);
router.post("/", authMiddleware, createFeature);

export default router;
```

### Step 4: Register Routes
In `backend/src/app.js`:
```javascript
import featureRoutes from "./routes/featureRoutes.js";
// ...
app.use("/api/features", featureRoutes);
```

### Step 5: Create Frontend Page
Create `frontend/src/pages/FeaturePage.jsx`:
```javascript
import { useState, useEffect } from "react";
import { api } from "../api/client";

export default function FeaturePage() {
  const [features, setFeatures] = useState([]);
  
  useEffect(() => {
    api.getFeatures(token).then(res => setFeatures(res.features));
  }, [token]);
  
  return <div>{/* Your UI */}</div>;
}
```

### Step 6: Add Routes in App.jsx
```javascript
import FeaturePage from "./pages/FeaturePage.jsx";
// In Routes...
<Route path="/features" element={<FeaturePage />} />
```

### Step 7: Add API Methods
In `frontend/src/api/client.js`:
```javascript
export const api = {
  // ...existing methods
  getFeatures: (token) => request("/features", { token }),
  createFeature: (token, payload) => 
    request("/features", { method: "POST", token, body: payload })
};
```

---

## 💾 Database Schema Patterns

### Embedded Documents Pattern (What We Use)
```javascript
// User has nested arrays of documents
const user = {
  _id: "user123",
  email: "user@example.com",
  tasks: [
    { _id: "task1", title: "...", completed: false },
    { _id: "task2", title: "...", completed: true }
  ]
}

// Access via: user.tasks.id("task1")
const task = user.tasks.id("task1");
task.completed = true;
await user.save();
```

### Alternative: Separate Collections (For Scalability)
```javascript
// When data gets large, consider separate collection
db.tasks = [
  { _id: "task1", userId: "user123", title: "..." }
]

// Query: Task.find({ userId: "user123" })
```

---

## 🔍 Common Code Patterns

### Controller Error Handling Pattern
```javascript
export const functionName = async (req, res, next) => {
  try {
    // Your code here
    res.json({ message: "Success", data: result });
  } catch (error) {
    next(error); // Pass to error middleware
  }
};
```

### API Client Pattern
```javascript
// Always use the client, never fetch directly
const result = await api.getTasks(token);

// Client handles:
// - URL building
// - Headers
// - JSON serialization
// - Error handling
```

### Frontend Data Fetching Pattern
```javascript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);
      const response = await api.getFeatures(token);
      setData(response.features || []);
    } catch (error) {
      console.error("Failed:", error);
    } finally {
      setLoading(false);
    }
  };
  loadData();
}, [token]);
```

### Form Submission Pattern
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!formData.title) return; // Validate
  
  try {
    const response = await api.createFeature(token, formData);
    setData([...data, response.feature]);
    setFormData({ title: "" }); // Reset
  } catch (error) {
    console.error("Error:", error);
  }
};
```

---

## 🎨 UI Component Patterns

### Modal Component Pattern
```jsx
{showModal && (
  <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center">
    <motion.div 
      className="bg-white rounded-2xl p-8"
      initial={{ scale: 0.95 }} 
      animate={{ scale: 1 }}
    >
      {/* Form content */}
    </motion.div>
  </motion.div>
)}
```

### Stats Card Component Pattern
```jsx
<motion.div 
  className="bg-indigo-50 rounded-2xl p-6"
  initial={{ opacity: 0, y: 20 }} 
  animate={{ opacity: 1, y: 0 }}
>
  <p className="text-sm text-slate-600">Label</p>
  <p className="text-3xl font-bold mt-2">Value</p>
</motion.div>
```

### List Items with Actions
```jsx
{items.map((item) => (
  <motion.div key={item._id} className="flex items-center justify-between">
    <div>{/* Item details */}</div>
    <button onClick={() => handleDelete(item._id)}>Delete</button>
  </motion.div>
))}
```

---

## 🧪 Testing Your Changes

### 1. Test Backend Endpoint Manually
```bash
# Using curl or Postman
POST http://localhost:5000/api/features
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
{ "title": "Test Feature" }
```

### 2. Test Frontend Component
- Open browser DevTools (F12)
- Check Console for errors
- Use React DevTools to inspect state
- Use Network tab to see API calls

### 3. Test with Real Data
```bash
# Seed test data
npm run seed:demo
```

---

## 🐛 Debugging Tips

### Backend Debugging
```javascript
// Add console logs
console.log("userId:", req.user._id);
console.log("tasks:", user.tasks);

// Use VS Code debugger
// Add breakpoints and run: node --inspect-brk server.js

// Check MongoDB directly
// Use MongoDB Compass to view collections
```

### Frontend Debugging
```javascript
// React DevTools Chrome extension
// Console errors appear at bottom right
// Use network tab to check API responses
// Use local storage viewer for auth tokens

// Add debug prints
console.log("tasks:", tasks);
```

---

## 📚 Key Concepts

### Request Flow
```
User Action → Frontend Component → api.method() → Backend Route 
→ Controller → User.findById() → res.json() → Frontend State Update
```

### Authentication Flow
```
Login → JWT Token Created → Stored in localStorage 
→ Sent with every API call → authMiddleware Validates 
→ req.user._id Available in Controllers
```

### Gamification Flow
```
Task Completed → XP Awarded → user.xp += amount 
→ Streak Checked → Level Calculated → UI Updated
```

---

## 🔐 Security Checklist

- [ ] Always validate input on server
- [ ] Use authMiddleware on protected routes
- [ ] Filter data by `req.user._id`
- [ ] Never expose passwords
- [ ] Use HTTPS in production
- [ ] Validate JWT tokens
- [ ] Use environment variables for secrets

---

## 📞 Common Issues & Solutions

### "Cannot find module" Error
```
Solution: Run npm install in the directory
```

### CORS Error in Frontend
```
Solution: Check VITE_API_URL in .env.local
Make sure backend /api/app routes are registered
```

### "User not found" Error
```
Solution: Ensure token is valid
Check if user exists in MongoDB
Verify _id is passed correctly
```

### Tasks Not Appearing
```
Solution: Check api.getTasks returns correct data
Check Frontend useEffect dependencies
Verify tasks exist in MongoDB
```

---

## 🎯 Performance Optimization Tips

1. **Database**: Use indexes on frequently queried fields
2. **Frontend**: Use React.memo() for expensive components
3. **API**: Filter data before returning (don't send unnecessary fields)
4. **Animations**: Use transform/opacity instead of width/height
5. **Images**: Use lazy loading

---

## 📞 Helpful Resources

- Express Docs: https://expressjs.com
- MongoDB Docs: https://docs.mongodb.com
- React Docs: https://react.dev
- Tailwind Docs: https://tailwindcss.com
- Framer Motion Docs: https://www.framer.com/motion

---

## ✅ Checklist Before Committing

- [ ] Code follows existing patterns
- [ ] No console.log() left in production code
- [ ] Error handling included
- [ ] Function documented with comments
- [ ] No breaking changes to existing APIs
- [ ] Frontend and backend changes aligned
- Tests pass locally

---

**Happy coding! 🚀**

Remember: When in doubt, follow the patterns established in existing controllers and components.

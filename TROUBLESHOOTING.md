# 🛠️ Troubleshooting Guide

Quick solutions to common problems during development and deployment.

---

## 🔴 Backend Issues

### "Cannot find module" Error
```
Error: Cannot find module 'express'
```

**Solution:**
```bash
cd backend
npm install
```

**Root Cause:** Dependencies not installed after cloning repository.

---

### "ENOENT: no such file or directory, open '.env'"
```
Error: ENOENT: no such file or directory, open '.env'
```

**Solution:**
1. Create `.env` file in backend directory:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your-secret-key-here
PORT=5000
```

2. Or copy from `.env.example`:
```bash
cp .env.example .env
```

**Root Cause:** Environment variables file not created.

---

### "Cannot GET /" or CORS Error
```
Error: No 'Access-Control-Allow-Origin' header is present on the requested resource
```

**Solution:**

Check `backend/src/app.js` has CORS configured:
```javascript
import cors from "cors";
app.use(cors());
```

If still failing:
```javascript
app.use(cors({
  origin: "http://localhost:5173", // Your frontend URL
  credentials: true
}));
```

**Root Cause:** CORS not enabled or wrong frontend URL configured.

---

### "MongooseError: cast to ObjectId failed"
```
Error: Cast to ObjectId failed for value "invalid" at path "_id"
```

**Solution:**

Verify ID is valid MongoDB ObjectId format:
```javascript
// ❌ WRONG
const task = await Task.findById("123");

// ✅ CORRECT
const task = await Task.findById("507f1f77bcf86cd799439011");
```

Check that `req.params.id` is a valid ObjectId before querying.

**Root Cause:** Invalid ID format sent to API.

---

### "TypeError: Cannot read property 'password' of null"
```
Error: TypeError: Cannot read property 'password' of null
```

**Solution:**

Add null check before accessing properties:
```javascript
// ✅ CORRECT
const user = await User.findOne({ email });
if (!user) {
  const error = new Error("User not found");
  error.status = 401;
  throw error;
}
// Now safe to access user.password
```

**Root Cause:** User not found in database but code tried to access their properties.

---

### "JsonWebTokenError: invalid token"
```
Error: JsonWebTokenError: invalid token
```

**Solution:**

1. Make sure token is being sent in header:
```javascript
// ✅ CORRECT
Authorization: Bearer eyJhbGc...

// ❌ WRONG
Authorization: eyJhbGc...  // Missing "Bearer "
```

2. Check token hasn't expired:
```javascript
// In authMiddleware
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
} catch (err) {
  if (err.name === 'TokenExpiredError') {
    // Re-login required
  }
}
```

**Root Cause:** Malformed token or token expired.

---

### Server Crashes with No Error Message
**Solution:**

1. Add error handling middleware at end of `app.js`:
```javascript
app.use((error, req, res, next) => {
  console.error("Error:", error);
  res.status(error.status || 500).json({ 
    error: error.message || "Server error" 
  });
});
```

2. Run with debug logging:
```bash
DEBUG=* npm start
```

3. Check for unhandled promise rejections:
```javascript
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});
```

**Root Cause:** Missing error handling or async errors not caught.

---

## 🟡 Frontend Issues

### "Vite failed to resolve import"
```
Error: Failed to resolve import "[module]"
```

**Solution:**

1. Reinstall dependencies:
```bash
cd frontend
npm install
```

2. Restart Vite dev server:
```bash
npm run dev
```

3. Check import path is correct:
```javascript
// ✅ CORRECT
import { api } from "../api/client";

// ❌ WRONG
import { api } from "../api/client.js"; // Don't include .js in Vite
```

**Root Cause:** Module not found or incorrect import path.

---

### "Blank Page on localhost:5173"
**Solution:**

1. Check browser console (F12) for errors
2. Verify `frontend/index.html` has `<div id="root"></div>`
3. Check `frontend/src/main.jsx` exists:
```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

4. Restart dev server:
```bash
npm run dev
```

**Root Cause:** Bundle not generated or root element missing.

---

### "Cannot POST /api/..." (Network Error)
```
XMLHttpRequest POST http://localhost:5000/api/tasks 404
```

**Solution:**

1. Verify backend is running:
```bash
# In another terminal
cd backend
npm run dev
```

2. Check API URL in frontend:
```javascript
// frontend/src/api/client.js
const baseURL = "http://localhost:5000";
```

3. Verify backend routes are registered:
```javascript
// backend/src/app.js
import taskRoutes from "./routes/taskRoutes.js";
app.use("/api/tasks", taskRoutes);
```

**Root Cause:** Backend not running or wrong API URL.

---

### "Unexpected token < in JSON at position 0"
```
SyntaxError: Unexpected token < in JSON at position 0
```

**Solution:**

Backend is returning HTML instead of JSON. Check:
1. API endpoint exists and is registered
2. Correct HTTP method used (GET vs POST)
3. URL is correct: `http://localhost:5000/api/tasks` not `/tasks`

Add debugging:
```javascript
// In api/client.js
const res = await fetch(url, options);
const text = await res.text();
console.log("Response:", text);
const data = JSON.parse(text);
```

**Root Cause:** 404 error returning HTML error page instead of JSON.

---

### "Undefined" values appearing in UI
**Solution:**

1. Check if data is loading:
```javascript
const [tasks, setTasks] = useState(null);

if (tasks === null) return <div>Loading...</div>;
```

2. Use optional chaining:
```javascript
// ✅ Safe
const taskTitle = tasks?.[0]?.title;

// ❌ Crashes if tasks is null
const taskTitle = tasks[0].title;
```

3. Add fallback values:
```javascript
<div>{task?.title || "Untitled"}</div>
```

**Root Cause:** Component rendered before data fetched.

---

### "Token not persisting after page refresh"
**Solution:**

1. Save token to localStorage on login:
```javascript
localStorage.setItem("token", response.token);
```

2. Read token on app load:
```javascript
const savedToken = localStorage.getItem("token");
```

3. Verify AuthContext persists token:
```javascript
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return localStorage.getItem("token");
  });

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  return (
    <AuthContext.Provider value={{ token, login }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**Root Cause:** Token only in memory, not persisted to localStorage.

---

### "Protected Routes Showing Login Page"
**Solution:**

Check `ProtectedRoute.jsx`:
```javascript
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { token } = useContext(AuthContext);
  
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  
  return children;
}
```

Verify routes use ProtectedRoute:
```javascript
<Route 
  path="/tasks" 
  element={<ProtectedRoute><TaskManagementPage /></ProtectedRoute>} 
/>
```

**Root Cause:** ProtectedRoute not checking token correctly.

---

## 🟠 Database Issues

### "MongoNetworkError: connect ECONNREFUSED"
```
Error: MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**

MongoDB connection failed. Check:
1. MongoDB is running locally:
```bash
mongod
```

Or use MongoDB Atlas cloud connection:
```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname
```

2. Verify connection string in `.env`:
```
MONGODB_URI=mongodb://localhost:27017/hackanovate
```

**Root Cause:** MongoDB service not running or incorrect connection string.

---

### "MongooseError: Model.collection.insertOne() buffering timed out"
```
Error: MongooseError: Model.collection.insertOne() buffering timed out
```

**Solution:**

Connection not establishing. Try:
1. Check MongoDB Atlas IP whitelist (add 0.0.0.0/0 for development)
2. Verify network connectivity
3. Increase timeout:
```javascript
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
});
```

**Root Cause:** Network issue or IP not whitelisted.

---

### "E11000 duplicate key error"
```
Error: E11000 duplicate key error collection: test.users index: email_1 dup key: { : "user@example.com" }
```

**Solution:**

Email already exists. Add check before creating:
```javascript
const existingUser = await User.findOne({ email });
if (existingUser) {
  const error = new Error("Email already registered");
  error.status = 400;
  throw error;
}
```

Or allow duplicates for development:
```javascript
// In MongoDB shell
db.users.deleteMany({ email: "user@example.com" });
```

**Root Cause:** Duplicate email in unique field.

---

## 🔵 Deployment Issues

### "Cannot read .env file"
**Solution:**

On hosting platforms, set environment variables directly:

**Heroku:**
```bash
heroku config:set MONGODB_URI=mongodb+srv://...
heroku config:set JWT_SECRET=your-secret
```

**Railway:**
Set in .railway.toml or dashboard

**Vercel (Frontend only):**
```javascript
// Use VITE_ prefix
VITE_API_URL=https://api.example.com
```

**Root Cause:** .env file not committed to git (shouldn't be).

---

### "Cannot find frontend assets"
**Solution:**

Build frontend before deploying:
```bash
cd frontend
npm run build
```

Serve from backend:
```javascript
import express from "express";
import path from "path";

app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});
```

**Root Cause:** Frontend not built or routing not configured.

---

### "502 Bad Gateway"
**Solution:**

1. Check backend is actually running:
```bash
curl http://localhost:5000/health
```

2. Increase timeout:
```nginx
proxy_connect_timeout 600s;
proxy_send_timeout 600s;
proxy_read_timeout 600s;
```

3. Check logs:
```bash
heroku logs -t
```

**Root Cause:** Backend not responding or crashed.

---

## 📊 Performance Issues

### Slow API Responses
**Solution:**

1. Add indexes to frequently queried fields:
```javascript
// In User schema
userSchema.index({ email: 1 });
userSchema.index({ "plannerTasks.deadline": 1 });
```

2. Limit data returned:
```javascript
// ❌ Returns everything
const user = await User.findById(userId);

// ✅ Return only needed fields
const user = await User.findById(userId).select("xp level streak");
```

3. Use pagination:
```javascript
const page = req.query.page || 1;
const limit = 20;
const tasks = await User.findById(userId)
  .select("plannerTasks")
  .slice("plannerTasks", (page - 1) * limit, page * limit);
```

---

### High Memory Usage
**Solution:**

Close unused streams and connections:
```javascript
// ✅ Limit connections
const pool = mongoose.connection.getClient();
pool.options.maxPoolSize = 10;
```

Use lean() for read-only queries:
```javascript
// Less memory
const tasks = await Task.find().lean();
```

---

## ✅ Verification Checklist

Before pushing to production:

- [ ] All routes tested with Postman
- [ ] Frontend components render without errors
- [ ] Database connections working
- [ ] Error handling in place
- [ ] Environment variables set
- [ ] No console.log() left in code
- [ ] Authentication working
- [ ] Protected routes blocking unauthenticated users
- [ ] CORS configured correctly
- [ ] Frontend built: `npm run build`
- [ ] .env not committed to git
- [ ] No hardcoded secrets in code

---

## 📞 Getting Help

### Check These Files First
1. `SETUP_GUIDE.md` - Setup instructions
2. `IMPLEMENTATION_SUMMARY.md` - What was built
3. `API_REFERENCE.md` - All endpoints
4. `DEVELOPER_GUIDE.md` - Code patterns

### Debug Tools
- **Browser DevTools:** F12 in any browser
- **MongoDB Compass:** GUI for MongoDB
- **Postman:** Test APIs
- **VS Code Debugger:** Debug Node.js
- **React DevTools:** Extensions for React debugging

### Common Commands
```bash
# Backend
cd backend && npm install
npm run dev
npm start

# Frontend
cd frontend && npm install
npm run dev
npm run build

# Database
mongod
mongo
```

### Server Logs Location
- Backend: Terminal where server is running
- Frontend: Browser console (F12)
- Production: Usually in hosting platform dashboard

---

**Last Updated:** January 2024  
**For Issues:** Check this guide first, then check project documentation.

# 📡 Complete API Reference

> Base URL: `http://localhost:5000/api`  
> Authentication: All requests (except /auth routes) require `Authorization: Bearer TOKEN` header

---

## 🔐 Authentication Routes
**Base: `/auth`**

| Method | Endpoint | Purpose | Body |
|--------|----------|---------|------|
| POST | `/signup` | Create account | `{ email, password }` |
| POST | `/login` | Get JWT token | `{ email, password }` |
| GET | `/profile` | Get user info | - |

**Response Example:**
```json
{
  "user": {
    "_id": "user123",
    "email": "user@example.com",
    "xp": 1200,
    "level": 5,
    "streak": 7
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## ✅ Task Management Routes
**Base: `/tasks`**

| Method | Endpoint | Purpose | Body |
|--------|----------|---------|------|
| **GET** | `/` | Get all tasks | - |
| **GET** | `/search?q=keyword` | Search tasks | - |
| **GET** | `/:taskId` | Get single task | - |
| **POST** | `/` | Create task | `{ title, description, category, priority, deadline, view }` |
| **PATCH** | `/:taskId` | Update task | `{ title, description, category, priority, deadline, view }` |
| **POST** | `/:taskId/complete` | Mark complete | - |
| **DELETE** | `/:taskId` | Delete task | - |
| **POST** | `/reorder` | Reorder tasks | `{ taskIds: ["id1", "id2"] }` |

**Task Object:**
```json
{
  "_id": "task123",
  "title": "Complete project",
  "description": "Finish the dashboard",
  "category": "Work",
  "priority": "Hard",
  "deadline": "2024-12-31",
  "view": "daily",
  "completed": false,
  "order": 1,
  "createdAt": "2024-01-01T10:00:00Z"
}
```

**Priority & XP Awards:**
- `Easy` → 50 XP
- `Medium` → 100 XP  
- `Hard` → 150 XP

**Categories:**
- Work, Study, Health, Personal, Future

**Views:**
- daily, weekly

---

## 🔄 Habit Tracking Routes
**Base: `/habits`**

| Method | Endpoint | Purpose | Body |
|--------|----------|---------|------|
| **GET** | `/` | Get all habits | - |
| **GET** | `/:habitId` | Get single habit | - |
| **POST** | `/` | Create habit | `{ name, target, frequency }` |
| **PATCH** | `/:habitId` | Update habit | `{ name, target, frequency }` |
| **POST** | `/:habitId/increment` | Add +1 to progress | - |
| **POST** | `/:habitId/complete-today` | Mark complete today | - |
| **POST** | `/:habitId/reset-daily` | Reset for next day | - |
| **DELETE** | `/:habitId` | Delete habit | - |

**Habit Object:**
```json
{
  "_id": "habit123",
  "name": "Meditation",
  "target": 30,
  "current": 15,
  "streak": 7,
  "completedToday": false,
  "lastTaskCompletedAt": "2024-01-02T09:00:00Z",
  "frequency": "daily"
}
```

**XP Rewards:**
- Completing habit to target: 100 XP

**Frequency Options:**
- daily, weekly, monthly

---

## 🎯 Goals Management Routes
**Base: `/goals`**

| Method | Endpoint | Purpose | Body |
|--------|----------|---------|------|
| **GET** | `/` | Get all goals | - |
| **GET** | `/:goalId` | Get single goal | - |
| **GET** | `/horizon/:horizon` | Get goals by horizon | - |
| **POST** | `/` | Create goal | `{ title, detail, horizon, progress }` |
| **PATCH** | `/:goalId` | Update goal | `{ title, detail, horizon, progress, status }` |
| **DELETE** | `/:goalId` | Delete goal | - |

**Goal Object:**
```json
{
  "_id": "goal123",
  "title": "Learn Spanish",
  "detail": "Reach conversational fluency",
  "horizon": "5 Years",
  "progress": 45,
  "status": "On Track",
  "createdAt": "2024-01-01T10:00:00Z"
}
```

**Horizons:**
- 3 Months, 1 Year, 5 Years

**Status Options:**
- "On Track", "Needs Focus", "Completed"

**Progress Range:**
- 0-100 (percentage)

---

## 📔 Journal Routes
**Base: `/journal`**

| Method | Endpoint | Purpose | Body |
|--------|----------|---------|------|
| **GET** | `/` | Get all entries | - |
| **GET** | `/:entryId` | Get single entry | - |
| **GET** | `/stats/mood` | Get mood statistics | - |
| **POST** | `/` | Create entry | `{ title, body, mood }` |
| **PATCH** | `/:entryId` | Update entry | `{ title, body, mood }` |
| **DELETE** | `/:entryId` | Delete entry | - |

**Journal Entry Object:**
```json
{
  "_id": "entry123",
  "title": "First day at new job",
  "body": "Really excited about the team...",
  "mood": "Motivated",
  "createdAt": "2024-01-01T20:00:00Z"
}
```

**Mood Types:**
- Focused, Balanced, Drained, Motivated, Reflective

**Mood Stats Response:**
```json
{
  "totalEntries": 42,
  "moodCounts": {
    "Focused": 12,
    "Balanced": 10,
    "Drained": 8,
    "Motivated": 9,
    "Reflective": 3
  },
  "mostCommon": "Focused"
}
```

---

## 🔔 Notifications Routes
**Base: `/notifications`**

| Method | Endpoint | Purpose | Body |
|--------|----------|---------|------|
| **GET** | `/` | Get all notifications | - |
| **POST** | `/` | Create notification | `{ type, title, message }` |
| **POST** | `/check-deadlines` | Check & alert deadlines | - |
| **PATCH** | `/:notificationId/read` | Mark as read | - |
| **PATCH** | `/read-all` | Mark all as read | - |
| **DELETE** | `/:notificationId` | Delete notification | - |
| **DELETE** | `/` | Delete all | - |

**Notification Object:**
```json
{
  "_id": "notif123",
  "type": "deadline",
  "title": "Task Due Soon",
  "message": "Complete project is due in 1 hour",
  "read": false,
  "createdAt": "2024-01-01T15:00:00Z"
}
```

**Notification Types:**
- deadline, achievement, task, habit, system, warning

**Deadline Alert Logic:**
- 24 hours before deadline: "Task due tomorrow"
- 1 hour before deadline: "Task due soon!"

---

## 👥 Existing User-Related Routes

### Profile & Authentication
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/profile` | Get user profile | ✅ |
| PATCH | `/profile` | Update profile | ✅ |

### Quests (Existing)
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/quests` | Get all quests | ✅ |
| POST | `/quests` | Create quest | ✅ |
| PATCH | `/quests/:id` | Update quest | ✅ |
| DELETE | `/quests/:id` | Delete quest | ✅ |


## 📊 Complete User Model Structure

```javascript
User {
  _id: ObjectId
  email: String (unique)
  password: String (hashed)
  
  // Gamification
  xp: Number (default: 0)
  streak: Number (default: 0)
  level: Number (default: 1)
  
  // Core Features
  plannerTasks: [{
    _id: ObjectId
    title: String
    description: String
    category: String
    priority: String
    deadline: Date
    view: String
    completed: Boolean
    order: Number
    createdAt: Date
  }]
  
  habitTracker: [{
    _id: ObjectId
    name: String
    target: Number
    current: Number
    streak: Number
    completedToday: Boolean
    lastTaskCompletedAt: Date
    frequency: String
  }]
  
  longTermGoals: [{
    _id: ObjectId
    title: String
    detail: String
    horizon: String
    progress: Number (0-100)
    status: String
    createdAt: Date
  }]
  
  journalEntries: [{
    _id: ObjectId
    title: String
    body: String
    mood: String
    createdAt: Date
  }]
  
  notifications: [{
    _id: ObjectId
    type: String
    title: String
    message: String
    read: Boolean
    createdAt: Date
  }]
  
  // Existing Features
  quests: [...]
  
  createdAt: Date
  updatedAt: Date
}
```

---

## 🛠️ Common Request Examples

### Create a Task
```bash
POST /api/tasks
Authorization: Bearer eyJ...
Content-Type: application/json

{
  "title": "Write report",
  "description": "Complete Q1 report",
  "category": "Work",
  "priority": "Hard",
  "deadline": "2024-02-15",
  "view": "daily"
}
```

### Mark Task Complete
```bash
POST /api/tasks/task123/complete
Authorization: Bearer eyJ...
```

### Create Habit
```bash
POST /api/habits
Authorization: Bearer eyJ...
Content-Type: application/json

{
  "name": "Morning Run",
  "target": 5,
  "frequency": "daily"
}
```

### Increment Habit Progress
```bash
POST /api/habits/habit123/increment
Authorization: Bearer eyJ...
```

### Create Goal
```bash
POST /api/goals
Authorization: Bearer eyJ...
Content-Type: application/json

{
  "title": "Build a house",
  "detail": "Save and construct dream home",
  "horizon": "5 Years",
  "progress": 10
}
```

### Create Journal Entry
```bash
POST /api/journal
Authorization: Bearer eyJ...
Content-Type: application/json

{
  "title": "Great day!",
  "body": "Accomplished all my goals today",
  "mood": "Motivated"
}
```

### Get Mood Statistics
```bash
GET /api/journal/stats/mood
Authorization: Bearer eyJ...
```

### Create Notification
```bash
POST /api/notifications
Authorization: Bearer eyJ...
Content-Type: application/json

{
  "type": "achievement",
  "title": "Habit Milestone!",
  "message": "You've completed 30 days of meditation!"
}
```

### Check Deadlines for Notifications
```bash
POST /api/notifications/check-deadlines
Authorization: Bearer eyJ...
```

---

## ⚙️ Error Responses

### Success Response (201 Created)
```json
{
  "message": "Task created successfully.",
  "task": { "_id": "...", "title": "..." }
}
```

### Success Response (200 OK)
```json
{
  "message": "Task updated successfully.",
  "task": { "_id": "...", "title": "..." }
}
```

### Error Response (400 Bad Request)
```json
{
  "error": "Title is required."
}
```

### Error Response (401 Unauthorized)
```json
{
  "error": "Unauthorized - Invalid token"
}
```

### Error Response (404 Not Found)
```json
{
  "error": "Task not found."
}
```

### Error Response (500 Server Error)
```json
{
  "error": "Server error. Please try again."
}
```

---

## 📋 Status Codes Reference

| Code | Meaning | Use Case |
|------|---------|----------|
| 200 | OK | Successful GET/PATCH/DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Missing/invalid fields |
| 401 | Unauthorized | No/invalid token |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Unexpected error |

---

## 🔗 Frontend API Client Usage

```javascript
import { api } from "./src/api/client.js";

// Get token from AuthContext
const token = localStorage.getItem("token");

// Tasks
await api.getTasks(token);
await api.createTask(token, { title, description, ... });
await api.completeTask(token, taskId);

// Habits
await api.getHabits(token);
await api.incrementHabitProgress(token, habitId);

// Goals
await api.getGoals(token);
await api.updateGoal(token, goalId, { progress: 50 });

// Journal
await api.getJournalEntries(token);
await api.getMoodStats(token);

// Notifications
await api.getNotifications(token);
await api.markNotificationAsRead(token, notificationId);
```

---

## 🧪 Testing with Postman/Thunder Client

1. Create environment variable:
   - Name: `token`
   - Value: Paste JWT from login response

2. Add header to requests:
   ```
   Authorization: Bearer {{token}}
   ```

3. Use base URL variable:
   ```
   {{baseUrl}}/api/tasks
   ```

---

## 📝 Notes for Developers

- All timestamps are in ISO 8601 format (UTC)
- IDs are MongoDB ObjectIds
- Passwords are never returned in responses
- Validation happens server-side
- Errors include descriptive messages
- All routes require authentication except `/auth`
- Nested array updates use MongoDB push/pull operators

---

**Last Updated:** January 2024  
**API Version:** 1.0

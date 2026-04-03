import { Navigate, Route, Routes } from "react-router-dom";
import BackgroundAudioController from "./components/BackgroundAudioController.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import FuturePage from "./pages/FuturePage.jsx";
import FutureScannerPage from "./pages/FutureScannerPage.jsx";
import CareerGuidancePage from "./pages/CareerGuidancePage.jsx";
import FeedbackPage from "./pages/FeedbackPage.jsx";
import GrowthPage from "./pages/GrowthPage.jsx";
import GuildsPage from "./pages/GuildsPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import MessagePage from "./pages/MessagePage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import ProductivityPlannerPage from "./pages/ProductivityPlannerPage.jsx";
import QuizPage from "./pages/QuizPage.jsx";
import TaskManagementPage from "./pages/TaskManagementPage.jsx";
import HabitTrackerPage from "./pages/HabitTrackerPage.jsx";
import JournalPage from "./pages/JournalPage.jsx";
import GoalsPage from "./pages/GoalsPage.jsx";

const App = () => (
  <>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/feedback" element={<FeedbackPage />} />
      <Route
        path="/quiz"
        element={
          <ProtectedRoute>
            <QuizPage />
          </ProtectedRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/app" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/scanner" element={<FutureScannerPage />} />
        <Route path="/app/future" element={<FuturePage />} />
        <Route path="/futures" element={<FuturePage />} />
        <Route path="/app/growth" element={<GrowthPage />} />
        <Route path="/growth" element={<GrowthPage />} />
        <Route path="/app/career" element={<CareerGuidancePage />} />
        <Route path="/career" element={<CareerGuidancePage />} />
        <Route path="/app/planner" element={<ProductivityPlannerPage />} />
        <Route path="/planner" element={<ProductivityPlannerPage />} />
        <Route path="/app/tasks" element={<TaskManagementPage />} />
        <Route path="/tasks" element={<TaskManagementPage />} />
        <Route path="/app/habits" element={<HabitTrackerPage />} />
        <Route path="/habits" element={<HabitTrackerPage />} />
        <Route path="/app/journal" element={<JournalPage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/app/goals" element={<GoalsPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/app/message" element={<MessagePage />} />
        <Route path="/message" element={<MessagePage />} />
        <Route path="/app/guilds" element={<GuildsPage />} />
        <Route path="/app/profile" element={<ProfilePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/app/feedback" element={<FeedbackPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <BackgroundAudioController />
  </>
);

export default App;

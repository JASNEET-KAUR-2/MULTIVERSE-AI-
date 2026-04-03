import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import BackgroundAudioController from "./components/BackgroundAudioController.jsx";
import BrandSplashScreen from "./components/BrandSplashScreen.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import FuturePage from "./pages/FuturePage.jsx";
import FeedbackPage from "./pages/FeedbackPage.jsx";
import GrowthPage from "./pages/GrowthPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import MessagePage from "./pages/MessagePage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import ProductivityPlannerPage from "./pages/ProductivityPlannerPage.jsx";
import ProductivityDetectorPage from "./pages/ProductivityDetectorPage.jsx";
import QuizPage from "./pages/QuizPage.jsx";
import RealityEnginePage from "./pages/RealityEnginePage.jsx";
import TaskManagementPage from "./pages/TaskManagementPage.jsx";
import HabitTrackerPage from "./pages/HabitTrackerPage.jsx";
import JournalPage from "./pages/JournalPage.jsx";
import GoalsPage from "./pages/GoalsPage.jsx";

const App = () => {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setShowIntro(false), 1900);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <>
      <BrandSplashScreen visible={showIntro} />
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
        <Route path="/scanner" element={<Navigate to="/dashboard" replace />} />
        <Route path="/app/scanner" element={<Navigate to="/dashboard" replace />} />
        <Route path="/app/future" element={<FuturePage />} />
        <Route path="/futures" element={<FuturePage />} />
        <Route path="/app/reality-engine" element={<RealityEnginePage />} />
        <Route path="/reality-engine" element={<RealityEnginePage />} />
        <Route path="/app/growth" element={<GrowthPage />} />
        <Route path="/growth" element={<GrowthPage />} />
        <Route path="/app/planner" element={<ProductivityPlannerPage />} />
        <Route path="/planner" element={<ProductivityPlannerPage />} />
        <Route path="/app/productivity-detector" element={<ProductivityDetectorPage />} />
        <Route path="/productivity-detector" element={<ProductivityDetectorPage />} />
        <Route path="/app/tasks" element={<TaskManagementPage />} />
        <Route path="/tasks" element={<TaskManagementPage />} />
        <Route path="/app/habits" element={<HabitTrackerPage />} />
        <Route path="/habits" element={<HabitTrackerPage />} />
        <Route path="/app/journal" element={<JournalPage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/app/goals" element={<GoalsPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/app/mood" element={<Navigate to="/dashboard" replace />} />
        <Route path="/mood" element={<Navigate to="/dashboard" replace />} />
        <Route path="/app/message" element={<MessagePage />} />
        <Route path="/message" element={<MessagePage />} />
        <Route path="/app/profile" element={<ProfilePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/app/feedback" element={<FeedbackPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BackgroundAudioController />
    </>
  );
};

export default App;

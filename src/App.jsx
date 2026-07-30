import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import VerifyOtpPage from "./pages/VerifyOtpPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import EmployerProfile from "./pages/EmployerProfile";

import InterviewsPage from "./pages/InterviewsPage";
import QuestionsPage from "./pages/QuestionsPage";
import CandidatesPage from "./pages/CandidatesPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";

import DashboardLayout from "./layouts/DashboardLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/forgot-password"
          element={<ForgotPasswordPage />}
        />

        <Route
          path="/verify-otp"
          element={<VerifyOtpPage />}
        />

        <Route
          path="/reset-password"
          element={<ResetPasswordPage />}
        />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />

          <Route
            path="profile"
            element={<EmployerProfile />}
          />

          <Route
            path="interviews"
            element={<InterviewsPage />}
          />

          <Route
            path="questions"
            element={<QuestionsPage />}
          />

          <Route
            path="candidates"
            element={<CandidatesPage />}
          />

          <Route
            path="analytics"
            element={<AnalyticsPage />}
          />

          <Route
            path="settings"
            element={<SettingsPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
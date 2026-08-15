import { BrowserRouter, Routes, Route } from "react-router-dom";

// Public pages
import LandingPage from "./pages/LandingPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import VerifyOtpPage from "./pages/VerifyOtpPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// Dashboard pages
import DashboardPage from "./pages/DashboardPage";
import EmployerProfile from "./pages/EmployerProfile";
import InterviewsPage from "./pages/InterviewsPage";
import QuestionsPage from "./pages/QuestionsPage";
import CandidatesPage from "./pages/CandidatesPage";
import CandidateDetailsPage from "./pages/CandidateDetailsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";

// Live interview pages
import JoinLiveInterviewPage from "./pages/JoinLiveInterviewPage";
import LiveInterviewPage from "./pages/LiveInterviewPage";
import EmployerLiveInterviewPage from "./pages/EmployerLiveInterviewPage";

// Interview creation
import CreateInterviewPage from "./pages/CreateInterviewPage";

// Candidate interview
import CandidateInterviewPage from "./pages/CandidateInterviewPage";

// Layout
import DashboardLayout from "./layouts/DashboardLayout";


function App() {
    return (
        <BrowserRouter>

            <Routes>

                {/* =====================================================
                    PUBLIC PAGES
                ====================================================== */}

                <Route
                    path="/"
                    element={<LandingPage />}
                />

                <Route
                    path="/register"
                    element={<RegisterPage />}
                />

                <Route
                    path="/login"
                    element={<LoginPage />}
                />

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


                {/* =====================================================
                    CANDIDATE INTERVIEW
                ====================================================== */}

                <Route
                    path="/interview/:token"
                    element={<CandidateInterviewPage />}
                />


                {/* =====================================================
                    LIVE INTERVIEW PAGES
                ====================================================== */}

                <Route
                    path="/join-live-interview"
                    element={<JoinLiveInterviewPage />}
                />

                <Route
                    path="/live-interview/:roomName"
                    element={<LiveInterviewPage />}
                />

                <Route
                    path="/employer/live-interview/:roomName"
                    element={<EmployerLiveInterviewPage />}
                />


                {/* =====================================================
                    EMPLOYER DASHBOARD
                ====================================================== */}

                <Route
                    path="/dashboard"
                    element={<DashboardLayout />}
                >

                    {/* Dashboard */}
                    <Route
                        index
                        element={<DashboardPage />}
                    />


                    {/* Employer Profile */}
                    <Route
                        path="profile"
                        element={<EmployerProfile />}
                    />


                    {/* Interviews */}
                    <Route
                        path="interviews"
                        element={<InterviewsPage />}
                    />


                    {/* Create Interview */}
                    <Route
                        path="interviews/create"
                        element={<CreateInterviewPage />}
                    />


                    {/* Questions for a specific interview */}
                    <Route
                        path="interviews/:interviewId/questions"
                        element={<QuestionsPage />}
                    />


                    {/* Candidates */}
                    <Route
                        path="candidates"
                        element={<CandidatesPage />}
                    />


                    {/* Candidate Details */}
                    <Route
                        path="candidates/:id"
                        element={<CandidateDetailsPage />}
                    />


                    {/* Analytics */}
                    <Route
                        path="analytics"
                        element={<AnalyticsPage />}
                    />


                    {/* Settings */}
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
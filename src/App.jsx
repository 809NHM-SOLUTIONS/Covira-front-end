import { BrowserRouter, Routes, Route } from "react-router-dom";

// Public Pages
import LandingPage from "./pages/LandingPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import VerifyOtpPage from "./pages/VerifyOtpPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// Dashboard Pages
import DashboardPage from "./pages/DashboardPage";
import EmployerProfile from "./pages/EmployerProfile";
import InterviewsPage from "./pages/InterviewsPage";
import CreateInterviewPage from "./pages/CreateInterviewPage";
import QuestionsPage from "./pages/QuestionsPage";
import CandidatesPage from "./pages/CandidatesPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";

// Dashboard Layout
import DashboardLayout from "./layouts/DashboardLayout";


function App() {
    return (
        <BrowserRouter>

            <Routes>

                {/* =====================================================
                    PUBLIC ROUTES
                ===================================================== */}

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
                    DASHBOARD ROUTES
                ===================================================== */}

                <Route
                    path="/dashboard"
                    element={<DashboardLayout />}
                >

                    {/* Dashboard Home */}
                    <Route
                        index
                        element={<DashboardPage />}
                    />


                    {/* Employer Profile */}
                    <Route
                        path="profile"
                        element={<EmployerProfile />}
                    />


                    {/* =================================================
                        INTERVIEWS
                    ================================================= */}

                    {/* All Interviews */}
                    <Route
                        path="interviews"
                        element={<InterviewsPage />}
                    />

                    {/* Create Interview */}
                    <Route
                        path="interviews/create"
                        element={<CreateInterviewPage />}
                    />


                    {/* =================================================
                        QUESTION BANK
                    ================================================= */}

                    <Route
                        path="questions"
                        element={<QuestionsPage />}
                    />


                    {/* =================================================
                        CANDIDATES
                    ================================================= */}

                    <Route
                        path="candidates"
                        element={<CandidatesPage />}
                    />


                    {/* =================================================
                        ANALYTICS
                    ================================================= */}

                    <Route
                        path="analytics"
                        element={<AnalyticsPage />}
                    />


                    {/* =================================================
                        SETTINGS
                    ================================================= */}

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
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import VerifyOtpPage from "./pages/VerifyOtpPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";

function App() {
  return (
      <BrowserRouter>
        <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/verify-otp" element={<VerifyOtpPage/>} />
            <Route path="/reset-password" element={<ResetPasswordPage />}
            />
        </Routes>
      </BrowserRouter>
  );
}

export default App;
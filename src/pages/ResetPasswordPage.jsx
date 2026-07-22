import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/ForgotPasswordPage.css";
import AlertModal from "../components/AlertModal";
import PasswordRequirements from "../components/PasswordRequirements";

function ResetPasswordPage() {

    const location = useLocation();
    const navigate = useNavigate();

    const email = location.state?.email || "";

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const [alertOpen, setAlertOpen] = useState(false);
    const [alertType, setAlertType] = useState("success");
    const [alertTitle, setAlertTitle] = useState("");
    const [alertMessage, setAlertMessage] = useState("");

    const isPasswordValid =
        newPassword.length >= 8 &&
        /[A-Z]/.test(newPassword) &&
        /[a-z]/.test(newPassword) &&
        /\d/.test(newPassword) &&
        /[@$!%*?&^#()_+\-=]/.test(newPassword);

    const passwordsMatch =
        newPassword === confirmPassword &&
        confirmPassword !== "";

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!isPasswordValid) {

            setAlertType("error");
            setAlertTitle("Weak Password");
            setAlertMessage(
                "Your password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character."
            );
            setAlertOpen(true);

            return;
        }

        if (!passwordsMatch) {

            setAlertType("error");
            setAlertTitle("Passwords Do Not Match");
            setAlertMessage(
                "Please make sure both password fields are identical."
            );
            setAlertOpen(true);

            return;
        }

        setLoading(true);

        try {

            const response = await fetch(
                "http://localhost:8080/api/auth/reset-password",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        newPassword
                    }),
                }
            );

            const message = await response.text();

            if (response.ok) {

                setAlertType("success");
                setAlertTitle("Password Updated");
                setAlertMessage(message);
                setAlertOpen(true);

            } else {

                setAlertType("error");
                setAlertTitle("Password Reset Failed");
                setAlertMessage(message);
                setAlertOpen(true);

            }

        } catch (error) {

            setAlertType("error");
            setAlertTitle("Connection Error");
            setAlertMessage(
                "Unable to connect to the server. Please try again."
            );
            setAlertOpen(true);

        } finally {

            setLoading(false);

        }

    };

    return (

        <>

            <div className="forgot-page">

                <div className="forgot-card">

                    <img
                        src="/covira_tranperant.png"
                        alt="Covira"
                        className="forgot-logo"
                    />

                    <h2>Create New Password</h2>

                    <p>

                        Your identity has been verified.

                        <br />

                        Create a new password for your account.

                    </p>

                    <form onSubmit={handleSubmit}>

                        <div className="input-group">

                            <label>New Password</label>

                            <input
                                type="password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />

                            <PasswordRequirements
                                password={newPassword}
                            />

                        </div>

                        <div className="input-group">

                            <label>Confirm Password</label>

                            <input
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />

                            {confirmPassword && (

                                <div
                                    className={`password-match ${
                                        passwordsMatch ? "success" : "error"
                                    }`}
                                >

                                    {passwordsMatch
                                        ? "✓ Passwords match"
                                        : "✕ Passwords do not match"}

                                </div>

                            )}

                        </div>

                        <button
                            type="submit"
                            className="send-btn"
                            disabled={
                                loading ||
                                !isPasswordValid ||
                                !passwordsMatch
                            }
                        >

                            {loading
                                ? "Updating..."
                                : "Reset Password"}

                        </button>

                    </form>

                    <div className="back-login">

                        <Link to="/login">

                            Back to Login

                        </Link>

                    </div>

                </div>

            </div>

            <AlertModal

                open={alertOpen}

                type={alertType}

                title={alertTitle}

                message={alertMessage}

                buttonText={
                    alertType === "success"
                        ? "Go to Login"
                        : "OK"
                }

                onClose={() => {

                    setAlertOpen(false);

                    if (alertType === "success") {

                        navigate("/login");

                    }

                }}

            />

        </>

    );

}

export default ResetPasswordPage;
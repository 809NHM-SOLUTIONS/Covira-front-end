import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/ForgotPasswordPage.css";
import AlertModal from "../components/AlertModal";

function ForgotPasswordPage() {

    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const [alertOpen, setAlertOpen] = useState(false);
    const [alertType, setAlertType] = useState("success");
    const [alertTitle, setAlertTitle] = useState("");
    const [alertMessage, setAlertMessage] = useState("");

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const response = await fetch(
                "http://localhost:8080/api/auth/forgot-password",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email }),
                }
            );

            const message = await response.text();

            if (response.ok) {

                setAlertType("success");
                setAlertTitle("OTP Sent");
                setAlertMessage(message);
                setAlertOpen(true);

            } else {

                setAlertType("error");
                setAlertTitle("Request Failed");
                setAlertMessage(message);
                setAlertOpen(true);

            }

        } catch (error) {

            console.error(error);

            setAlertType("error");
            setAlertTitle("Connection Error");
            setAlertMessage("Unable to connect to the server. Please try again.");
            setAlertOpen(true);

        }

    };

    return (

        <>

            <div className="forgot-page">

                <div className="forgot-card">

                    <img
                        src="/covira_tranperant.png"
                        alt="Covira Logo"
                        className="forgot-logo"
                    />

                    <h2>Forgot Password</h2>

                    <p>
                        Enter the email address associated with your account.
                        We'll send you a One-Time Password (OTP) to reset your password.
                    </p>

                    <form onSubmit={handleSubmit}>

                        <div className="input-group">

                            <label>Email Address</label>

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                        </div>

                        <button
                            type="submit"
                            className="send-btn"
                        >

                            Send OTP

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

                buttonText={alertType === "success" ? "Continue" : "OK"}

                onClose={() => {

                    setAlertOpen(false);

                    if (alertType === "success") {

                        navigate("/verify-otp", {
                            state: {
                                email
                            }
                        });

                    }

                }}

            />

        </>

    );

}

export default ForgotPasswordPage;
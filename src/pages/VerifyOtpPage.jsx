import { useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/ForgotPasswordPage.css";
import AlertModal from "../components/AlertModal";

function VerifyOtpPage() {

    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email || "";

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);

    // Alert Modal States
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertType, setAlertType] = useState("success");
    const [alertTitle, setAlertTitle] = useState("");
    const [alertMessage, setAlertMessage] = useState("");

    const inputs = useRef([]);

    const maskEmail = (email) => {

        if (!email) return "";

        const [name, domain] = email.split("@");

        if (name.length <= 2) {
            return email;
        }

        const visible = name.substring(0, 2);

        return `${visible}${"*".repeat(name.length - 2)}@${domain}`;
    };

    const handleChange = (value, index) => {

        if (!/^\d?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;

        setOtp(newOtp);

        if (value && index < 5) {
            inputs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {

        if (e.key === "Backspace" && otp[index] === "" && index > 0) {
            inputs.current[index - 1].focus();
        }
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        const enteredOtp = otp.join("");

        if (enteredOtp.length !== 6) {

            setAlertType("warning");
            setAlertTitle("Incomplete OTP");
            setAlertMessage("Please enter the complete 6-digit verification code.");
            setAlertOpen(true);

            return;
        }

        setLoading(true);

        try {

            const response = await fetch(
                "http://localhost:8080/api/auth/verify-otp",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        otp: enteredOtp,
                    }),
                }
            );

            const message = await response.text();

            if (response.ok) {

                setAlertType("success");
                setAlertTitle("OTP Verified");
                setAlertMessage("Your identity has been verified successfully.");
                setAlertOpen(true);

            } else {

                setAlertType("error");
                setAlertTitle("Verification Failed");
                setAlertMessage(message);
                setAlertOpen(true);

            }

        } catch (error) {

            setAlertType("error");
            setAlertTitle("Connection Error");
            setAlertMessage("Unable to connect to the server. Please try again.");
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

                    <h2>Verify OTP</h2>

                    <p>

                        We've sent a 6-digit verification code to

                        <br /><br />

                        <strong>{maskEmail(email)}</strong>

                    </p>

                    <form onSubmit={handleSubmit}>

                        <div className="otp-container">

                            {otp.map((digit, index) => (

                                <input
                                    key={index}
                                    type="text"
                                    maxLength="1"
                                    value={digit}
                                    ref={(el) => inputs.current[index] = el}
                                    onChange={(e) => handleChange(e.target.value, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                />

                            ))}

                        </div>

                        <button
                            type="submit"
                            className="send-btn"
                            disabled={loading}
                        >

                            {loading ? "Verifying..." : "Verify OTP"}

                        </button>

                    </form>

                    <div className="resend">

                        Didn't receive the code?

                        <span> Resend OTP</span>

                    </div>

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

                        navigate("/reset-password", {
                            state: {
                                email,
                                otp: otp.join("")
                            }
                        });

                    }

                }}

            />

        </>

    );

}

export default VerifyOtpPage;
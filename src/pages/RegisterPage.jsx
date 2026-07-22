import "../styles/RegisterPage.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import AlertModal from "../components/AlertModal";
import PasswordRequirements from "../components/PasswordRequirements";

function RegisterPage() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        companyName: "",
        fullName: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: ""
    });

    const [alertOpen, setAlertOpen] = useState(false);
    const [alertType, setAlertType] = useState("success");
    const [alertTitle, setAlertTitle] = useState("");
    const [alertMessage, setAlertMessage] = useState("");

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

    const isPasswordValid =
        formData.password.length >= 8 &&
        /[A-Z]/.test(formData.password) &&
        /[a-z]/.test(formData.password) &&
        /\d/.test(formData.password) &&
        /[@$!%*?&^#()_+\-=]/.test(formData.password);

    const passwordsMatch =
        formData.password === formData.confirmPassword &&
        formData.confirmPassword !== "";

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

        try {

            const response = await fetch(
                "http://localhost:8080/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        companyName: formData.companyName,
                        fullName: formData.fullName,
                        email: formData.email,
                        phoneNumber: formData.phoneNumber,
                        password: formData.password
                    })
                }
            );

            const message = await response.text();

            if (response.ok) {

                setAlertType("success");
                setAlertTitle("Account Created");
                setAlertMessage(
                    "Your Covira account has been created successfully."
                );
                setAlertOpen(true);

            } else {

                setAlertType("error");

                if (message.toLowerCase().includes("already")) {

                    setAlertTitle("Account Already Exists");
                    setAlertMessage(
                        "An account with this email already exists. Please sign in or use the Forgot Password option if you've forgotten your password."
                    );

                } else {

                    setAlertTitle("Registration Failed");
                    setAlertMessage(message);

                }

                setAlertOpen(true);

            }

        } catch (error) {

            console.error(error);

            setAlertType("error");
            setAlertTitle("Connection Error");
            setAlertMessage(
                "Unable to connect to the server."
            );
            setAlertOpen(true);

        }

    };

    return (

        <>

            <div className="register-page">

                <div className="register-left">

                    <div className="brand">

                        <Link to="/">
                            <img
                                src="/covira_tranperant.png"
                                alt="Covira"
                            />
                        </Link>

                        <div>
                            <h3>Covira</h3>
                            <span>Beyond Resumes</span>
                        </div>

                    </div>

                    <p className="tag">
                        VIDEO INTERVIEW PLATFORM
                    </p>

                    <h2>

                        Hire talent through

                        <br />

                        real conversations

                    </h2>

                    <p>

                        Create interview assessments,
                        invite candidates,
                        review video responses,
                        and make smarter hiring decisions
                        with Covira.

                    </p>

                    <div className="benefits">

                        <div className="benefit">
                            ✓ Create interview assessments
                        </div>

                        <div className="benefit">
                            ✓ Review candidate video responses
                        </div>

                        <div className="benefit">
                            ✓ Share interview links instantly
                        </div>

                        <div className="benefit">
                            ✓ Hire beyond resumes
                        </div>

                    </div>

                    <div className="dashboard-preview">

                        <h4>Hiring Progress</h4>

                        <div className="progress"></div>

                        <p>

                            92% of invited candidates
                            completed their video interviews.

                        </p>

                    </div>

                </div>

                <div className="register-right">

                    <div className="register-card">

                        <Link
                            to="/"
                            className="back-home"
                        >
                            ← Back Home
                        </Link>

                        <h3>Create Account</h3>

                        <form onSubmit={handleSubmit}>

                            <input
                                type="text"
                                name="companyName"
                                placeholder="Company Name"
                                value={formData.companyName}
                                onChange={handleChange}
                                required
                            />

                            <input
                                type="text"
                                name="fullName"
                                placeholder="Full Name"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />

                            <input
                                type="email"
                                name="email"
                                placeholder="Business Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />

                            <input
                                type="tel"
                                name="phoneNumber"
                                placeholder="Phone Number"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                required
                            />

                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />

                            <PasswordRequirements
                                password={formData.password}
                            />

                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />

                            {formData.confirmPassword && (

                                <div
                                    className={`password-match ${passwordsMatch ? "success" : "error"}`}
                                >

                                    {passwordsMatch
                                        ? "✓ Passwords match"
                                        : "✕ Passwords do not match"}

                                </div>

                            )}

                            <button
                                type="submit"
                                disabled={!isPasswordValid || !passwordsMatch}
                            >

                                Create Account

                            </button>

                        </form>

                        <div className="login-link">

                            Already have an account?{" "}

                            <Link to="/login">

                                Sign In

                            </Link>

                        </div>

                    </div>

                </div>

            </div>
            <AlertModal

                open={alertOpen}

                type={alertType}

                title={alertTitle}

                message={alertMessage}

                buttonText={
                    alertTitle === "Account Already Exists"
                        ? "Go to Login"
                        : alertType === "success"
                            ? "Continue"
                            : "OK"
                }

                onClose={() => {

                    setAlertOpen(false);

                    if (
                        alertType === "success" ||
                        alertTitle === "Account Already Exists"
                    ) {

                        navigate("/login");

                    }

                }}

            />
        </>

    );

}

export default RegisterPage;
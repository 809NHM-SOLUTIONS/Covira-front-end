import "../styles/RegisterPage.css";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function LoginPage() {

    const navigate = useNavigate();

    const [loginData, setLoginData] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setLoginData({
            ...loginData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            const response = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(loginData)
            });

            const message = await response.text();

            if (response.ok) {

                Swal.fire({
                    icon: "success",
                    title: "Welcome Back!",
                    text: message,
                    confirmButtonColor: "#00A99D",
                    background: "#ffffff",
                    color: "#333",
                    timer: 1800,
                    showConfirmButton: false
                }).then(() => {
                    navigate("/dashboard");
                });

            } else {

                Swal.fire({
                    icon: "error",
                    title: "Login Failed",
                    text: message,
                    confirmButtonColor: "#00A99D"
                });

            }

        } catch (error) {

            console.error(error);

            Swal.fire({
                icon: "error",
                title: "Connection Error",
                text: "Unable to connect to the server.",
                confirmButtonColor: "#00A99D"
            });

        }
    };

    return (

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
                        <h1>Beyond Resumes</h1>
                        <span>See the person behind the CV</span>
                    </div>

                </div>

                <span className="tag">
                    VIDEO INTERVIEW PLATFORM
                </span>

                <h1>
                    Welcome <span>Back</span>
                </h1>

                <p>
                    Sign in to access your dashboard,
                    manage interviews and review
                    candidate submissions.
                </p>

                <div className="dashboard-preview">

                    <div className="preview-header">
                        Interview Analytics
                    </div>

                    <div className="progress"></div>

                    <div className="preview-score">
                        Candidate Match Score: 92%
                    </div>

                </div>

            </div>

            <div className="register-right">

                <div className="register-card">

                    <Link to="/" className="back-home">
                        ← Back to Home
                    </Link>

                    <h3>Sign In</h3>

                    <form onSubmit={handleSubmit}>

                        <input
                            type="email"
                            name="email"
                            placeholder="Business Email"
                            value={loginData.email}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={loginData.password}
                            onChange={handleChange}
                            required
                        />

                        <div className="login-options">

                            <label>

                                <input type="checkbox" />

                                Remember Me

                            </label>

                            <Link to="/forgot-password">
                                Forgot Password?
                            </Link>

                        </div>

                        <button type="submit">
                            Sign In
                        </button>

                    </form>

                    <p className="login-link">
                        Don't have an account?
                        <Link to="/register"> Create Account</Link>
                    </p>

                </div>

            </div>

        </div>

    );

}

export default LoginPage;
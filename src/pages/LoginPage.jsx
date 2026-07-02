import "../styles/RegisterPage.css";
import { Link } from "react-router-dom";
function RegisterPage() {
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
                    Welcome
                    <span> Back</span>
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

                    <h3>Sign in</h3>

                    <form>

                        <input
                            type="email"
                            placeholder="Business Email"
                            required
                        />

                        <input
                            type="password"
                            placeholder="Password"
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

export default RegisterPage;
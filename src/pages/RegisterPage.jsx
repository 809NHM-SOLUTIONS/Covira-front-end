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
                    Hire Beyond
                    <span> CVs</span>
                </h1>
                <p>
                    Create your employer account and begin
                    conducting professional video interviews
                    in minutes.
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

                    <h3>Create Account</h3>

                    <form>

                        <input
                            type="text"
                            placeholder="Company Name"
                            required
                        />

                        <input
                            type="text"
                            placeholder="Full Name"
                            required
                        />

                        <input
                            type="email"
                            placeholder="Business Email"
                            required
                        />

                        <input
                            type="tel"
                            placeholder="Phone Number"
                            required
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            required
                        />

                        <input
                            type="password"
                            placeholder="Confirm Password"
                            required
                        />

                        <button type="submit">
                            Create Free Account
                        </button>

                    </form>

                    <p className="login-link">
                        Already have an account?
                        <Link to="/login"> Sign In</Link>
                    </p>

                </div>

            </div>

        </div>
    );
}

export default RegisterPage;
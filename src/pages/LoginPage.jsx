import "../styles/RegisterPage.css";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function LoginPage() {
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setLoginData((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8081/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },

          // Important: saves and sends the backend session cookie
          credentials: "include",

          body: JSON.stringify(loginData),
        }
      );

      if (response.ok) {
        const data = await response.json();

        await Swal.fire({
          html: `
            <div class="covira-swal">
              <div class="covira-swal-badge">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="#00A99D" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h2>Welcome back, ${data.fullName.split(" ")[0]}</h2>
              <p>Signed in to <strong>${data.companyName}</strong></p>
            </div>
          `,
          showConfirmButton: false,
          timer: 1800,
          background: "#ffffff",
          customClass: {
            popup: "covira-swal-popup",
          },
        });

        navigate("/dashboard");
      } else {
        const message = await response.text();

        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: message || "Invalid email address or password.",
          confirmButtonColor: "#00A99D",
        });
      }
    } catch (error) {
      console.error("Login error:", error);

      Swal.fire({
        icon: "error",
        title: "Connection Error",
        text: "Unable to connect to the server.",
        confirmButtonColor: "#00A99D",
      });
    } finally {
      setLoading(false);
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
          Sign in to access your dashboard, manage interviews and
          review candidate submissions.
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
              autoComplete="email"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={loginData.password}
              onChange={handleChange}
              autoComplete="current-password"
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

            <button type="submit" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="login-link">
            Don&apos;t have an account?
            <Link to="/register"> Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
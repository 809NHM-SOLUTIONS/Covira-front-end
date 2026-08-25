import { useEffect, useRef, useState } from "react";
import "./EmployerProfile.css";
import AlertModal from "../components/AlertModal";
import PasswordRequirements from "../components/PasswordRequirements";


const API_URL = "http://localhost:8081/api/employer/profile";
const CHANGE_PASSWORD_REQUEST_URL = "http://localhost:8081/api/employer/profile/change-password/request";
const CHANGE_PASSWORD_VERIFY_URL = "http://localhost:8081/api/employer/profile/change-password/verify";
const CHANGE_PASSWORD_RESEND_URL = "http://localhost:8081/api/employer/profile/change-password/resend";
const OTP_EXPIRY_SECONDS = 300;

function ChangePasswordSection() {
  // step: "form" -> entering current/new password, "otp" -> verifying OTP
  const [step, setStep] = useState("form");

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [requesting, setRequesting] = useState(false);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(OTP_EXPIRY_SECONDS);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertOnClose, setAlertOnClose] = useState(null);

  const otpInputs = useRef([]);
  const timerRef = useRef(null);

  const isPasswordValid =
    passwordForm.newPassword.length >= 8 &&
    /[A-Z]/.test(passwordForm.newPassword) &&
    /[a-z]/.test(passwordForm.newPassword) &&
    /\d/.test(passwordForm.newPassword) &&
    /[@$!%*?&^#()_+\-=]/.test(passwordForm.newPassword);

  const passwordsMatch =
    passwordForm.newPassword === passwordForm.confirmPassword &&
    passwordForm.confirmPassword !== "";

  const showAlert = (type, title, message, onClose = null) => {
    setAlertType(type);
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertOnClose(() => onClose);
    setAlertOpen(true);
  };

  // Countdown timer while on the OTP step
  useEffect(() => {
    if (step !== "otp") return;

    timerRef.current = setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [step]);

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handlePasswordFieldChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((current) => ({ ...current, [name]: value }));
    setPasswordErrors((current) => ({ ...current, [name]: "" }));
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = "Enter your current password.";
    }

    if (!isPasswordValid) {
      newErrors.newPassword = "New password does not meet the requirements.";
    }

    if (!passwordsMatch) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (
      passwordForm.currentPassword &&
      passwordForm.newPassword &&
      passwordForm.currentPassword === passwordForm.newPassword
    ) {
      newErrors.newPassword = "New password must be different from your current password.";
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 1: Current Password + New Password -> Request Password Change -> OTP Sent
  const handleRequestChange = async (event) => {
    event.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    setRequesting(true);

    try {
      const response = await fetch(CHANGE_PASSWORD_REQUEST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const message = await response.text();

      if (!response.ok) {
        // e.g. current password incorrect — surface it against the field too
        setPasswordErrors((current) => ({
          ...current,
          currentPassword: message || "Unable to verify current password.",
        }));
        showAlert("error", "Request Failed", message || "Unable to request a password change.");
        return;
      }

      setOtp(["", "", "", "", "", ""]);
      setSecondsLeft(OTP_EXPIRY_SECONDS);
      setStep("otp");
      showAlert(
        "success",
        "OTP Sent",
        message || "We've sent a one-time verification code to your registered email address."
      );
    } catch (error) {
      showAlert("error", "Connection Error", "Unable to connect to the server. Please try again.");
    } finally {
      setRequesting(false);
    }
  };

  // OTP input handlers (same pattern as VerifyOtpPage)
  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (event, index) => {
    if (event.key === "Backspace" && otp[index] === "" && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  // Step 2: Enter OTP -> Verify -> Password Changed
  const handleVerifyOtp = async (event) => {
    event.preventDefault();

    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      showAlert("warning", "Incomplete OTP", "Please enter the complete 6-digit verification code.");
      return;
    }

    if (secondsLeft === 0) {
      showAlert("error", "Code Expired", "This code has expired. Please request a new one.");
      return;
    }

    setVerifying(true);

    try {
      const response = await fetch(CHANGE_PASSWORD_VERIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ otp: enteredOtp }),
      });

      const message = await response.text();

      if (!response.ok) {
        showAlert("error", "Verification Failed", message || "Invalid or expired code.");
        return;
      }

      // Password changed successfully — force re-login for security.
      showAlert(
        "success",
        "Password Updated",
        message || "Your password has been changed successfully. Please log in again with your new password.",
        async () => {
          try {
            await fetch("http://localhost:8081/api/auth/logout", {
              method: "POST",
              credentials: "include",
            });
          } catch (error) {
            // Non-fatal — we still clear local state and redirect below.
          }
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = "/login";
        }
      );
    } catch (error) {
      showAlert("error", "Connection Error", "Unable to connect to the server. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);

    try {
      const response = await fetch(CHANGE_PASSWORD_RESEND_URL, {
        method: "POST",
        credentials: "include",
      });

      const message = await response.text();

      if (!response.ok) {
        showAlert("error", "Resend Failed", message || "Unable to resend the code.");
        return;
      }

      setOtp(["", "", "", "", "", ""]);
      setSecondsLeft(OTP_EXPIRY_SECONDS);
      showAlert("success", "OTP Resent", message || "A new code has been sent to your email.");
    } catch (error) {
      showAlert("error", "Connection Error", "Unable to connect to the server. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const handleCancelOtp = () => {
    clearInterval(timerRef.current);
    setStep("form");
    setOtp(["", "", "", "", "", ""]);
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <section className="profile-card password-card">
      <div className="password-card-header">
        <h2>Change Password</h2>
        <p>
          For your security, changing your password requires verifying a one-time code
          sent to your registered email address.
        </p>
      </div>

      {step === "form" && (
        <form onSubmit={handleRequestChange} noValidate>
          <div className="profile-field">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={handlePasswordFieldChange}
              placeholder="Enter your current password"
              className={passwordErrors.currentPassword ? "input-error" : ""}
              autoComplete="current-password"
            />
            {passwordErrors.currentPassword && (
              <span className="field-error">{passwordErrors.currentPassword}</span>
            )}
          </div>

          <div className="profile-field">
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={handlePasswordFieldChange}
              placeholder="Enter a new password"
              className={passwordErrors.newPassword ? "input-error" : ""}
              autoComplete="new-password"
            />
            {passwordErrors.newPassword && (
              <span className="field-error">{passwordErrors.newPassword}</span>
            )}
            <PasswordRequirements password={passwordForm.newPassword} />
          </div>

          <div className="profile-field">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordFieldChange}
              placeholder="Re-enter your new password"
              className={passwordErrors.confirmPassword ? "input-error" : ""}
              autoComplete="new-password"
            />
            {passwordForm.confirmPassword && (
              <div className={`password-match ${passwordsMatch ? "success" : "error"}`}>
                {passwordsMatch ? "✓ Passwords match" : "✕ Passwords do not match"}
              </div>
            )}
          </div>

          <div className="profile-actions">
            <button
              type="submit"
              className="profile-primary-button"
              disabled={requesting}
            >
              {requesting ? "Sending OTP..." : "Request Password Change"}
            </button>
          </div>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerifyOtp} noValidate>
          <p className="otp-instructions">
            Enter the 6-digit code sent to your registered email address.{" "}
            {secondsLeft > 0 ? (
              <span className="otp-timer">Expires in {formatTime(secondsLeft)}</span>
            ) : (
              <span className="otp-timer expired">Code expired</span>
            )}
          </p>

          <div className="otp-container">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                ref={(el) => (otpInputs.current[index] = el)}
                onChange={(e) => handleOtpChange(e.target.value, index)}
                onKeyDown={(e) => handleOtpKeyDown(e, index)}
                disabled={secondsLeft === 0}
              />
            ))}
          </div>

          <div className="profile-actions otp-actions">
            <button
              type="button"
              className="profile-secondary-button"
              onClick={handleCancelOtp}
              disabled={verifying}
            >
              Cancel
            </button>

            <button
              type="button"
              className="profile-secondary-button"
              onClick={handleResendOtp}
              disabled={resending || (secondsLeft > 0 && secondsLeft > OTP_EXPIRY_SECONDS - 30)}
            >
              {resending ? "Resending..." : "Resend OTP"}
            </button>

            <button
              type="submit"
              className="profile-primary-button"
              disabled={verifying || secondsLeft === 0}
            >
              {verifying ? "Verifying..." : "Verify & Change Password"}
            </button>
          </div>
        </form>
      )}

      <AlertModal
        open={alertOpen}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        buttonText={alertType === "success" ? "Continue" : "OK"}
        onClose={() => {
          setAlertOpen(false);
          if (alertOnClose) alertOnClose();
        }}
      />
    </section>
  );
}
   
function EmployerProfile() {
  const [formData, setFormData] = useState({
    companyName: "",
    fullName: "",
    email: "",
    phoneNumber: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({
    type: "",
    text: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch(API_URL, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to load employer profile.");
      }

      const data = await response.json();

      setFormData({
        companyName: data.companyName || "",
        fullName: data.fullName || "",
        email: data.email || "",
        phoneNumber: data.phoneNumber || "",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Unable to load your profile.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));

    setMessage({ type: "", text: "" });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required.";
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Contact person is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required.";
    } else if (
      !/^[0-9+()\-\s]{7,20}$/.test(formData.phoneNumber)
    ) {
      newErrors.phoneNumber = "Enter a valid phone number.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch(API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          companyName: formData.companyName.trim(),
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          phoneNumber: formData.phoneNumber.trim(),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to update employer profile.");
      }

      const updatedProfile = await response.json();

      setFormData({
        companyName: updatedProfile.companyName || "",
        fullName: updatedProfile.fullName || "",
        email: updatedProfile.email || "",
        phoneNumber: updatedProfile.phoneNumber || "",
      });

      setMessage({
        type: "success",
        text: "Employer profile updated successfully.",
      });

      window.dispatchEvent(
  new Event("employerProfileUpdated")
);


    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Unable to update your profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="employer-profile-page">
  <div className="profile-loading">
    Loading employer profile...
  </div>
</div>
    );
  }

return (
  <div className="employer-profile-page">
    <section className="profile-header">
      <div>
        <p className="profile-label">Employer account</p>
        <h1>Company Profile</h1>
        <p>
          View and update your company and contact information.
        </p>
      </div>
    </section>

    <section className="profile-card">
      {message.text && (
        <div
          className={`profile-message profile-message-${message.type}`}
          role="alert"
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="profile-form-grid">
          <div className="profile-field">
            <label htmlFor="companyName">Company Name</label>

            <input
              id="companyName"
              name="companyName"
              type="text"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Enter company name"
              className={errors.companyName ? "input-error" : ""}
            />

            {errors.companyName && (
              <span className="field-error">
                {errors.companyName}
              </span>
            )}
          </div>

          <div className="profile-field">
            <label htmlFor="fullName">Contact Person</label>

            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter full name"
              className={errors.fullName ? "input-error" : ""}
            />

            {errors.fullName && (
              <span className="field-error">
                {errors.fullName}
              </span>
            )}
          </div>

          <div className="profile-field">
            <label htmlFor="email">Email Address</label>

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              className={errors.email ? "input-error" : ""}
            />

            {errors.email && (
              <span className="field-error">
                {errors.email}
              </span>
            )}
          </div>

          <div className="profile-field">
            <label htmlFor="phoneNumber">Phone Number</label>

            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter phone number"
              className={errors.phoneNumber ? "input-error" : ""}
            />

            {errors.phoneNumber && (
              <span className="field-error">
                {errors.phoneNumber}
              </span>
            )}
          </div>
        </div>

        <div className="profile-actions">
          <button
            type="button"
            className="profile-secondary-button"
            onClick={loadProfile}
            disabled={saving}
          >
            Reset
          </button>

          <button
            type="submit"
            className="profile-primary-button"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </section>
    <ChangePasswordSection />
  </div>
);
}

export default EmployerProfile;
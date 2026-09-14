import { useEffect, useState } from "react";
import "./SettingsPage.css";
import AlertModal from "../components/AlertModal";
import { DEFAULT_TIMEZONE, TIMEZONE_OPTIONS } from "../styles/utils/timezoneOptions";

const SETTINGS_URL = "http://localhost:8081/api/employer/settings";

function ToggleRow({ label, description, checked, onChange, disabled }) {
  return (
    <div className="settings-toggle-row">
      <div>
        <p className="settings-toggle-label">{label}</p>
        {description && <p className="settings-toggle-description">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`settings-toggle ${checked ? "on" : "off"}`}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
      >
        <span className="settings-toggle-knob" />
      </button>
    </div>
  );
}

function SettingsPage() {
  const [settings, setSettings] = useState({
    notifyNewCandidateApplications: true,
    timezone: DEFAULT_TIMEZONE,
    ccEmail: "",
  });

  const [ccEmailInput, setCcEmailInput] = useState("");
  const [ccEmailError, setCcEmailError] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOutAll, setLoggingOutAll] = useState(false);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    setCcEmailInput(settings.ccEmail || "");
  }, [settings.ccEmail]);

  const CC_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const showAlert = (type, title, message) => {
    setAlertType(type);
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertOpen(true);
  };

  const loadSettings = async () => {
    setLoading(true);

    try {
      const response = await fetch(SETTINGS_URL, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Unable to load your settings.");
      }

      const data = await response.json();
      setSettings(data);
    } catch (error) {
      showAlert("error", "Something Went Wrong", error.message || "Unable to load your settings.");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (nextSettings) => {
    setSaving(true);

    try {
      const response = await fetch(SETTINGS_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(nextSettings),
      });

      const responseText = await response.text();

      let data = null;

      try {
        data = responseText ? JSON.parse(responseText) : null;
      } catch {
        data = responseText;
      }

      if (!response.ok) {
        throw new Error(
          typeof data === "string" && data.trim()
            ? data
            : "Unable to save your changes."
        );
      }

      setSettings(data);

      window.dispatchEvent(new Event("employerSettingsUpdated"));
    } catch (error) {
      showAlert("error", "Save Failed", error.message || "Unable to save your changes.");
    } finally {
      setSaving(false);
    }
  };

  const updateAndSave = (key, value) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    saveSettings(next);
  };

  const handleCcEmailBlur = () => {
    const trimmed = ccEmailInput.trim();

    if (trimmed === (settings.ccEmail || "")) {
      setCcEmailError("");
      return;
    }

    if (trimmed && !CC_EMAIL_PATTERN.test(trimmed)) {
      setCcEmailError("Enter a valid email address.");
      return;
    }

    setCcEmailError("");
    updateAndSave("ccEmail", trimmed);
  };

  const handleLogoutAllDevices = async () => {
    setLoggingOutAll(true);

    try {
      const response = await fetch("http://localhost:8081/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Unable to log out of all devices right now.");
      }

      showAlert(
        "success",
        "Logged Out Everywhere",
        "You've been logged out of this session. Please log in again."
      );

      localStorage.clear();
      sessionStorage.clear();

      setTimeout(() => {
        window.location.href = "/login";
      }, 1200);
    } catch (error) {
      showAlert("error", "Something Went Wrong", error.message || "Please try again.");
    } finally {
      setLoggingOutAll(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-loading">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <section className="settings-header">
        <div>
          <p className="settings-label">Employer account</p>
          <h1>Settings</h1>
          <p>Manage how Covira notifies you, your account preferences, and your account security.</p>
        </div>
        {saving && <span className="settings-saved-pill">Saving...</span>}
      </section>

      {/* Notifications */}
      <section className="settings-card">
        <h2>Notifications</h2>
        <p className="settings-card-subtitle">
          Choose which emails Covira sends you. Security alerts can't be turned off.
        </p>

        <ToggleRow
          label="New candidate applications"
          description="Get notified when a candidate applies to one of your interviews."
          checked={settings.notifyNewCandidateApplications}
          onChange={(v) => updateAndSave("notifyNewCandidateApplications", v)}
          disabled={saving}
        />

        <div className="settings-field">
          <label htmlFor="ccEmail">CC email (optional)</label>
          <input
            id="ccEmail"
            type="email"
            placeholder="e.g. hr@yourcompany.com"
            value={ccEmailInput}
            onChange={(e) => setCcEmailInput(e.target.value)}
            onBlur={handleCcEmailBlur}
            disabled={saving || !settings.notifyNewCandidateApplications}
          />
          {ccEmailError ? (
            <p className="settings-field-error">{ccEmailError}</p>
          ) : (
            <p className="settings-toggle-description">
              Also send new-candidate alerts to this address, e.g. a shared HR inbox.
            </p>
          )}
        </div>
       
        <ToggleRow
          label="Security alerts"
          description="Password changes and profile updates. Always on for your protection."
          checked={true}
          onChange={() => {}}
          disabled={true}
        />
        
      </section>

      {/* Preferences */}
      <section className="settings-card">
        <h2>Preferences</h2>
        <p className="settings-card-subtitle">
          Set your default timezone across Covira.
        </p>

        <div className="settings-field">
          <label htmlFor="timezone">Timezone</label>
          <select
            id="timezone"
            value={settings.timezone}
            onChange={(e) => updateAndSave("timezone", e.target.value)}
            disabled={saving}
          >
            {TIMEZONE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Security */}
      <section className="settings-card">
        <h2>Security</h2>
        <p className="settings-card-subtitle">
          Manage how your account stays protected.
        </p>

        <div className="settings-security-row">
          <div>
            <p className="settings-toggle-label">Password</p>
            <p className="settings-toggle-description">
              Change your password with email verification.
            </p>
          </div>
          <a href="/dashboard/profile" className="settings-secondary-button">
            Go to Profile
          </a>
        </div>


        <div className="settings-security-row">
          <div>
            <p className="settings-toggle-label">Active sessions</p>
            <p className="settings-toggle-description">
              Log out of Covira on all devices, including this one.
            </p>
          </div>
          <button
            type="button"
            className="settings-danger-button"
            onClick={handleLogoutAllDevices}
            disabled={loggingOutAll}
          >
            {loggingOutAll ? "Logging out..." : "Log Out of All Devices"}
          </button>
        </div>
      </section>

      <AlertModal
        open={alertOpen}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        buttonText="OK"
        onClose={() => setAlertOpen(false)}
      />
    </div>
  );
}

export default SettingsPage;
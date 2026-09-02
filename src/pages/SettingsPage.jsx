import { useEffect, useState } from "react";
import "./SettingsPage.css";
import AlertModal from "../components/AlertModal";

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
    language: "en",
    timezone: "Africa/Johannesburg",
  });

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

      if (!response.ok) {
        throw new Error("Unable to save your changes.");
      }

      const data = await response.json();
      setSettings(data);
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
          Set your default language and timezone across Covira.
        </p>

        <div className="settings-field">
          <label htmlFor="language">Language</label>
          <select
            id="language"
            value={settings.language}
            onChange={(e) => updateAndSave("language", e.target.value)}
            disabled={saving}
          >
            <option value="en">English</option>
            <option value="af">Afrikaans</option>
            <option value="zu">isiZulu</option>
            <option value="xh">isiXhosa</option>
          </select>
        </div>

        <div className="settings-field">
          <label htmlFor="timezone">Timezone</label>
          <select
            id="timezone"
            value={settings.timezone}
            onChange={(e) => updateAndSave("timezone", e.target.value)}
            disabled={saving}
          >
            <option value="Africa/Johannesburg">Africa/Johannesburg (SAST, UTC+2)</option>
            <option value="Africa/Lagos">Africa/Lagos (WAT, UTC+1)</option>
            <option value="Africa/Nairobi">Africa/Nairobi (EAT, UTC+3)</option>
            <option value="Europe/London">Europe/London (GMT/BST)</option>
            <option value="UTC">UTC</option>
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
          <a href="/profile" className="settings-secondary-button">
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
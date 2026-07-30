import { useEffect, useState } from "react";
import "./EmployerProfile.css";

const API_URL = "http://localhost:8080/api/employer/profile";

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
  </div>
);
}

export default EmployerProfile;
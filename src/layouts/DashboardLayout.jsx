import { useEffect, useState } from "react";
import "../styles/DashboardPage.css";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import {
  FaHome,
  FaVideo,
  FaQuestionCircle,
  FaUsers,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaBuilding,
  FaBars,
  FaTimes,
} from "react-icons/fa";

const PROFILE_API_URL =
  "http://localhost:8080/api/employer/profile";

function DashboardLayout() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [employer, setEmployer] = useState({
    companyName: "",
    fullName: "",
    email: "",
    phoneNumber: "",
  });

  const [profileLoading, setProfileLoading] = useState(true);

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen((current) => !current);
  };

  const loadEmployerProfile = async () => {
    try {
      const response = await fetch(PROFILE_API_URL, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 401) {
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load employer profile.");
      }

      const data = await response.json();

      setEmployer({
        companyName: data.companyName || "",
        fullName: data.fullName || "",
        email: data.email || "",
        phoneNumber: data.phoneNumber || "",
      });
    } catch (error) {
      console.error("Profile loading error:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    loadEmployerProfile();

    const handleProfileUpdated = () => {
      loadEmployerProfile();
    };

    window.addEventListener(
      "employerProfileUpdated",
      handleProfileUpdated
    );

    return () => {
      window.removeEventListener(
        "employerProfileUpdated",
        handleProfileUpdated
      );
    };
  }, []);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const getInitials = (name) => {
    if (!name?.trim()) {
      return "E";
    }

    const names = name.trim().split(/\s+/);

    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }

    return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#00A99D",
      cancelButtonColor: "#d33",
      confirmButtonText: "Logout",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout request failed:", error);
    }

    localStorage.clear();
    sessionStorage.clear();

    await Swal.fire({
      icon: "success",
      title: "Logged Out",
      text: "You have been logged out successfully.",
      timer: 1500,
      showConfirmButton: false,
    });

    navigate("/login");
  };

  const getLinkClass = ({ isActive }) =>
    isActive ? "active" : "";

  return (
    <div className="dashboard">
      <div
        className={`sidebar-overlay ${
          sidebarOpen ? "sidebar-overlay-open" : ""
        }`}
        onClick={closeSidebar}
      />

      <aside
        className={`sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >
        <div>
          <div className="sidebar-mobile-header">
            <span>Navigation</span>

            <button
              type="button"
              className="sidebar-close-button"
              onClick={closeSidebar}
              aria-label="Close navigation menu"
            >
              <FaTimes />
            </button>
          </div>

          <div className="sidebar-brand">
            <div className="brand-card">
              <div className="brand-logo">
                <img
                  src="/covira_tranperant.png"
                  alt="Covira Logo"
                />
              </div>

              <div className="brand-text">
                <h2>Covira</h2>
                <p>Beyond Resumes</p>
              </div>
            </div>
          </div>

          <nav>
            <NavLink
              to="/dashboard"
              end
              className={getLinkClass}
              onClick={closeSidebar}
            >
              <FaHome className="menu-icon" />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/dashboard/profile"
              className={getLinkClass}
              onClick={closeSidebar}
            >
              <FaBuilding className="menu-icon" />
              <span>Employer Profile</span>
            </NavLink>

            <NavLink
              to="/dashboard/interviews"
              className={getLinkClass}
              onClick={closeSidebar}
            >
              <FaVideo className="menu-icon" />
              <span>Interviews</span>
            </NavLink>

            <NavLink
              to="/dashboard/questions"
              className={getLinkClass}
              onClick={closeSidebar}
            >
              <FaQuestionCircle className="menu-icon" />
              <span>Questions</span>
            </NavLink>

            <NavLink
              to="/dashboard/candidates"
              className={getLinkClass}
              onClick={closeSidebar}
            >
              <FaUsers className="menu-icon" />
              <span>Candidates</span>
            </NavLink>

            <NavLink
              to="/dashboard/analytics"
              className={getLinkClass}
              onClick={closeSidebar}
            >
              <FaChartBar className="menu-icon" />
              <span>Analytics</span>
            </NavLink>

            <NavLink
              to="/dashboard/settings"
              className={getLinkClass}
              onClick={closeSidebar}
            >
              <FaCog className="menu-icon" />
              <span>Settings</span>
            </NavLink>
          </nav>
        </div>

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          <FaSignOutAlt className="menu-icon" />
          Logout
        </button>
      </aside>

      <main className="dashboard-content">
        <header className="dashboard-header">
          <button
            type="button"
            className="mobile-menu-button"
            onClick={toggleSidebar}
            aria-label="Open navigation menu"
          >
            <FaBars />
          </button>

          <div className="header-right">
            <div className="notification">
              <FaBell />
              <span className="notification-dot" />
            </div>

            <NavLink
              to="/dashboard/profile"
              className="profile"
            >
              <div className="avatar">
                {profileLoading
                  ? "..."
                  : getInitials(employer.fullName)}
              </div>

              <div className="profile-details">
                <h4>
                  {profileLoading
                    ? "Loading..."
                    : employer.fullName || "Employer"}
                </h4>

                <span>
                  {profileLoading
                    ? "Please wait"
                    : employer.companyName || "Employer Account"}
                </span>
              </div>
            </NavLink>
          </div>
        </header>

        <div className="dashboard-page-content">
          <Outlet
            context={{
              employer,
              loadEmployerProfile,
            }}
          />
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;
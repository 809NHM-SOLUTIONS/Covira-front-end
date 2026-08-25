import { useEffect, useState } from "react";
import "../styles/DashboardPage.css";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import {
  FaHome,
  FaVideo,
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
  "http://localhost:8081/api/employer/profile";

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


  /*
   * ============================================================
   * SIDEBAR
   * ============================================================
   */

  const closeSidebar = () => {
    setSidebarOpen(false);
  };


  const toggleSidebar = () => {
    setSidebarOpen((current) => !current);
  };


  /*
   * ============================================================
   * LOAD EMPLOYER PROFILE
   * ============================================================
   */

  const loadEmployerProfile = async () => {

    try {

      const response = await fetch(
        PROFILE_API_URL,
        {
          method: "GET",
          credentials: "include",
        }
      );


      if (response.status === 401) {

        navigate("/login");

        return;
      }


      if (!response.ok) {

        throw new Error(
          "Failed to load employer profile."
        );

      }


      const data = await response.json();


      setEmployer({

        companyName:
          data.companyName || "",

        fullName:
          data.fullName || "",

        email:
          data.email || "",

        phoneNumber:
          data.phoneNumber || "",

      });


    } catch (error) {

      console.error(
        "Profile loading error:",
        error
      );


    } finally {

      setProfileLoading(false);

    }

  };


  /*
   * ============================================================
   * INITIAL LOAD
   * ============================================================
   */

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


  /*
   * ============================================================
   * PREVENT BODY SCROLL WHEN MOBILE SIDEBAR IS OPEN
   * ============================================================
   */

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


  /*
   * ============================================================
   * GET EMPLOYER INITIALS
   * ============================================================
   */

  const getInitials = (name) => {

    if (!name?.trim()) {

      return "E";

    }


    const names = name
      .trim()
      .split(/\s+/);


    if (names.length === 1) {

      return names[0]
        .charAt(0)
        .toUpperCase();

    }


    return `${names[0].charAt(0)}${names[1].charAt(0)}`
      .toUpperCase();

  };


  /*
   * ============================================================
   * LOGOUT
   * ============================================================
   */

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

      await fetch(
        "http://localhost:8081/api/auth/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );


    } catch (error) {

      console.error(
        "Logout request failed:",
        error
      );

    }


    localStorage.clear();

    sessionStorage.clear();


    await Swal.fire({

      html: `
        <div class="covira-swal">
          <div class="covira-swal-badge">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="#00A99D" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2>Logged Out</h2>
          <p>You've been signed out successfully.</p>
        </div>
      `,
      showConfirmButton: false,
      timer: 1500,
      background: "#ffffff",
      customClass: {
        popup: "covira-swal-popup",
      },

    });


    navigate("/login");

  };


  /*
   * ============================================================
   * ACTIVE LINK
   * ============================================================
   */

  const getLinkClass = ({ isActive }) =>
    isActive ? "active" : "";


  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (

    <div className="dashboard">


      {/* ========================================================
          MOBILE SIDEBAR OVERLAY
      ========================================================= */}

      <div
        className={`sidebar-overlay ${
          sidebarOpen
            ? "sidebar-overlay-open"
            : ""
        }`}
        onClick={closeSidebar}
      />


      {/* ========================================================
          SIDEBAR
      ========================================================= */}

      <aside
        className={`sidebar ${
          sidebarOpen
            ? "sidebar-open"
            : ""
        }`}
      >

        <div>


          {/* ====================================================
              MOBILE SIDEBAR HEADER
          ==================================================== */}

          <div className="sidebar-mobile-header">

            <span>
              Navigation
            </span>


            <button
              type="button"
              className="sidebar-close-button"
              onClick={closeSidebar}
              aria-label="Close navigation menu"
            >

              <FaTimes />

            </button>

          </div>


          {/* ====================================================
              BRAND
          ==================================================== */}

          <div className="sidebar-brand">

            <div className="brand-card">

              <div className="brand-logo">

                <img
                  src="/covira_tranperant.png"
                  alt="Covira Logo"
                />

              </div>


              <div className="brand-text">

                <h2>
                  Covira
                </h2>

                <p>
                  Beyond Resumes
                </p>

              </div>

            </div>

          </div>


          {/* ====================================================
              NAVIGATION
          ==================================================== */}

          <nav>


            {/* Dashboard */}

            <NavLink
              to="/dashboard"
              end
              className={getLinkClass}
              onClick={closeSidebar}
            >

              <FaHome className="menu-icon" />

              <span>
                Dashboard
              </span>

            </NavLink>


            {/* Employer Profile */}

            <NavLink
              to="/dashboard/profile"
              className={getLinkClass}
              onClick={closeSidebar}
            >

              <FaBuilding className="menu-icon" />

              <span>
                Employer Profile
              </span>

            </NavLink>


            {/* Interviews */}

            <NavLink
              to="/dashboard/interviews"
              className={getLinkClass}
              onClick={closeSidebar}
            >

              <FaVideo className="menu-icon" />

              <span>
                Interviews
              </span>

            </NavLink>


            {/* Candidates */}

            <NavLink
              to="/dashboard/candidates"
              className={getLinkClass}
              onClick={closeSidebar}
            >

              <FaUsers className="menu-icon" />

              <span>
                Candidates
              </span>

            </NavLink>


            {/* Analytics */}

            <NavLink
              to="/dashboard/analytics"
              className={getLinkClass}
              onClick={closeSidebar}
            >

              <FaChartBar className="menu-icon" />

              <span>
                Analytics
              </span>

            </NavLink>


            {/* Settings */}

            <NavLink
              to="/dashboard/settings"
              className={getLinkClass}
              onClick={closeSidebar}
            >

              <FaCog className="menu-icon" />

              <span>
                Settings
              </span>

            </NavLink>


          </nav>

        </div>


        {/* ======================================================
            LOGOUT
        ======================================================= */}

        <button
          className="logout-btn"
          onClick={handleLogout}
        >

          <FaSignOutAlt className="menu-icon" />

          Logout

        </button>

      </aside>


      {/* ========================================================
          MAIN CONTENT
      ========================================================= */}

      <main className="dashboard-content">


        {/* ======================================================
            HEADER
        ======================================================= */}

        <header className="dashboard-header">


          {/* Mobile menu */}

          <button
            type="button"
            className="mobile-menu-button"
            onClick={toggleSidebar}
            aria-label="Open navigation menu"
          >

            <FaBars />

          </button>


          {/* Header right */}

          <div className="header-right">


            {/* Notification */}

            <div className="notification">

              <FaBell />

              <span className="notification-dot" />

            </div>


            {/* Profile */}

            <NavLink
              to="/dashboard/profile"
              className="profile"
            >

              <div className="avatar">

                {profileLoading
                  ? "..."
                  : getInitials(
                      employer.fullName
                    )}

              </div>


              <div className="profile-details">

                <h4>

                  {profileLoading
                    ? "Loading..."
                    : employer.fullName ||
                      "Employer"}

                </h4>


                <span>

                  {profileLoading
                    ? "Please wait"
                    : employer.companyName ||
                      "Employer Account"}

                </span>

              </div>

            </NavLink>

          </div>

        </header>


        {/* ======================================================
            PAGE CONTENT
        ======================================================= */}

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
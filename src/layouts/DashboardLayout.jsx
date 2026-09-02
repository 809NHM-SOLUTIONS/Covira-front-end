import { useEffect, useRef, useState } from "react";import "../styles/DashboardPage.css";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getUnsavedChanges, setUnsavedChanges } from "../styles/utils/unsavedChangesGuard";
import { getNotificationIcon, getNotificationTarget } from "../styles/utils/notificationTypes";

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
  FaClock,
  FaHourglassEnd,
  FaStar,
  FaTimesCircle,
} from "react-icons/fa";

const PROFILE_API_URL =
  "http://localhost:8081/api/employer/profile";
const NOTIFICATIONS_URL = "http://localhost:8081/api/notifications";
const UNREAD_COUNT_URL = "http://localhost:8081/api/notifications/unread-count";

const NOTIFICATION_POLL_INTERVAL_MS = 30000;

function formatNotificationTime(isoString) {
  if (!isoString) return "";

  const then = new Date(isoString);
  const now = new Date();
  const diffMins = Math.round((now - then) / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.round(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return then.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}



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


  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState(false);      
  const [countLoaded, setCountLoaded] = useState(false);
  const notifPanelRef = useRef(null);

  const loadUnreadCount = async () => {
    try {
      const response = await fetch(UNREAD_COUNT_URL, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) return;

      const data = await response.json();
      setUnreadCount(data.count || 0);
      setCountLoaded(true);
    } catch (error) {
      // the bell just won't update this cycle.
    }
  };

  const loadNotifications = async () => {
    setNotifLoading(true);
  setNotifError(false);
    try {
      const response = await fetch(NOTIFICATIONS_URL, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to load notifications.");
      }

      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      setNotifError(true); 
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    loadUnreadCount();

    const interval = setInterval(loadUnreadCount, NOTIFICATION_POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifPanelRef.current && !notifPanelRef.current.contains(e.target)) {
        setNotifPanelOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleNotifPanel = () => {
    const opening = !notifPanelOpen;
    setNotifPanelOpen(opening);

    if (opening) {
      loadNotifications();
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await fetch(`${NOTIFICATIONS_URL}/${notification.id}/read`, {
          method: "POST",
          credentials: "include",
        });

        setNotifications((current) =>
          current.map((n) =>
            n.id === notification.id ? { ...n, read: true } : n
          )
        );

        setUnreadCount((current) => Math.max(0, current - 1));
      } catch (error) {
        // Non-fatal - still navigate even if marking-as-read failed.
      }
    }

    setNotifPanelOpen(false);

    const target = getNotificationTarget(notification);

    if (target?.type === "candidate") {
      navigate(`/dashboard/candidates/${target.id}`);
    } else if (target?.type === "interview") {
      navigate(`/dashboard/interviews/${target.id}/questions`);
    }
  };

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


  /* LOAD EMPLOYER PROFILE*/

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
   
   * INITIAL LOAD
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
    
   * PREVENT BODY SCROLL WHEN MOBILE SIDEBAR IS OPEN
   
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

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (getUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);



  /*
   
   * GET EMPLOYER INITIALS
   
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

const handleNavClick = (e, destination) => {
  if (getUnsavedChanges()) {
    e.preventDefault();

    Swal.fire({
      title: "Unsaved Changes",
      text: "Your password change isn’t complete. Leaving this page will lose your progress. Continue?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#00A99D",
      cancelButtonColor: "#98A2B3",
      confirmButtonText: "Leave Anyway",
      cancelButtonText: "Stay",
    }).then((result) => {
      if (result.isConfirmed) {
        setUnsavedChanges(false);
        closeSidebar();
        navigate(destination);
      }
    });

    return;
  }

  closeSidebar();
};


/*
 * ============================================================
 * LOGOUT
 * ============================================================
 */

const handleLogout = async () => {

  // Check for unsaved password changes
  if (getUnsavedChanges()) {
    const stay = await Swal.fire({
      title: "Unsaved Changes",
      text: "You're in the middle of changing your password. Logging out now will discard your progress.",
      icon: "warning",
      showCancelButton: true,

      confirmButtonColor: "#00A99D",
      cancelButtonColor: "#98A2B3",
      confirmButtonText: "Logout Anyway",
      cancelButtonText: "Stay",

    }
  );

    if (!stay.isConfirmed) {
      return;
    }

    setUnsavedChanges(false);
  }


  // Normal logout confirmation
  const result = await Swal.fire({
    title: "Logout?",
    text: "Are you sure you want to logout?",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#00A99D",
    cancelButtonColor: "#d33",
    confirmButtonText: "Logout",
    cancelButtonText: "Cancel",
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
            <path
              d="M20 6L9 17l-5-5"
              stroke="#00A99D"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
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
            <div className="notification-wrapper" ref={notifPanelRef}>
              <button
                type="button"
                className="notification"
                onClick={toggleNotifPanel}
                aria-label="Notifications"
              >
                <FaBell />
                {countLoaded &&unreadCount > 0 && (
                  <span className="notification-dot">{unreadCount > 9 ? "9+" : unreadCount}</span>
                )}
              </button>

              {notifPanelOpen && (
                <div className="notification-panel">
                  <div className="notification-panel-header">
                    <h4>Notifications</h4>
                    {unreadCount > 0 && <span className="notification-panel-count">{unreadCount} unread</span>}
                  </div>

                             <div className="notification-panel-list">
                    {notifLoading ? (
                      <div className="notification-panel-empty">Loading...</div>
                    ) : notifError ? (
                      <div className="notification-panel-empty notification-panel-error">
                        <p>Something went wrong loading your notifications.</p>
                        <button type="button" onClick={loadNotifications}>
                          Try Again
                        </button>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="notification-panel-empty">
                        No Notifications Yet
                        <br />
                        You'll see updates here when candidates submit their interviews.
                      </div>
                    ) : (
                      notifications.map((notification) => {
                        const NotificationIcon = getNotificationIcon(notification.type);

                     return (
                        <button
                          type="button"
                          key={notification.id}
                          className={`notification-item ${notification.read ? "" : "notification-item-unread"}`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          {!notification.read && <span className="notification-item-dot" />}
                          <div className="notification-item-body">
                            <span className="notification-item-icon">
                              <NotificationIcon />
                            </span>
                            <div>
                              <h5>{notification.title}</h5>
                              <p>{notification.message}</p>
                              {notification.candidateName && (
                                <span className="notification-item-meta">
                                  {notification.candidateName}
                                  {notification.interviewTitle ? ` · ${notification.interviewTitle}` : ""}
                                </span>
                              )}
                              <span className="notification-item-time">
                                {formatNotificationTime(notification.createdAt)}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
})
                    )}
                  </div>
                </div>
              )}
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


        {/* 
            PAGE CONTENT */}

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
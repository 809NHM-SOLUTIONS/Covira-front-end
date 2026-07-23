import "../styles/DashboardPage.css";
import { useNavigate, NavLink } from "react-router-dom";
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
    FaPlusCircle
} from "react-icons/fa";

function DashboardPage() {

    const navigate = useNavigate();

    const handleLogout = () => {

        Swal.fire({
            title: "Logout?",
            text: "Are you sure you want to logout?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#00A99D",
            cancelButtonColor: "#d33",
            confirmButtonText: "Logout"
        }).then((result) => {

            if (result.isConfirmed) {

                localStorage.clear();
                sessionStorage.clear();

                Swal.fire({
                    icon: "success",
                    title: "Logged Out",
                    text: "You have been logged out successfully.",
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {

                    navigate("/login");

                });

            }

        });

    };

    return (

        <div className="dashboard">

            {/* Sidebar */}

            <aside className="sidebar">

                <div>

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
                            className={({ isActive }) => isActive ? "active" : ""}
                        >
                            <span>Dashboard</span>
                        </NavLink>

                        <NavLink to="/dashboard/interviews">
                            <FaVideo className="menu-icon" />
                            <span>Interviews</span>
                        </NavLink>

                        <NavLink to="/dashboard/questions">
                            <FaQuestionCircle className="menu-icon" />
                            <span>Questions</span>
                        </NavLink>

                        <NavLink to="/dashboard/candidates">
                            <FaUsers className="menu-icon" />
                            <span>Candidates</span>
                        </NavLink>

                        <NavLink to="/dashboard/analytics">
                            <FaChartBar className="menu-icon" />
                            <span>Analytics</span>
                        </NavLink>

                        <NavLink to="/dashboard/settings">
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

            </aside>            {/* Main */}

            <main className="dashboard-content">

                {/* Header */}

                <header className="dashboard-header">

                    <div className="header-right">

                        <div className="notification">

                            <FaBell />

                            <span className="notification-dot"></span>

                        </div>

                        <div className="profile">

                            <div className="avatar">
                                N
                            </div>

                            <div>

                                <h4>Nomsa</h4>

                                <span>Employer</span>

                            </div>

                        </div>

                    </div>
                </header>

                {/* Statistics */}

                <section className="stats">

                    <div className="card">

                        <h3>Total Interviews</h3>

                        <h2>0</h2>

                        <span>No interviews created</span>

                    </div>

                    <div className="card">

                        <h3>Candidates</h3>

                        <h2>0</h2>

                        <span>No candidates yet</span>

                    </div>

                    <div className="card">

                        <h3>Completed</h3>

                        <h2>0</h2>

                        <span>Completed interviews</span>

                    </div>

                    <div className="card">

                        <h3>Pending</h3>

                        <h2>0</h2>

                        <span>Awaiting responses</span>

                    </div>

                </section>

                {/* Quick Actions */}

                <section className="quick-actions">

                    <h2>Quick Actions</h2>

                    <div className="actions-grid">

                        <div className="action-card">

                            <h3>
                                <FaPlusCircle className="action-icon" />
                                Create Interview
                            </h3>

                            <p>Create a new interview assessment.</p>

                        </div>

                        <div className="action-card">

                            <h3>
                                <FaQuestionCircle className="action-icon" />
                                Manage Questions
                            </h3>

                            <p>Create and organize interview questions.</p>

                        </div>

                        <div className="action-card">

                            <h3>
                                <FaUsers className="action-icon" />
                                View Candidates
                            </h3>

                            <p>Review submitted interview responses.</p>

                        </div>

                    </div>

                </section>

                {/* Recent Activity */}

                <section className="activity">

                    <h2>Recent Activity</h2>

                    <div className="activity-box">

                        <h3>No activity yet</h3>

                        <p>
                            Once you create interviews and invite candidates,
                            your recent activity will appear here.
                        </p>

                    </div>

                </section>

            </main>

        </div>

    );

}

export default DashboardPage;
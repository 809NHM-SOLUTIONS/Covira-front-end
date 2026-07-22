import "../styles/DashboardPage.css";
import {
    FaHome,
    FaClipboardList,
    FaUsers,
    FaVideo,
    FaChartBar,
    FaCog,
    FaBell,
    FaSearch,
    FaPlus,
    FaSignOutAlt
} from "react-icons/fa";

function DashboardPage() {

    return (

        <div className="dashboard">

            {/* Sidebar */}

            <aside className="sidebar">

                <div className="logo-section">

                    <img
                        src="/covira_tranperant.png"
                        alt="Covira Logo"
                        className="logo"
                    />

                    <h2>Covira</h2>

                    <p>Beyond Resumes</p>

                </div>

                <nav>

                    <ul>

                        <li className="active">
                            <FaHome />
                            Dashboard
                        </li>

                        <li>
                            <FaClipboardList />
                            Interviews
                        </li>

                        <li>
                            <FaVideo />
                            Video Responses
                        </li>

                        <li>
                            <FaUsers />
                            Candidates
                        </li>

                        <li>
                            <FaChartBar />
                            Reports
                        </li>

                        <li>
                            <FaCog />
                            Settings
                        </li>

                    </ul>

                </nav>

                <button className="logout-btn">

                    <FaSignOutAlt />

                    Logout

                </button>

            </aside>

            {/* Main Content */}

            <main className="main-content">

                {/* Header */}

                <header className="topbar">

                    <div>

                        <h1>Dashboard</h1>

                        <p>Welcome back to Covira.</p>

                    </div>

                    <div className="top-actions">

                        <div className="search-box">

                            <FaSearch />

                            <input
                                type="text"
                                placeholder="Search..."
                            />

                        </div>

                        <button className="icon-btn">

                            <FaBell />

                        </button>

                        <div className="profile">

                            <div className="avatar">
                                N
                            </div>

                            <div>

                                <h4>Nomsa</h4>

                                <span>Administrator</span>

                            </div>

                        </div>

                    </div>

                </header>

                {/* Welcome Banner */}

                <section className="welcome-banner">

                    <div>

                        <h2>Welcome back 👋</h2>

                        <p>

                            Create interviews, review candidates,
                            and make smarter hiring decisions.

                        </p>

                    </div>

                    <button className="create-btn">

                        <FaPlus />

                        Create Interview

                    </button>

                </section>

                {/* Statistics */}

                <section className="stats-grid">

                    <div className="stat-card">
                        <span>Total Interviews</span>
                        <h2>24</h2>
                        <p>+4 this week</p>
                    </div>

                    <div className="stat-card">
                        <span>Candidates</span>
                        <h2>86</h2>
                        <p>18 new today</p>
                    </div>

                    <div className="stat-card">
                        <span>Completed</span>
                        <h2>56</h2>
                        <p>92% completion</p>
                    </div>

                    <div className="stat-card">
                        <span>Success Rate</span>
                        <h2>97%</h2>
                        <p>Excellent</p>
                    </div>

                </section>

                {/* Dashboard Content */}

                <div className="dashboard-grid">

                    {/* Recent Interviews */}

                    <div className="dashboard-card interviews-card">

                        <div className="card-header">

                            <h3>Recent Interviews</h3>

                            <button>View All</button>

                        </div>

                        <table>

                            <thead>

                            <tr>

                                <th>Position</th>

                                <th>Status</th>

                                <th>Candidates</th>

                                <th>Action</th>

                            </tr>

                            </thead>

                            <tbody>

                            <tr>

                                <td>Software Developer</td>

                                <td><span className="badge active">Active</span></td>

                                <td>18</td>

                                <td><button className="table-btn">View</button></td>

                            </tr>

                            <tr>

                                <td>Frontend Developer</td>

                                <td><span className="badge completed">Completed</span></td>

                                <td>10</td>

                                <td><button className="table-btn">View</button></td>

                            </tr>

                            <tr>

                                <td>HR Manager</td>

                                <td><span className="badge pending">Pending</span></td>

                                <td>7</td>

                                <td><button className="table-btn">View</button></td>

                            </tr>

                            <tr>

                                <td>UI/UX Designer</td>

                                <td><span className="badge active">Active</span></td>

                                <td>14</td>

                                <td><button className="table-btn">View</button></td>

                            </tr>

                            </tbody>

                        </table>

                    </div>

                    {/* Right Side */}

                    <div className="right-panel">

                        {/* Quick Actions */}

                        <div className="dashboard-card">

                            <h3>Quick Actions</h3>

                            <button className="quick-btn">+ Create Interview</button>

                            <button className="quick-btn">+ Add Questions</button>

                            <button className="quick-btn">Invite Candidate</button>

                            <button className="quick-btn">Generate Link</button>

                        </div>

                        {/* Recent Candidates */}

                        <div className="dashboard-card">

                            <h3>Recent Candidates</h3>

                            <div className="candidate">

                                <div>

                                    <strong>Sarah Johnson</strong>

                                    <p>Software Developer</p>

                                </div>

                                <span className="badge completed">Completed</span>

                            </div>

                            <div className="candidate">

                                <div>

                                    <strong>James Smith</strong>

                                    <p>Frontend Developer</p>

                                </div>

                                <span className="badge active">In Progress</span>

                            </div>

                            <div className="candidate">

                                <div>

                                    <strong>Emily Brown</strong>

                                    <p>HR Manager</p>

                                </div>

                                <span className="badge pending">Pending</span>

                            </div>

                        </div>

                    </div>

                </div>

            </main>

        </div>

    );

}

export default DashboardPage;
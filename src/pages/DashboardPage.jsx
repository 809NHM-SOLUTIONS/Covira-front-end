import "../styles/DashboardPage.css";
import { NavLink } from "react-router-dom";

import {
  FaPlusCircle,
  FaQuestionCircle,
  FaUsers,
  FaBuilding,
} from "react-icons/fa";

function DashboardPage() {
  return (
    <>
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

      <section className="quick-actions">
        <h2>Quick Actions</h2>

        <div className="actions-grid">
          <NavLink
            to="/dashboard/interviews"
            className="action-card"
          >
            <h3>
              <FaPlusCircle className="action-icon" />
              Create Interview
            </h3>

            <p>Create a new interview assessment.</p>
          </NavLink>

          <NavLink
            to="/dashboard/questions"
            className="action-card"
          >
            <h3>
              <FaQuestionCircle className="action-icon" />
              Manage Questions
            </h3>

            <p>Create and organise interview questions.</p>
          </NavLink>

          <NavLink
            to="/dashboard/candidates"
            className="action-card"
          >
            <h3>
              <FaUsers className="action-icon" />
              View Candidates
            </h3>

            <p>Review submitted interview responses.</p>
          </NavLink>

          <NavLink
            to="/dashboard/profile"
            className="action-card"
          >
            <h3>
              <FaBuilding className="action-icon" />
              Company Profile
            </h3>

            <p>Update your company and contact information.</p>
          </NavLink>
        </div>
      </section>

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
    </>
  );
}

export default DashboardPage;
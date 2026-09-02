import { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import "../styles/DashboardPage.css";

import {
  FaPlusCircle,
  FaQuestionCircle,
  FaUsers,
  FaBuilding,
  FaFileAlt,
  FaCheckCircle,
  FaClock,
  FaUserPlus,
} from "react-icons/fa";

const DASHBOARD_SUMMARY_URL = "http://localhost:8081/api/dashboard/summary";

function formatRelativeTime(isoString) {
  if (!isoString) return "";

  const then = new Date(isoString);
  const now = new Date();
  const diffMs = now - then;
  const diffMins = Math.round(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? "" : "s"} ago`;

  const diffHours = Math.round(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

  return then.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatDate(isoString) {
  if (!isoString) return "-";
  return new Date(isoString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DashboardPage() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(DASHBOARD_SUMMARY_URL, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 401) {
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load dashboard data.");
      }

      const data = await response.json();
      setSummary(data);
    } catch (err) {
      setError(err.message || "Unable to load your dashboard right now.");
    } finally {
      setLoading(false);
    }
  };

  const goToInterview = (interviewId) => {
    if (!interviewId) return;
    navigate(`/dashboard/interviews/${interviewId}/questions`);
  };

  const activityIcon = (type) => {
    switch (type) {
      case "CANDIDATE_COMPLETED":
        return <FaCheckCircle className="activity-icon activity-icon-success" />;
      case "INTERVIEW_CREATED":
        return <FaFileAlt className="activity-icon activity-icon-info" />;
      default:
        return <FaClock className="activity-icon" />;
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading-state">Loading your dashboard...</div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-loading-state dashboard-error-state">
        <p>{error}</p>
        <button type="button" onClick={loadSummary}>
          Try Again
        </button>
      </div>
    );
  }

  const stats = summary?.stats || {};
  const recentActivity = summary?.recentActivity || [];
  const recentInterviews = summary?.recentInterviews || [];
  const candidateOverview = summary?.candidateOverview || {};

  return (
    <>
      {/* ==================== STATS ==================== */}
      <section className="stats">
        <div className="card">
          <h3>Total Interviews</h3>
          <h2>{stats.totalInterviews ?? 0}</h2>
          <span>
            {stats.totalInterviews ? "Interviews created" : "No interviews created"}
          </span>
        </div>

        <div className="card">
          <h3>Total Candidates</h3>
          <h2>{stats.totalCandidates ?? 0}</h2>
          <span>{stats.totalCandidates ? "Candidates invited" : "No candidates yet"}</span>
        </div>

        <div className="card">
          <h3>Completed</h3>
          <h2>{stats.completedInterviews ?? 0}</h2>
          <span>Completed interviews</span>
        </div>

        <div className="card">
          <h3>Pending</h3>
          <h2>{stats.pendingResponses ?? 0}</h2>
          <span>Awaiting responses</span>
        </div>
      </section>

      {/* ==================== QUICK ACTIONS ==================== */}
      <section className="quick-actions">
        <h2>Quick Actions</h2>

        <div className="actions-grid">
          <NavLink to="/dashboard/interviews" className="action-card">
            <h3>
              <FaPlusCircle className="action-icon" />
              Create Interview
            </h3>
            <p>Create a new interview assessment.</p>
          </NavLink>

          <NavLink to="/dashboard/interviews" className="action-card">
            <h3>
              <FaQuestionCircle className="action-icon" />
              Manage Questions
            </h3>
            <p>Select an interview to manage its questions.</p>
          </NavLink>

          <NavLink to="/dashboard/candidates" className="action-card">
            <h3>
              <FaUsers className="action-icon" />
              View Candidates
            </h3>
            <p>Review submitted interview responses.</p>
          </NavLink>

          <NavLink to="/dashboard/profile" className="action-card">
            <h3>
              <FaBuilding className="action-icon" />
              Company Profile
            </h3>
            <p>Update your company and contact information.</p>
          </NavLink>
        </div>
      </section>

      {/* ==================== CANDIDATE OVERVIEW ==================== */}
      <section className="candidate-overview">
        <h2>Candidate Overview</h2>

        <div className="candidate-overview-grid">
          <div className="overview-pill">
            <FaUserPlus className="overview-pill-icon" />
            <div>
              <h4>{candidateOverview.newCandidates ?? 0}</h4>
              <span>New Candidates</span>
            </div>
          </div>

          <div className="overview-pill">
            <FaClock className="overview-pill-icon" />
            <div>
              <h4>{candidateOverview.awaitingReview ?? 0}</h4>
              <span>Awaiting Review</span>
            </div>
          </div>

          <div className="overview-pill">
            <FaCheckCircle className="overview-pill-icon" />
            <div>
              <h4>{candidateOverview.completed ?? 0}</h4>
              <span>Completed</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== RECENT INTERVIEWS ==================== */}
      <section className="recent-interviews">
        <h2>Recent Interviews</h2>

        {recentInterviews.length === 0 ? (
          <div className="activity-box">
            <h3>No Interviews Yet</h3>
            <p>Create your first interview to start receiving candidate responses.</p>
          </div>
        ) : (
          <div className="recent-interviews-list">
            {recentInterviews.map((interview) => (
              <button
                type="button"
                key={interview.id}
                className="recent-interview-row"
                onClick={() => goToInterview(interview.id)}
              >
                <div className="recent-interview-main">
                  <h4>{interview.title}</h4>
                  <p>{interview.position || "No position set"}</p>
                </div>

                <div className="recent-interview-meta">
                  <span className={`status-badge status-${(interview.status || "").toLowerCase()}`}>
                    {interview.status}
                  </span>
                  <span>{interview.questionCount} question{interview.questionCount === 1 ? "" : "s"}</span>
                  <span>
                    {interview.completedResponseCount}/{interview.candidateCount} responded
                  </span>
                  <span>{formatDate(interview.createdAt)}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ==================== RECENT ACTIVITY ==================== */}
      <section className="activity">
        <h2>Recent Activity</h2>

        {recentActivity.length === 0 ? (
          <div className="activity-box">
            <h3>No activity yet</h3>
            <p>
              Once you create interviews and invite candidates,
              your recent activity will appear here.
            </p>
          </div>
        ) : (
          <div className="activity-list">
            {recentActivity.map((item, index) => (
              <button
                type="button"
                key={index}
                className="activity-row"
                onClick={() => goToInterview(item.interviewId)}
                disabled={!item.interviewId}
              >
                {activityIcon(item.type)}
                <span className="activity-message">{item.message}</span>
                <span className="activity-time">{formatRelativeTime(item.timestamp)}</span>
              </button>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default DashboardPage;
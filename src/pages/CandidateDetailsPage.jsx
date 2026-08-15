import "../styles/CandidateDetailsPage.css";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  HiOutlineArrowLeft,
  HiOutlineEnvelope,
  HiOutlineBriefcase,
  HiOutlineVideoCamera,
  HiOutlineMapPin,
  HiOutlineCalendarDays,
  HiOutlinePlayCircle,
} from "react-icons/hi2";

const API_BASE_URL = "http://localhost:8080";

function CandidateDetailsPage() {
  const { id } = useParams();

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * Load candidate from backend
   */
  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/candidates/${id}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 401) {
          throw new Error(
            "You are not logged in. Please log in again."
          );
        }

        if (response.status === 404) {
          throw new Error(
            "The candidate you are looking for does not exist."
          );
        }

        if (!response.ok) {
          throw new Error(
            "Failed to load candidate."
          );
        }

        const data = await response.json();

        setCandidate(data);

      } catch (err) {
        console.error(
          "Error loading candidate:",
          err
        );

        setError(err.message);

      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCandidate();
    }
  }, [id]);

  /*
   * Loading
   */
  if (loading) {
    return (
      <section className="module-page candidate-details-page">

        <div className="candidate-loading">
          <p>Loading candidate...</p>
        </div>

      </section>
    );
  }

  /*
   * Error
   */
  if (error || !candidate) {
    return (
      <section className="module-page">

        <div className="candidate-not-found">

          <h1>Candidate Not Found</h1>

          <p>
            {error ||
              "The candidate you are looking for does not exist."}
          </p>

          <Link
            to="/dashboard/candidates"
            className="back-candidates-btn"
          >
            <HiOutlineArrowLeft />
            Back to Candidates
          </Link>

        </div>

      </section>
    );
  }

  const initial =
    candidate.name?.charAt(0).toUpperCase() || "?";

  const responses = Array.isArray(candidate.responses)
    ? candidate.responses
    : [];

  return (
    <section className="candidate-details-page">

      {/* Back */}
      <Link
        to="/dashboard/candidates"
        className="back-candidates-link"
      >
        <HiOutlineArrowLeft />
        Back to Candidates
      </Link>

      {/* Candidate Header */}
      <div className="candidate-profile-card">

        <div className="candidate-profile-info">

          <div className="candidate-large-avatar">
            {initial}
          </div>

          <div className="candidate-profile-text">

            <h1>{candidate.name}</h1>

            <p>
              Candidate for{" "}
              {candidate.position || "-"}
            </p>

          </div>

        </div>

        <span
          className={`status-badge status-${(
            candidate.status || ""
          ).toLowerCase()}`}
        >
          {candidate.status || "Unknown"}
        </span>

      </div>

      {/* Candidate Information */}
      <div className="candidate-information-card">

        <div className="candidate-section-heading">

          <h2>Candidate Information</h2>

          <p>
            Personal and interview information
            for this candidate.
          </p>

        </div>

        <div className="candidate-info-grid">

          <InfoItem
            icon={<HiOutlineEnvelope />}
            label="Email"
            value={candidate.email || "-"}
          />

          <InfoItem
            icon={<HiOutlineBriefcase />}
            label="Position"
            value={candidate.position || "-"}
          />

          <InfoItem
            icon={<HiOutlineVideoCamera />}
            label="Interview"
            value={candidate.interview || "-"}
          />

          <InfoItem
            icon={<HiOutlineBriefcase />}
            label="Department"
            value={candidate.department || "-"}
          />

          <InfoItem
            icon={<HiOutlineMapPin />}
            label="Location"
            value={candidate.location || "-"}
          />

          <InfoItem
            icon={<HiOutlineCalendarDays />}
            label="Submitted"
            value={candidate.submittedAt || "-"}
          />

        </div>

      </div>

      {/* Interview Submission */}
      <div className="interview-submission-card">

        <div className="candidate-section-heading">

          <h2>Interview Submission</h2>

          <p>
            Review the candidate's submitted
            interview responses.
          </p>

        </div>

        {candidate.status === "Pending" ||
        responses.length === 0 ? (

          <div className="submission-empty">

            <div className="submission-empty-icon">
              <HiOutlineVideoCamera />
            </div>

            <h3>Interview not submitted</h3>

            <p>
              This candidate has not completed
              the interview yet. Their responses
              will appear here after submission.
            </p>

          </div>

        ) : (

          <div className="submission-list">

            {responses.map((response, index) => (

              <div
                className="submission-item"
                key={response.id || index}
              >

                {/* Question */}
                <div className="submission-question">

                  <span>
                    Question{" "}
                    {response.questionNumber ||
                      index + 1}
                  </span>

                  <h3>
                    {response.question ||
                      "Question unavailable"}
                  </h3>

                </div>

                {/* Candidate Answer */}
                <div className="candidate-answer">

                  <div className="answer-header">

                    <strong>
                      Candidate Answer
                    </strong>

                  </div>

                  <p>
                    {response.answer ||
                      "No written answer submitted."}
                  </p>

                </div>

                {/* Video */}
                <div className="video-response">

                  {response.videoUrl ? (

                    <video
                     controls
                    className="candidate-video"
                    src={`${API_BASE_URL}${response.videoUrl}`}
                     >
                     Your browser does not support video playback.
                    </video>

                  ) : (

                    <div className="video-placeholder">

                      <div className="video-placeholder-icon">
                        <HiOutlinePlayCircle />
                      </div>

                      <div className="video-placeholder-content">

                        <strong>
                          Video Response
                        </strong>

                        <p>
                          The candidate's recorded
                          video will appear here
                          once the recording is
                          connected.
                        </p>

                      </div>

                    </div>

                  )}

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </section>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="candidate-info-item">

      <div className="candidate-info-icon">
        {icon}
      </div>

      <div>

        <span>{label}</span>

        <strong>{value}</strong>

      </div>

    </div>
  );
}

export default CandidateDetailsPage;
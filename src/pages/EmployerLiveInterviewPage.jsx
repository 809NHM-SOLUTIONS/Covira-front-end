import { useEffect, useMemo, useState } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/EmployerLiveInterviewPage.css";

function EmployerLiveInterviewPage() {
  const navigate = useNavigate();
  const { roomName } = useParams();

  const safeRoomName =
    roomName || "covira-java-developer-interview-001";

  const interview = useMemo(
    () => ({
      candidateName: "Senzo Khumalo",
      position: "Java Developer",
      company: "Covira Technologies",
      interviewerName: "Hiring Manager",
      duration: "45 minutes",
    }),
    []
  );

  const storageKey = `covira-interview-assessment-${safeRoomName}`;

  const [notes, setNotes] = useState("");
  const [communicationScore, setCommunicationScore] =
    useState(0);
  const [technicalScore, setTechnicalScore] = useState(0);
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [recommendation, setRecommendation] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [participantCount, setParticipantCount] = useState(1);
  const [meetingStatus, setMeetingStatus] =
    useState("Waiting for candidate");

  useEffect(() => {
    try {
      const savedAssessment = localStorage.getItem(storageKey);

      if (!savedAssessment) {
        return;
      }

      const parsedAssessment = JSON.parse(savedAssessment);

      setNotes(parsedAssessment.notes || "");
      setCommunicationScore(
        parsedAssessment.communicationScore || 0
      );
      setTechnicalScore(parsedAssessment.technicalScore || 0);
      setConfidenceScore(parsedAssessment.confidenceScore || 0);
      setRecommendation(parsedAssessment.recommendation || "");
    } catch (error) {
      console.error(
        "Unable to load the saved interview assessment:",
        error
      );
    }
  }, [storageKey]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const assessment = {
        notes,
        communicationScore,
        technicalScore,
        confidenceScore,
        recommendation,
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(
        storageKey,
        JSON.stringify(assessment)
      );

      setSaveMessage("Progress saved automatically");

      const messageTimeout = setTimeout(() => {
        setSaveMessage("");
      }, 2000);

      return () => clearTimeout(messageTimeout);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [
    notes,
    communicationScore,
    technicalScore,
    confidenceScore,
    recommendation,
    storageKey,
  ]);

  const calculateOverallScore = () => {
    const scores = [
      communicationScore,
      technicalScore,
      confidenceScore,
    ];

    const completedScores = scores.filter((score) => score > 0);

    if (completedScores.length === 0) {
      return 0;
    }

    const total = completedScores.reduce(
      (sum, score) => sum + score,
      0
    );

    return Math.round(
      (total / (completedScores.length * 5)) * 100
    );
  };

  const handleManualSave = () => {
    const assessment = {
      candidateName: interview.candidateName,
      position: interview.position,
      notes,
      communicationScore,
      technicalScore,
      confidenceScore,
      recommendation,
      overallScore: calculateOverallScore(),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      storageKey,
      JSON.stringify(assessment)
    );

    setSaveMessage("Interview assessment saved successfully");

    setTimeout(() => {
      setSaveMessage("");
    }, 2500);
  };

  const handleEndInterview = () => {
    const confirmed = window.confirm(
      "Are you sure you want to end this interview?"
    );

    if (!confirmed) {
      return;
    }

    handleManualSave();

    navigate(`/interview-summary/${safeRoomName}`);
  };

  const renderRatingButtons = (
    label,
    value,
    setter,
    description
  ) => (
    <section className="assessment-section">
      <div className="assessment-section-heading">
        <div>
          <h3>{label}</h3>
          <p>{description}</p>
        </div>

        <strong>{value}/5</strong>
      </div>

      <div
        className="rating-buttons"
        role="group"
        aria-label={`${label} rating`}
      >
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            type="button"
            className={
              value >= score
                ? "rating-button rating-button-active"
                : "rating-button"
            }
            onClick={() => setter(score)}
            aria-label={`Rate ${label} ${score} out of 5`}
          >
            ★
          </button>
        ))}
      </div>
    </section>
  );

  return (
    <main className="employer-live-page">
      <header className="employer-live-header">
        <div>
          <span className="employer-live-badge">
            COVIRA LIVE
          </span>

          <h1>{interview.position} Interview</h1>

          <p>
            Candidate: {interview.candidateName} · Interviewer:{" "}
            {interview.interviewerName}
          </p>
        </div>

        <div className="meeting-status-area">
          <span className="meeting-status">
            <span className="meeting-status-dot" />
            {meetingStatus}
          </span>

          <span className="participant-count">
            {participantCount} participant
            {participantCount === 1 ? "" : "s"}
          </span>
        </div>
      </header>

      <section className="employer-interview-information">
        <article>
          <span>Position</span>
          <strong>{interview.position}</strong>
        </article>

        <article>
          <span>Candidate</span>
          <strong>{interview.candidateName}</strong>
        </article>

        <article>
          <span>Company</span>
          <strong>{interview.company}</strong>
        </article>

        <article>
          <span>Scheduled duration</span>
          <strong>{interview.duration}</strong>
        </article>
      </section>

      <section className="employer-workspace">
        <section className="employer-video-panel">
          <JitsiMeeting
            domain="meet.jit.si"
            roomName={safeRoomName}
            userInfo={{
              displayName: interview.interviewerName,
              email: "",
            }}
            configOverwrite={{
              subject: `${interview.position} Interview`,
              startWithAudioMuted: false,
              startWithVideoMuted: false,
              prejoinPageEnabled: true,
              disableDeepLinking: true,
              enableWelcomePage: false,
              enableClosePage: false,
              requireDisplayName: false,
            }}
            interfaceConfigOverwrite={{
              DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
              MOBILE_APP_PROMO: false,
              SHOW_PROMOTIONAL_CLOSE_PAGE: false,
              DEFAULT_BACKGROUND: "#111827",
            }}
            getIFrameRef={(iframeRef) => {
              iframeRef.style.width = "100%";
              iframeRef.style.height = "760px";
              iframeRef.style.border = "none";
            }}
            onApiReady={(externalApi) => {
              externalApi.executeCommand(
                "displayName",
                interview.interviewerName
              );

              externalApi.executeCommand(
                "subject",
                `${interview.position} Interview`
              );

              externalApi.addListener(
                "participantJoined",
                () => {
                  setParticipantCount((current) => current + 1);
                  setMeetingStatus("Interview in progress");
                }
              );

              externalApi.addListener(
                "participantLeft",
                () => {
                  setParticipantCount((current) =>
                    Math.max(1, current - 1)
                  );
                }
              );

              externalApi.addListener(
                "videoConferenceJoined",
                () => {
                  setMeetingStatus("Waiting for candidate");
                }
              );

              externalApi.addListener(
                "readyToClose",
                () => {
                  setMeetingStatus("Interview ended");
                }
              );
            }}
            onReadyToClose={handleEndInterview}
          />
        </section>

        <aside className="employer-assessment-panel">
          <div className="assessment-heading">
            <div>
              <span>INTERVIEW ASSESSMENT</span>
              <h2>Candidate evaluation</h2>
            </div>

            <div className="overall-score">
              <strong>{calculateOverallScore()}%</strong>
              <span>Overall</span>
            </div>
          </div>

          <section className="notes-section">
            <label htmlFor="interviewNotes">
              Interview notes
            </label>

            <p>
              Record important answers, strengths and areas of
              concern.
            </p>

            <textarea
              id="interviewNotes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Example: Candidate demonstrated a strong understanding of Spring Boot and REST APIs..."
              rows="9"
            />

            <span className="notes-character-count">
              {notes.length} characters
            </span>
          </section>

          {renderRatingButtons(
            "Communication",
            communicationScore,
            setCommunicationScore,
            "Clarity, listening and explanation skills."
          )}

          {renderRatingButtons(
            "Technical ability",
            technicalScore,
            setTechnicalScore,
            "Java, Spring Boot and problem-solving knowledge."
          )}

          {renderRatingButtons(
            "Confidence",
            confidenceScore,
            setConfidenceScore,
            "Professional presence and confidence."
          )}

          <section className="recommendation-section">
            <h3>Recommendation</h3>

            <p>
              Select your current recommendation for this candidate.
            </p>

            <div className="recommendation-options">
              {["HIRE", "MAYBE", "REJECT"].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={
                    recommendation === option
                      ? "recommendation-button recommendation-button-active"
                      : "recommendation-button"
                  }
                  onClick={() => setRecommendation(option)}
                >
                  {option === "HIRE"
                    ? "Hire"
                    : option === "MAYBE"
                      ? "Maybe"
                      : "Reject"}
                </button>
              ))}
            </div>
          </section>

          <div className="assessment-save-message" aria-live="polite">
            {saveMessage}
          </div>

          <div className="assessment-actions">
            <button
              type="button"
              className="save-assessment-button"
              onClick={handleManualSave}
            >
              Save progress
            </button>

            <button
              type="button"
              className="end-interview-button"
              onClick={handleEndInterview}
            >
              End interview
            </button>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default EmployerLiveInterviewPage;
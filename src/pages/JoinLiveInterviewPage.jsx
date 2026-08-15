import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/JoinLiveInterviewPage.css";

function JoinLiveInterviewPage() {
  const navigate = useNavigate();

  const [participantName, setParticipantName] = useState("");
  const [error, setError] = useState("");

  const interview = {
    position: "Java Developer",
    company: "Covira Technologies",
    interviewType: "Live Video Interview",
    interviewer: "Hiring Manager",
    date: "5 August 2026",
    time: "10:00 AM",
    duration: "45 minutes",
    roomName: "covira-java-developer-interview-001",
  };

  const handleJoinInterview = (event) => {
    event.preventDefault();

    const cleanName = participantName.trim();

    if (!cleanName) {
      setError("Please enter your full name.");
      return;
    }

    const interviewData = {
      participantName: cleanName,
      participantRole: "CANDIDATE",
      position: interview.position,
      company: interview.company,
      interviewer: interview.interviewer,
      roomName: interview.roomName,
    };

    sessionStorage.setItem(
      "coviraLiveInterview",
      JSON.stringify(interviewData)
    );

    navigate(`/live-interview/${interview.roomName}`, {
      state: interviewData,
    });
  };

  return (
    <main className="join-interview-page">
      <section className="join-interview-card">
        <div className="join-interview-brand">
          <span className="join-interview-badge">
            COVIRA LIVE
          </span>

          <h1>Join your live interview</h1>

          <p>
            Confirm your interview details and enter your full name
            before joining the meeting.
          </p>
        </div>

        <div className="join-interview-content">
          <section className="interview-information">
            <div className="interview-title-block">
              <div className="interview-position-icon">
                JD
              </div>

              <div>
                <span>Position</span>
                <h2>{interview.position}</h2>
                <p>{interview.company}</p>
              </div>
            </div>

            <div className="interview-information-grid">
              <article>
                <span>Interview type</span>
                <strong>{interview.interviewType}</strong>
              </article>

              <article>
                <span>Interviewer</span>
                <strong>{interview.interviewer}</strong>
              </article>

              <article>
                <span>Date</span>
                <strong>{interview.date}</strong>
              </article>

              <article>
                <span>Time</span>
                <strong>{interview.time}</strong>
              </article>

              <article>
                <span>Duration</span>
                <strong>{interview.duration}</strong>
              </article>

              <article>
                <span>Status</span>
                <strong className="scheduled-status">
                  Scheduled
                </strong>
              </article>
            </div>

            <div className="interview-reminder">
              <strong>Before joining</strong>

              <p>
                Make sure your camera, microphone and internet
                connection are working correctly.
              </p>
            </div>
          </section>

          <form
            className="join-interview-form"
            onSubmit={handleJoinInterview}
          >
            <h2>Enter the interview room</h2>

            <p>
              Your name will be shown to the interviewer when you
              join.
            </p>

            <label htmlFor="participantName">
              Full name
            </label>

            <input
              id="participantName"
              type="text"
              value={participantName}
              onChange={(event) => {
                setParticipantName(event.target.value);
                setError("");
              }}
              placeholder="Example: Senzo Khumalo"
              autoComplete="name"
            />

            {error && (
              <p className="join-form-error">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="join-interview-button"
            >
              Join Java Developer Interview
            </button>

            <button
              type="button"
              className="return-dashboard-button"
              onClick={() => navigate("/dashboard")}
            >
              Return to dashboard
            </button>

            <div className="privacy-message">
              By joining, your browser will request permission to
              access your camera and microphone.
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

export default JoinLiveInterviewPage;
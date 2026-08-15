import { useMemo } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { JitsiMeeting } from "@jitsi/react-sdk";
import "../styles/LiveInterviewPage.css";

function LiveInterviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomName } = useParams();

  const storedInterviewData = useMemo(() => {
    try {
      const savedData = sessionStorage.getItem(
        "coviraLiveInterview"
      );

      return savedData ? JSON.parse(savedData) : {};
    } catch (error) {
      console.error(
        "Unable to read interview information:",
        error
      );

      return {};
    }
  }, []);

  const interviewData = {
    ...storedInterviewData,
    ...(location.state || {}),
  };

  const participantName =
    interviewData.participantName || "Covira Participant";

  const participantRole =
    interviewData.participantRole || "CANDIDATE";

  const position =
    interviewData.position || "Java Developer";

  const company =
    interviewData.company || "Covira Technologies";

  const interviewer =
    interviewData.interviewer || "Hiring Manager";

  const safeRoomName =
    roomName ||
    interviewData.roomName ||
    "covira-java-developer-interview-001";

  const roleLabel =
    participantRole === "EMPLOYER"
      ? "Interviewer"
      : "Candidate";

  const handleLeaveInterview = () => {
    navigate("/join-live-interview");
  };

  return (
    <main className="live-interview-page">
      <header className="live-interview-header">
        <div className="live-interview-heading">
          <span className="live-interview-badge">
            COVIRA LIVE
          </span>

          <h1>{position} Interview</h1>

          <p>
            {company} · {roleLabel}: {participantName}
          </p>
        </div>

        <button
          type="button"
          className="leave-interview-header-button"
          onClick={handleLeaveInterview}
        >
          Leave Interview
        </button>
      </header>

      <section className="live-interview-details">
        <article>
          <span>Position</span>
          <strong>{position}</strong>
        </article>

        <article>
          <span>Company</span>
          <strong>{company}</strong>
        </article>

        <article>
          <span>{roleLabel}</span>
          <strong>{participantName}</strong>
        </article>

        <article>
          <span>Interviewer</span>
          <strong>{interviewer}</strong>
        </article>
      </section>

      <section className="live-meeting-wrapper">
        <JitsiMeeting
          domain="meet.jit.si"
          roomName={safeRoomName}
          userInfo={{
            displayName: participantName,
            email: "",
          }}
          configOverwrite={{
            subject: `${position} Interview`,
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinPageEnabled: true,
            disableDeepLinking: true,
            enableWelcomePage: false,
            enableClosePage: false,
            requireDisplayName: false,
            disableThirdPartyRequests: true,
          }}
          interfaceConfigOverwrite={{
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
            MOBILE_APP_PROMO: false,
            SHOW_PROMOTIONAL_CLOSE_PAGE: false,
            DEFAULT_BACKGROUND: "#111827",
          }}
          getIFrameRef={(iframeRef) => {
            iframeRef.style.width = "100%";
            iframeRef.style.height = "720px";
            iframeRef.style.border = "none";
          }}
          onApiReady={(externalApi) => {
            externalApi.executeCommand(
              "displayName",
              participantName
            );

            externalApi.executeCommand(
              "subject",
              `${position} Interview`
            );
          }}
          onReadyToClose={handleLeaveInterview}
        />
      </section>

      <footer className="live-interview-footer">
        <div>
          <strong>Interview room</strong>
          <span>{safeRoomName}</span>
        </div>

        <p>
          Use the meeting controls to manage your camera,
          microphone, screen sharing and chat.
        </p>
      </footer>
    </main>
  );
}

export default LiveInterviewPage;
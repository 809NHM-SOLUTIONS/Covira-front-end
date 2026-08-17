import "../styles/CandidateDetailsPage.css";

import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import {
  HiOutlineArrowLeft,
  HiOutlineEnvelope,
  HiOutlineBriefcase,
  HiOutlineVideoCamera,
  HiOutlineMapPin,
  HiOutlineCalendarDays,
  HiOutlinePlayCircle,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineDocumentText,
} from "react-icons/hi2";

const API_BASE_URL = "http://localhost:8080";

function CandidateDetailsPage() {
  const { id } = useParams();

  const [candidate, setCandidate] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [videoErrors, setVideoErrors] = useState({});

  /*
   * =========================================================
   * LOAD CANDIDATE
   * =========================================================
   */

  useEffect(() => {
    let cancelled = false;

    const fetchCandidate = async () => {
      try {
        setLoading(true);
        setError("");

        if (!id) {
          throw new Error("Candidate ID is missing.");
        }

        const response = await fetch(
          `${API_BASE_URL}/api/candidates/${id}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const responseText = await response.text();

        let data = null;

        try {
          data = responseText
            ? JSON.parse(responseText)
            : null;
        } catch {
          data = responseText;
        }

        if (response.status === 401) {
          throw new Error(
            "You are not logged in. Please log in again."
          );
        }

        if (response.status === 403) {
          throw new Error(
            "You do not have permission to view this candidate."
          );
        }

        if (response.status === 404) {
          throw new Error(
            "The candidate you are looking for does not exist."
          );
        }

        if (!response.ok) {
          throw new Error(
            typeof data === "string" && data.trim()
              ? data
              : "Failed to load candidate."
          );
        }

        if (!data || typeof data !== "object") {
          throw new Error(
            "The server returned an invalid candidate response."
          );
        }

        if (!cancelled) {
          console.log(
            "Candidate details loaded:",
            data
          );

          console.log(
            "Candidate responses:",
            data.responses
          );

          setCandidate(data);
        }
      } catch (err) {
        console.error(
          "Error loading candidate:",
          err
        );

        if (!cancelled) {
          setError(
            err?.message ||
              "Unable to load candidate."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchCandidate();

    return () => {
      cancelled = true;
    };
  }, [id]);

  /*
   * =========================================================
   * NORMALIZE RESPONSES
   * =========================================================
   *
   * Different backend versions may return:
   *
   * responses
   * answerResponses
   * interviewResponses
   *
   * We safely handle the common variations.
   * =========================================================
   */

  const responses = useMemo(() => {
    if (!candidate) {
      return [];
    }

    if (Array.isArray(candidate.responses)) {
      return candidate.responses;
    }

    if (Array.isArray(candidate.answerResponses)) {
      return candidate.answerResponses;
    }

    if (Array.isArray(candidate.interviewResponses)) {
      return candidate.interviewResponses;
    }

    return [];
  }, [candidate]);

  /*
   * =========================================================
   * DETERMINE QUESTION TYPE
   * =========================================================
   */

  const getQuestionType = (response) => {
    if (!response) {
      return "";
    }

    const possibleTypes = [
      response.questionType,
      response.answerType,
      response.type,
      response.answerMode,
      response.mode,
      response.question?.questionType,
      response.question?.answerType,
      response.question?.type,
    ];

    const type = possibleTypes.find(
      (value) =>
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
    );

    return String(type || "")
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_");
  };

  /*
   * =========================================================
   * DETERMINE VIDEO RESPONSE
   * =========================================================
   */

  const isVideoResponse = (response) => {
    const type = getQuestionType(response);

    /*
     * Explicit video types.
     */

    if (
      type === "VIDEO" ||
      type === "VIDEO_RESPONSE" ||
      type === "VIDEO_ANSWER"
    ) {
      return true;
    }

    /*
     * If the backend supplied a video URL,
     * we can safely treat the response as video.
     */

    if (
      response?.videoUrl ||
      response?.videoURL ||
      response?.videoPath ||
      response?.fileUrl ||
      response?.fileURL ||
      response?.mediaUrl ||
      response?.mediaURL
    ) {
      return true;
    }

    /*
     * Some backend responses may store the
     * answer mode in lowercase/other fields.
     */

    const answer = String(
      response?.answer || ""
    ).toLowerCase();

    if (
      answer.includes("video response") ||
      answer.includes("video recorded")
    ) {
      return true;
    }

    return false;
  };

  /*
   * =========================================================
   * GET VIDEO URL FROM RESPONSE
   * =========================================================
   */

  const getRawVideoUrl = (response) => {
    if (!response) {
      return "";
    }

    const possibleUrls = [
      response.videoUrl,
      response.videoURL,
      response.videoPath,
      response.videoFile,
      response.videoFileUrl,
      response.fileUrl,
      response.fileURL,
      response.mediaUrl,
      response.mediaURL,
      response.video,
      response.url,
    ];

    const value = possibleUrls.find(
      (url) =>
        url !== null &&
        url !== undefined &&
        String(url).trim() !== ""
    );

    return value ? String(value).trim() : "";
  };

  /*
   * =========================================================
   * BUILD FULL VIDEO URL
   * =========================================================
   *
   * Handles:
   *
   * /uploads/video.webm
   *
   * uploads/video.webm
   *
   * http://localhost:8080/uploads/video.webm
   *
   * https://example.com/video.webm
   *
   * =========================================================
   */

  const getVideoUrl = (videoUrl) => {
    if (!videoUrl) {
      return "";
    }

    let value = String(videoUrl).trim();

    if (!value) {
      return "";
    }

    /*
     * Remove accidental quotes returned by
     * some JSON/database implementations.
     */

    value = value.replace(/^["']|["']$/g, "");

    /*
     * Already a complete URL.
     */

    if (
      value.startsWith("http://") ||
      value.startsWith("https://")
    ) {
      return value;
    }

    /*
     * Handle localhost URLs that may have been
     * returned without the protocol.
     */

    if (value.startsWith("//")) {
      return `http:${value}`;
    }

    /*
     * Absolute backend path.
     */

    if (value.startsWith("/")) {
      return `${API_BASE_URL}${value}`;
    }

    /*
     * Relative backend path.
     */

    return `${API_BASE_URL}/${value}`;
  };

  /*
   * =========================================================
   * VIDEO MIME TYPE
   * =========================================================
   *
   * The recorder currently creates WebM.
   *
   * We use the extension to give the browser
   * the correct MIME type where possible.
   * =========================================================
   */

  const getVideoMimeType = (videoUrl) => {
    const value = String(
      videoUrl || ""
    ).toLowerCase();

    if (value.includes(".mp4")) {
      return "video/mp4";
    }

    if (value.includes(".webm")) {
      return "video/webm";
    }

    if (value.includes(".ogg")) {
      return "video/ogg";
    }

    if (value.includes(".ogv")) {
      return "video/ogg";
    }

    if (value.includes(".mov")) {
      return "video/quicktime";
    }

    return "";
  };

  /*
   * =========================================================
   * VIDEO ERROR HANDLER
   * =========================================================
   */

  const handleVideoError = (
    responseKey,
    event
  ) => {
    console.error(
      "Video playback failed:",
      {
        responseKey,
        videoElement: event?.currentTarget,
        source:
          event?.currentTarget?.currentSrc,
      }
    );

    setVideoErrors((previous) => ({
      ...previous,
      [responseKey]: true,
    }));
  };

  /*
   * =========================================================
   * VIDEO LOADED
   * =========================================================
   */

  const handleVideoLoaded = (
    responseKey
  ) => {
    console.log(
      `Video loaded successfully for response ${responseKey}`
    );

    setVideoErrors((previous) => {
      if (!previous[responseKey]) {
        return previous;
      }

      const updated = {
        ...previous,
      };

      delete updated[responseKey];

      return updated;
    });
  };

  /*
   * =========================================================
   * FORMAT DATE
   * =========================================================
   */

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    try {
      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return String(value);
      }

      return date.toLocaleDateString(
        "en-ZA",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return String(value);
    }
  };

  /*
   * =========================================================
   * STATUS CLASS
   * =========================================================
   */

  const getStatusClass = (status) => {
    return String(status || "unknown")
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading) {
    return (
      <section className="module-page candidate-details-page">
        <div className="candidate-loading">
          <div className="loading-spinner" />

          <p>
            Loading candidate...
          </p>
        </div>
      </section>
    );
  }

  /*
   * =========================================================
   * ERROR
   * =========================================================
   */

  if (error || !candidate) {
    return (
      <section className="module-page candidate-details-page">
        <div className="candidate-not-found">
          <div className="candidate-error-icon">
            <HiOutlineExclamationCircle />
          </div>

          <h1>
            Candidate Not Found
          </h1>

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

  /*
   * =========================================================
   * CANDIDATE DATA
   * =========================================================
   */

  const initial =
    candidate.name
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() || "?";

  const status =
    candidate.status || "Unknown";

  /*
   * =========================================================
   * INTERVIEW SUBMITTED?
   * =========================================================
   */

  const hasResponses =
    responses.length > 0;

  const isPending =
    String(status).toLowerCase() ===
      "pending" &&
    !hasResponses;

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <section className="candidate-details-page">

      {/* =====================================================
          BACK BUTTON
      ===================================================== */}

      <Link
        to="/dashboard/candidates"
        className="back-candidates-link"
      >
        <HiOutlineArrowLeft />

        Back to Candidates
      </Link>

      {/* =====================================================
          CANDIDATE HEADER
      ===================================================== */}

      <div className="candidate-profile-card">

        <div className="candidate-profile-info">

          <div className="candidate-large-avatar">
            {initial}
          </div>

          <div className="candidate-profile-text">

            <h1>
              {candidate.name ||
                "Unnamed Candidate"}
            </h1>

            <p>
              Candidate for{" "}
              {candidate.position ||
                candidate.jobTitle ||
                "-"}
            </p>

            {candidate.email && (
              <span>
                {candidate.email}
              </span>
            )}

          </div>

        </div>

        <span
          className={`status-badge status-${getStatusClass(
            status
          )}`}
        >
          {status}
        </span>

      </div>

      {/* =====================================================
          CANDIDATE INFORMATION
      ===================================================== */}

      <div className="candidate-information-card">

        <div className="candidate-section-heading">

          <h2>
            Candidate Information
          </h2>

          <p>
            Personal and interview information
            for this candidate.
          </p>

        </div>

        <div className="candidate-info-grid">

          <InfoItem
            icon={
              <HiOutlineEnvelope />
            }
            label="Email"
            value={
              candidate.email || "-"
            }
          />

          <InfoItem
            icon={
              <HiOutlineBriefcase />
            }
            label="Position"
            value={
              candidate.position ||
              candidate.jobTitle ||
              "-"
            }
          />

          <InfoItem
            icon={
              <HiOutlineVideoCamera />
            }
            label="Interview"
            value={
              candidate.interview ||
              candidate.interviewTitle ||
              candidate.interviewName ||
              "-"
            }
          />

          <InfoItem
            icon={
              <HiOutlineBriefcase />
            }
            label="Department"
            value={
              candidate.department ||
              "-"
            }
          />

          <InfoItem
            icon={
              <HiOutlineMapPin />
            }
            label="Location"
            value={
              candidate.location ||
              "-"
            }
          />

          <InfoItem
            icon={
              <HiOutlineCalendarDays />
            }
            label="Submitted"
            value={
              formatDate(
                candidate.submittedAt ||
                  candidate.completedAt ||
                  candidate.createdAt
              )
            }
          />

        </div>

      </div>

      {/* =====================================================
          INTERVIEW SUBMISSION
      ===================================================== */}

      <div className="interview-submission-card">

        <div className="candidate-section-heading">

          <h2>
            Interview Submission
          </h2>

          <p>
            Review the candidate's submitted
            interview responses.
          </p>

        </div>

        {/* ===================================================
            EMPTY SUBMISSION
        =================================================== */}

        {isPending ? (

          <div className="submission-empty">

            <div className="submission-empty-icon">
              <HiOutlineVideoCamera />
            </div>

            <h3>
              Interview not submitted
            </h3>

            <p>
              This candidate has not completed
              the interview yet. Their responses
              will appear here after submission.
            </p>

          </div>

        ) : !hasResponses ? (

          <div className="submission-empty">

            <div className="submission-empty-icon">
              <HiOutlineDocumentText />
            </div>

            <h3>
              No responses available
            </h3>

            <p>
              The candidate has no interview
              responses available to review.
            </p>

          </div>

        ) : (

          <div className="submission-list">

            {responses.map(
              (response, index) => {

                /*
                 * =================================================
                 * RESPONSE KEY
                 * =================================================
                 */

                const responseKey =
                  response.id ||
                  response.responseId ||
                  `response-${index}`;

                /*
                 * =================================================
                 * QUESTION NUMBER
                 * =================================================
                 */

                const questionNumber =
                  response.questionNumber ||
                  response.question?.questionNumber ||
                  index + 1;

                /*
                 * =================================================
                 * QUESTION TEXT
                 * =================================================
                 */

                const questionText =
                  response.questionText ||
                  response.question ||
                  response.question?.questionText ||
                  response.question?.text ||
                  "Question unavailable";

                /*
                 * =================================================
                 * QUESTION TYPE
                 * =================================================
                 */

                const questionType =
                  getQuestionType(
                    response
                  );

                const videoQuestion =
                  isVideoResponse(
                    response
                  );

                /*
                 * =================================================
                 * VIDEO URL
                 * =================================================
                 */

                const rawVideoUrl =
                  getRawVideoUrl(
                    response
                  );

                const videoUrl =
                  getVideoUrl(
                    rawVideoUrl
                  );

                const videoMimeType =
                  getVideoMimeType(
                    rawVideoUrl
                  );

                const videoHasError =
                  Boolean(
                    videoErrors[
                      responseKey
                    ]
                  );

                /*
                 * =================================================
                 * ANSWER
                 * =================================================
                 */

                const answer =
                  response.answer ??
                  response.textAnswer ??
                  response.selectedAnswer ??
                  "";

                return (
                  <div
                    className="submission-item"
                    key={responseKey}
                  >

                    {/* =========================================
                        QUESTION
                    ========================================= */}

                    <div className="submission-question">

                      <span>
                        Question{" "}
                        {questionNumber}
                      </span>

                      <h3>
                        {questionText}
                      </h3>

                      {questionType && (
                        <small>
                          {questionType
                            .replace(
                              /_/g,
                              " "
                            )
                            .toLowerCase()
                            .replace(
                              /\b\w/g,
                              (letter) =>
                                letter.toUpperCase()
                            )}
                        </small>
                      )}

                    </div>

                    {/* =========================================
                        VIDEO RESPONSE
                    ========================================= */}

                    {videoQuestion ? (

                      <div className="candidate-answer video-answer">

                        <div className="answer-header">

                          <div>
                            <strong>
                              Video Response
                            </strong>

                            <span>
                              Candidate recorded
                              video answer
                            </span>
                          </div>

                          {videoUrl &&
                            !videoHasError && (
                              <HiOutlineCheckCircle />
                            )}

                        </div>

                        {/* =====================================
                            VIDEO AVAILABLE
                        ===================================== */}

                        {videoUrl &&
                        !videoHasError ? (

                          <div className="candidate-video-container">

                            <video
                              className="candidate-video"
                              controls
                              playsInline
                              preload="metadata"
                              src={
                                videoUrl
                              }
                              onLoadedData={() =>
                                handleVideoLoaded(
                                  responseKey
                                )
                              }
                              onError={(
                                event
                              ) =>
                                handleVideoError(
                                  responseKey,
                                  event
                                )
                              }
                            >
                              {videoMimeType && (
                                <source
                                  src={
                                    videoUrl
                                  }
                                  type={
                                    videoMimeType
                                  }
                                />
                              )}

                              Your browser does not
                              support video playback.
                            </video>

                            <div className="candidate-video-url">
                              <span>
                                Video file
                              </span>

                              <strong>
                                {rawVideoUrl}
                              </strong>
                            </div>

                          </div>

                        ) : (

                          /* ===================================
                             VIDEO NOT AVAILABLE
                             =================================== */

                          <div className="video-placeholder">

                            <div className="video-placeholder-icon">
                              {videoHasError ? (
                                <HiOutlineExclamationCircle />
                              ) : (
                                <HiOutlinePlayCircle />
                              )}
                            </div>

                            <div className="video-placeholder-content">

                              <strong>
                                {videoHasError
                                  ? "Video Could Not Be Played"
                                  : "Video Not Available"}
                              </strong>

                              <p>
                                {videoHasError
                                  ? "The video file was found, but the browser could not play it. Check that the uploaded file is a valid WebM or MP4 video."
                                  : "The candidate submitted a video response, but no video file URL was returned by the server."}
                              </p>

                              {rawVideoUrl && (
                                <small>
                                  Video path:{" "}
                                  {rawVideoUrl}
                                </small>
                              )}

                            </div>

                          </div>
                        )}

                      </div>

                    ) : (

                      /* =========================================
                         NON-VIDEO RESPONSE
                      ========================================= */

                      <div className="candidate-answer">

                        <div className="answer-header">

                          <strong>
                            Candidate Answer
                          </strong>

                        </div>

                        {answer ? (

                          <p>
                            {answer}
                          </p>

                        ) : (

                          <p className="empty-answer">
                            No written answer
                            submitted.
                          </p>

                        )}

                      </div>
                    )}

                  </div>
                );
              }
            )}

          </div>
        )}

      </div>

    </section>
  );
}

/*
 * =========================================================
 * INFORMATION ITEM
 * =========================================================
 */

function InfoItem({
  icon,
  label,
  value,
}) {
  return (
    <div className="candidate-info-item">

      <div className="candidate-info-icon">
        {icon}
      </div>

      <div>

        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

      </div>

    </div>
  );
}

export default CandidateDetailsPage;
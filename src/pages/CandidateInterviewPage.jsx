import "../styles/CandidateInterviewPage.css";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import {
  HiOutlineVideoCamera,
  HiOutlineMicrophone,
  HiOutlineStop,
  HiOutlineCheckCircle,
  HiOutlineArrowRight,
  HiOutlineArrowLeft,
  HiOutlineExclamationCircle,
} from "react-icons/hi2";

const API_BASE_URL = "http://localhost:8080";

function CandidateInterviewPage() {
  const { token } = useParams();

  /*
   * ============================================================
   * INTERVIEW
   * ============================================================
   */

  const [interview, setInterview] = useState(null);
  const [questions, setQuestions] = useState([]);

  /*
   * ============================================================
   * CANDIDATE REGISTRATION
   * ============================================================
   */

  const [candidateId, setCandidateId] = useState(null);

  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");

  const [candidateRegistered, setCandidateRegistered] =
    useState(false);

  const [registeringCandidate, setRegisteringCandidate] =
    useState(false);

  /*
   * ============================================================
   * INTERVIEW STATE
   * ============================================================
   */

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cameraReady, setCameraReady] = useState(false);
  const [recording, setRecording] = useState(false);

  const [recordings, setRecordings] = useState({});

  const [textAnswers, setTextAnswers] = useState({});
  const [selectedAnswers, setSelectedAnswers] = useState({});

  const [mediaError, setMediaError] = useState("");

  const [timeRemaining, setTimeRemaining] = useState(null);

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /*
   * ============================================================
   * REFS
   * ============================================================
   */

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  /*
   * ============================================================
   * LOAD INTERVIEW + QUESTIONS
   * ============================================================
   */

  useEffect(() => {
    const loadInterview = async () => {
      try {
        setLoading(true);
        setError("");

        /*
         * Load interview
         */

        const interviewResponse = await fetch(
          `${API_BASE_URL}/api/interviews/public/${token}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!interviewResponse.ok) {
          if (interviewResponse.status === 404) {
            throw new Error(
              "This interview link is invalid or no longer available."
            );
          }

          throw new Error("Failed to load interview.");
        }

        const interviewData =
          await interviewResponse.json();

        setInterview(interviewData);

        /*
         * Load questions
         */

        const questionsResponse = await fetch(
          `${API_BASE_URL}/api/interviews/public/${token}/questions`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!questionsResponse.ok) {
          throw new Error(
            "Interview loaded, but the interview questions could not be loaded."
          );
        }

        const questionsData =
          await questionsResponse.json();

        setQuestions(
          Array.isArray(questionsData)
            ? questionsData
            : []
        );
      } catch (err) {
        console.error(
          "Error loading candidate interview:",
          err
        );

        setError(
          err.message ||
            "Unable to load interview."
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadInterview();
    }
  }, [token]);

  /*
   * ============================================================
   * CURRENT QUESTION
   * ============================================================
   */

  const question = questions[currentQuestion];

  /*
   * ============================================================
   * REGISTER CANDIDATE
   * ============================================================
   */

  const registerCandidate = async (event) => {
    event.preventDefault();

    if (!candidateName.trim()) {
      setMediaError("Please enter your full name.");
      return;
    }

    if (!candidateEmail.trim()) {
      setMediaError("Please enter your email address.");
      return;
    }

    try {
      setRegisteringCandidate(true);
      setMediaError("");

      const response = await fetch(
        `${API_BASE_URL}/api/candidates/public`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            interviewToken: token,
            name: candidateName.trim(),
            email: candidateEmail.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : "Failed to register candidate."
        );
      }

      /*
       * Save candidate information returned
       * by Spring Boot.
       */

      setCandidateId(data.id);
      setCandidateName(data.name || candidateName);
      setCandidateEmail(data.email || candidateEmail);

      setCandidateRegistered(true);

      setMediaError("");
    } catch (err) {
      console.error(
        "Candidate registration error:",
        err
      );

      setMediaError(
        err.message ||
          "Unable to register candidate."
      );
    } finally {
      setRegisteringCandidate(false);
    }
  };

  /*
   * ============================================================
   * TIMER
   * ============================================================
   */

  useEffect(() => {
    if (!question) {
      setTimeRemaining(null);
      return;
    }

    if (!question.timeLimit) {
      setTimeRemaining(null);
      return;
    }

    setTimeRemaining(question.timeLimit);

    const timer = setInterval(() => {
      setTimeRemaining((previous) => {
        if (previous === null) {
          return null;
        }

        if (previous <= 1) {
          clearInterval(timer);

          if (recording) {
            stopRecording();
          }

          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [currentQuestion, question]);

  /*
   * ============================================================
   * CAMERA
   * ============================================================
   */

  const startCamera = async () => {
    try {
      setMediaError("");

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        throw new Error(
          "Your browser does not support camera access."
        );
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraReady(true);
    } catch (err) {
      console.error("Camera error:", err);

      setMediaError(
        "Camera and microphone access is required. Please allow access in your browser."
      );
    }
  };

  /*
   * ============================================================
   * START RECORDING
   * ============================================================
   */

  const startRecording = () => {
    if (!streamRef.current) {
      setMediaError(
        "Please enable your camera before starting the recording."
      );

      return;
    }

    try {
      setMediaError("");

      chunksRef.current = [];

      let mimeType = "video/webm";

      if (
        MediaRecorder.isTypeSupported(
          "video/webm;codecs=vp9"
        )
      ) {
        mimeType =
          "video/webm;codecs=vp9";
      } else if (
        MediaRecorder.isTypeSupported(
          "video/webm;codecs=vp8"
        )
      ) {
        mimeType =
          "video/webm;codecs=vp8";
      }

      const recorder =
        new MediaRecorder(
          streamRef.current,
          {
            mimeType,
          }
        );

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(
          chunksRef.current,
          {
            type: mimeType,
          }
        );

        const videoUrl =
          URL.createObjectURL(blob);

        setRecordings((previous) => ({
          ...previous,

          [currentQuestion]: {
            blob,
            videoUrl,
          },
        }));
      };

      recorder.start();

      setRecording(true);
    } catch (err) {
      console.error(
        "Recording error:",
        err
      );

      setMediaError(
        "Unable to start video recording."
      );
    }
  };

  /*
   * ============================================================
   * STOP RECORDING
   * ============================================================
   */

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !==
        "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    setRecording(false);
  };

  /*
   * ============================================================
   * CLEANUP CAMERA
   * ============================================================
   */

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );
      }

      Object.values(recordings).forEach(
        (recordingItem) => {
          if (recordingItem?.videoUrl) {
            URL.revokeObjectURL(
              recordingItem.videoUrl
            );
          }
        }
      );
    };
  }, []);

  /*
   * ============================================================
   * TEXT ANSWER
   * ============================================================
   */

  const handleTextAnswer = (event) => {
    setTextAnswers((previous) => ({
      ...previous,

      [currentQuestion]:
        event.target.value,
    }));
  };

  /*
   * ============================================================
   * MULTIPLE CHOICE
   * ============================================================
   */

  const handleMultipleChoice = (event) => {
    setSelectedAnswers((previous) => ({
      ...previous,

      [currentQuestion]:
        event.target.value,
    }));
  };

  /*
   * ============================================================
   * CHECK ANSWER
   * ============================================================
   */

  const hasAnswer = () => {
    if (!question) {
      return false;
    }

    const type =
      question.questionType?.toLowerCase();

    if (type === "video") {
      return Boolean(
        recordings[currentQuestion]
      );
    }

    if (type === "text") {
      return Boolean(
        textAnswers[currentQuestion]?.trim()
      );
    }

    if (
      type === "multiple choice"
    ) {
      return Boolean(
        selectedAnswers[currentQuestion]
      );
    }

    return true;
  };

  /*
   * ============================================================
   * NEXT QUESTION
   * ============================================================
   */

  const nextQuestion = () => {
    if (recording) {
      stopRecording();
      return;
    }

    if (
      question?.required &&
      !hasAnswer()
    ) {
      setMediaError(
        "Please answer this required question before continuing."
      );

      return;
    }

    setMediaError("");

    if (
      currentQuestion <
      questions.length - 1
    ) {
      setCurrentQuestion(
        (previous) =>
          previous + 1
      );
    }
  };

  /*
   * ============================================================
   * PREVIOUS QUESTION
   * ============================================================
   */

  const previousQuestion = () => {
    if (recording) {
      stopRecording();
      return;
    }

    setMediaError("");

    if (currentQuestion > 0) {
      setCurrentQuestion(
        (previous) =>
          previous - 1
      );
    }
  };

  /*
   * ============================================================
   * SUBMIT INTERVIEW
   * ============================================================
   */

  const submitInterview = async () => {
    if (recording) {
      stopRecording();
      return;
    }

    if (!candidateId) {
      setMediaError(
        "Candidate registration is incomplete."
      );

      return;
    }

    if (
      question?.required &&
      !hasAnswer()
    ) {
      setMediaError(
        "Please answer the final required question before submitting."
      );

      return;
    }

    try {
      setSubmitting(true);
      setMediaError("");

      /*
       * Build answers object.
       *
       * The backend currently accepts:
       *
       * {
       *   answers: {
       *      "0": "...",
       *      "1": "...",
       *      "2": "..."
       *   }
       * }
       *
       * Video recordings are currently converted
       * to a placeholder value because the current
       * CandidateResponse entity only stores videoUrl.
       *
       * Actual video upload will be added separately.
       */

      const answers = {};

      questions.forEach((_, index) => {
        const questionForIndex =
          questions[index];

        const type =
          questionForIndex?.questionType?.toLowerCase();

        if (type === "video") {
          const recordingItem =
            recordings[index];

          if (recordingItem) {
            answers[index] =
              "Video response recorded";
          } else {
            answers[index] = "";
          }
        } else if (type === "text") {
          answers[index] =
            textAnswers[index] || "";
        } else if (
          type === "multiple choice"
        ) {
          answers[index] =
            selectedAnswers[index] || "";
        } else {
          answers[index] = "";
        }
      });

      const response = await fetch(
        `${API_BASE_URL}/api/candidates/${candidateId}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            answers,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : "Failed to submit interview."
        );
      }

      console.log(
        "Interview submitted:",
        data
      );

      setSubmitted(true);
    } catch (err) {
      console.error(
        "Interview submission error:",
        err
      );

      setMediaError(
        err.message ||
          "Failed to submit interview."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * ============================================================
   * FORMAT TIME
   * ============================================================
   */

  const formatTime = (seconds) => {
    if (seconds === null) {
      return "";
    }

    const minutes = Math.floor(
      seconds / 60
    );

    const remainingSeconds =
      seconds % 60;

    return `${minutes}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <main className="candidate-interview-page">
        <div className="candidate-interview-loading">
          <div className="loading-spinner"></div>

          <h2>
            Loading Interview
          </h2>

          <p>
            Please wait while we prepare
            your interview.
          </p>
        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * ERROR
   * ============================================================
   */

  if (error) {
    return (
      <main className="candidate-interview-page">
        <div className="candidate-interview-error">
          <HiOutlineExclamationCircle />

          <h1>
            Unable to Load Interview
          </h1>

          <p>{error}</p>
        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * NO QUESTIONS
   * ============================================================
   */

  if (!questions.length) {
    return (
      <main className="candidate-interview-page">
        <div className="candidate-interview-error">
          <HiOutlineExclamationCircle />

          <h1>
            No Questions Available
          </h1>

          <p>
            This interview does not have
            any questions yet.
          </p>
        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * SUBMITTED
   * ============================================================
   */

  if (submitted) {
    return (
      <main className="candidate-interview-page">
        <div className="candidate-interview-error">
          <HiOutlineCheckCircle />

          <h1>
            Interview Submitted
          </h1>

          <p>
            Thank you for completing your
            interview,{" "}
            <strong>
              {candidateName}
            </strong>
            .
          </p>

          <p>
            Your responses have been
            successfully recorded.
          </p>
        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * CANDIDATE REGISTRATION SCREEN
   * ============================================================
   */

  if (!candidateRegistered) {
    return (
      <main className="candidate-interview-page">

        <header className="candidate-interview-header">

          <div className="candidate-interview-brand">

            <h1>Covira</h1>

            <span>
              Candidate Interview
            </span>

          </div>

        </header>

        <section className="candidate-interview-intro">

          <h1>
            {interview?.title ||
              "Interview"}
          </h1>

          {interview?.position && (
            <p>
              {interview.position}
            </p>
          )}

          {interview?.description && (
            <span>
              {interview.description}
            </span>
          )}

        </section>

        <section className="candidate-interview-content">

          <div className="candidate-question-card">

            <span className="question-number">
              Candidate Registration
            </span>

            <h2>
              Before you begin
            </h2>

            <p>
              Please enter your details
              below to start your interview.
            </p>

          </div>

          <div className="candidate-recording-card">

            <div className="recording-header">

              <div>

                <h2>
                  Your Details
                </h2>

                <p>
                  Your information will be
                  associated with this interview.
                </p>

              </div>

            </div>

            <form
              onSubmit={
                registerCandidate
              }
            >

              <div
                style={{
                  display: "grid",
                  gap: "16px",
                }}
              >

                <div>

                  <label
                    htmlFor="candidateName"
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                    }}
                  >
                    Full Name
                  </label>

                  <input
                    id="candidateName"
                    type="text"
                    value={
                      candidateName
                    }
                    onChange={(event) =>
                      setCandidateName(
                        event.target.value
                      )
                    }
                    placeholder="Enter your full name"
                    required
                    style={{
                      width: "100%",
                      padding: "14px",
                      borderRadius: "10px",
                      border:
                        "1px solid #dbe2ea",
                      fontSize: "15px",
                      boxSizing:
                        "border-box",
                    }}
                  />

                </div>

                <div>

                  <label
                    htmlFor="candidateEmail"
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                    }}
                  >
                    Email Address
                  </label>

                  <input
                    id="candidateEmail"
                    type="email"
                    value={
                      candidateEmail
                    }
                    onChange={(event) =>
                      setCandidateEmail(
                        event.target.value
                      )
                    }
                    placeholder="Enter your email address"
                    required
                    style={{
                      width: "100%",
                      padding: "14px",
                      borderRadius: "10px",
                      border:
                        "1px solid #dbe2ea",
                      fontSize: "15px",
                      boxSizing:
                        "border-box",
                    }}
                  />

                </div>

              </div>

              {mediaError && (

                <div
                  className="media-error"
                  style={{
                    marginTop: "16px",
                  }}
                >

                  <HiOutlineExclamationCircle />

                  {mediaError}

                </div>

              )}

              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  justifyContent:
                    "flex-end",
                }}
              >

                <button
                  type="submit"
                  className="next-question-button"
                  disabled={
                    registeringCandidate
                  }
                >

                  {registeringCandidate
                    ? "Registering..."
                    : "Start Interview"}

                  {!registeringCandidate && (
                    <HiOutlineArrowRight />
                  )}

                </button>

              </div>

            </form>

          </div>

        </section>

      </main>
    );
  }

  /*
   * ============================================================
   * QUESTION TYPE
   * ============================================================
   */

  const questionType =
    question?.questionType?.toLowerCase();

  const isVideo =
    questionType === "video";

  const isText =
    questionType === "text";

  const isMultipleChoice =
    questionType ===
    "multiple choice";

  /*
   * ============================================================
   * RENDER INTERVIEW
   * ============================================================
   */

  return (
    <main className="candidate-interview-page">

      {/* HEADER */}

      <header className="candidate-interview-header">

        <div className="candidate-interview-brand">

          <h1>Covira</h1>

          <span>
            Candidate Interview
          </span>

        </div>

        <div className="candidate-interview-progress">

          <span>
            Question{" "}
            {currentQuestion + 1} of{" "}
            {questions.length}
          </span>

          <div className="progress-bar">

            <div
              className="progress-bar-fill"
              style={{
                width: `${
                  ((currentQuestion + 1) /
                    questions.length) *
                  100
                }%`,
              }}
            />

          </div>

        </div>

      </header>

      {/* INTERVIEW INFORMATION */}

      <section className="candidate-interview-intro">

        <h1>
          {interview?.title ||
            "Interview"}
        </h1>

        {interview?.position && (
          <p>
            {interview.position}
          </p>
        )}

        {interview?.description && (
          <span>
            {interview.description}
          </span>
        )}

        <div
          style={{
            marginTop: "12px",
            fontSize: "14px",
          }}
        >
          Candidate:{" "}
          <strong>
            {candidateName}
          </strong>
        </div>

      </section>

      {/* MAIN INTERVIEW */}

      <section className="candidate-interview-content">

        {/* QUESTION */}

        <div className="candidate-question-card">

          <span className="question-number">
            Question{" "}
            {currentQuestion + 1}
          </span>

          <h2>
            {question.questionText}
          </h2>

          {question.required && (
            <span className="required-question">
              Required
            </span>
          )}

          <div
            style={{
              marginTop: "12px",
              display: "flex",
              gap: "12px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >

            <span>
              Type:{" "}
              {question.questionType}
            </span>

            {question.timeLimit && (
              <span>
                Time:{" "}
                {formatTime(
                  question.timeLimit
                )}
              </span>
            )}

          </div>

        </div>

        {/* TIMER */}

        {timeRemaining !== null && (
          <div
            style={{
              marginBottom: "18px",
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            Time remaining:{" "}
            {formatTime(
              timeRemaining
            )}
          </div>
        )}

        {/* VIDEO QUESTION */}

        {isVideo && (

          <div className="candidate-recording-card">

            <div className="recording-header">

              <div>

                <h2>
                  Your Video Response
                </h2>

                <p>
                  Record your answer using
                  your camera and microphone.
                </p>

              </div>

              {recording && (
                <span className="recording-indicator">
                  Recording
                </span>
              )}

            </div>

            <div className="video-container">

              {recordings[
                currentQuestion
              ] && !recording ? (

                <video
                  controls
                  className="recorded-video"
                  src={
                    recordings[
                      currentQuestion
                    ].videoUrl
                  }
                />

              ) : (

                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="candidate-camera"
                />

              )}

              {!cameraReady &&
                !recordings[
                  currentQuestion
                ] && (

                  <div className="camera-overlay">

                    <HiOutlineVideoCamera />

                    <h3>
                      Camera not enabled
                    </h3>

                    <p>
                      Enable your camera and
                      microphone to continue.
                    </p>

                  </div>

                )}

            </div>

            {mediaError && (

              <div className="media-error">

                <HiOutlineExclamationCircle />

                {mediaError}

              </div>

            )}

            <div className="recording-controls">

              {!cameraReady && (

                <button
                  type="button"
                  className="camera-button"
                  onClick={startCamera}
                >
                  <HiOutlineVideoCamera />

                  Enable Camera

                </button>

              )}

              {cameraReady &&
                !recording &&
                !recordings[
                  currentQuestion
                ] && (

                  <button
                    type="button"
                    className="record-button"
                    onClick={
                      startRecording
                    }
                  >

                    <HiOutlineMicrophone />

                    Start Recording

                  </button>

                )}

              {recording && (

                <button
                  type="button"
                  className="stop-record-button"
                  onClick={
                    stopRecording
                  }
                >

                  <HiOutlineStop />

                  Stop Recording

                </button>

              )}

              {recordings[
                currentQuestion
              ] &&
                !recording && (

                  <button
                    type="button"
                    className="record-again-button"
                    onClick={() => {

                      const existing =
                        recordings[
                          currentQuestion
                        ];

                      if (
                        existing?.videoUrl
                      ) {
                        URL.revokeObjectURL(
                          existing.videoUrl
                        );
                      }

                      setRecordings(
                        (previous) => {

                          const updated = {
                            ...previous,
                          };

                          delete updated[
                            currentQuestion
                          ];

                          return updated;
                        }
                      );

                    }}
                  >

                    Record Again

                  </button>

                )}

            </div>

          </div>

        )}

        {/* TEXT QUESTION */}

        {isText && (

          <div className="candidate-recording-card">

            <div className="recording-header">

              <div>

                <h2>
                  Your Answer
                </h2>

                <p>
                  Type your answer below.
                </p>

              </div>

            </div>

            <textarea
              value={
                textAnswers[
                  currentQuestion
                ] || ""
              }
              onChange={
                handleTextAnswer
              }
              placeholder="Type your answer here..."
              rows={8}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "10px",
                border:
                  "1px solid #dbe2ea",
                resize: "vertical",
                fontSize: "15px",
                boxSizing: "border-box",
              }}
            />

            {mediaError && (

              <div className="media-error">

                <HiOutlineExclamationCircle />

                {mediaError}

              </div>

            )}

          </div>

        )}

        {/* MULTIPLE CHOICE */}

        {isMultipleChoice && (

          <div className="candidate-recording-card">

            <div className="recording-header">

              <div>

                <h2>
                  Select Your Answer
                </h2>

                <p>
                  Choose the answer that
                  best applies.
                </p>

              </div>

            </div>

            <div
              style={{
                display: "grid",
                gap: "12px",
              }}
            >

              {[
                "Option A",
                "Option B",
                "Option C",
                "Option D",
              ].map((option) => (

                <label
                  key={option}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "14px",
                    border:
                      "1px solid #e2e8f0",
                    borderRadius: "10px",
                    cursor: "pointer",
                  }}
                >

                  <input
                    type="radio"
                    name={`question-${currentQuestion}`}
                    value={option}
                    checked={
                      selectedAnswers[
                        currentQuestion
                      ] === option
                    }
                    onChange={
                      handleMultipleChoice
                    }
                  />

                  {option}

                </label>

              ))}

            </div>

            {mediaError && (

              <div className="media-error">

                <HiOutlineExclamationCircle />

                {mediaError}

              </div>

            )}

          </div>

        )}

        {/* NAVIGATION */}

        <div className="candidate-question-navigation">

          <button
            type="button"
            className="previous-question-button"
            onClick={
              previousQuestion
            }
            disabled={
              currentQuestion === 0 ||
              recording ||
              submitting
            }
          >

            <HiOutlineArrowLeft />

            Previous

          </button>

          {currentQuestion <
          questions.length - 1 ? (

            <button
              type="button"
              className="next-question-button"
              onClick={
                nextQuestion
              }
              disabled={
                recording ||
                submitting ||
                (question.required &&
                  !hasAnswer())
              }
            >

              Next Question

              <HiOutlineArrowRight />

            </button>

          ) : (

            <button
              type="button"
              className="submit-interview-button"
              disabled={
                recording ||
                submitting ||
                (question.required &&
                  !hasAnswer())
              }
              onClick={
                submitInterview
              }
            >

              <HiOutlineCheckCircle />

              {submitting
                ? "Submitting..."
                : "Submit Interview"}

            </button>

          )}

        </div>

      </section>

    </main>
  );
}

export default CandidateInterviewPage;
import "../styles/CandidateInterviewPage.css";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useParams } from "react-router-dom";

import {
  HiOutlineVideoCamera,
  HiOutlineMicrophone,
  HiOutlineStop,
  HiOutlineCheckCircle,
  HiOutlineArrowRight,
  HiOutlineArrowLeft,
  HiOutlineExclamationCircle,
  HiOutlineSpeakerWave,
  HiOutlinePause,
  HiOutlinePlay,
  HiOutlineStopCircle,
} from "react-icons/hi2";

const API_BASE_URL = "http://localhost:8081";
const isChoiceType = (type) =>
  [
    "multiple choice", "multiple-choice", "multiple_choice",
    "yes/no", "yes / no", "yes-no", "yes_no",
  ].includes(type);

const SPEECH_LANG = "en-US";
const SPEECH_CHUNK_LENGTH = 180;

/*
 * Browsers cut off long utterances (Chrome stops after ~15s), so
 * the text is read as a queue of short, sentence-sized chunks.
 */
const splitForSpeech = (text) => {
  const sentences =
    String(text || "")
      .replace(/\s+/g, " ")
      .trim()
      .match(/[^.!?;:]+[.!?;:]*\s*/g) || [];

  const chunks = [];
  let current = "";

  const pushCurrent = () => {
    if (current.trim()) chunks.push(current.trim());
    current = "";
  };

  sentences.forEach((sentence) => {
    if (sentence.length > SPEECH_CHUNK_LENGTH) {
      pushCurrent();
      let remaining = sentence;
      while (remaining.length > SPEECH_CHUNK_LENGTH) {
        let cut = remaining.lastIndexOf(" ", SPEECH_CHUNK_LENGTH);
        if (cut <= 0) cut = SPEECH_CHUNK_LENGTH;
        chunks.push(remaining.slice(0, cut).trim());
        remaining = remaining.slice(cut);
      }
      current = remaining;
      return;
    }

    if ((current + sentence).length > SPEECH_CHUNK_LENGTH) {
      pushCurrent();
    }
    current += sentence;
  });

  pushCurrent();
  return chunks;
};

function CandidateInterviewPage() {
  const { token } = useParams();

  // ============================================================
  // INTERVIEW
  // ============================================================

  const [interview, setInterview] = useState(null);
  const [questions, setQuestions] = useState([]);

  // ============================================================
  // CANDIDATE
  // ============================================================

  const [candidateId, setCandidateId] = useState(null);
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidateRegistered, setCandidateRegistered] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  // Retakes used per question index (enforces interview.maxRetakes).
  const [retakesUsed, setRetakesUsed] = useState({});
  const [registeringCandidate, setRegisteringCandidate] = useState(false);

  // ============================================================
  // INTERVIEW STATE
  // ============================================================

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cameraReady, setCameraReady] = useState(false);
  const [recording, setRecording] = useState(false);

  const [recordings, setRecordings] = useState({});

  const [uploadingQuestion, setUploadingQuestion] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [textAnswers, setTextAnswers] = useState({});
  const [selectedAnswers, setSelectedAnswers] = useState({});

  const [mediaError, setMediaError] = useState("");

  const [timeRemaining, setTimeRemaining] = useState(null);

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ============================================================
  // REFS
  // ============================================================

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const recordingQuestionRef = useRef(null);

  const uploadPromisesRef = useRef({});

  const mountedRef = useRef(true);

  // ============================================================
  // CURRENT QUESTION
  // ============================================================

  const question = questions[currentQuestion];

  const questionType = useMemo(() => {
    return question?.questionType?.trim()?.toLowerCase() || "";
  }, [question]);

  const isVideo = questionType === "video";
  const isText = questionType === "text";

  const isMultipleChoice =
    questionType === "multiple choice" ||
    questionType === "multiple-choice" ||
    questionType === "multiple_choice";

    const isYesNo =
  questionType === "yes/no" ||
  questionType === "yes / no" ||
  questionType === "yes-no" ||
  questionType === "yes_no";

const isChoice = isMultipleChoice || isYesNo;

const choiceOptions = isYesNo ? ["Yes", "No"] : question?.options || [];

const allowMultiple = isMultipleChoice && Boolean(question?.allowMultiple);

  const isUploadingCurrentQuestion = uploadingQuestion === currentQuestion;

  // ============================================================
  // COMPONENT MOUNT / UNMOUNT
  // ============================================================

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ============================================================
  // HELPER: READ API RESPONSE
  // ============================================================

  const parseApiResponse = async (response) => {
    const text = await response.text();

    if (!text) {
      return null;
    }

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  };

  // ============================================================
  // HELPER: GET ERROR MESSAGE
  // ============================================================

  const getApiErrorMessage = (response, data) => {
    if (response.status === 413) {
      return "The recorded video is too large for the server. Increase the Spring Boot multipart file size limit.";
    }

    if (response.status === 400) {
      if (typeof data === "string" && data.trim()) {
        return data;
      }

      return (
        data?.message ||
        data?.error ||
        "The server rejected the video upload."
      );
    }

    if (response.status === 401) {
      return "You are not authorized to upload this response.";
    }

    if (response.status === 403) {
      return "The server denied this video upload.";
    }

    if (response.status === 404) {
      return (
        data?.message ||
        data?.error ||
        "The video upload endpoint could not be found."
      );
    }

    if (response.status >= 500) {
      return (
        data?.message ||
        data?.error ||
        "The server encountered an error while saving the video."
      );
    }

    if (typeof data === "string" && data.trim()) {
      return data;
    }

    return data?.message || data?.error || "Failed to upload video.";
  };

  // ============================================================
  // LOAD INTERVIEW
  // ============================================================

  useEffect(() => {
    const loadInterview = async () => {
      try {
        setLoading(true);
        setError("");

        if (!token) {
          throw new Error("Interview token is missing.");
        }

        // --------------------------------------------------------
        // LOAD INTERVIEW
        // --------------------------------------------------------

        const interviewUrl = `${API_BASE_URL}/api/interviews/public/${token}`;

        console.log("Loading interview:", interviewUrl);

        const interviewResponse = await fetch(interviewUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        const interviewData = await parseApiResponse(interviewResponse);

        console.log(
          "Interview response:",
          interviewResponse.status,
          interviewData
        );

        if (!interviewResponse.ok) {
          throw new Error(
            interviewResponse.status === 404
              ? "This interview link is invalid or no longer available."
              : getApiErrorMessage(interviewResponse, interviewData)
          );
        }

        if (!interviewData) {
          throw new Error("The server returned an empty interview response.");
        }

        setInterview(interviewData);

        // --------------------------------------------------------
        // LOAD QUESTIONS
        // --------------------------------------------------------

        const questionsUrl = `${API_BASE_URL}/api/interviews/public/${token}/questions`;

        console.log("Loading questions:", questionsUrl);

        const questionsResponse = await fetch(questionsUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        const questionsData = await parseApiResponse(questionsResponse);

        console.log(
          "Questions response:",
          questionsResponse.status,
          questionsData
        );

        if (!questionsResponse.ok) {
          throw new Error(
            getApiErrorMessage(questionsResponse, questionsData)
          );
        }

        if (Array.isArray(questionsData)) {
          setQuestions(questionsData);
        } else if (Array.isArray(questionsData?.questions)) {
          setQuestions(questionsData.questions);
        } else {
          setQuestions([]);
        }
      } catch (err) {
        console.error("Error loading candidate interview:", err);

        if (mountedRef.current) {
          setError(err.message || "Unable to load interview.");
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    loadInterview();
  }, [token]);

  // ============================================================
  // REGISTER CANDIDATE
  // ============================================================

  const registerCandidate = async (event) => {
    event.preventDefault();

    setMediaError("");

    if (!candidateName.trim()) {
      setMediaError("Please enter your full name.");
      return;
    }

    if (!candidateEmail.trim()) {
      setMediaError("Please enter your email address.");
      return;
    }

    if (interview?.requireConsent && !consentGiven) {
      setMediaError("Please agree to the recording consent to continue.");
      return;
    }

    try {
      setRegisteringCandidate(true);

      const response = await fetch(`${API_BASE_URL}/api/candidates/public`, {
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
      });

      const data = await parseApiResponse(response);

      console.log("Candidate registration:", response.status, data);

      if (!response.ok) {
        throw new Error(getApiErrorMessage(response, data));
      }

      if (!data?.id) {
        throw new Error(
          "Candidate was created, but the server did not return a candidate ID."
        );
      }

      setCandidateId(data.id);

      setCandidateName(data.name || candidateName.trim());

      setCandidateEmail(data.email || candidateEmail.trim());

      setCandidateRegistered(true);
      setMediaError("");
    } catch (err) {
      console.error("Candidate registration error:", err);

      setMediaError(err.message || "Unable to register candidate.");
    } finally {
      setRegisteringCandidate(false);
    }
  };

  // ============================================================
  // TIMER
  // ============================================================

  // The countdown only runs while a video answer is being recorded,
  // so candidates are never timed while they read the question or
  // set up their camera. It is hidden again when recording stops.
  useEffect(() => {
    const limit = Number(question?.timeLimit);

    if (!recording || !Number.isFinite(limit) || limit <= 0) {
      return undefined;
    }

    setTimeRemaining(limit);

    const timer = setInterval(() => {
      setTimeRemaining((previous) => {
        if (previous === null) {
          return null;
        }

        if (previous <= 1) {
          clearInterval(timer);

          if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state !== "inactive"
          ) {
            mediaRecorderRef.current.stop();
          }

          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [currentQuestion, question, recording]);

  // ============================================================
  // READ ALOUD (TEXT-TO-SPEECH)
  // ============================================================

  const ttsSupported =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window;

  const [autoRead, setAutoRead] = useState(true);
  // "idle" | "speaking" | "paused"
  const [speechState, setSpeechState] = useState("idle");
  const speechRunRef = useRef(0);

  const readAloudActive =
    candidateRegistered &&
    !submitted &&
    !loading &&
    !error &&
    Boolean(question);

  const stopSpeech = useCallback(() => {
    speechRunRef.current += 1;

    if (ttsSupported) {
      window.speechSynthesis.cancel();
    }

    setSpeechState("idle");
  }, [ttsSupported]);

  const speakQuestion = useCallback(
    (target, number) => {
      if (!ttsSupported || !target?.questionText) return;

      const synth = window.speechSynthesis;
      synth.cancel();

      const run = speechRunRef.current + 1;
      speechRunRef.current = run;

      let text = `Question ${number}. ${target.questionText}`;

      const type = String(target.questionType || "")
        .trim()
        .toLowerCase();

      if (
        isChoiceType(type) &&
        Array.isArray(target.options) &&
        target.options.length > 0
      ) {
        text += `. Options: ${target.options.join(". ")}`;
      }

      const chunks = splitForSpeech(text);
      if (chunks.length === 0) return;

      setSpeechState("speaking");

      chunks.forEach((chunk, index) => {
        const utterance = new SpeechSynthesisUtterance(chunk);
        utterance.lang = SPEECH_LANG;
        utterance.rate = 0.95;

        utterance.onend = () => {
          if (
            speechRunRef.current === run &&
            index === chunks.length - 1
          ) {
            setSpeechState("idle");
          }
        };

        utterance.onerror = (event) => {
          if (
            speechRunRef.current === run &&
            event.error !== "canceled" &&
            event.error !== "interrupted"
          ) {
            setSpeechState("idle");
          }
        };

        synth.speak(utterance);
      });
    },
    [ttsSupported]
  );

  const pauseSpeech = () => {
    if (!ttsSupported) return;
    window.speechSynthesis.pause();
    setSpeechState("paused");
  };

  const resumeSpeech = () => {
    if (!ttsSupported) return;
    window.speechSynthesis.resume();
    setSpeechState("speaking");
  };

  // Read each question when it appears (if auto-read is on).
  useEffect(() => {
    if (!ttsSupported || !readAloudActive || !autoRead) {
      return undefined;
    }

    const timer = setTimeout(() => {
      speakQuestion(question, currentQuestion + 1);
    }, 400);

    return () => {
      clearTimeout(timer);
      // Leaving a question (or the page) silences the old one.
      window.speechSynthesis.cancel();
      speechRunRef.current += 1;
      setSpeechState("idle");
    };
  }, [
    ttsSupported,
    readAloudActive,
    autoRead,
    question,
    currentQuestion,
    speakQuestion,
  ]);

  // Always silence speech when the page is closed, and when
  // auto-read is off and the candidate moves on.
  useEffect(() => {
    stopSpeech();
  }, [currentQuestion, stopSpeech]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // ============================================================
  // CAMERA
  // ============================================================

  const startCamera = async () => {
    try {
      setMediaError("");

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          "Your browser does not support camera and microphone access."
        );
      }

      // Stop any previous stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: {
            ideal: 1280,
          },
          height: {
            ideal: 720,
          },
          facingMode: "user",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        try {
          await videoRef.current.play();
        } catch (playError) {
          console.warn("Video autoplay warning:", playError);
        }
      }

      setCameraReady(true);
      setMediaError("");
    } catch (err) {
      console.error("Camera error:", err);

      let message = "Camera and microphone access is required.";

      if (err?.name === "NotAllowedError") {
        message =
          "Camera and microphone permission was denied. Allow access in Chrome and try again.";
      } else if (err?.name === "NotFoundError") {
        message = "No camera or microphone was found on this device.";
      } else if (err?.name === "NotReadableError") {
        message =
          "Your camera or microphone is already being used by another application.";
      } else if (err?.message) {
        message = err.message;
      }

      setMediaError(message);
      setCameraReady(false);
    }
  };

  // ============================================================
  // GET BEST MEDIA RECORDER MIME TYPE
  // ============================================================

  const getSupportedMimeType = () => {
    if (typeof MediaRecorder === "undefined") {
      return "";
    }

    const types = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
      "video/mp4",
    ];

    for (const type of types) {
      try {
        if (MediaRecorder.isTypeSupported(type)) {
          return type;
        }
      } catch {
        // Continue checking the next type.
      }
    }

    return "";
  };

  // ============================================================
  // UPLOAD VIDEO
  // ============================================================

  const uploadVideoResponse = useCallback(
    async (questionIndex, blob) => {
      if (!candidateId) {
        throw new Error("Candidate ID is missing. Please register first.");
      }

      if (!token) {
        throw new Error("Interview token is missing.");
      }

      if (!blob || blob.size === 0) {
        throw new Error("The recorded video is empty.");
      }

      const questionNumber = questionIndex + 1;

      const formData = new FormData();

      formData.append("interviewToken", token);

      formData.append("questionNumber", String(questionNumber));

      const extension = blob.type.includes("mp4") ? "mp4" : "webm";

      const filename = `candidate-${candidateId}-question-${questionNumber}.${extension}`;

      /*
       * IMPORTANT:
       *
       * Do NOT manually set Content-Type.
       *
       * Browser creates the multipart boundary.
       */

      formData.append("video", blob, filename);

      console.log("======================================");
      console.log("VIDEO UPLOAD START");
      console.log(
        "Endpoint:",
        `${API_BASE_URL}/api/candidates/${candidateId}/responses/video`
      );
      console.log("Candidate ID:", candidateId);
      console.log("Question number:", questionNumber);
      console.log("Video type:", blob.type);
      console.log(
        "Video size:",
        `${(blob.size / 1024 / 1024).toFixed(2)} MB`
      );
      console.log("======================================");

      if (mountedRef.current) {
        setUploadProgress(0);
      }

      /*
       * ----------------------------------------------------------
       * XMLHttpRequest
       * ----------------------------------------------------------
       *
       * We use XHR instead of fetch here because it gives us
       * real upload progress.
       */

      const result = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open(
          "POST",
          `${API_BASE_URL}/api/candidates/${candidateId}/responses/video`
        );

        xhr.setRequestHeader("Accept", "application/json");

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && mountedRef.current) {
            const progress = Math.round((event.loaded / event.total) * 100);

            setUploadProgress(progress);
          }
        };

        xhr.onload = () => {
          const responseText = xhr.responseText || "";

          let data;

          try {
            data = responseText ? JSON.parse(responseText) : null;
          } catch {
            data = responseText;
          }

          console.log("Video upload response:", xhr.status, data);

          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({
              status: xhr.status,
              data,
            });
          } else {
            const fakeResponse = {
              status: xhr.status,
            };

            reject(new Error(getApiErrorMessage(fakeResponse, data)));
          }
        };

        xhr.onerror = () => {
          reject(
            new Error(
              "Network error while uploading the video. Make sure the Spring Boot backend is running."
            )
          );
        };

        xhr.onabort = () => {
          reject(new Error("Video upload was cancelled."));
        };

        xhr.ontimeout = () => {
          reject(new Error("Video upload timed out."));
        };

        /*
         * 10 minute timeout for large videos.
         */

        xhr.timeout = 10 * 60 * 1000;

        xhr.send(formData);
      });

      if (mountedRef.current) {
        setUploadProgress(100);
      }

      const data = result.data;

      /*
       * Backend returns CandidateDto.
       *
       * CandidateDto contains responses.
       */

      let uploadedVideoUrl = null;

      if (Array.isArray(data?.responses)) {
        const responseItem = data.responses.find(
          (item) => Number(item.questionNumber) === questionNumber
        );

        if (responseItem) {
          uploadedVideoUrl = responseItem.videoUrl || null;
        }
      }

      /*
       * Save upload information locally.
       */

      if (mountedRef.current) {
        setRecordings((previous) => ({
          ...previous,

          [questionIndex]: {
            ...previous[questionIndex],

            uploaded: true,
            uploadFailed: false,

            videoUrlFromServer: uploadedVideoUrl,

            serverResponse: data,
          },
        }));
      }

      console.log(
        `Video uploaded successfully for question ${questionNumber}.`
      );

      return data;
    },
    [candidateId, token]
  );

  // ============================================================
  // START RECORDING
  // ============================================================

  const startRecording = () => {
    if (!streamRef.current) {
      setMediaError("Please enable your camera before recording.");

      return;
    }

    if (!candidateId) {
      setMediaError("Candidate registration is incomplete.");

      return;
    }

    if (typeof MediaRecorder === "undefined") {
      setMediaError("Your browser does not support video recording.");

      return;
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      return;
    }

    // Don't let the read-aloud voice leak into the recording.
    stopSpeech();

    try {
      setMediaError("");

      chunksRef.current = [];

      recordingQuestionRef.current = currentQuestion;

      const mimeType = getSupportedMimeType();

      if (!mimeType) {
        throw new Error(
          "Your browser does not support a compatible video recording format."
        );
      }

      console.log("Starting MediaRecorder:", mimeType);

      const recorder = new MediaRecorder(streamRef.current, {
        mimeType,
      });

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);

        if (mountedRef.current) {
          setMediaError("An error occurred while recording the video.");

          setRecording(false);
        }
      };

      recorder.onstop = async () => {
        const questionIndex = recordingQuestionRef.current;

        const chunks = chunksRef.current;

        chunksRef.current = [];

        if (questionIndex === null || questionIndex === undefined) {
          console.error("Recording question index is missing.");

          return;
        }

        if (!chunks.length) {
          if (mountedRef.current) {
            setMediaError(
              "No video data was recorded. Please try recording again."
            );
          }

          return;
        }

        const blob = new Blob(chunks, {
          type: recorder.mimeType || mimeType || "video/webm",
        });

        console.log("Recorded video created:", {
          type: blob.type,
          size: blob.size,
        });

        if (blob.size === 0) {
          if (mountedRef.current) {
            setMediaError("The recorded video is empty. Please record again.");
          }

          return;
        }

        const videoUrl = URL.createObjectURL(blob);

        /*
         * Show the recording immediately.
         */

        if (mountedRef.current) {
          setRecordings((previous) => ({
            ...previous,

            [questionIndex]: {
              blob,
              videoUrl,

              uploaded: false,
              uploadFailed: false,

              videoUrlFromServer: null,
            },
          }));
        }

        /*
         * Upload immediately.
         */

        try {
          if (mountedRef.current) {
            setUploadingQuestion(questionIndex);

            setUploadProgress(0);
            setMediaError("");
          }

          const uploadPromise = uploadVideoResponse(questionIndex, blob);

          uploadPromisesRef.current[questionIndex] = uploadPromise;

          await uploadPromise;

          console.log(`Question ${questionIndex + 1} upload completed.`);
        } catch (err) {
          console.error("VIDEO UPLOAD FAILED:", err);

          if (mountedRef.current) {
            setMediaError(
              err.message ||
                `Failed to upload video for question ${questionIndex + 1}.`
            );

            setRecordings((previous) => ({
              ...previous,

              [questionIndex]: {
                ...previous[questionIndex],

                uploaded: false,
                uploadFailed: true,
              },
            }));
          }
        } finally {
          if (mountedRef.current) {
            setUploadingQuestion(null);
          }

          delete uploadPromisesRef.current[questionIndex];
        }
      };

      /*
       * Start recording in 1-second chunks.
       */

      recorder.start(1000);

      setRecording(true);
      setMediaError("");

      console.log(`Recording started for question ${currentQuestion + 1}`);
    } catch (err) {
      console.error("Recording start error:", err);

      setRecording(false);

      setMediaError(err.message || "Unable to start video recording.");
    }
  };

  // ============================================================
  // STOP RECORDING
  // ============================================================

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;

    if (recorder && recorder.state !== "inactive") {
      try {
        recorder.stop();
      } catch (err) {
        console.error("Stop recording error:", err);
      }
    }

    setRecording(false);
  };

  // ============================================================
  // WAIT FOR ALL UPLOADS
  // ============================================================

  const waitForVideoUploads = async () => {
    const promises = Object.values(uploadPromisesRef.current);

    if (!promises.length) {
      return;
    }

    await Promise.all(promises);
  };

  // ============================================================
  // CHECK WHETHER QUESTION HAS ANSWER
  // ============================================================

  const hasAnswer = useCallback(
    (index = currentQuestion) => {
      const current = questions[index];

      if (!current) {
        return false;
      }

      const type = current.questionType?.trim()?.toLowerCase();

      if (type === "video") {
        return Boolean(recordings[index]?.uploaded);
      }

      if (type === "text") {
        return Boolean(textAnswers[index]?.trim());
      }

     if (
  type === "multiple choice" ||
  type === "multiple-choice" ||
  type === "multiple_choice" ||
  type === "yes/no" ||
  type === "yes / no" ||
  type === "yes-no" ||
  type === "yes_no"
) {
  const answer = selectedAnswers[index];

  // "Select all that apply" questions store an array.
  return Array.isArray(answer) ? answer.length > 0 : Boolean(answer);
}

      return true;
    },
    [currentQuestion, questions, recordings, textAnswers, selectedAnswers]
  );

  // ============================================================
  // NEXT QUESTION
  // ============================================================

  const nextQuestion = async () => {
    if (recording) {
      stopRecording();
      return;
    }

    if (isUploadingCurrentQuestion) {
      setMediaError("Please wait for your video to finish uploading.");

      return;
    }

    if (question?.required && !hasAnswer()) {
      setMediaError("Please answer this required question before continuing.");

      return;
    }

    setMediaError("");

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((previous) => previous + 1);

      setUploadProgress(0);
    }
  };

  // ============================================================
  // PREVIOUS QUESTION
  // ============================================================

  const previousQuestion = () => {
    if (recording) {
      stopRecording();
      return;
    }

    if (isUploadingCurrentQuestion) {
      setMediaError("Please wait for your video to finish uploading.");

      return;
    }

    setMediaError("");

    if (currentQuestion > 0) {
      setCurrentQuestion((previous) => previous - 1);

      setUploadProgress(0);
    }
  };

  // ============================================================
  // RECORD AGAIN
  // ============================================================

  const recordAgain = () => {
    if (isUploadingCurrentQuestion) {
      setMediaError("Please wait for the current upload to finish.");

      return;
    }

    if (
      typeof interview?.maxRetakes === "number" &&
      (retakesUsed[currentQuestion] || 0) >= interview.maxRetakes
    ) {
      setMediaError("You have used all of your retakes for this question.");

      return;
    }

    setRetakesUsed((previous) => ({
      ...previous,
      [currentQuestion]: (previous[currentQuestion] || 0) + 1,
    }));

    const existing = recordings[currentQuestion];

    if (existing?.videoUrl) {
      URL.revokeObjectURL(existing.videoUrl);
    }

    setRecordings((previous) => {
      const updated = {
        ...previous,
      };

      delete updated[currentQuestion];

      return updated;
    });

    setMediaError("");
    setUploadProgress(0);

    /*
     * Camera remains active.
     * Candidate can immediately record again.
     */
  };

  // ============================================================
  // TEXT ANSWER
  // ============================================================

  const handleTextAnswer = (event) => {
    setTextAnswers((previous) => ({
      ...previous,

      [currentQuestion]: event.target.value,
    }));

    setMediaError("");
  };

  // ============================================================
  // MULTIPLE CHOICE
  // ============================================================
const handleMultipleChoice = (event) => {
  const { value, checked } = event.target;

  setSelectedAnswers((previous) => {
    if (!allowMultiple) {
      return { ...previous, [currentQuestion]: value };
    }

    const current = Array.isArray(previous[currentQuestion])
      ? previous[currentQuestion]
      : [];

    return {
      ...previous,
      [currentQuestion]: checked
        ? [...current, value]
        : current.filter((item) => item !== value),
    };
  });

  setMediaError("");
};

  // ============================================================
  // SUBMIT INTERVIEW
  // ============================================================

  const submitInterview = async () => {
    if (recording) {
      stopRecording();
      return;
    }

    if (!candidateId) {
      setMediaError("Candidate registration is incomplete.");

      return;
    }

    if (uploadingQuestion !== null) {
      setMediaError("Please wait for the video upload to finish.");

      return;
    }

    if (question?.required && !hasAnswer()) {
      setMediaError(
        "Please answer the final required question before submitting."
      );

      return;
    }

    try {
      setSubmitting(true);
      setMediaError("");

      /*
       * Wait for any upload still in progress.
       */

      await waitForVideoUploads();

      /*
       * Validate every required question.
       */

      for (let index = 0; index < questions.length; index++) {
        const current = questions[index];

        if (current?.required && !hasAnswer(index)) {
          throw new Error(
            `Question ${index + 1} is required and has not been answered.`
          );
        }
      }

      /*
       * Build answers expected by the backend.
       *
       * Backend expects question indexes:
       *
       * 0 = first question
       * 1 = second question
       * etc.
       */

      const answers = {};

      questions.forEach((_, index) => {
        const current = questions[index];

        const type = current?.questionType?.trim()?.toLowerCase();

        if (type === "video") {
          answers[index] = recordings[index]?.uploaded
            ? "Video response recorded"
            : "";
        } else if (type === "text") {
          answers[index] = textAnswers[index] || "";
        } else if (isChoiceType(type)) {
  const selected = selectedAnswers[index];

  // Several selections are sent as: "Option A | Option C"
  answers[index] = Array.isArray(selected)
    ? selected.join(" | ")
    : selected || "";
} else {
          answers[index] = "";
        }
      });

      console.log("Submitting interview answers:", answers);

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

      const data = await parseApiResponse(response);

      console.log("Interview submission response:", response.status, data);

      if (!response.ok) {
        throw new Error(getApiErrorMessage(response, data));
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Interview submission error:", err);

      setMediaError(err.message || "Failed to submit interview.");
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // CLEANUP
  // ============================================================

  useEffect(() => {
    return () => {
      /*
       * Stop camera.
       */

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());

        streamRef.current = null;
      }

      /*
       * Stop recorder.
       */

      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          // Ignore cleanup errors.
        }
      }

      /*
       * Revoke local preview URLs.
       */

      Object.values(recordings).forEach((recordingItem) => {
        if (recordingItem?.videoUrl) {
          URL.revokeObjectURL(recordingItem.videoUrl);
        }
      });
    };
  }, []);

  // ============================================================
  // FORMAT TIME
  // ============================================================

  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) {
      return "";
    }

    const minutes = Math.floor(seconds / 60);

    const remainingSeconds = seconds % 60;

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <main className="candidate-interview-page">
        <div className="candidate-interview-loading">
          <div className="loading-spinner" />

          <h2>Loading Interview</h2>

          <p>Please wait while we prepare your interview.</p>
        </div>
      </main>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <main className="candidate-interview-page">
        <div className="candidate-interview-error">
          <HiOutlineExclamationCircle />

          <h1>Unable to Load Interview</h1>

          <p>{error}</p>
        </div>
      </main>
    );
  }

  // ============================================================
  // NO QUESTIONS
  // ============================================================

  if (!questions.length) {
    return (
      <main className="candidate-interview-page">
        <div className="candidate-interview-error">
          <HiOutlineExclamationCircle />

          <h1>No Questions Available</h1>

          <p>This interview does not have any questions yet.</p>
        </div>
      </main>
    );
  }

  // ============================================================
  // SUBMITTED
  // ============================================================

  if (submitted) {
    return (
      <main className="candidate-interview-page">
        <div className="candidate-interview-error candidate-interview-success">
          <HiOutlineCheckCircle style={{ color: "#16a34a" }} />

          <h1>Interview Submitted</h1>

          <p>
            Thank you for completing your interview,{" "}
            <strong>{candidateName}</strong>.
          </p>

          <p>
            Your responses have been successfully recorded and are now under
            review by the employer.
          </p>

          <p>
            A confirmation has also been sent to your email. If you
            haven&apos;t heard back within 15 days, please consider your
            application unsuccessful for this role.
          </p>
        </div>
      </main>
    );
  }

  // ============================================================
  // REGISTRATION
  // ============================================================

  if (!candidateRegistered) {
    return (
      <main className="candidate-interview-page">
        <header className="candidate-interview-header">
          <div className="candidate-interview-brand">
            <h1>Covira</h1>

            <span>Candidate Interview</span>
          </div>
        </header>

        <section className="candidate-interview-intro">
          <h1>{interview?.title || "Interview"}</h1>

          {interview?.position && <p>{interview.position}</p>}

          {interview?.description && <span>{interview.description}</span>}
        </section>

        <section className="candidate-interview-content">
          {interview?.welcomeMessage && (
            <div className="candidate-welcome">
              <p>{interview.welcomeMessage}</p>
            </div>
          )}

          <div className="candidate-question-card">
            <span className="candidate-question-label">Before you begin</span>

            <h2>What to expect</h2>

            <ul className="expect-list">
              <li>
                {questions.length}{" "}
                {questions.length === 1 ? "question" : "questions"}
              </li>

              {interview?.answerTimeLimit && (
                <li>
                  Up to {formatTime(Number(interview.answerTimeLimit))} for
                  each video answer
                </li>
              )}

              {typeof interview?.maxRetakes === "number" && (
                <li>
                  {interview.maxRetakes === 0
                    ? "Video answers can't be re-recorded"
                    : `You can re-record each video answer ${interview.maxRetakes} ${
                        interview.maxRetakes === 1 ? "time" : "times"
                      }`}
                </li>
              )}

              {interview?.allowBackNavigation === false && (
                <li>You can't return to earlier questions</li>
              )}

              {interview?.candidateDeadline && (
                <li>
                  Start before{" "}
                  {new Date(interview.candidateDeadline).toLocaleString(
                    undefined,
                    {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }
                  )}
                </li>
              )}
            </ul>
          </div>

          <div className="candidate-recording-card">
            <div className="recording-header">
              <div>
                <h2>Your Details</h2>

                <p>
                  Your information will be associated with this interview.
                </p>
              </div>
            </div>

            <form onSubmit={registerCandidate}>
              <div className="candidate-form-grid">
                <div className="candidate-field">
                  <label htmlFor="candidateName">Full Name</label>

                  <input
                    id="candidateName"
                    type="text"
                    value={candidateName}
                    onChange={(event) => setCandidateName(event.target.value)}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="candidate-field">
                  <label htmlFor="candidateEmail">Email Address</label>

                  <input
                    id="candidateEmail"
                    type="email"
                    value={candidateEmail}
                    onChange={(event) => setCandidateEmail(event.target.value)}
                    placeholder="Enter your email address"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {interview?.requireConsent && (
                <label className="consent-check">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(event) => setConsentGiven(event.target.checked)}
                  />

                  <span>
                    I agree to my video and written answers being recorded and
                    shared with the hiring team for this interview.
                  </span>
                </label>
              )}

              {mediaError && (
                <div className="media-error">
                  <HiOutlineExclamationCircle />
                  {mediaError}
                </div>
              )}

              <div className="candidate-form-actions">
                <button
                  type="submit"
                  className="next-question-button"
                  disabled={registeringCandidate}
                >
                  {registeringCandidate ? "Registering..." : "Start Interview"}

                  {!registeringCandidate && <HiOutlineArrowRight />}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    );
  }

  // ============================================================
  // VIDEO RECORDING DATA
  // ============================================================

  const currentRecording = recordings[currentQuestion];

  const currentRecordingUrl = currentRecording?.videoUrl;

  // null = unlimited (also the value for interviews created before
  // this setting existed).
  const retakesLeft =
    typeof interview?.maxRetakes === "number"
      ? Math.max(0, interview.maxRetakes - (retakesUsed[currentQuestion] || 0))
      : null;

  const canGoBack = interview?.allowBackNavigation !== false;

  // ============================================================
  // MAIN INTERVIEW UI
  // ============================================================

  return (
    <main className="candidate-interview-page">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="candidate-interview-header">
        <div className="candidate-interview-brand">
          <h1>Covira</h1>

          <span>Candidate Interview</span>
        </div>

        <div className="candidate-interview-progress">
          <span>
            Question {currentQuestion + 1} of {questions.length}
          </span>

          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{
                width: `${((currentQuestion + 1) / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </header>

      {/* ======================================================
          INTERVIEW INFORMATION
      ====================================================== */}

      <section className="candidate-interview-intro">
        <h1>{interview?.title || "Interview"}</h1>

        {interview?.position && <p>{interview.position}</p>}

        {interview?.description && <span>{interview.description}</span>}

        <div
          style={{
            marginTop: "12px",
            fontSize: "14px",
          }}
        >
          Candidate: <strong>{candidateName}</strong>
        </div>
      </section>

      {/* ======================================================
          MAIN INTERVIEW
      ====================================================== */}

      <section className="candidate-interview-content">
        {/* ====================================================
            QUESTION
        ==================================================== */}

        <div className="candidate-question-card">
          <span className="candidate-question-label">
            Question {currentQuestion + 1}
          </span>

          <h2>{question.questionText}</h2>

          {ttsSupported ? (
            <div className="read-aloud-bar">
              {speechState === "idle" && (
                <button
                  type="button"
                  className="read-aloud-btn"
                  onClick={() =>
                    speakQuestion(question, currentQuestion + 1)
                  }
                  disabled={recording}
                  title={
                    recording
                      ? "Stop recording before listening again"
                      : "Read this question aloud"
                  }
                >
                  <HiOutlineSpeakerWave />
                  {autoRead ? "Replay question" : "Read aloud"}
                </button>
              )}

              {speechState === "speaking" && (
                <button
                  type="button"
                  className="read-aloud-btn"
                  onClick={pauseSpeech}
                >
                  <HiOutlinePause />
                  Pause
                </button>
              )}

              {speechState === "paused" && (
                <button
                  type="button"
                  className="read-aloud-btn"
                  onClick={resumeSpeech}
                >
                  <HiOutlinePlay />
                  Resume
                </button>
              )}

              {speechState !== "idle" && (
                <button
                  type="button"
                  className="read-aloud-btn"
                  onClick={stopSpeech}
                >
                  <HiOutlineStopCircle />
                  Stop
                </button>
              )}

              <label className="read-aloud-toggle">
                <input
                  type="checkbox"
                  checked={autoRead}
                  onChange={(event) => setAutoRead(event.target.checked)}
                />
                Read questions automatically
              </label>

              <span
                className="read-aloud-status"
                role="status"
                aria-live="polite"
              >
                {speechState === "speaking" && "Reading question..."}
                {speechState === "paused" && "Paused"}
              </span>
            </div>
          ) : (
            <p className="read-aloud-note">
              Read-aloud isn't supported in this browser. You can still
              read the question on screen.
            </p>
          )}

          {question.required && (
            <span className="required-question">Required</span>
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
            <span>Type: {question.questionType}</span>

            {isVideo && question.timeLimit && (
              <span>
                Max length: {formatTime(Number(question.timeLimit))}
              </span>
            )}
          </div>
        </div>

        {/* ====================================================
            TIMER
        ==================================================== */}

        {recording && timeRemaining !== null && (
          <div
            style={{
              marginBottom: "18px",
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            Time remaining: {formatTime(timeRemaining)}
          </div>
        )}

        {/* ====================================================
            VIDEO QUESTION
        ==================================================== */}

        {isVideo && (
          <div className="candidate-recording-card">
            <div className="recording-header">
              <div>
                <h2>Your Video Response</h2>

                <p>Record your answer using your camera and microphone.</p>
              </div>

              {recording && (
                <span className="recording-indicator">Recording</span>
              )}

              {isUploadingCurrentQuestion && (
                <span className="recording-indicator">
                  Uploading {uploadProgress}%
                </span>
              )}
            </div>

            {/* ==================================================
                VIDEO
            ================================================== */}

            <div className="video-container">
              {currentRecordingUrl && !recording ? (
                <video
                  controls
                  playsInline
                  className="recorded-video"
                  src={currentRecordingUrl}
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

              {!cameraReady && !currentRecording && !recording && (
                <div className="camera-overlay">
                  <HiOutlineVideoCamera />

                  <h3>Camera not enabled</h3>

                  <p>Enable your camera and microphone to continue.</p>
                </div>
              )}
            </div>

            {/* ==================================================
                UPLOAD PROGRESS
            ================================================== */}

            {isUploadingCurrentQuestion && (
              <div
                style={{
                  marginTop: "14px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  <span>Uploading video...</span>

                  <span>{uploadProgress}%</span>
                </div>

                <div
                  style={{
                    width: "100%",
                    height: "8px",
                    borderRadius: "999px",
                    background: "#e5e7eb",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${uploadProgress}%`,
                      height: "100%",
                      background: "#2563eb",
                      transition: "width 0.2s ease",
                    }}
                  />
                </div>
              </div>
            )}

            {/* ==================================================
                SUCCESS
            ================================================== */}

            {currentRecording?.uploaded && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "#dcfce7",
                  color: "#166534",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                Video uploaded successfully.
              </div>
            )}

            {/* ==================================================
                ERROR
            ================================================== */}

            {currentRecording?.uploadFailed && (
              <div
                className="media-error"
                style={{
                  marginTop: "12px",
                }}
              >
                <HiOutlineExclamationCircle />

                <span>Video upload failed. Please record again.</span>
              </div>
            )}

            {mediaError && (
              <div className="media-error">
                <HiOutlineExclamationCircle />

                <span>{mediaError}</span>
              </div>
            )}

            {/* ==================================================
                RECORDING CONTROLS
            ================================================== */}

            <div className="recording-controls">
              {!cameraReady && !currentRecording && (
                <button
                  type="button"
                  className="camera-button"
                  onClick={startCamera}
                >
                  <HiOutlineVideoCamera />
                  Enable Camera
                </button>
              )}

              {cameraReady && !recording && !currentRecording && (
                <button
                  type="button"
                  className="record-button"
                  onClick={startRecording}
                  disabled={isUploadingCurrentQuestion || submitting}
                >
                  <HiOutlineMicrophone />
                  Start Recording
                </button>
              )}

              {recording && (
                <button
                  type="button"
                  className="stop-record-button"
                  onClick={stopRecording}
                >
                  <HiOutlineStop />
                  Stop Recording
                </button>
              )}

              {currentRecording && !recording && retakesLeft !== 0 && (
                <button
                  type="button"
                  className="record-again-button"
                  onClick={recordAgain}
                  disabled={isUploadingCurrentQuestion || submitting}
                >
                  Record Again
                  {retakesLeft !== null && ` (${retakesLeft} left)`}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ====================================================
            TEXT QUESTION
        ==================================================== */}

        {isText && (
          <div className="candidate-recording-card">
            <div className="recording-header">
              <div>
                <h2>Your Answer</h2>

                <p>Type your answer below.</p>
              </div>
            </div>

            <textarea
              value={textAnswers[currentQuestion] || ""}
              onChange={handleTextAnswer}
              placeholder="Type your answer here..."
              rows={8}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "10px",
                border: "1px solid #dbe2ea",
                resize: "vertical",
                fontSize: "15px",
                boxSizing: "border-box",
              }}
            />

            {mediaError && (
              <div className="media-error">
                <HiOutlineExclamationCircle />

                <span>{mediaError}</span>
              </div>
            )}
          </div>
        )}

        {/* ====================================================
            MULTIPLE CHOICE
        ==================================================== */}

       {isChoice && (
  <div className="candidate-recording-card">
    <div className="recording-header">
      <div>
        <h2>Select Your Answer</h2>
        <p>
          {allowMultiple
            ? "Select all answers that apply."
            : "Choose the answer that best applies."}
        </p>
      </div>
    </div>

    <div style={{ display: "grid", gap: "12px" }}>
      {choiceOptions.map((option) => (
        <label
          key={option}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "14px",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          <input
            type={allowMultiple ? "checkbox" : "radio"}
            name={`question-${currentQuestion}`}
            value={option}
            checked={
              allowMultiple
                ? (selectedAnswers[currentQuestion] || []).includes(option)
                : selectedAnswers[currentQuestion] === option
            }
            onChange={handleMultipleChoice}
          />
          {option}
        </label>
      ))}

      {choiceOptions.length === 0 && (
        <p style={{ color: "#b42318" }}>
          This question has no answer options yet. Please contact the employer.
        </p>
      )}
    </div>

    {mediaError && (
      <div className="media-error">
        <HiOutlineExclamationCircle />
        <span>{mediaError}</span>
      </div>
    )}
  </div>
)}

        {/* ====================================================
            NAVIGATION
        ==================================================== */}

        <div className="candidate-question-navigation">
          {canGoBack && (
            <button
              type="button"
              className="previous-question-button"
              onClick={previousQuestion}
              disabled={
                currentQuestion === 0 ||
                recording ||
                submitting ||
                isUploadingCurrentQuestion
              }
            >
              <HiOutlineArrowLeft />
              Previous
            </button>
          )}

          {currentQuestion < questions.length - 1 ? (
            <button
              type="button"
              className="next-question-button"
              onClick={nextQuestion}
              disabled={
                recording ||
                submitting ||
                isUploadingCurrentQuestion ||
                (question.required && !hasAnswer())
              }
            >
              {isUploadingCurrentQuestion
                ? `Uploading ${uploadProgress}%...`
                : "Next Question"}

              {!isUploadingCurrentQuestion && <HiOutlineArrowRight />}
            </button>
          ) : (
            <button
              type="button"
              className="submit-interview-button"
              disabled={
                recording ||
                submitting ||
                isUploadingCurrentQuestion ||
                (question.required && !hasAnswer())
              }
              onClick={submitInterview}
            >
              <HiOutlineCheckCircle />

              {submitting
                ? "Submitting..."
                : isUploadingCurrentQuestion
                ? `Uploading ${uploadProgress}%...`
                : "Submit Interview"}
            </button>
          )}
        </div>
      </section>
    </main>
  );
}

export default CandidateInterviewPage;

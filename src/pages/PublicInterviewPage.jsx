import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  HiOutlineVideoCamera,
  HiOutlineArrowRight,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
} from "react-icons/hi2";

const API_BASE_URL = "http://localhost:8081";

function PublicInterviewPage() {
  const { token } = useParams();

  const [interview, setInterview] = useState(null);
  const [questions, setQuestions] = useState([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  const [error, setError] = useState("");

  const [candidate, setCandidate] = useState(null);

  /*
   * ============================================================
   * LOAD PUBLIC INTERVIEW
   * ============================================================
   */

  useEffect(() => {
    const loadInterview = async () => {
      try {
        setLoading(true);
        setError("");

        console.log(
          "Loading public interview with token:",
          token
        );

        /*
         * --------------------------------------------------------
         * LOAD INTERVIEW
         * --------------------------------------------------------
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

        console.log(
          "Interview response status:",
          interviewResponse.status
        );

        if (!interviewResponse.ok) {
          const message =
            await interviewResponse.text();

          throw new Error(
            message ||
              "This interview link is invalid or has expired."
          );
        }

        const interviewData =
          await interviewResponse.json();

        console.log(
          "Interview loaded:",
          interviewData
        );

        if (!interviewData) {
          throw new Error(
            "Interview data was not returned."
          );
        }

        if (!interviewData.id) {
          throw new Error(
            "Interview was loaded but does not contain an ID."
          );
        }

        setInterview(interviewData);

        /*
         * --------------------------------------------------------
         * LOAD QUESTIONS
         * --------------------------------------------------------
         */

        const questionsUrl =
          `${API_BASE_URL}/api/interviews/` +
          `${interviewData.id}/questions`;

        console.log(
          "Loading questions from:",
          questionsUrl
        );

        const questionsResponse =
          await fetch(
            questionsUrl,
            {
              method: "GET",
              headers: {
                Accept: "application/json",
              },
            }
          );

        console.log(
          "Questions response status:",
          questionsResponse.status
        );

        const questionsText =
          await questionsResponse.text();

        console.log(
          "Questions response:",
          questionsText
        );

        /*
         * --------------------------------------------------------
         * IMPORTANT
         *
         * 200 + [] is NOT an error.
         * It simply means the interview has no
         * questions yet.
         * --------------------------------------------------------
         */

        if (!questionsResponse.ok) {
          throw new Error(
            "Interview loaded, but the interview questions could not be loaded."
          );
        }

        let questionsData = [];

        try {
          questionsData =
            questionsText
              ? JSON.parse(questionsText)
              : [];
        } catch (parseError) {
          console.error(
            "Questions JSON parse error:",
            parseError
          );

          throw new Error(
            "The interview questions response was invalid."
          );
        }

        console.log(
          "Parsed questions:",
          questionsData
        );

        /*
         * Support both:
         *
         * [...]
         *
         * and:
         *
         * { questions: [...] }
         */

        if (Array.isArray(questionsData)) {
          setQuestions(questionsData);
        } else if (
          Array.isArray(
            questionsData.questions
          )
        ) {
          setQuestions(
            questionsData.questions
          );
        } else {
          setQuestions([]);
        }

      } catch (err) {
        console.error(
          "Public interview loading error:",
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
    } else {
      setError(
        "Interview token is missing."
      );

      setLoading(false);
    }
  }, [token]);

  /*
   * ============================================================
   * REGISTER CANDIDATE
   * ============================================================
   */

  const handleStartInterview = async (
    event
  ) => {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError(
        "Please enter your full name."
      );

      return;
    }

    if (!email.trim()) {
      setError(
        "Please enter your email address."
      );

      return;
    }

    try {
      setStarting(true);

      console.log(
        "Creating candidate..."
      );

      const response = await fetch(
        `${API_BASE_URL}/api/candidates/public`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "application/json",
          },

          body: JSON.stringify({
            interviewToken: token,
            name: name.trim(),
            email: email.trim(),
          }),
        }
      );

      const responseText =
        await response.text();

      console.log(
        "Candidate response:",
        response.status,
        responseText
      );

      let data;

      try {
        data = responseText
          ? JSON.parse(responseText)
          : null;
      } catch {
        data = responseText;
      }

      if (!response.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : data?.message ||
                "Unable to register candidate."
        );
      }

      console.log(
        "Candidate created:",
        data
      );

      setCandidate(data);

    } catch (err) {
      console.error(
        "Create candidate error:",
        err
      );

      setError(
        err.message ||
          "Unable to start interview."
      );
    } finally {
      setStarting(false);
    }
  };

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <div className="public-interview-page">

        <div className="public-interview-card">

          <HiOutlineVideoCamera
            size={45}
          />

          <h2>
            Loading interview...
          </h2>

          <p>
            Please wait while we prepare
            your interview.
          </p>

        </div>

      </div>
    );
  }

  /*
   * ============================================================
   * ERROR
   * ============================================================
   */

  if (error && !interview) {
    return (
      <div className="public-interview-page">

        <div className="public-interview-card">

          <HiOutlineExclamationCircle
            size={50}
          />

          <h1>
            Interview Unavailable
          </h1>

          <p>
            {error}
          </p>

        </div>

      </div>
    );
  }

  /*
   * ============================================================
   * CANDIDATE REGISTERED
   * ============================================================
   */

  if (candidate) {
    return (
      <div className="public-interview-page">

        <div className="public-interview-card">

          <HiOutlineCheckCircle
            size={55}
          />

          <h1>
            Welcome,{" "}
            {candidate.name ||
              name}
          </h1>

          <p>
            Your interview has been
            registered successfully.
          </p>

          <h2>
            {interview.title}
          </h2>

          <div className="public-interview-divider" />

          <h2>
            Interview Questions
          </h2>

          {questions.length === 0 ? (

            <div>
              <p>
                This interview does not
                have any questions yet.
              </p>

              <p>
                Please contact the employer
                if you believe this is an
                error.
              </p>
            </div>

          ) : (

            <div className="public-interview-questions">

              {questions.map(
                (question, index) => (

                  <div
                    key={
                      question.id ||
                      index
                    }
                    className="public-interview-question"
                  >

                    <span>
                      Question{" "}
                      {index + 1}
                    </span>

                    <p>
                      {question.questionText ||
                        question.text ||
                        question.question ||
                        "Question text unavailable."}
                    </p>

                  </div>

                )
              )}

            </div>

          )}

          <button
            type="button"
            className="public-interview-start-button"
            onClick={() => {
              alert(
                "Candidate registered successfully. The video interview stage is next."
              );
            }}
          >

            Continue to Interview

            <HiOutlineArrowRight
              size={20}
            />

          </button>

        </div>

      </div>
    );
  }

  /*
   * ============================================================
   * REGISTRATION PAGE
   * ============================================================
   */

  return (
    <div className="public-interview-page">

      <div className="public-interview-card">

        <div className="public-interview-icon">

          <HiOutlineVideoCamera
            size={35}
          />

        </div>

        <h1>
          {interview?.title}
        </h1>

        {interview?.position && (
          <p className="public-interview-position">
            {interview.position}
          </p>
        )}

        {interview?.description && (
          <p className="public-interview-description">
            {interview.description}
          </p>
        )}

        <div className="public-interview-details">

          {interview?.department && (
            <div>
              <span>
                Department
              </span>

              <strong>
                {interview.department}
              </strong>
            </div>
          )}

          {interview?.employmentType && (
            <div>
              <span>
                Employment Type
              </span>

              <strong>
                {interview.employmentType}
              </strong>
            </div>
          )}

          {interview?.location && (
            <div>
              <span>
                Location
              </span>

              <strong>
                {interview.location}
              </strong>
            </div>
          )}

        </div>

        <div className="public-interview-divider" />

        <h2>
          Before you begin
        </h2>

        <p>
          Please enter your details below.
          These details will be associated
          with your interview submission.
        </p>

        <form
          onSubmit={
            handleStartInterview
          }
        >

          <div className="public-form-group">

            <label>
              Full Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              placeholder="Enter your full name"
              disabled={starting}
            />

          </div>

          <div className="public-form-group">

            <label>
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="Enter your email address"
              disabled={starting}
            />

          </div>

          {error && (
            <div className="public-interview-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="public-interview-start-button"
            disabled={starting}
          >

            {starting
              ? "Registering..."
              : "Start Interview"}

            {!starting && (
              <HiOutlineArrowRight
                size={20}
              />
            )}

          </button>

        </form>

      </div>

    </div>
  );
}

export default PublicInterviewPage;
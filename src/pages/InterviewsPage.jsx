import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  HiOutlinePlus,
  HiOutlineArrowPath,
  HiOutlineVideoCamera,
  HiOutlineLink,
  HiOutlineQuestionMarkCircle,
} from "react-icons/hi2";

const API_BASE_URL = "http://localhost:8081";

function InterviewsPage() {

  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  /*
   * ============================================================
   * LOAD INTERVIEWS
   * ============================================================
   */

  const loadInterviews = async () => {

    try {

      setLoading(true);

      setError("");


      const response = await fetch(
        `${API_BASE_URL}/api/interviews`,
        {
          method: "GET",
          credentials: "include",
        }
      );


      /*
       * User is not logged in
       */

      if (response.status === 401) {

        setError(
          "Your session has expired. Please log in again."
        );

        return;
      }


      /*
       * Other backend errors
       */

      if (!response.ok) {

        const message = await response.text();

        throw new Error(
          message || "Failed to load interviews."
        );

      }


      /*
       * Get interviews
       */

      const data = await response.json();


      /*
       * Make sure we always have an array.
       */

      if (Array.isArray(data)) {

        setInterviews(data);

      } else {

        setInterviews([]);

      }


    } catch (err) {

      console.error(
        "Load interviews error:",
        err
      );

      setError(
        err.message ||
        "Unable to load interviews."
      );


    } finally {

      setLoading(false);

    }

  };


  /*
   * ============================================================
   * LOAD WHEN PAGE OPENS
   * ============================================================
   */

  useEffect(() => {

    loadInterviews();

  }, []);


  /*
   * ============================================================
   * CREATE INTERVIEW
   * ============================================================
   */

  const handleCreateInterview = () => {

    navigate(
      "/dashboard/interviews/create"
    );

  };


  /*
   * ============================================================
   * MANAGE QUESTIONS
   * ============================================================
   */

  const handleManageQuestions = (interviewId) => {

    if (!interviewId) {

      console.error(
        "Cannot open questions: interview ID is missing."
      );

      return;
    }


    navigate(
      `/dashboard/interviews/${interviewId}/questions`
    );

  };


  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (

    <section className="module-page">


      {/* ========================================================
          HEADER
      ========================================================= */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          marginBottom: "25px",
          flexWrap: "wrap",
        }}
      >

        <div>

          <h1>
            Interviews
          </h1>

          <p>
            Create and manage video interviews.
          </p>

        </div>


        {/* Create Interview Button */}

        <button
          type="button"
          onClick={handleCreateInterview}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "12px 20px",
            border: "none",
            borderRadius: "10px",
            background: "#21409a",
            color: "#ffffff",
            fontWeight: "600",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >

          <HiOutlinePlus size={20} />

          Create Interview

        </button>

      </div>


      {/* ========================================================
          ERROR
      ========================================================= */}

      {!loading && error && (

        <div
          className="module-empty-state"
          style={{
            padding: "50px 30px",
          }}
        >

          <h2>
            Unable to load interviews
          </h2>

          <p>
            {error}
          </p>


          <button
            type="button"
            onClick={loadInterviews}
            style={{
              marginTop: "20px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "11px 18px",
              border: "none",
              borderRadius: "9px",
              background: "#21409a",
              color: "#ffffff",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >

            <HiOutlineArrowPath size={18} />

            Try Again

          </button>

        </div>

      )}


      {/* ========================================================
          LOADING
      ========================================================= */}

      {loading && (

        <div
          className="module-empty-state"
        >

          <h2>
            Loading interviews...
          </h2>

          <p>
            Please wait while your interviews are loaded.
          </p>

        </div>

      )}


      {/* ========================================================
          EMPTY STATE
      ========================================================= */}

      {!loading &&
        !error &&
        interviews.length === 0 && (

          <div
            className="module-empty-state"
            style={{
              padding: "70px 30px",
            }}
          >

            <div
              style={{
                width: "60px",
                height: "60px",
                margin: "0 auto 20px",
                borderRadius: "50%",
                background: "#eef2ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >

              <HiOutlineVideoCamera
                size={28}
                color="#21409a"
              />

            </div>


            <h2>
              No interviews created
            </h2>


            <p>
              Create your first interview to get started.
            </p>


            <button
              type="button"
              onClick={handleCreateInterview}
              style={{
                marginTop: "22px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 22px",
                border: "none",
                borderRadius: "10px",
                background: "#21409a",
                color: "#ffffff",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >

              <HiOutlinePlus size={20} />

              Create Your First Interview

            </button>

          </div>

        )}


      {/* ========================================================
          INTERVIEW LIST
      ========================================================= */}

      {!loading &&
        !error &&
        interviews.length > 0 && (

          <div
            style={{
              display: "grid",
              gap: "16px",
            }}
          >

            {interviews.map((interview) => (

              <div
                key={interview.id}
                style={{
                  background: "#ffffff",
                  borderRadius: "14px",
                  padding: "22px",
                  boxShadow:
                    "0 5px 20px rgba(30, 64, 175, 0.06)",
                  border:
                    "1px solid #edf0f7",
                }}
              >


                {/* ==================================================
                    INTERVIEW HEADER
                =================================================== */}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "20px",
                    flexWrap: "wrap",
                  }}
                >

                  <div>

                    <h2
                      style={{
                        margin: "0 0 8px",
                        color: "#173b8f",
                      }}
                    >

                      {interview.title || "Untitled Interview"}

                    </h2>


                    <p
                      style={{
                        margin: "0",
                        color: "#64748b",
                      }}
                    >

                      {interview.position || "No position specified"}

                    </p>

                  </div>


                  {/* Status */}

                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: "20px",
                      background:
                        interview.status === "Active"
                          ? "#dcfce7"
                          : "#fef3c7",
                      color:
                        interview.status === "Active"
                          ? "#166534"
                          : "#92400e",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >

                    {interview.status || "Draft"}

                  </span>

                </div>


                {/* ==================================================
                    INTERVIEW INFORMATION
                =================================================== */}

                <div
                  style={{
                    display: "flex",
                    gap: "25px",
                    flexWrap: "wrap",
                    marginTop: "20px",
                    paddingTop: "18px",
                    borderTop:
                      "1px solid #eef1f6",
                  }}
                >

                  {interview.department && (

                    <div>

                      <small
                        style={{
                          color: "#94a3b8",
                        }}
                      >
                        Department
                      </small>

                      <p
                        style={{
                          margin: "4px 0 0",
                          color: "#334155",
                        }}
                      >
                        {interview.department}
                      </p>

                    </div>

                  )}


                  {interview.employmentType && (

                    <div>

                      <small
                        style={{
                          color: "#94a3b8",
                        }}
                      >
                        Employment Type
                      </small>

                      <p
                        style={{
                          margin: "4px 0 0",
                          color: "#334155",
                        }}
                      >
                        {interview.employmentType}
                      </p>

                    </div>

                  )}


                  {interview.location && (

                    <div>

                      <small
                        style={{
                          color: "#94a3b8",
                        }}
                      >
                        Location
                      </small>

                      <p
                        style={{
                          margin: "4px 0 0",
                          color: "#334155",
                        }}
                      >
                        {interview.location}
                      </p>

                    </div>

                  )}

                </div>


                {/* ==================================================
                    CANDIDATE LINK
                =================================================== */}

                {interview.interviewToken && (

                  <div
                    style={{
                      marginTop: "18px",
                      padding: "12px 15px",
                      borderRadius: "9px",
                      background: "#f8fafc",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      wordBreak: "break-all",
                    }}
                  >

                    <HiOutlineLink
                      size={19}
                      color="#21409a"
                    />

                    <span
                      style={{
                        fontSize: "13px",
                        color: "#475569",
                      }}
                    >

                      Candidate link:

                      {" "}

                      {window.location.origin}
                      /interview/
                      {interview.interviewToken}

                    </span>

                  </div>

                )}


                {/* ==================================================
                    ACTIONS
                =================================================== */}

                <div
                  style={{
                    marginTop: "20px",
                    paddingTop: "18px",
                    borderTop:
                      "1px solid #eef1f6",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >

                  {/* Manage Questions */}

                  <button
                    type="button"
                    onClick={() =>
                      handleManageQuestions(
                        interview.id
                      )
                    }
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      padding: "10px 16px",
                      border: "1px solid #dbe3f4",
                      borderRadius: "9px",
                      background: "#f8fafc",
                      color: "#21409a",
                      fontWeight: "600",
                      fontSize: "14px",
                      cursor: "pointer",
                    }}
                  >

                    <HiOutlineQuestionMarkCircle
                      size={19}
                    />

                    Manage Questions

                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

    </section>

  );

}


export default InterviewsPage;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { confirmAlert } from "../styles/utils/AlertService";

import {
  HiOutlinePlus,
  HiOutlineArrowPath,
  HiOutlineVideoCamera,
  HiOutlineLink,
  HiOutlineQuestionMarkCircle,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineClipboardDocument,
  HiOutlineCheck,
  HiOutlineLockClosed,
  HiOutlineArchiveBox,
  HiOutlineArrowUturnLeft,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";

const API_BASE_URL = "http://localhost:8081";

const DEPARTMENTS = [
  "Human Resources",
  "Information Technology",
  "Finance",
  "Marketing",
];

const EMPLOYMENT_TYPES = [
  "Full Time",
  "Part Time",
  "Internship",
  "Contract",
];

const LOCKED_MESSAGE =
  "A candidate has submitted this interview, so it can no longer be edited or deleted.";

// "2026-10-30T09:00:00" -> "2026-10-30T09:00" for <input type="datetime-local">
const toDateTimeLocal = (value) =>
  typeof value === "string" ? value.slice(0, 16) : "";

const buttonStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "10px 16px",
  borderRadius: "9px",
  fontWeight: "600",
  fontSize: "14px",
  cursor: "pointer",
};

const fieldStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #d0d5dd",
  fontSize: "14px",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  marginBottom: "6px",
  fontSize: "13px",
  fontWeight: "600",
  color: "#344054",
};

function InterviewsPage() {

  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // { type: "success" | "error", text }
  const [notice, setNotice] = useState(null);
  // interview id -> true when a candidate has submitted it
  const [stats, setStats] = useState({});
  const [tab, setTab] = useState("active");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editError, setEditError] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);


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
        loadStats(data);
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
   * WHICH INTERVIEWS ARE LOCKED
   * ============================================================
   *
   * An interview locks once a candidate has submitted it. The
   * server enforces this too; this just disables the buttons.
   */

  const loadStats = async (list) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/candidates`, {
        credentials: "include",
      });

      if (!res.ok) return;

      const candidates = await res.json();

      if (!Array.isArray(candidates)) return;

      const result = {};

      list.forEach((item) => {
        const mine = candidates.filter((c) =>
          c.interviewId != null
            ? Number(c.interviewId) === Number(item.id)
            : c.interview === item.title
        );

        const status = (c) => String(c.status || "").toLowerCase();

        result[item.id] = {
          total: mine.length,
          submitted: mine.filter((c) => status(c) !== "pending").length,
          awaiting: mine.filter((c) => status(c) === "completed").length,
        };
      });

      setStats(result);
    } catch {
      // Non-fatal: the server still enforces every rule.
    }
  };

  // A candidate has submitted -> questions/settings are locked.
  const isLocked = (id) => (stats[id]?.submitted || 0) > 0;

  // Submitted but not yet shortlisted or rejected -> delete is blocked.
  const awaitingOf = (id) => stats[id]?.awaiting || 0;

  /*
   * ============================================================
   * COPY CANDIDATE LINK
   * ============================================================
   */

  const handleCopyLink = async (interview) => {
    const link = `${window.location.origin}/interview/${interview.interviewToken}`;

    let copied = false;

    try {
      await navigator.clipboard.writeText(link);
      copied = true;
    } catch {
      // Fallback for browsers/contexts without the Clipboard API.
      try {
        const area = document.createElement("textarea");
        area.value = link;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        copied = document.execCommand("copy");
        document.body.removeChild(area);
      } catch {
        copied = false;
      }
    }

    if (copied) {
      setCopiedId(interview.id);
      setNotice(null);
      setTimeout(
        () =>
          setCopiedId((current) =>
            current === interview.id ? null : current
          ),
        2000
      );
    } else {
      setNotice({
        type: "error",
        text: "Couldn't copy automatically. Select the link and copy it manually.",
      });
    }
  };

  /*
   * ============================================================
   * DELETE INTERVIEW
   * ============================================================
   */

  const handleArchive = async (interview) => {
    const confirmed = await confirmAlert({
      title: "Archive interview?",
      text: `"${interview.title}" will move to Archived and its candidate link will stop working. You can restore it at any time.`,
      confirmText: "Archive",
      tone: "primary",
      icon: "archive",
    });

    if (!confirmed) {
      return;
    }

    await changeArchived(interview, "archive", `"${interview.title}" was archived.`);
  };

  const handleRestore = async (interview) => {
    await changeArchived(interview, "restore", `"${interview.title}" was restored. Its candidate link works again.`);
  };

  const changeArchived = async (interview, action, successText) => {
    try {
      setNotice(null);

      const response = await fetch(
        `${API_BASE_URL}/api/interviews/${interview.id}/${action}`,
        { method: "POST", credentials: "include" }
      );

      if (response.status === 401) {
        setNotice({
          type: "error",
          text: "Your session has expired. Please log in again.",
        });
        return;
      }

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Failed to ${action} interview.`);
      }

      const updated = await response.json();

      setInterviews((current) =>
        current.map((item) =>
          item.id === updated.id ? { ...item, ...updated } : item
        )
      );
      setNotice({ type: "success", text: successText });
    } catch (err) {
      console.error(`${action} interview error:`, err);
      setNotice({
        type: "error",
        text: err.message || `Unable to ${action} interview.`,
      });
    }
  };

  const openDelete = (interview) => {
    const waiting = awaitingOf(interview.id);

    if (waiting > 0) {
      setNotice({
        type: "error",
        text: `${waiting} candidate${waiting === 1 ? " is" : "s are"} still awaiting review. Shortlist or reject them before deleting this interview.`,
      });
      return;
    }

    setNotice(null);
    setDeleteTarget(interview);
    setDeleteConfirmText("");
    setDeleteError("");
  };

  const closeDelete = () => {
    if (deleting) return;
    setDeleteTarget(null);
    setDeleteConfirmText("");
    setDeleteError("");
  };

  const confirmDelete = async (event) => {
    event.preventDefault();

    if (
      !deleteTarget ||
      deleteConfirmText.trim() !== (deleteTarget.title || "").trim()
    ) {
      return;
    }

    try {
      setDeleting(true);
      setDeleteError("");

      const response = await fetch(
        `${API_BASE_URL}/api/interviews/${deleteTarget.id}`,
        { method: "DELETE", credentials: "include" }
      );

      if (response.status === 401) {
        setDeleteError("Your session has expired. Please log in again.");
        return;
      }

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to delete interview.");
      }

      const removed = deleteTarget;

      setInterviews((current) =>
        current.filter((item) => item.id !== removed.id)
      );
      setNotice({
        type: "success",
        text: `"${removed.title}" and its candidate data were permanently deleted.`,
      });
      setDeleteTarget(null);
      setDeleteConfirmText("");
    } catch (err) {
      console.error("Delete interview error:", err);
      setDeleteError(err.message || "Unable to delete interview.");
    } finally {
      setDeleting(false);
    }
  };

  /*
   * ============================================================
   * EDIT INTERVIEW
   * ============================================================
   */

  const openEdit = (interview) => {
    if (isLocked(interview.id)) {
      setNotice({ type: "error", text: LOCKED_MESSAGE });
      return;
    }

    setEditing(interview);
    setEditError("");
    setEditForm({
      title: interview.title || "",
      position: interview.position || "",
      department: interview.department || "",
      employmentType: interview.employmentType || "",
      location: interview.location || "",
      description: interview.description || "",
      // "" = no limit / unlimited
      answerTimeLimit:
        interview.answerTimeLimit == null
          ? ""
          : String(interview.answerTimeLimit),
      maxRetakes:
        interview.maxRetakes == null ? "" : String(interview.maxRetakes),
      candidateDeadline: toDateTimeLocal(interview.candidateDeadline),
      welcomeMessage: interview.welcomeMessage || "",
      requireConsent: Boolean(interview.requireConsent),
      allowBackNavigation: interview.allowBackNavigation !== false,
    });
  };

  const closeEdit = () => {
    if (savingEdit) return;
    setEditing(null);
    setEditForm(null);
    setEditError("");
  };

  const updateEditField = (name, value) =>
    setEditForm((current) => ({ ...current, [name]: value }));

  const saveEdit = async (event) => {
    event.preventDefault();

    if (!editForm.title.trim()) {
      setEditError("Interview title is required.");
      return;
    }

    const limit =
      editForm.answerTimeLimit === ""
        ? null
        : Number(editForm.answerTimeLimit);
    if (
      limit !== null &&
      (!Number.isInteger(limit) || limit < 10 || limit > 900)
    ) {
      setEditError(
        "Answer time limit must be between 10 and 900 seconds, or left empty."
      );
      return;
    }

    const retakes =
      editForm.maxRetakes === "" ? null : Number(editForm.maxRetakes);
    if (
      retakes !== null &&
      (!Number.isInteger(retakes) || retakes < 0 || retakes > 10)
    ) {
      setEditError(
        "Retakes must be between 0 and 10, or left empty for unlimited."
      );
      return;
    }

    if (editForm.welcomeMessage.length > 1000) {
      setEditError("The welcome message must be 1000 characters or fewer.");
      return;
    }

    try {
      setSavingEdit(true);
      setEditError("");

      const response = await fetch(
        `${API_BASE_URL}/api/interviews/${editing.id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: editForm.title.trim(),
            position: editForm.position,
            department: editForm.department,
            employmentType: editForm.employmentType,
            location: editForm.location,
            description: editForm.description,
            answerTimeLimit: limit,
            maxRetakes: retakes,
            candidateDeadline: editForm.candidateDeadline || null,
            welcomeMessage: editForm.welcomeMessage,
            requireConsent: editForm.requireConsent,
            allowBackNavigation: editForm.allowBackNavigation,
          }),
        }
      );

      if (response.status === 401) {
        setEditError("Your session has expired. Please log in again.");
        return;
      }

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to save changes.");
      }

      const updated = await response.json();

      setInterviews((current) =>
        current.map((item) =>
          item.id === updated.id ? { ...item, ...updated } : item
        )
      );

      setNotice({
        type: "success",
        text: `"${updated.title}" was updated.`,
      });
      setEditing(null);
      setEditForm(null);
    } catch (err) {
      console.error("Update interview error:", err);
      setEditError(err.message || "Unable to save changes.");
    } finally {
      setSavingEdit(false);
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


  const isArchivedItem = (item) => item.status === "Archived";
  const activeCount = interviews.filter((i) => !isArchivedItem(i)).length;
  const archivedCount = interviews.length - activeCount;
  const visibleInterviews = interviews.filter((i) =>
    tab === "archived" ? isArchivedItem(i) : !isArchivedItem(i)
  );

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


      {notice && (
        <div
          role="status"
          style={{
            marginBottom: "16px",
            padding: "12px 16px",
            borderRadius: "10px",
            fontSize: "14px",
            background: notice.type === "success" ? "#ecfdf3" : "#fef3f2",
            border: `1px solid ${
              notice.type === "success" ? "#abefc6" : "#fecdca"
            }`,
            color: notice.type === "success" ? "#067647" : "#b42318",
          }}
        >
          {notice.text}
        </div>
      )}

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


      {!loading && !error && interviews.length > 0 && (
        <div
          role="tablist"
          style={{ display: "flex", gap: "8px", marginBottom: "16px" }}
        >
          {[
            ["active", `Active (${activeCount})`],
            ["archived", `Archived (${archivedCount})`],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              style={{
                padding: "8px 16px",
                borderRadius: "999px",
                border: "1px solid",
                borderColor: tab === key ? "#21409a" : "#d0d5dd",
                background: tab === key ? "#21409a" : "#ffffff",
                color: tab === key ? "#ffffff" : "#344054",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {!loading &&
        !error &&
        interviews.length > 0 &&
        visibleInterviews.length === 0 && (
          <p style={{ color: "#64748b" }}>
            {tab === "archived"
              ? "No archived interviews."
              : "No active interviews. Restore one from the Archived tab or create a new interview."}
          </p>
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

            {visibleInterviews.map((interview) => (

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
                      {interview.status === "Archived" && (
                        <span
                          style={{
                            marginLeft: "10px",
                            padding: "3px 10px",
                            borderRadius: "999px",
                            background: "#f2f4f7",
                            color: "#475569",
                            fontSize: "12px",
                            fontWeight: "600",
                            verticalAlign: "middle",
                          }}
                        >
                          Archived
                        </span>
                      )}

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

                    {interview.status === "Archived" ? (
                      <span
                        style={{
                          marginLeft: "auto",
                          fontSize: "13px",
                          color: "#b42318",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Link closed
                      </span>
                    ) : (
                      <button
                      type="button"
                      onClick={() => handleCopyLink(interview)}
                      style={{
                        ...buttonStyle,
                        marginLeft: "auto",
                        padding: "7px 12px",
                        fontSize: "13px",
                        border: "1px solid #c7d2fe",
                        background: "#eef2ff",
                        color: "#21409a",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {copiedId === interview.id ? (
                        <>
                          <HiOutlineCheck size={16} />
                          Copied!
                        </>
                      ) : (
                        <>
                          <HiOutlineClipboardDocument size={16} />
                          Copy link
                        </>
                      )}
                    </button>
                    )}
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

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => openEdit(interview)}
                    disabled={Boolean(isLocked(interview.id))}
                    title={
                      isLocked(interview.id)
                        ? LOCKED_MESSAGE
                        : "Edit interview"
                    }
                    style={{
                      ...buttonStyle,
                      border: "1px solid #d0d5dd",
                      background: "#ffffff",
                      color: "#344054",
                      opacity: isLocked(interview.id) ? 0.5 : 1,
                      cursor: isLocked(interview.id)
                        ? "not-allowed"
                        : "pointer",
                    }}
                  >
                    {isLocked(interview.id) ? (
                      <HiOutlineLockClosed size={18} />
                    ) : (
                      <HiOutlinePencilSquare size={18} />
                    )}
                    Edit
                  </button>

                  {/* Archive / Restore */}
                  {interview.status === "Archived" ? (
                    <button
                      type="button"
                      onClick={() => handleRestore(interview)}
                      style={{
                        ...buttonStyle,
                        border: "1px solid #abefc6",
                        background: "#ecfdf3",
                        color: "#067647",
                      }}
                    >
                      <HiOutlineArrowUturnLeft size={18} />
                      Restore
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleArchive(interview)}
                      title="Close the candidate link and move this interview to Archived"
                      style={{
                        ...buttonStyle,
                        border: "1px solid #d0d5dd",
                        background: "#ffffff",
                        color: "#344054",
                      }}
                    >
                      <HiOutlineArchiveBox size={18} />
                      Archive
                    </button>
                  )}

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => openDelete(interview)}
                    title={
                      awaitingOf(interview.id) > 0
                        ? "Shortlist or reject the candidates awaiting review first"
                        : "Permanently delete this interview and its candidate data"
                    }
                    style={{
                      ...buttonStyle,
                      border: "1px solid #fecdca",
                      background: "#ffffff",
                      color: "#b42318",
                      opacity: awaitingOf(interview.id) > 0 ? 0.5 : 1,
                      cursor:
                        awaitingOf(interview.id) > 0
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    {awaitingOf(interview.id) > 0 ? (
                      <HiOutlineLockClosed size={18} />
                    ) : (
                      <HiOutlineTrash size={18} />
                    )}
                    Delete
                  </button>

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

      {/* ========================================================
          DELETE MODAL
      ========================================================= */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Delete interview"
          onClick={closeDelete}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(16, 24, 40, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            zIndex: 1000,
          }}
        >
          <form
            noValidate
            onSubmit={confirmDelete}
            onClick={(event) => event.stopPropagation()}
            style={{
              background: "#ffffff",
              borderRadius: "14px",
              padding: "24px",
              width: "100%",
              maxWidth: "480px",
              boxSizing: "border-box",
            }}
          >
            <h2
              style={{
                margin: "0 0 12px",
                color: "#b42318",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <HiOutlineExclamationTriangle size={24} />
              Delete interview permanently?
            </h2>

            <p style={{ margin: "0 0 10px", color: "#344054", fontSize: "14px" }}>
              This will permanently delete <strong>{deleteTarget.title}</strong>
              {stats[deleteTarget.id]?.total
                ? `, its ${stats[deleteTarget.id].total} candidate${
                    stats[deleteTarget.id].total === 1 ? "" : "s"
                  }`
                : ""}
              , their answers and their recorded videos. This can't be undone.
            </p>

            <p style={{ margin: "0 0 14px", color: "#475569", fontSize: "13px" }}>
              If you only want to stop new candidates, use Archive instead. It
              keeps everything.
            </p>

            {deleteError && (
              <div
                role="alert"
                style={{
                  marginBottom: "14px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "#fef3f2",
                  border: "1px solid #fecdca",
                  color: "#b42318",
                  fontSize: "14px",
                }}
              >
                {deleteError}
              </div>
            )}

            <label style={labelStyle} htmlFor="delete-confirm">
              Type the interview title to confirm
            </label>
            <input
              id="delete-confirm"
              style={fieldStyle}
              autoComplete="off"
              placeholder={deleteTarget.title}
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "20px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={closeDelete}
                disabled={deleting}
                style={{
                  ...buttonStyle,
                  border: "1px solid #d0d5dd",
                  background: "#ffffff",
                  color: "#344054",
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  deleting ||
                  deleteConfirmText.trim() !==
                    (deleteTarget.title || "").trim()
                }
                style={{
                  ...buttonStyle,
                  border: "none",
                  background: "#d92d20",
                  color: "#ffffff",
                  opacity:
                    deleting ||
                    deleteConfirmText.trim() !==
                      (deleteTarget.title || "").trim()
                      ? 0.5
                      : 1,
                }}
              >
                {deleting ? "Deleting..." : "Delete permanently"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================
          EDIT MODAL
      ========================================================= */}
      {editing && editForm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Edit interview"
          onClick={closeEdit}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(16, 24, 40, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            zIndex: 1000,
          }}
        >
          <form
            noValidate
            onSubmit={saveEdit}
            onClick={(event) => event.stopPropagation()}
            style={{
              background: "#ffffff",
              borderRadius: "14px",
              padding: "24px",
              width: "100%",
              maxWidth: "640px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxSizing: "border-box",
            }}
          >
            <h2 style={{ margin: "0 0 18px", color: "#173b8f" }}>
              Edit Interview
            </h2>

            {editError && (
              <div
                role="alert"
                style={{
                  marginBottom: "16px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "#fef3f2",
                  border: "1px solid #fecdca",
                  color: "#b42318",
                  fontSize: "14px",
                }}
              >
                {editError}
              </div>
            )}

            <div style={{ display: "grid", gap: "14px" }}>
              <div>
                <label style={labelStyle} htmlFor="edit-title">
                  Interview title *
                </label>
                <input
                  id="edit-title"
                  style={fieldStyle}
                  value={editForm.title}
                  onChange={(e) => updateEditField("title", e.target.value)}
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="edit-position">
                  Position
                </label>
                <input
                  id="edit-position"
                  style={fieldStyle}
                  value={editForm.position}
                  onChange={(e) => updateEditField("position", e.target.value)}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "14px",
                }}
              >
                <div>
                  <label style={labelStyle} htmlFor="edit-department">
                    Department
                  </label>
                  <select
                    id="edit-department"
                    style={fieldStyle}
                    value={editForm.department}
                    onChange={(e) =>
                      updateEditField("department", e.target.value)
                    }
                  >
                    <option value="">Select department</option>
                    {editForm.department &&
                      !DEPARTMENTS.includes(editForm.department) && (
                        <option value={editForm.department}>
                          {editForm.department}
                        </option>
                      )}
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle} htmlFor="edit-type">
                    Employment type
                  </label>
                  <select
                    id="edit-type"
                    style={fieldStyle}
                    value={editForm.employmentType}
                    onChange={(e) =>
                      updateEditField("employmentType", e.target.value)
                    }
                  >
                    <option value="">Select type</option>
                    {editForm.employmentType &&
                      !EMPLOYMENT_TYPES.includes(editForm.employmentType) && (
                        <option value={editForm.employmentType}>
                          {editForm.employmentType}
                        </option>
                      )}
                    {EMPLOYMENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle} htmlFor="edit-location">
                  Location
                </label>
                <input
                  id="edit-location"
                  style={fieldStyle}
                  value={editForm.location}
                  onChange={(e) => updateEditField("location", e.target.value)}
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="edit-description">
                  Description
                </label>
                <textarea
                  id="edit-description"
                  rows={4}
                  style={{ ...fieldStyle, resize: "vertical" }}
                  value={editForm.description}
                  onChange={(e) =>
                    updateEditField("description", e.target.value)
                  }
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "14px",
                }}
              >
                <div>
                  <label style={labelStyle} htmlFor="edit-limit">
                    Answer time limit (seconds)
                  </label>
                  <input
                    id="edit-limit"
                    type="number"
                    min="10"
                    max="900"
                    placeholder="No limit"
                    style={fieldStyle}
                    value={editForm.answerTimeLimit}
                    onChange={(e) =>
                      updateEditField("answerTimeLimit", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label style={labelStyle} htmlFor="edit-retakes">
                    Retakes per question
                  </label>
                  <input
                    id="edit-retakes"
                    type="number"
                    min="0"
                    max="10"
                    placeholder="Unlimited"
                    style={fieldStyle}
                    value={editForm.maxRetakes}
                    onChange={(e) =>
                      updateEditField("maxRetakes", e.target.value)
                    }
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle} htmlFor="edit-deadline">
                  Candidate deadline
                </label>
                <input
                  id="edit-deadline"
                  type="datetime-local"
                  style={fieldStyle}
                  value={editForm.candidateDeadline}
                  onChange={(e) =>
                    updateEditField("candidateDeadline", e.target.value)
                  }
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="edit-welcome">
                  Welcome message
                </label>
                <textarea
                  id="edit-welcome"
                  rows={3}
                  style={{ ...fieldStyle, resize: "vertical" }}
                  value={editForm.welcomeMessage}
                  onChange={(e) =>
                    updateEditField("welcomeMessage", e.target.value)
                  }
                />
              </div>

              <label style={{ display: "flex", gap: "8px", fontSize: "14px" }}>
                <input
                  type="checkbox"
                  checked={editForm.requireConsent}
                  onChange={(e) =>
                    updateEditField("requireConsent", e.target.checked)
                  }
                />
                Require candidate consent before starting
              </label>

              <label style={{ display: "flex", gap: "8px", fontSize: "14px" }}>
                <input
                  type="checkbox"
                  checked={editForm.allowBackNavigation}
                  onChange={(e) =>
                    updateEditField("allowBackNavigation", e.target.checked)
                  }
                />
                Allow candidates to go back to earlier questions
              </label>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "22px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={closeEdit}
                disabled={savingEdit}
                style={{
                  ...buttonStyle,
                  border: "1px solid #d0d5dd",
                  background: "#ffffff",
                  color: "#344054",
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={savingEdit}
                style={{
                  ...buttonStyle,
                  border: "none",
                  background: "#21409a",
                  color: "#ffffff",
                  opacity: savingEdit ? 0.7 : 1,
                }}
              >
                {savingEdit ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}


export default InterviewsPage;
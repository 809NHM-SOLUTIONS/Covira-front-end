import "../styles/ManageQuestions.css";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  HiOutlineQuestionMarkCircle,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineLockClosed,
  HiOutlineVideoCamera,
  HiOutlineCheckCircle,
  HiOutlineListBullet,
  HiOutlineXMark,
  HiOutlineArrowLeft,
} from "react-icons/hi2";

const API_BASE_URL = "http://localhost:8081";

const QUESTION_TYPES = [
  { value: "Video", label: "Video", Icon: HiOutlineVideoCamera },
  { value: "Text", label: "Written", Icon: HiOutlinePencilSquare },
  { value: "Yes/No", label: "Yes / No", Icon: HiOutlineCheckCircle },
  { value: "Multiple Choice", label: "Multiple Choice", Icon: HiOutlineListBullet },
];

const TIME_OPTIONS = [
  { label: "1 minute", seconds: 60 },
  { label: "2 minutes", seconds: 120 },
  { label: "3 minutes", seconds: 180 },
  { label: "5 minutes", seconds: 300 },
];

const EMPTY_FORM = {
  text: "",
  type: "Video",
  timeLimit: 120,
  required: true,
  options: ["", ""],
  allowMultiple: false,
};

const formatTimeLimit = (seconds) => {
  if (!seconds) return "No time limit";
  const minutes = Math.floor(seconds / 60);
  return minutes === 1 ? "1 minute" : `${minutes} minutes`;
};

function QuestionsPage() {
  const { interviewId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [locked, setLocked] = useState(false);

  // null = adding a new question, otherwise the id being edited
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  // ============================================================
  // LOAD
  // ============================================================

  const loadLockStatus = async () => {
    if (!interviewId) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/interviews/${interviewId}/questions/locked`,
        { method: "GET", credentials: "include" }
      );

      if (!response.ok) return;

      const data = await response.json();
      setLocked(Boolean(data.locked));
    } catch {
      // Non-fatal: the backend still blocks edits on a locked interview.
    }
  };

  const loadQuestions = async () => {
    if (!interviewId) {
      setError("No interview selected.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/interviews/${interviewId}/questions`,
        { method: "GET", credentials: "include" }
      );

      if (response.status === 401) {
        setError("Your session has expired. Please log in again.");
        return;
      }

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to load questions.");
      }

      const data = await response.json();

      setQuestions(
        data.map((q) => ({
          id: q.id,
          text: q.questionText,
          type: q.questionType,
          timeLimitSeconds: q.timeLimit,
          options: Array.isArray(q.options) ? q.options : [],
          allowMultiple: Boolean(q.allowMultiple),
          required:  q.required !== false,

        }))
      );
    } catch (err) {
      console.error("Load questions error:", err);
      setError(err.message || "Unable to load questions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
    loadLockStatus();
  }, [interviewId]);

  // ============================================================
  // FORM HELPERS
  // ============================================================

  const openAddForm = () => {
    setError("");
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (question) => {
    if (locked) return;

    setError("");
    setEditingId(question.id);
    setForm({
      text: question.text,
      type: question.type,
      timeLimit: question.timeLimitSeconds || 120,
      required: question.required,
      options:
        question.options && question.options.length >= 2
          ? [...question.options]
          : ["", ""],
      allowMultiple: question.allowMultiple,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setError("");
  };

  const setField = (name, value) =>
    setForm((previous) => ({ ...previous, [name]: value }));

  const updateOption = (index, value) =>
    setForm((previous) => ({
      ...previous,
      options: previous.options.map((o, i) => (i === index ? value : o)),
    }));

  const addOption = () =>
    setForm((previous) =>
      previous.options.length >= 6
        ? previous
        : { ...previous, options: [...previous.options, ""] }
    );

  const removeOption = (index) =>
    setForm((previous) =>
      previous.options.length <= 2
        ? previous
        : {
            ...previous,
            options: previous.options.filter((_, i) => i !== index),
          }
    );

  // ============================================================
  // SAVE (ADD OR EDIT)
  // ============================================================

  const saveQuestion = async () => {
    if (locked) {
      setError(
        "This interview has candidate submissions and can no longer be edited."
      );
      return;
    }

    if (!form.text.trim()) {
      setError("Please enter a question.");
      return;
    }

    const isChoice = form.type === "Multiple Choice";
    const cleanOptions = form.options.map((o) => o.trim()).filter(Boolean);

    if (isChoice && cleanOptions.length < 2) {
      setError("Multiple choice questions need at least 2 answer options.");
      return;
    }

    const isEditing = editingId !== null;

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        isEditing
          ? `${API_BASE_URL}/api/interviews/${interviewId}/questions/${editingId}`
          : `${API_BASE_URL}/api/interviews/${interviewId}/questions`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            questionText: form.text.trim(),
            questionType: form.type,
            timeLimit: form.type === "Video" ? Number(form.timeLimit) : null,
            options: isChoice ? cleanOptions : [],
            allowMultiple: isChoice ? form.allowMultiple : false,
         required: form.required,
          }),
        }
      );

      if (response.status === 401) {
        setError("Your session has expired. Please log in again.");
        return;
      }

      if (!response.ok) {
        const message = await response.text();
        throw new Error(
          message ||
            (isEditing
              ? "Failed to update question."
              : "Failed to create question.")
        );
      }

      closeForm();
      setForm(EMPTY_FORM);
      await loadQuestions();
    } catch (err) {
      console.error("Save question error:", err);
      setError(err.message || "Unable to save question.");
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // DELETE
  // ============================================================

  const deleteQuestion = async (id) => {
    if (locked) {
      setError(
        "This interview has candidate submissions and can no longer be edited."
      );
      return;
    }

    if (!window.confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/interviews/${interviewId}/questions/${id}`,
        { method: "DELETE", credentials: "include" }
      );

      if (response.status === 401) {
        setError("Your session has expired. Please log in again.");
        return;
      }

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to delete question.");
      }

      if (editingId === id) closeForm();

      await loadQuestions();
    } catch (err) {
      console.error("Delete question error:", err);
      setError(err.message || "Unable to delete question.");
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  const goBack = () => {
  if (
    showForm &&
    !window.confirm("Leave without saving this question?")
  ) {
    return;
  }

  navigate("/dashboard/interviews");
};

  const isEditing = editingId !== null;

  return (
    <section className="mq-page">
      {/* HEADER */}
      <div className="mq-header">
        <div>
  <button
    type="button"
    className="mq-btn mq-btn-ghost"
    onClick={goBack}
    style={{ marginBottom: 12 }}
  >
    <HiOutlineArrowLeft />
    Back to Interviews
  </button>

  <h1>Manage Questions</h1>
  <p>Create and manage the questions for this interview.</p>
</div>

        {!locked && (
          <button type="button" className="mq-btn mq-btn-primary" onClick={openAddForm}>
            <HiOutlinePlus />
            Add Question
          </button>
        )}
      </div>

      {/* LOCKED */}
      {locked && (
        <div className="mq-locked">
          <HiOutlineLockClosed />
          <div>
            <h3>This interview is locked</h3>
            <p>
              A candidate has completed this interview, so its questions can no
              longer be changed. You can still view them below.
            </p>
          </div>
        </div>
      )}

      {/* ERROR */}
      {error && <div className="mq-error">{error}</div>}

      {/* FORM */}
      {showForm && !locked && (
        <div className="mq-form">
          <div className="mq-form-head">
            <h2>{isEditing ? "Edit Question" : "Add Question"}</h2>
            <p>
              {isEditing
                ? "Update this question. Candidates will see the new version."
                : "Create a question that candidates will answer."}
            </p>
          </div>

          <label className="mq-label">Your question</label>
          <textarea
            className="mq-textarea"
            rows="3"
            value={form.text}
            onChange={(e) => setField("text", e.target.value)}
            placeholder="Example: Tell us about yourself and your experience."
            disabled={saving}
          />

          <label className="mq-label" style={{ marginTop: 18 }}>
            Response type
          </label>
          <div className="mq-types" role="radiogroup" aria-label="Response type">
            {QUESTION_TYPES.map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={form.type === value}
                className={`mq-type ${form.type === value ? "selected" : ""}`}
                onClick={() => setField("type", value)}
                disabled={saving}
              >
                <Icon />
                {label}
              </button>
            ))}
          </div>

          {form.type === "Video" && (
            <>
              <label className="mq-label" style={{ marginTop: 18 }}>
                Answer time
              </label>
              <select
                className="mq-select"
                value={form.timeLimit}
                onChange={(e) => setField("timeLimit", Number(e.target.value))}
                disabled={saving}
              >
                {TIME_OPTIONS.map((t) => (
                  <option key={t.seconds} value={t.seconds}>
                    {t.label}
                  </option>
                ))}
              </select>
            </>
          )}

          {form.type === "Multiple Choice" && (
            <div className="mq-options">
              <label className="mq-label" style={{ marginTop: 18 }}>
                Answer options
              </label>

              {form.options.map((option, i) => (
                <div className="mq-option-row" key={i}>
                  <span className="mq-option-letter">
                    {String.fromCharCode(65 + i)}
                  </span>

                  <input
                    className="mq-option-input"
                    value={option}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    onChange={(e) => updateOption(i, e.target.value)}
                    disabled={saving}
                  />

                  <button
                    type="button"
                    className="mq-icon-btn danger"
                    title="Remove option"
                    onClick={() => removeOption(i)}
                    disabled={form.options.length <= 2 || saving}
                  >
                    <HiOutlineXMark />
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="mq-add-option"
                onClick={addOption}
                disabled={form.options.length >= 6 || saving}
              >
                <HiOutlinePlus /> Add option
              </button>

              <label className="mq-switch" style={{ marginTop: 14 }}>
                <input
                  type="checkbox"
                  checked={form.allowMultiple}
                  onChange={(e) => setField("allowMultiple", e.target.checked)}
                  disabled={saving}
                />
                <span className="mq-switch-track" />
                Allow candidates to select multiple answers
              </label>
            </div>
          )}
          <label className="mq-switch" style={{ marginTop: 18 }}>
  <input
    type="checkbox"
    checked={form.required}
    onChange={(e) => setField("required", e.target.checked)}
    disabled={saving}
  />
  <span className="mq-switch-track" />
  Required question
</label>


          <div className="mq-form-foot">
            <button
              type="button"
              className="mq-btn mq-btn-ghost"
              onClick={closeForm}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="button"
              className="mq-btn mq-btn-primary"
              onClick={saveQuestion}
              disabled={saving}
            >
              {!isEditing && !saving && <HiOutlinePlus />}
              {saving ? "Saving..." : isEditing ? "Save Changes" : "Add Question"}
            </button>
          </div>
        </div>
      )}

      {/* LIST */}
      <div className="mq-card">
        <div className="mq-card-head">
          <h2>Interview Questions</h2>
          <p>
            {questions.length} question{questions.length !== 1 ? "s" : ""}
          </p>
        </div>

        {loading && (
          <div className="mq-empty">
            <HiOutlineQuestionMarkCircle />
            <h3>Loading questions...</h3>
          </div>
        )}

        {!loading && questions.length === 0 && (
          <div className="mq-empty">
            <HiOutlineQuestionMarkCircle />
            <h3>No questions created</h3>
            <p>Add questions that candidates will answer during this interview.</p>

            {!locked && (
              <button type="button" className="mq-btn mq-btn-primary" onClick={openAddForm}>
                <HiOutlinePlus />
                Add Your First Question
              </button>
            )}
          </div>
        )}

        {!loading && questions.length > 0 && (
          <div className="mq-list">
            {questions.map((question, index) => (
              <div
                className={`mq-item ${editingId === question.id ? "editing" : ""}`}
                key={question.id}
              >
                <div className="mq-badge">{index + 1}</div>

                <div className="mq-item-body">
                  <h3>{question.text}</h3>

                  <div className="mq-chips">
  <span className="mq-chip">{question.type}</span>

  <span className="mq-chip">
    {question.required ? "Required" : "Optional"}
  </span>

  {question.type === "Video" && (
    <span className="mq-chip">
      {formatTimeLimit(question.timeLimitSeconds)}
    </span>
  )}

  {question.type === "Multiple Choice" && (
    <span className="mq-chip">
      {question.allowMultiple ? "Select multiple" : "Select one"}
    </span>
  )}
</div>

                  {question.type === "Multiple Choice" && (
                    <ul className="mq-option-preview">
                      {question.options.length === 0 && (
                        <li className="empty">
                          No answer options saved. Edit this question to add some.
                        </li>
                      )}

                      {question.options.map((option, i) => (
                        <li key={i}>
                          <span>{String.fromCharCode(65 + i)}</span>
                          {option}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mq-actions">
                  <button
                    type="button"
                    className="mq-icon-btn"
                    title={locked ? "This interview can no longer be edited" : "Edit question"}
                    onClick={() => openEditForm(question)}
                    disabled={locked}
                  >
                    <HiOutlinePencilSquare />
                  </button>

                  <button
                    type="button"
                    className="mq-icon-btn danger"
                    title={locked ? "This interview can no longer be edited" : "Delete question"}
                    onClick={() => deleteQuestion(question.id)}
                    disabled={locked}
                  >
                    <HiOutlineTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default QuestionsPage;
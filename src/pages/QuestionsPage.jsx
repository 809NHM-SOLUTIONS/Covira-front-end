import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import "../styles/QuestionsPage.css";

const API_URL = "http://localhost:8080/api/questions";

function QuestionsPage() {
  const { employer } = useOutletContext();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [view, setView] = useState("bank");
  const [creationMethod, setCreationMethod] = useState(null);

  const [editingQuestion, setEditingQuestion] = useState(null);

  const [questionForm, setQuestionForm] = useState({
    questionText: "",
    category: "Behavioural",
    difficulty: "Medium",
    responseDuration: 120,
  });

  // --------------------------------------------------
  // LOAD QUESTIONS
  // --------------------------------------------------

  useEffect(() => {
    if (employer?.email) {
      loadQuestions();
    }
  }, [employer?.email]);

  const loadQuestions = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}?email=${encodeURIComponent(employer.email)}`
      );

      if (!response.ok) {
        throw new Error("Failed to load questions.");
      }

      const data = await response.json();

      setQuestions(data);
    } catch (error) {
      console.error("Error loading questions:", error);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // FORM HANDLING
  // --------------------------------------------------

  const handleChange = (event) => {
    const { name, value } = event.target;

    setQuestionForm((current) => ({
      ...current,
      [name]:
        name === "responseDuration"
          ? Number(value)
          : value,
    }));
  };

  // --------------------------------------------------
  // OPEN CREATE QUESTION
  // --------------------------------------------------

  const openCreateQuestion = () => {
    setEditingQuestion(null);

    setQuestionForm({
      questionText: "",
      category: "Behavioural",
      difficulty: "Medium",
      responseDuration: 120,
    });

    setCreationMethod(null);
    setView("method");
  };

  // --------------------------------------------------
  // OPEN MANUAL CREATION
  // --------------------------------------------------

  const openManualCreation = () => {
    setCreationMethod("MANUAL");
    setView("form");
  };

  // --------------------------------------------------
  // OPEN AI CREATION
  // --------------------------------------------------

  const openAICreation = () => {
    setCreationMethod("AI");
    setView("ai");
  };

  // --------------------------------------------------
  // SAVE QUESTION
  // --------------------------------------------------

  const saveQuestion = async () => {
    if (!questionForm.questionText.trim()) {
      alert("Please enter an interview question.");
      return;
    }

    if (!employer?.email) {
      alert("Unable to identify the logged-in employer.");
      return;
    }

    try {
      setSaving(true);

      const questionData = {
        questionText: questionForm.questionText.trim(),
        category: questionForm.category,
        difficulty: questionForm.difficulty,
        responseDuration: questionForm.responseDuration,
        creationMethod: creationMethod || "MANUAL",
        userEmail: employer.email,
      };

      // UPDATE
      if (editingQuestion) {
        const response = await fetch(
          `${API_URL}/${editingQuestion.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(questionData),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update question.");
        }

        const updatedQuestion = await response.json();

        setQuestions((current) =>
          current.map((item) =>
            item.id === updatedQuestion.id
              ? updatedQuestion
              : item
          )
        );

        alert("Question updated successfully.");
      }

      // CREATE
      else {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(questionData),
        });

        if (!response.ok) {
          throw new Error("Failed to save question.");
        }

        const savedQuestion = await response.json();

        setQuestions((current) => [
          ...current,
          savedQuestion,
        ]);

        alert("Question saved successfully.");
      }

      resetForm();
      setView("bank");

    } catch (error) {
      console.error("Question save error:", error);

      alert(
        editingQuestion
          ? "Could not update the question."
          : "Could not save the question."
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // EDIT QUESTION
  // --------------------------------------------------

  const editQuestion = (question) => {
    setEditingQuestion(question);

    setQuestionForm({
      questionText: question.questionText || "",
      category: question.category || "Behavioural",
      difficulty: question.difficulty || "Medium",
      responseDuration:
        question.responseDuration || 120,
    });

    setCreationMethod(
      question.creationMethod || "MANUAL"
    );

    setView("form");
  };

  // --------------------------------------------------
  // DELETE QUESTION
  // --------------------------------------------------

  const deleteQuestion = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this question?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete question.");
      }

      setQuestions((current) =>
        current.filter((question) => question.id !== id)
      );

    } catch (error) {
      console.error("Delete error:", error);

      alert("Could not delete the question.");
    }
  };

  // --------------------------------------------------
  // RESET FORM
  // --------------------------------------------------

  const resetForm = () => {
    setEditingQuestion(null);

    setQuestionForm({
      questionText: "",
      category: "Behavioural",
      difficulty: "Medium",
      responseDuration: 120,
    });

    setCreationMethod(null);
  };

  // --------------------------------------------------
  // BACK TO QUESTION BANK
  // --------------------------------------------------

  const backToBank = () => {
    resetForm();
    setView("bank");
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <section className="module-page questions-page">
        <div className="questions-empty-state">
          <div className="empty-icon">...</div>

          <h2>Loading your questions...</h2>

          <p>
            Please wait while we load your question bank.
          </p>
        </div>
      </section>
    );
  }

  // ==================================================
  // QUESTION BANK
  // ==================================================

  if (view === "bank") {
    return (
      <section className="module-page questions-page">

        <div className="questions-header">

          <div>
            <h1>Question Bank</h1>

            <p>
              Create, organise and manage your interview
              questions.
            </p>
          </div>

          <button
            className="question-primary-btn"
            onClick={openCreateQuestion}
          >
            + Create Question
          </button>

        </div>

        {questions.length === 0 ? (

          <div className="questions-empty-state">

            <div className="empty-icon">?</div>

            <h2>Your question bank is empty</h2>

            <p>
              Create your first interview question manually
              or generate questions with Covira AI.
            </p>

            <button
              className="question-primary-btn"
              onClick={openCreateQuestion}
            >
              + Create Your First Question
            </button>

          </div>

        ) : (

          <div className="question-bank-list">

            <div className="question-bank-toolbar">

              <div>
                <h2>Your Questions</h2>

                <p>
                  {questions.length}{" "}
                  {questions.length === 1
                    ? "question"
                    : "questions"}{" "}
                  in your question bank
                </p>
              </div>

            </div>

            {questions.map((question, index) => (

              <div
                className="question-item"
                key={question.id}
              >

                <div className="question-number">
                  {index + 1}
                </div>

                <div className="question-item-content">

                  <h3>
                    {question.questionText}
                  </h3>

                  <div className="question-meta">

                    <span>
                      {question.category}
                    </span>

                    <span>
                      {question.difficulty}
                    </span>

                    <span>
                      {question.responseDuration} seconds
                    </span>

                    <span>
                      {question.creationMethod === "AI"
                        ? "✨ AI Generated"
                        : "✎ Manual"}
                    </span>

                  </div>

                </div>

               <div className="question-actions">

  <button
    className="question-edit-btn"
    onClick={() => editQuestion(question)}
  >
    Edit
  </button>

  <button
    className="question-delete-btn"
    onClick={() => deleteQuestion(question.id)}
  >
    Delete
  </button>

</div>
              </div>

            ))}

          </div>

        )}

      </section>
    );
  }

  // ==================================================
  // CREATION METHOD
  // ==================================================

  if (view === "method") {
    return (
      <section className="module-page questions-page">

        <button
          className="question-back-btn"
          onClick={backToBank}
        >
          ← Back to Question Bank
        </button>

        <div className="creation-section">

          <div className="creation-title">

            <h2>
              Create an Interview Question
            </h2>

            <p>
              Choose how you would like to create your
              question.
            </p>

          </div>

          <div className="creation-options">

            {/* MANUAL */}

            <div className="creation-card">

              <div className="creation-card-icon manual-icon">
                ✎
              </div>

              <h3>
                Create Manually
              </h3>

              <p>
                Write your own question and control every
                part of the question.
              </p>

              <ul>
                <li>Write your own question</li>
                <li>Choose a category</li>
                <li>Set difficulty</li>
                <li>Set response time</li>
              </ul>

              <button
                className="question-primary-btn"
                onClick={openManualCreation}
              >
                Create Manually
              </button>

            </div>

            {/* AI */}

            <div className="creation-card ai-creation-card">

              <span className="ai-badge">
                AI POWERED
              </span>

              <div className="creation-card-icon ai-icon">
                ✦
              </div>

              <h3>
                Generate with AI
              </h3>

              <p>
                Let Covira help you create relevant
                interview questions based on the role.
              </p>

              <ul>
                <li>Generate multiple questions</li>
                <li>Choose interview focus</li>
                <li>Adjust difficulty</li>
                <li>Review before saving</li>
              </ul>

              <button
                className="question-secondary-btn"
                onClick={openAICreation}
              >
                Generate with AI
              </button>

            </div>

          </div>

          <div className="creation-tip">

            <strong>Good to know:</strong>{" "}
            You can combine manually created and
            AI-generated questions when building an
            interview.

          </div>

        </div>

      </section>
    );
  }

  // ==================================================
  // AI CREATION
  // ==================================================

  if (view === "ai") {
    return (
      <section className="module-page questions-page">

        <button
          className="question-back-btn"
          onClick={() => setView("method")}
        >
          ← Back
        </button>

        <div className="manual-question-section">

          <div className="manual-heading">

            <h2>
              Generate Questions with Covira AI
            </h2>

            <p>
              Tell Covira what kind of interview questions
              you need.
            </p>

          </div>

          <div className="question-form-card">

            <div className="question-form-group">

              <label>
                Job Role
              </label>

              <input
                type="text"
                placeholder="e.g. Software Developer"
              />

            </div>

            <div className="question-form-row">

              <div className="question-form-group">

                <label>
                  Category
                </label>

                <select
                  defaultValue="Behavioural"
                >
                  <option>Behavioural</option>
                  <option>Technical</option>
                  <option>Situational</option>
                  <option>General</option>
                  <option>Culture & Values</option>
                </select>

              </div>

              <div className="question-form-group">

                <label>
                  Difficulty
                </label>

                <select
                  defaultValue="Medium"
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Advanced</option>
                </select>

              </div>

              <div className="question-form-group">

                <label>
                  Number of Questions
                </label>

                <select defaultValue="5">
                  <option value="3">3 Questions</option>
                  <option value="5">5 Questions</option>
                  <option value="10">10 Questions</option>
                </select>

              </div>

            </div>

            <div className="creation-tip">

              <strong>AI generation:</strong>{" "}
              The AI generation service will be connected
              here next. Generated questions will be
              reviewed before they are saved to your
              question bank.

            </div>

            <div className="question-form-actions">

              <button
                className="question-cancel-btn"
                onClick={() => setView("method")}
              >
                Cancel
              </button>

              <button
                className="question-secondary-btn"
                onClick={() =>
                  alert(
                    "AI generation will be connected next."
                  )
                }
              >
                ✦ Generate Questions
              </button>

            </div>

          </div>

        </div>

      </section>
    );
  }

  // ==================================================
  // MANUAL FORM
  // ==================================================

  return (
    <section className="module-page questions-page">

      <button
        className="question-back-btn"
        onClick={() => {
          resetForm();
          setView("method");
        }}
      >
        ← Back
      </button>

      <div className="manual-question-section">

        <div className="manual-heading">

          <h2>
            {editingQuestion
              ? "Edit Question"
              : "Create Question"}
          </h2>

          <p>
            {editingQuestion
              ? "Update your interview question."
              : "Create a question for your interview question bank."}
          </p>

        </div>

        <div className="question-form-card">

          <div className="question-form-group">

            <label>
              Interview Question
            </label>

            <textarea
              name="questionText"
              value={questionForm.questionText}
              onChange={handleChange}
              placeholder="e.g. Tell us about a challenging project you worked on."
              rows="5"
            />

            <span className="field-help">
              Write a clear question that candidates
              can easily understand.
            </span>

          </div>

          <div className="question-form-row">

            <div className="question-form-group">

              <label>
                Category
              </label>

              <select
                name="category"
                value={questionForm.category}
                onChange={handleChange}
              >
                <option>Behavioural</option>
                <option>Technical</option>
                <option>Situational</option>
                <option>General</option>
                <option>Culture & Values</option>
              </select>

            </div>

            <div className="question-form-group">

              <label>
                Difficulty
              </label>

              <select
                name="difficulty"
                value={questionForm.difficulty}
                onChange={handleChange}
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Advanced</option>
              </select>

            </div>

            <div className="question-form-group">

              <label>
                Response Time
              </label>

              <select
                name="responseDuration"
                value={questionForm.responseDuration}
                onChange={handleChange}
              >
                <option value={30}>
                  30 seconds
                </option>

                <option value={60}>
                  1 minute
                </option>

                <option value={90}>
                  1 min 30 sec
                </option>

                <option value={120}>
                  2 minutes
                </option>

                <option value={180}>
                  3 minutes
                </option>

                <option value={300}>
                  5 minutes
                </option>
              </select>

            </div>

          </div>

          <div className="question-form-actions">

            <button
              className="question-cancel-btn"
              onClick={() => {
                resetForm();
                setView("bank");
              }}
            >
              Cancel
            </button>

            <button
              className="question-primary-btn"
              onClick={saveQuestion}
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingQuestion
                ? "Update Question"
                : "Save Question"}
            </button>

          </div>

        </div>

      </div>

    </section>
  );
}

export default QuestionsPage;
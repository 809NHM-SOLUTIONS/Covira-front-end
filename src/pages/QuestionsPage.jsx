import "../styles/QuestionsPage.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
    HiOutlineQuestionMarkCircle,
    HiOutlinePlus,
    HiOutlinePencilSquare,
    HiOutlineTrash
} from "react-icons/hi2";

const API_BASE_URL = "http://localhost:8081";

function QuestionsPage() {

    const { interviewId } = useParams();

    const [questions, setQuestions] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);

    const [saving, setSaving] = useState(false);

    const [newQuestion, setNewQuestion] = useState({
        text: "",
        type: "Video",
        timeLimit: "2 minutes",
        required: true
    });


    /*
     * ============================================================
     * LOAD QUESTIONS
     * ============================================================
     */

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
                {
                    method: "GET",
                    credentials: "include"
                }
            );


            if (response.status === 401) {

                setError(
                    "Your session has expired. Please log in again."
                );

                return;
            }


            if (!response.ok) {

                const message = await response.text();

                throw new Error(
                    message || "Failed to load questions."
                );

            }


            const data = await response.json();


            /*
             * Convert backend question format
             * to the format used by this page.
             */

            const formattedQuestions = data.map((question) => ({
                id: question.id,
                text: question.questionText,
                type: question.questionType,
                timeLimit: formatTimeLimit(question.timeLimit),
                required: true
            }));


            setQuestions(formattedQuestions);


        } catch (err) {

            console.error(
                "Load questions error:",
                err
            );

            setError(
                err.message ||
                "Unable to load questions."
            );


        } finally {

            setLoading(false);

        }

    };


    /*
     * ============================================================
     * LOAD QUESTIONS WHEN PAGE OPENS
     * ============================================================
     */

    useEffect(() => {

        loadQuestions();

    }, [interviewId]);


    /*
     * ============================================================
     * FORMAT TIME LIMIT
     * ============================================================
     */

    const formatTimeLimit = (seconds) => {

        if (!seconds) {
            return "No time limit";
        }


        if (seconds === 60) {
            return "1 minute";
        }


        if (seconds === 120) {
            return "2 minutes";
        }


        if (seconds === 180) {
            return "3 minutes";
        }


        if (seconds === 300) {
            return "5 minutes";
        }


        const minutes = Math.floor(seconds / 60);

        if (minutes === 1) {
            return "1 minute";
        }

        return `${minutes} minutes`;

    };


    /*
     * ============================================================
     * CONVERT TIME LIMIT TO SECONDS
     * ============================================================
     */

    const getTimeLimitSeconds = (timeLimit) => {

        switch (timeLimit) {

            case "1 minute":
                return 60;

            case "2 minutes":
                return 120;

            case "3 minutes":
                return 180;

            case "5 minutes":
                return 300;

            default:
                return 120;

        }

    };


    /*
     * ============================================================
     * HANDLE FORM CHANGES
     * ============================================================
     */

    const handleChange = (e) => {

        const {
            name,
            value,
            type,
            checked
        } = e.target;


        setNewQuestion({
            ...newQuestion,
            [name]:
                type === "checkbox"
                    ? checked
                    : value
        });

    };


    /*
     * ============================================================
     * ADD QUESTION
     * ============================================================
     */

    const addQuestion = async () => {

        if (!newQuestion.text.trim()) {

            setError(
                "Please enter a question."
            );

            return;
        }


        if (!interviewId) {

            setError(
                "No interview selected."
            );

            return;
        }


        try {

            setSaving(true);

            setError("");


            const response = await fetch(
                `${API_BASE_URL}/api/interviews/${interviewId}/questions`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        questionText:
                            newQuestion.text.trim(),

                        questionType:
                            newQuestion.type,

                        timeLimit:
                            getTimeLimitSeconds(
                                newQuestion.timeLimit
                            )
                    })
                }
            );


            if (response.status === 401) {

                setError(
                    "Your session has expired. Please log in again."
                );

                return;
            }


            if (!response.ok) {

                const message = await response.text();

                throw new Error(
                    message || "Failed to create question."
                );

            }


            /*
             * Question was successfully saved.
             */

            await response.json();


            /*
             * Reset form.
             */

            setNewQuestion({
                text: "",
                type: "Video",
                timeLimit: "2 minutes",
                required: true
            });


            setShowForm(false);


            /*
             * Reload from database.
             */

            await loadQuestions();


        } catch (err) {

            console.error(
                "Create question error:",
                err
            );

            setError(
                err.message ||
                "Unable to create question."
            );


        } finally {

            setSaving(false);

        }

    };


    /*
     * ============================================================
     * DELETE QUESTION
     * ============================================================
     */

    const deleteQuestion = async (id) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this question?"
        );


        if (!confirmed) {
            return;
        }


        try {

            setError("");


            const response = await fetch(
                `${API_BASE_URL}/api/interviews/${interviewId}/questions/${id}`,
                {
                    method: "DELETE",

                    credentials: "include"
                }
            );


            if (response.status === 401) {

                setError(
                    "Your session has expired. Please log in again."
                );

                return;
            }


            if (!response.ok) {

                const message = await response.text();

                throw new Error(
                    message || "Failed to delete question."
                );

            }


            /*
             * Reload questions after deletion.
             */

            await loadQuestions();


        } catch (err) {

            console.error(
                "Delete question error:",
                err
            );

            setError(
                err.message ||
                "Unable to delete question."
            );

        }

    };


    /*
     * ============================================================
     * RENDER
     * ============================================================
     */

    return (

        <section className="questions-page">


            {/* =====================================================
                HEADER
            ====================================================== */}

            <div className="questions-header">

                <div>

                    <h1>
                        Questions
                    </h1>

                    <p>
                        Create and manage questions for this interview.
                    </p>

                </div>


                <button
                    className="add-question-btn"
                    onClick={() => {

                        setError("");

                        setShowForm(true);

                    }}
                    disabled={loading}
                >

                    <HiOutlinePlus />

                    Add Question

                </button>

            </div>


            {/* =====================================================
                INTERVIEW ID
            ====================================================== */}

            <div
                style={{
                    marginBottom: "20px",
                    fontSize: "13px",
                    color: "#64748b"
                }}
            >

                Interview ID: {interviewId}

            </div>


            {/* =====================================================
                ERROR
            ====================================================== */}

            {error && (

                <div
                    style={{
                        marginBottom: "20px",
                        padding: "12px 15px",
                        borderRadius: "8px",
                        background: "#fee2e2",
                        color: "#991b1b",
                        fontSize: "14px"
                    }}
                >

                    {error}

                </div>

            )}


            {/* =====================================================
                QUESTION FORM
            ====================================================== */}

            {showForm && (

                <div className="question-form-card">

                    <div className="question-form-header">

                        <div>

                            <h2>
                                Add Question
                            </h2>

                            <p>
                                Create a question that candidates will answer.
                            </p>

                        </div>

                    </div>


                    <div className="question-form">


                        {/* Question */}

                        <div className="form-group">

                            <label>
                                Question
                            </label>

                            <textarea
                                name="text"
                                value={newQuestion.text}
                                onChange={handleChange}
                                placeholder="Enter your interview question..."
                                rows="4"
                                disabled={saving}
                            />

                        </div>


                        {/* Type + Time */}

                        <div className="question-form-grid">


                            {/* Question Type */}

                            <div className="form-group">

                                <label>
                                    Question Type
                                </label>

                                <select
                                    name="type"
                                    value={newQuestion.type}
                                    onChange={handleChange}
                                    disabled={saving}
                                >

                                    <option value="Video">
                                        Video
                                    </option>

                                    <option value="Text">
                                        Text
                                    </option>

                                    <option value="Multiple Choice">
                                        Multiple Choice
                                    </option>

                                </select>

                            </div>


                            {/* Answer Time */}

                            <div className="form-group">

                                <label>
                                    Answer Time
                                </label>

                                <select
                                    name="timeLimit"
                                    value={newQuestion.timeLimit}
                                    onChange={handleChange}
                                    disabled={saving}
                                >

                                    <option value="1 minute">
                                        1 minute
                                    </option>

                                    <option value="2 minutes">
                                        2 minutes
                                    </option>

                                    <option value="3 minutes">
                                        3 minutes
                                    </option>

                                    <option value="5 minutes">
                                        5 minutes
                                    </option>

                                </select>

                            </div>

                        </div>


                        {/* Required */}

                        <label className="required-option">

                            <input
                                type="checkbox"
                                name="required"
                                checked={newQuestion.required}
                                onChange={handleChange}
                                disabled={saving}
                            />

                            <span>
                                Required question
                            </span>

                        </label>


                        {/* Actions */}

                        <div className="question-form-actions">

                            <button
                                className="cancel-question-btn"
                                onClick={() => {

                                    setShowForm(false);

                                    setError("");

                                }}
                                disabled={saving}
                            >
                                Cancel
                            </button>


                            <button
                                className="save-question-btn"
                                onClick={addQuestion}
                                disabled={saving}
                            >

                                <HiOutlinePlus />

                                {saving
                                    ? "Saving..."
                                    : "Add Question"
                                }

                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* =====================================================
                QUESTIONS CARD
            ====================================================== */}

            <div className="questions-card">


                <div className="questions-card-header">

                    <div>

                        <h2>
                            Interview Questions
                        </h2>

                        <p>

                            {questions.length} question
                            {questions.length !== 1 ? "s" : ""}

                        </p>

                    </div>

                </div>


                {/* =================================================
                    LOADING
                ================================================== */}

                {loading && (

                    <div className="questions-empty">

                        <div className="empty-icon">

                            <HiOutlineQuestionMarkCircle />

                        </div>

                        <h3>
                            Loading questions...
                        </h3>

                        <p>
                            Please wait while the questions are loaded.
                        </p>

                    </div>

                )}


                {/* =================================================
                    EMPTY
                ================================================== */}

                {!loading &&
                    questions.length === 0 && (

                        <div className="questions-empty">

                            <div className="empty-icon">

                                <HiOutlineQuestionMarkCircle />

                            </div>

                            <h3>
                                No questions created
                            </h3>

                            <p>
                                Add questions that candidates will answer
                                during this interview.
                            </p>

                            <button
                                className="add-question-btn"
                                onClick={() => setShowForm(true)}
                            >

                                <HiOutlinePlus />

                                Add Your First Question

                            </button>

                        </div>

                    )}


                {/* =================================================
                    QUESTION LIST
                ================================================== */}

                {!loading &&
                    questions.length > 0 && (

                        <div className="question-list">

                            {questions.map(
                                (question, index) => (

                                    <div
                                        className="question-item"
                                        key={question.id}
                                    >


                                        {/* Number */}

                                        <div className="question-number">

                                            {index + 1}

                                        </div>


                                        {/* Content */}

                                        <div className="question-content">

                                            <h3>
                                                {question.text}
                                            </h3>


                                            <div className="question-meta">

                                                <span>
                                                    {question.type}
                                                </span>


                                                <span>
                                                    {question.timeLimit}
                                                </span>


                                                {question.required && (

                                                    <span>
                                                        Required
                                                    </span>

                                                )}

                                            </div>

                                        </div>


                                        {/* Actions */}

                                        <div className="question-actions">


                                            <button
                                                title="Edit question"
                                                type="button"
                                                disabled
                                            >

                                                <HiOutlinePencilSquare />

                                            </button>


                                            <button
                                                title="Delete question"
                                                type="button"
                                                onClick={() =>
                                                    deleteQuestion(
                                                        question.id
                                                    )
                                                }
                                            >

                                                <HiOutlineTrash />

                                            </button>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

            </div>

        </section>

    );

}

export default QuestionsPage;
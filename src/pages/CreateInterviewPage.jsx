import "../styles/CreateInterviewPage.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    HiOutlineClipboardDocumentList,
    HiOutlineQuestionMarkCircle,
    HiOutlineCog6Tooth,
    HiOutlinePaperAirplane,
    HiOutlinePlus,
    HiOutlineTrash,
    HiOutlineChevronUp,
    HiOutlineChevronDown
} from "react-icons/hi2";

function CreateInterviewPage() {

    const navigate = useNavigate();

    const [step, setStep] = useState(1);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    /*
     * ============================================================
     * INTERVIEW DETAILS
     * ============================================================
     */

    const [interview, setInterview] = useState({
        title: "",
        position: "",
        department: "",
        employmentType: "",
        location: "",
        description: ""
    });


    /*
     * ============================================================
     * INTERVIEW QUESTIONS
     * ============================================================
     */

    const [questions, setQuestions] = useState([
        {
            id: Date.now(),
            question: "",
            type: "Video",
            required: true
        }
    ]);


    /*
     * ============================================================
     * HANDLE INTERVIEW CHANGES
     * ============================================================
     */

    const handleChange = (e) => {

        setInterview({
            ...interview,
            [e.target.name]: e.target.value
        });

    };


    /*
     * ============================================================
     * HANDLE QUESTION CHANGES
     * ============================================================
     */

    const handleQuestionChange = (
        id,
        field,
        value
    ) => {

        setQuestions((currentQuestions) =>
            currentQuestions.map((question) =>
                question.id === id
                    ? {
                        ...question,
                        [field]: value
                    }
                    : question
            )
        );

    };


    /*
     * ============================================================
     * ADD QUESTION
     * ============================================================
     */

    const addQuestion = () => {

        setQuestions((currentQuestions) => [

            ...currentQuestions,

            {
                id:
                    Date.now() +
                    Math.random(),

                question: "",

                type: "Video",

                required: true
            }

        ]);

    };


    /*
     * ============================================================
     * DELETE QUESTION
     * ============================================================
     */

    const deleteQuestion = (id) => {

        if (questions.length === 1) {
            return;
        }

        setQuestions((currentQuestions) =>
            currentQuestions.filter(
                (question) =>
                    question.id !== id
            )
        );

    };


    /*
     * ============================================================
     * MOVE QUESTION UP
     * ============================================================
     */

    const moveQuestionUp = (index) => {

        if (index === 0) {
            return;
        }

        const updatedQuestions = [
            ...questions
        ];

        const currentQuestion =
            updatedQuestions[index];

        updatedQuestions[index] =
            updatedQuestions[index - 1];

        updatedQuestions[index - 1] =
            currentQuestion;

        setQuestions(updatedQuestions);

    };


    /*
     * ============================================================
     * MOVE QUESTION DOWN
     * ============================================================
     */

    const moveQuestionDown = (index) => {

        if (
            index ===
            questions.length - 1
        ) {
            return;
        }

        const updatedQuestions = [
            ...questions
        ];

        const currentQuestion =
            updatedQuestions[index];

        updatedQuestions[index] =
            updatedQuestions[index + 1];

        updatedQuestions[index + 1] =
            currentQuestion;

        setQuestions(updatedQuestions);

    };


    /*
     * ============================================================
     * VALIDATE INTERVIEW DETAILS
     * ============================================================
     */

    const validateDetails = () => {

        if (!interview.title.trim()) {

            setError(
                "Please enter an interview title."
            );

            return false;
        }


        if (!interview.position.trim()) {

            setError(
                "Please enter the job position."
            );

            return false;
        }


        if (!interview.department) {

            setError(
                "Please select a department."
            );

            return false;
        }


        if (!interview.employmentType) {

            setError(
                "Please select an employment type."
            );

            return false;
        }


        if (!interview.location.trim()) {

            setError(
                "Please enter the interview location."
            );

            return false;
        }


        setError("");

        return true;
    };


    /*
     * ============================================================
     * VALIDATE QUESTIONS
     * ============================================================
     */

    const validateQuestions = () => {

        if (questions.length === 0) {

            setError(
                "Please add at least one interview question."
            );

            return false;
        }


        const emptyQuestion =
            questions.find(
                (question) =>
                    !question.question.trim()
            );


        if (emptyQuestion) {

            setError(
                "Please enter text for every interview question."
            );

            return false;
        }


        setError("");

        return true;
    };


    /*
     * ============================================================
     * NEXT STEP
     * ============================================================
     */

    const nextStep = () => {

        setError("");

        setSuccess("");


        if (step === 1) {

            if (!validateDetails()) {
                return;
            }

        }


        if (step === 2) {

            if (!validateQuestions()) {
                return;
            }

        }


        if (step < 4) {

            setStep(
                (currentStep) =>
                    currentStep + 1
            );

        }

    };


    /*
     * ============================================================
     * PREVIOUS STEP
     * ============================================================
     */

    const previousStep = () => {

        setError("");

        setSuccess("");


        if (step > 1) {

            setStep(
                (currentStep) =>
                    currentStep - 1
            );

        }

    };


    /*
     * ============================================================
     * CREATE INTERVIEW + QUESTIONS
     * ============================================================
     */

    const createInterview = async () => {

        /*
         * Make sure details are valid.
         */

        if (!validateDetails()) {

            setStep(1);

            return;
        }


        /*
         * Make sure questions are valid.
         */

        if (!validateQuestions()) {

            setStep(2);

            return;
        }


        setLoading(true);

        setError("");

        setSuccess("");


        try {

            /*
             * ====================================================
             * STEP 1
             * CREATE INTERVIEW
             * ====================================================
             */

            const interviewResponse =
                await fetch(
                    "http://localhost:8081/api/interviews",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        credentials: "include",

                        body: JSON.stringify({

                            title:
                                interview.title,

                            position:
                                interview.position,

                            department:
                                interview.department,

                            employmentType:
                                interview.employmentType,

                            location:
                                interview.location,

                            description:
                                interview.description

                        })
                    }
                );


            /*
             * Try to read the backend response.
             */

            const createdInterview =
                await interviewResponse
                    .json()
                    .catch(() => null);


            /*
             * Check interview creation.
             */

            if (!interviewResponse.ok) {

                if (
                    typeof createdInterview ===
                    "string"
                ) {

                    throw new Error(
                        createdInterview
                    );

                }


                throw new Error(
                    createdInterview?.message ||
                    "Failed to create interview."
                );

            }


            /*
             * ====================================================
             * STEP 2
             * GET CREATED INTERVIEW ID
             * ====================================================
             */

            const interviewId =
                createdInterview?.id;


            if (!interviewId) {

                console.error(
                    "Interview response:",
                    createdInterview
                );

                throw new Error(
                    "Interview was created but no interview ID was returned."
                );

            }


            /*
             * ====================================================
             * STEP 3
             * CREATE QUESTIONS
             * ====================================================
             *
             * Questions are created one by one.
             *
             * The backend automatically determines the
             * question order.
             */

            for (
                const question
                of questions
            ) {

                const questionResponse =
                    await fetch(
                        `http://localhost:8081/api/interviews/${interviewId}/questions`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            credentials:
                                "include",

                            body:
                                JSON.stringify({

                                    questionText:
                                        question.question,

                                    questionType:
                                        question.type,

                                    timeLimit:
                                        null

                                })
                        }
                    );


                const questionData =
                    await questionResponse
                        .json()
                        .catch(() => null);


                /*
                 * Check question creation.
                 */

                if (
                    !questionResponse.ok
                ) {

                    if (
                        typeof questionData ===
                        "string"
                    ) {

                        throw new Error(
                            questionData
                        );

                    }


                    throw new Error(
                        questionData?.message ||
                        "Failed to save interview question."
                    );

                }

            }


            /*
             * ====================================================
             * STEP 4
             * SUCCESS
             * ====================================================
             */

            setSuccess(
                "Interview and questions created successfully."
            );


            /*
             * Navigate back to interviews.
             */

            setTimeout(() => {

                navigate(
                    "/dashboard/interviews"
                );

            }, 1000);


        } catch (err) {

            console.error(
                "Create interview error:",
                err
            );


            setError(
                err.message ||
                "Something went wrong while creating the interview."
            );


        } finally {

            setLoading(false);

        }

    };


    /*
     * ============================================================
     * RENDER
     * ============================================================
     */

    return (

        <div className="create-interview-page">


            {/* ====================================================
                HEADER
            ==================================================== */}

            <div className="create-header">

                <div>

                    <h1>
                        Create Interview
                    </h1>

                    <p>
                        Build professional interview
                        assessments for your candidates
                        in just a few simple steps.
                    </p>

                </div>


                <button
                    className="save-draft"
                    type="button"
                    disabled={loading}
                >
                    Save Draft
                </button>

            </div>


            {/* ====================================================
                PROGRESS
            ==================================================== */}

            <div className="progress-card">


                {/* DETAILS */}

                <div
                    className={`step ${
                        step >= 1
                            ? "active"
                            : ""
                    }`}
                >

                    <div className="step-circle">

                        <HiOutlineClipboardDocumentList />

                    </div>

                    <span>
                        Details
                    </span>

                </div>


                <div className="step-line"></div>


                {/* QUESTIONS */}

                <div
                    className={`step ${
                        step >= 2
                            ? "active"
                            : ""
                    }`}
                >

                    <div className="step-circle">

                        <HiOutlineQuestionMarkCircle />

                    </div>

                    <span>
                        Questions
                    </span>

                </div>


                <div className="step-line"></div>


                {/* SETTINGS */}

                <div
                    className={`step ${
                        step >= 3
                            ? "active"
                            : ""
                    }`}
                >

                    <div className="step-circle">

                        <HiOutlineCog6Tooth />

                    </div>

                    <span>
                        Settings
                    </span>

                </div>


                <div className="step-line"></div>


                {/* PUBLISH */}

                <div
                    className={`step ${
                        step >= 4
                            ? "active"
                            : ""
                    }`}
                >

                    <div className="step-circle">

                        <HiOutlinePaperAirplane />

                    </div>

                    <span>
                        Publish
                    </span>

                </div>

            </div>


            {/* ====================================================
                ERROR
            ==================================================== */}

            {error && (

                <div className="form-error">

                    {error}

                </div>

            )}


            {/* ====================================================
                SUCCESS
            ==================================================== */}

            {success && (

                <div className="form-success">

                    {success}

                </div>

            )}


            {/* ====================================================
                STEP 1
                INTERVIEW DETAILS
            ==================================================== */}

            {step === 1 && (

                <div className="content-card">


                    <div className="card-title">

                        <h2>
                            Interview Details
                        </h2>

                        <p>
                            Enter the basic information
                            for this interview.
                        </p>

                    </div>


                    <div className="form-grid">


                        {/* TITLE */}

                        <div className="form-group">

                            <label>
                                Interview Title
                            </label>

                            <input
                                type="text"
                                name="title"
                                value={
                                    interview.title
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Graduate Software Developer Interview"
                            />

                        </div>


                        {/* POSITION */}

                        <div className="form-group">

                            <label>
                                Job Position
                            </label>

                            <input
                                type="text"
                                name="position"
                                value={
                                    interview.position
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Software Developer"
                            />

                        </div>


                        {/* DEPARTMENT */}

                        <div className="form-group">

                            <label>
                                Department
                            </label>

                            <select
                                name="department"
                                value={
                                    interview.department
                                }
                                onChange={
                                    handleChange
                                }
                            >

                                <option value="">
                                    Select Department
                                </option>

                                <option value="Human Resources">
                                    Human Resources
                                </option>

                                <option value="Information Technology">
                                    Information Technology
                                </option>

                                <option value="Finance">
                                    Finance
                                </option>

                                <option value="Marketing">
                                    Marketing
                                </option>

                            </select>

                        </div>


                        {/* EMPLOYMENT TYPE */}

                        <div className="form-group">

                            <label>
                                Employment Type
                            </label>

                            <select
                                name="employmentType"
                                value={
                                    interview.employmentType
                                }
                                onChange={
                                    handleChange
                                }
                            >

                                <option value="">
                                    Select Employment Type
                                </option>

                                <option value="Full Time">
                                    Full Time
                                </option>

                                <option value="Part Time">
                                    Part Time
                                </option>

                                <option value="Internship">
                                    Internship
                                </option>

                                <option value="Contract">
                                    Contract
                                </option>

                            </select>

                        </div>


                        {/* LOCATION */}

                        <div className="form-group full-width">

                            <label>
                                Location
                            </label>

                            <input
                                type="text"
                                name="location"
                                value={
                                    interview.location
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Johannesburg, South Africa"
                            />

                        </div>


                        {/* DESCRIPTION */}

                        <div className="form-group full-width">

                            <label>
                                Description
                            </label>

                            <textarea
                                rows="6"
                                name="description"
                                value={
                                    interview.description
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Describe this interview assessment..."
                            />

                        </div>

                    </div>

                </div>

            )}


            {/* ====================================================
                STEP 2
                QUESTIONS
            ==================================================== */}

            {step === 2 && (

                <div className="content-card questions-card">


                    {/* HEADER */}

                    <div className="card-title questions-header">

                        <div>

                            <h2>
                                Interview Questions
                            </h2>

                            <p>
                                Create the questions
                                that candidates will
                                answer during this
                                interview.
                            </p>

                        </div>


                        <button
                            type="button"
                            className="add-question-btn"
                            onClick={
                                addQuestion
                            }
                            disabled={loading}
                        >

                            <HiOutlinePlus />

                            Add Question

                        </button>

                    </div>


                    {/* =================================================
                        QUESTION INFORMATION
                    ================================================== */}

                    <div className="question-info">

                        <HiOutlineQuestionMarkCircle />

                        <div>

                            <strong>
                                Build your interview assessment
                            </strong>

                            <p>
                                Add questions in the order
                                you want the candidate to
                                answer them. You can choose
                                whether each question requires
                                a video, text, or yes/no response.
                            </p>

                        </div>

                    </div>


                    {/* =================================================
                        QUESTIONS LIST
                    ================================================== */}

                    <div className="questions-list">

                        {questions.map(
                            (
                                question,
                                index
                            ) => (

                                <div
                                    className="question-card"
                                    key={question.id}
                                >


                                    {/* QUESTION HEADER */}

                                    <div className="question-card-header">


                                        <div className="question-number">

                                            <span>
                                                Question{" "}
                                                {index + 1}
                                            </span>

                                        </div>


                                        <div className="question-actions">


                                            {/* MOVE UP */}

                                            <button
                                                type="button"
                                                title="Move question up"
                                                onClick={() =>
                                                    moveQuestionUp(
                                                        index
                                                    )
                                                }
                                                disabled={
                                                    index ===
                                                        0 ||
                                                    loading
                                                }
                                            >

                                                <HiOutlineChevronUp />

                                            </button>


                                            {/* MOVE DOWN */}

                                            <button
                                                type="button"
                                                title="Move question down"
                                                onClick={() =>
                                                    moveQuestionDown(
                                                        index
                                                    )
                                                }
                                                disabled={
                                                    index ===
                                                        questions.length -
                                                        1 ||
                                                    loading
                                                }
                                            >

                                                <HiOutlineChevronDown />

                                            </button>


                                            {/* DELETE */}

                                            <button
                                                type="button"
                                                title="Delete question"
                                                className="delete-question"
                                                onClick={() =>
                                                    deleteQuestion(
                                                        question.id
                                                    )
                                                }
                                                disabled={
                                                    questions.length ===
                                                        1 ||
                                                    loading
                                                }
                                            >

                                                <HiOutlineTrash />

                                            </button>

                                        </div>

                                    </div>


                                    {/* QUESTION TEXT */}

                                    <div className="form-group">

                                        <label>
                                            Question
                                        </label>

                                        <textarea
                                            rows="4"
                                            value={
                                                question.question
                                            }
                                            onChange={(e) =>
                                                handleQuestionChange(
                                                    question.id,
                                                    "question",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Example: Tell us about yourself and your experience in software development."
                                            disabled={loading}
                                        />

                                    </div>


                                    {/* QUESTION OPTIONS */}

                                    <div className="question-options">


                                        {/* RESPONSE TYPE */}

                                        <div className="form-group">

                                            <label>
                                                Response Type
                                            </label>

                                            <select
                                                value={
                                                    question.type
                                                }
                                                onChange={(e) =>
                                                    handleQuestionChange(
                                                        question.id,
                                                        "type",
                                                        e.target.value
                                                    )
                                                }
                                                disabled={
                                                    loading
                                                }
                                            >

                                                <option value="Video">
                                                    Video Response
                                                </option>

                                                <option value="Text">
                                                    Written Response
                                                </option>

                                                <option value="Yes/No">
                                                    Yes / No
                                                </option>

                                                <option value="Multiple Choice">
                                                    Multiple Choice
                                                </option>

                                            </select>

                                        </div>


                                        {/* REQUIRED */}

                                        <div className="required-option">

                                            <label>

                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        question.required
                                                    }
                                                    onChange={(e) =>
                                                        handleQuestionChange(
                                                            question.id,
                                                            "required",
                                                            e.target.checked
                                                        )
                                                    }
                                                    disabled={
                                                        loading
                                                    }
                                                />

                                                <span>
                                                    Required question
                                                </span>

                                            </label>

                                        </div>

                                    </div>

                                </div>

                            )
                        )}

                    </div>


                    {/* =================================================
                        ADD QUESTION BOTTOM
                    ================================================== */}

                    <button
                        type="button"
                        className="add-question-bottom"
                        onClick={
                            addQuestion
                        }
                        disabled={loading}
                    >

                        <HiOutlinePlus />

                        Add Another Question

                    </button>

                </div>

            )}


            {/* ====================================================
                STEP 3
                SETTINGS
            ==================================================== */}

            {step === 3 && (

                <div className="content-card coming-soon">

                    <h2>
                        Interview Settings
                    </h2>

                    <p>
                        Configure interview duration,
                        candidate permissions, retakes
                        and other settings.
                    </p>

                </div>

            )}


            {/* ====================================================
                STEP 4
                PUBLISH
            ==================================================== */}

            {step === 4 && (

                <div className="content-card publish-card">


                    <h2>
                        Publish Interview
                    </h2>


                    <p>
                        Review your interview and create
                        it when you are ready.
                    </p>


                    <div className="publish-summary">


                        {/* INTERVIEW */}

                        <div>

                            <strong>
                                Interview
                            </strong>

                            <span>
                                {
                                    interview.title ||
                                    "Not specified"
                                }
                            </span>

                        </div>


                        {/* POSITION */}

                        <div>

                            <strong>
                                Position
                            </strong>

                            <span>
                                {
                                    interview.position ||
                                    "Not specified"
                                }
                            </span>

                        </div>


                        {/* DEPARTMENT */}

                        <div>

                            <strong>
                                Department
                            </strong>

                            <span>
                                {
                                    interview.department ||
                                    "Not specified"
                                }
                            </span>

                        </div>


                        {/* QUESTIONS */}

                        <div>

                            <strong>
                                Questions
                            </strong>

                            <span>
                                {questions.length}
                            </span>

                        </div>

                    </div>


                    {/* QUESTION PREVIEW */}

                    <div className="publish-questions">

                        <h3>
                            Interview Questions
                        </h3>


                        {questions.map(
                            (
                                question,
                                index
                            ) => (

                                <div
                                    className="publish-question"
                                    key={question.id}
                                >

                                    <span>
                                        {index + 1}.
                                    </span>

                                    <div>

                                        <strong>
                                            {
                                                question.question ||
                                                "Question not specified"
                                            }
                                        </strong>

                                        <small>
                                            {
                                                question.type
                                            }

                                            {" • "}

                                            {
                                                question.required
                                                    ? "Required"
                                                    : "Optional"
                                            }
                                        </small>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                </div>

            )}


            {/* ====================================================
                NAVIGATION
            ==================================================== */}

            <div className="wizard-buttons">


                {/* PREVIOUS */}

                <button
                    type="button"
                    className="previous-btn"
                    onClick={
                        previousStep
                    }
                    disabled={
                        step === 1 ||
                        loading
                    }
                >
                    ← Previous
                </button>


                {/* NEXT */}

                {step < 4 && (

                    <button
                        type="button"
                        className="next-btn"
                        onClick={
                            nextStep
                        }
                        disabled={
                            loading
                        }
                    >

                        Next →

                    </button>

                )}


                {/* CREATE */}

                {step === 4 && (

                    <button
                        type="button"
                        className="next-btn"
                        onClick={
                            createInterview
                        }
                        disabled={
                            loading
                        }
                    >

                        {loading
                            ? "Creating..."
                            : "Create Interview"
                        }

                    </button>

                )}

            </div>

        </div>

    );
}


/*
 * ================================================================
 * DEFAULT EXPORT
 * ================================================================
 */

export default CreateInterviewPage;
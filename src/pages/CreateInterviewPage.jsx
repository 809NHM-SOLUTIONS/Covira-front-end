import "../styles/CreateInterviewPage.css";
import "../styles/CreateInterviewQuestions.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    HiOutlineClipboardDocumentList,
    HiOutlineQuestionMarkCircle,
    HiOutlinePaperAirplane,
    HiOutlinePlus,
    HiOutlineTrash,
    HiOutlineChevronUp,
    HiOutlineChevronDown,
    HiOutlineCog6Tooth,
    HiOutlineClock,
    HiOutlineArrowPath,
    HiOutlineShieldCheck,
    HiOutlineChatBubbleLeftRight,
    HiOutlineVideoCamera,
    HiOutlineXMark,
    HiOutlinePencilSquare,
    HiOutlineCheckCircle,
    HiOutlineListBullet
} from "react-icons/hi2";

/*
 * ============================================================
 * INTERVIEW SETTINGS: OPTIONS + SMALL UI PIECES
 * ============================================================
 */

const TIME_LIMIT_OPTIONS = [
    { value: 30, label: "30 sec" },
    { value: 60, label: "1 min" },
    { value: 120, label: "2 min" },
    { value: 180, label: "3 min" },
    { value: 300, label: "5 min" },
    { value: null, label: "No limit" }
];

const RETAKE_OPTIONS = [
    { value: 0, label: "None" },
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: null, label: "Unlimited" }
];

const DEFAULT_SETTINGS = {
    // seconds per video answer, null = no limit
    answerTimeLimit: 120,
    // re-records per video question, null = unlimited
    maxRetakes: 1,
    // datetime-local string, "" = no deadline
    candidateDeadline: "",
    welcomeMessage: "",
    requireConsent: true,
    allowBackNavigation: true
};

const QUESTION_TYPES = [
    { value: "Video", label: "Video", Icon: HiOutlineVideoCamera },
    { value: "Text", label: "Written", Icon: HiOutlinePencilSquare },
    { value: "Yes/No", label: "Yes / No", Icon: HiOutlineCheckCircle },
    { value: "Multiple Choice", label: "Multiple Choice", Icon: HiOutlineListBullet }
];

const WELCOME_MAX_LENGTH = 1000;

function formatSeconds(totalSeconds) {

    if (totalSeconds === null) {
        return "No limit";
    }

    if (totalSeconds < 60) {
        return `${totalSeconds} sec`;
    }

    const minutes = totalSeconds / 60;

    return `${Number.isInteger(minutes)
        ? minutes
        : minutes.toFixed(1)} min`;
}

function formatRetakes(maxRetakes) {

    if (maxRetakes === null) {
        return "Unlimited";
    }

    if (maxRetakes === 0) {
        return "None";
    }

    return `${maxRetakes} per question`;
}

function formatDeadline(value) {

    if (!value) {
        return "No deadline";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "No deadline";
    }

    return date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

/* Pill-style single choice control (radio group). */
function SegmentedControl({
    label,
    options,
    value,
    onChange
}) {

    return (
        <div
            className="segmented"
            role="radiogroup"
            aria-label={label}
        >
            {options.map((option) => (
                <button
                    key={String(option.value)}
                    type="button"
                    role="radio"
                    aria-checked={value === option.value}
                    className={`segment ${
                        value === option.value
                            ? "active"
                            : ""
                    }`}
                    onClick={() => onChange(option.value)}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}

/* Row with a title, helper text and an on/off switch. */
function ToggleRow({
    id,
    title,
    description,
    checked,
    onChange
}) {

    return (
        <div className="setting-row">

            <div className="setting-text">
                <h3 id={`${id}-label`}>
                    {title}
                </h3>
                <p>
                    {description}
                </p>
            </div>

            <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-labelledby={`${id}-label`}
                className={`switch ${checked ? "on" : ""}`}
                onClick={() => onChange(!checked)}
            >
                <span className="switch-thumb" />
            </button>

        </div>
    );
}

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
        description: "",
        position: "",
        department: "",
        employmentType: "",
        location: ""
    });


    /*
     * ============================================================
     * INTERVIEW QUESTIONS
     * ============================================================
     */

    const [questions, setQuestions] = useState([
        {
            id: "initial-question",
            question: "",
            type: "Video",
            required: true,
            options: ["", ""],
            allowMultiple: false
        }
    ]);


    /*
     * ============================================================
     * INTERVIEW SETTINGS
     * ============================================================
     */

    const [settings, setSettings] = useState(DEFAULT_SETTINGS);

    const updateSetting = (key, value) => {

        setSettings((current) => ({
            ...current,
            [key]: value
        }));

    };


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

                required: true,

                options: ["", ""],

                allowMultiple: false
            }

        ]);

    };


    /*
     * ============================================================
     * MULTIPLE CHOICE OPTIONS
     * ============================================================
     */

    const updateOption = (qId, optIndex, value) => {

        setQuestions((qs) => qs.map((q) =>
            q.id === qId
                ? {
                    ...q,
                    options: (q.options || []).map((o, i) =>
                        i === optIndex ? value : o
                    )
                }
                : q
        ));

    };

    const addOption = (qId) => {

        setQuestions((qs) => qs.map((q) =>
            q.id === qId && (q.options?.length || 0) < 6
                ? { ...q, options: [...(q.options || []), ""] }
                : q
        ));

    };

    const removeOption = (qId, optIndex) => {

        setQuestions((qs) => qs.map((q) =>
            q.id === qId && (q.options?.length || 0) > 2
                ? { ...q, options: q.options.filter((_, i) => i !== optIndex) }
                : q
        ));

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


        const badChoice = questions.find(
            (q) =>
                q.type === "Multiple Choice" &&
                (q.options || []).filter((o) => o.trim()).length < 2
        );

        if (badChoice) {

            setError(
                "Multiple choice questions need at least 2 answer options."
            );

            return false;
        }


        setError("");

        return true;
    };


    /*
     * ============================================================
     * VALIDATE SETTINGS
     * ============================================================
     */

    const validateSettings = () => {

        if (settings.candidateDeadline) {

            const deadline = new Date(settings.candidateDeadline);

            if (
                Number.isNaN(deadline.getTime()) ||
                deadline.getTime() <= new Date().getTime()
            ) {
                setError(
                    "The candidate deadline must be a date and time in the future."
                );
                return false;
            }
        }

        if (settings.welcomeMessage.length > WELCOME_MAX_LENGTH) {
            setError(
                `The welcome message must be ${WELCOME_MAX_LENGTH} characters or fewer.`
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


        if (step === 3) {

            if (!validateSettings()) {
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

        if (!validateDetails()) {

            setStep(1);

            return;
        }


        if (!validateQuestions()) {

            setStep(2);

            return;
        }


        if (!validateSettings()) {

            setStep(3);

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
                                interview.description,

                            /*
                             * Interview settings
                             */
                            answerTimeLimit:
                                settings.answerTimeLimit,
                            maxRetakes:
                                settings.maxRetakes,
                            candidateDeadline:
                                settings.candidateDeadline || null,
                            welcomeMessage:
                                settings.welcomeMessage.trim() || null,
                            requireConsent:
                                settings.requireConsent,
                            allowBackNavigation:
                                settings.allowBackNavigation

                        })
                    }
                );


            const createdInterview =
                await interviewResponse
                    .json()
                    .catch(() => null);


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

                const isChoice =
                    question.type === "Multiple Choice";

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

                                    /*
                                     * Time limits only apply to video answers.
                                     */
                                    timeLimit:
                                        question.type === "Video"
                                            ? settings.answerTimeLimit
                                            : null,

                                    /*
                                     * Multiple choice only.
                                     */
                                    options:
                                        isChoice
                                            ? (question.options || [])
                                                .map((o) => o.trim())
                                                .filter(Boolean)
                                            : [],

                                    allowMultiple:
                                        isChoice
                                            ? !!question.allowMultiple
                                            : false,

                                            required: question.required !== false
                                })
                        }
                    );


                const questionData =
                    await questionResponse
                        .json()
                        .catch(() => null);


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
const leaveWizard = () => {

    if (loading) {
        return;
    }

    const hasWork =
        Object.values(interview).some((v) => String(v).trim()) ||
        questions.some((q) => q.question.trim());

    if (
        hasWork &&
        !window.confirm(
            "Leave without creating this interview? What you've entered won't be saved."
        )
    ) {
        return;
    }

    navigate("/dashboard/interviews");
};

    /*
     * Derived values for the settings summary.
     */

    const videoCount = questions.filter(
        (q) => q.type === "Video"
    ).length;

    const textCount = questions.filter(
        (q) => q.type === "Text"
    ).length;

    const choiceCount = questions.filter(
        (q) => q.type === "Multiple Choice" || q.type === "Yes/No"
    ).length;

    const maxRecordingSeconds =
        settings.answerTimeLimit === null
            ? null
            : videoCount * settings.answerTimeLimit;


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


            {/* ERROR */}

            {error && (

                <div className="form-error">

                    {error}

                </div>

            )}


            {/* SUCCESS */}

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
                                disabled={loading}
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
                                    Select employment type
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
                <div className="cq-card">

                    <div className="cq-header">
                        <div>
                            <h2>Interview Questions</h2>
                            <p>Build the questions candidates will answer, in order.</p>
                        </div>
                        <button type="button" className="cq-add-btn" onClick={addQuestion} disabled={loading}>
                            <HiOutlinePlus />
                            Add Question
                        </button>
                    </div>

                    <div className="cq-list">
                        {questions.map((question, index) => (
                            <div className="cq-item" key={question.id}>

                                <div className="cq-item-head">
                                    <div className="cq-badge">{index + 1}</div>
                                    <div className="cq-item-title">Question {index + 1}</div>

                                    <div className="cq-tools">
                                        <button type="button" className="cq-tool" title="Move question up"
                                            onClick={() => moveQuestionUp(index)}
                                            disabled={index === 0 || loading}>
                                            <HiOutlineChevronUp />
                                        </button>
                                        <button type="button" className="cq-tool" title="Move question down"
                                            onClick={() => moveQuestionDown(index)}
                                            disabled={index === questions.length - 1 || loading}>
                                            <HiOutlineChevronDown />
                                        </button>
                                        <button type="button" className="cq-tool danger" title="Delete question"
                                            onClick={() => deleteQuestion(question.id)}
                                            disabled={questions.length === 1 || loading}>
                                            <HiOutlineTrash />
                                        </button>
                                    </div>
                                </div>

                                <label className="cq-label">Your question</label>
                                <textarea
                                    className="cq-textarea"
                                    rows="3"
                                    value={question.question}
                                    onChange={(e) => handleQuestionChange(question.id, "question", e.target.value)}
                                    placeholder="Example: Tell us about yourself and your experience in software development."
                                    disabled={loading}
                                />

                                <label className="cq-label" style={{ marginTop: 18 }}>Response type</label>
                                <div className="cq-types" role="radiogroup" aria-label="Response type">
                                    {QUESTION_TYPES.map(({ value, label, Icon }) => (
                                        <button
                                            key={value}
                                            type="button"
                                            role="radio"
                                            aria-checked={question.type === value}
                                            className={`cq-type ${question.type === value ? "selected" : ""}`}
                                            onClick={() => handleQuestionChange(question.id, "type", value)}
                                            disabled={loading}
                                        >
                                            <Icon />
                                            {label}
                                        </button>
                                    ))}
                                </div>

                                {question.type === "Multiple Choice" && (
                                    <div className="cq-options">
                                        <label className="cq-label" style={{ marginTop: 18 }}>Answer options</label>

                                        {(question.options || ["", ""]).map((opt, i) => (
                                            <div className="cq-option-row" key={i}>
                                                <span className="cq-option-letter">{String.fromCharCode(65 + i)}</span>
                                                <input
                                                    className="cq-option-input"
                                                    value={opt}
                                                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                                    onChange={(e) => updateOption(question.id, i, e.target.value)}
                                                    disabled={loading}
                                                />
                                                <button
                                                    type="button"
                                                    className="cq-tool danger"
                                                    title="Remove option"
                                                    onClick={() => removeOption(question.id, i)}
                                                    disabled={(question.options?.length || 0) <= 2 || loading}
                                                >
                                                    <HiOutlineXMark />
                                                </button>
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            className="cq-add-option"
                                            onClick={() => addOption(question.id)}
                                            disabled={(question.options?.length || 0) >= 6 || loading}
                                        >
                                            <HiOutlinePlus /> Add option
                                        </button>

                                        <label className="cq-switch" style={{ marginTop: 14 }}>
                                            <input
                                                type="checkbox"
                                                checked={!!question.allowMultiple}
                                                onChange={(e) =>
                                                    handleQuestionChange(question.id, "allowMultiple", e.target.checked)
                                                }
                                                disabled={loading}
                                            />
                                            <span className="cq-switch-track" />
                                            Allow candidates to select multiple answers
                                        </label>
                                    </div>
                                )}

                                <div className="cq-foot">
                                    <label className="cq-switch">
                                        <input
                                            type="checkbox"
                                            checked={question.required}
                                            onChange={(e) => handleQuestionChange(question.id, "required", e.target.checked)}
                                            disabled={loading}
                                        />
                                        <span className="cq-switch-track" />
                                        Required question
                                    </label>
                                    <span className="cq-hint">
                                        {question.required ? "Candidates must answer this" : "Candidates can skip this"}
                                    </span>
                                </div>

                            </div>
                        ))}
                    </div>

                    <button type="button" className="cq-add-bottom" onClick={addQuestion} disabled={loading}>
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

                <div className="settings-layout">

                    <div className="settings-main">

                        {/* TIMING */}

                        <section className="content-card settings-section">

                            <header className="settings-section-header">
                                <span className="settings-icon">
                                    <HiOutlineClock />
                                </span>
                                <div>
                                    <h2>Timing</h2>
                                    <p>
                                        Set how long candidates have to
                                        answer, and when the link closes.
                                    </p>
                                </div>
                            </header>

                            <div className="setting-row stacked">
                                <div className="setting-text">
                                    <h3>Answer time limit</h3>
                                    <p>
                                        Maximum length of each video answer.
                                        Recording stops automatically when
                                        time runs out.
                                    </p>
                                </div>
                                <SegmentedControl
                                    label="Answer time limit"
                                    options={TIME_LIMIT_OPTIONS}
                                    value={settings.answerTimeLimit}
                                    onChange={(value) =>
                                        updateSetting("answerTimeLimit", value)
                                    }
                                />
                            </div>

                            <div className="setting-row stacked">
                                <div className="setting-text">
                                    <h3>Complete by</h3>
                                    <p>
                                        After this date and time, candidates
                                        can no longer open the interview.
                                        Leave empty for no deadline.
                                    </p>
                                </div>
                                <div className="deadline-control">
                                    <input
                                        type="datetime-local"
                                        aria-label="Candidate deadline"
                                        value={settings.candidateDeadline}
                                        onChange={(e) =>
                                            updateSetting(
                                                "candidateDeadline",
                                                e.target.value
                                            )
                                        }
                                    />
                                    {settings.candidateDeadline && (
                                        <button
                                            type="button"
                                            className="clear-deadline"
                                            onClick={() =>
                                                updateSetting(
                                                    "candidateDeadline",
                                                    ""
                                                )
                                            }
                                        >
                                            <HiOutlineXMark />
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>

                        </section>


                        {/* PERMISSIONS */}

                        <section className="content-card settings-section">

                            <header className="settings-section-header">
                                <span className="settings-icon">
                                    <HiOutlineShieldCheck />
                                </span>
                                <div>
                                    <h2>Candidate permissions</h2>
                                    <p>
                                        Decide what candidates can do
                                        while they take the interview.
                                    </p>
                                </div>
                            </header>

                            <div className="setting-row stacked">
                                <div className="setting-text">
                                    <h3>Retakes</h3>
                                    <p>
                                        How many times a candidate can
                                        re-record a video answer.
                                    </p>
                                </div>
                                <SegmentedControl
                                    label="Retakes per video question"
                                    options={RETAKE_OPTIONS}
                                    value={settings.maxRetakes}
                                    onChange={(value) =>
                                        updateSetting("maxRetakes", value)
                                    }
                                />
                            </div>

                            <ToggleRow
                                id="back-navigation"
                                title="Allow going back"
                                description="Candidates can return to earlier questions before they submit."
                                checked={settings.allowBackNavigation}
                                onChange={(value) =>
                                    updateSetting("allowBackNavigation", value)
                                }
                            />

                            <ToggleRow
                                id="require-consent"
                                title="Require recording consent"
                                description="Candidates must agree to being recorded before they can start."
                                checked={settings.requireConsent}
                                onChange={(value) =>
                                    updateSetting("requireConsent", value)
                                }
                            />

                        </section>


                        {/* WELCOME MESSAGE */}

                        <section className="content-card settings-section">

                            <header className="settings-section-header">
                                <span className="settings-icon">
                                    <HiOutlineChatBubbleLeftRight />
                                </span>
                                <div>
                                    <h2>Welcome message</h2>
                                    <p>
                                        Shown to candidates before they begin.
                                        Use it to explain the process or set
                                        expectations.
                                    </p>
                                </div>
                            </header>

                            <textarea
                                className="welcome-textarea"
                                rows={4}
                                maxLength={WELCOME_MAX_LENGTH}
                                aria-label="Welcome message"
                                placeholder="Hi! Thanks for applying. You'll answer a few short questions on video. Find a quiet spot and take your time."
                                value={settings.welcomeMessage}
                                onChange={(e) =>
                                    updateSetting(
                                        "welcomeMessage",
                                        e.target.value
                                    )
                                }
                            />
                            <span className="char-count">
                                {settings.welcomeMessage.length}
                                {" / "}
                                {WELCOME_MAX_LENGTH}
                            </span>

                        </section>

                    </div>


                    {/* LIVE SUMMARY */}

                    <aside className="settings-summary">

                        <div className="content-card">

                            <h2>
                                <HiOutlineVideoCamera />
                                Candidate experience
                            </h2>

                            <dl>
                                <div>
                                    <dt>Questions</dt>
                                    <dd>
                                        {questions.length}
                                        <small>
                                            {videoCount} video,{" "}
                                            {textCount} text,{" "}
                                            {choiceCount} choice
                                        </small>
                                    </dd>
                                </div>
                                <div>
                                    <dt>Answer limit</dt>
                                    <dd>
                                        {formatSeconds(settings.answerTimeLimit)}
                                    </dd>
                                </div>
                                <div>
                                    <dt>Max recording</dt>
                                    <dd>
                                        {maxRecordingSeconds === null
                                            ? "No limit"
                                            : formatSeconds(maxRecordingSeconds)}
                                    </dd>
                                </div>
                                <div>
                                    <dt>
                                        <HiOutlineArrowPath /> Retakes
                                    </dt>
                                    <dd>{formatRetakes(settings.maxRetakes)}</dd>
                                </div>
                                <div>
                                    <dt>Deadline</dt>
                                    <dd>
                                        {formatDeadline(settings.candidateDeadline)}
                                    </dd>
                                </div>
                                <div>
                                    <dt>Going back</dt>
                                    <dd>
                                        {settings.allowBackNavigation
                                            ? "Allowed"
                                            : "Not allowed"}
                                    </dd>
                                </div>
                                <div>
                                    <dt>Consent</dt>
                                    <dd>
                                        {settings.requireConsent
                                            ? "Required"
                                            : "Not required"}
                                    </dd>
                                </div>
                            </dl>

                        </div>

                    </aside>

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

                        <div>
                            <strong>Interview</strong>
                            <span>{interview.title || "Not specified"}</span>
                        </div>

                        <div>
                            <strong>Position</strong>
                            <span>{interview.position || "Not specified"}</span>
                        </div>

                        <div>
                            <strong>Department</strong>
                            <span>{interview.department || "Not specified"}</span>
                        </div>

                        <div>
                            <strong>Questions</strong>
                            <span>{questions.length}</span>
                        </div>

                        <div>
                            <strong>Answer limit</strong>
                            <span>{formatSeconds(settings.answerTimeLimit)}</span>
                        </div>

                        <div>
                            <strong>Retakes</strong>
                            <span>{formatRetakes(settings.maxRetakes)}</span>
                        </div>

                        <div>
                            <strong>Deadline</strong>
                            <span>{formatDeadline(settings.candidateDeadline)}</span>
                        </div>

                        <div>
                            <strong>Consent</strong>
                            <span>
                                {settings.requireConsent ? "Required" : "Not required"}
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

               <button
    type="button"
    className="previous-btn"
    onClick={step === 1 ? leaveWizard : previousStep}
    disabled={loading}
>
    {step === 1 ? "← Back to Interviews" : "← Previous"}
</button>

                {step < 4 && (

                    <button
                        type="button"
                        className="next-btn"
                        onClick={nextStep}
                        disabled={loading}
                    >
                        Next →
                    </button>

                )}

                {step === 4 && (

                    <button
                        type="button"
                        className="next-btn"
                        onClick={createInterview}
                        disabled={loading}
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
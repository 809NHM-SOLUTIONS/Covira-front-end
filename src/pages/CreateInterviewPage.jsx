import "../styles/CreateInterviewPage.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    HiOutlineClipboardDocumentList,
    HiOutlineQuestionMarkCircle,
    HiOutlinePaperAirplane,
    HiOutlinePlus,
    HiOutlineTrash,
    HiOutlineChevronUp,
    HiOutlineChevronDown,
    HiOutlineMagnifyingGlass,
    HiOutlineCog6Tooth,
    HiOutlineCalendarDays,
} from "react-icons/hi2";

function CreateInterviewPage() {

    const navigate = useNavigate();

    // ============================================================
    // PAGE STATE
    // ============================================================

    const [step, setStep] = useState(1);

    const [loading, setLoading] = useState(false);

    const [questionsLoading, setQuestionsLoading] = useState(true);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    const [searchTerm, setSearchTerm] = useState("");


    // ============================================================
    // INTERVIEW DETAILS
    // ============================================================

    const [interview, setInterview] = useState({
        title: "",
        description: "",

        // Settings
        position: "",
        department: "",
        employmentType: "",
        location: "",
        deadline: "",
        noDeadline: true,
    });


    // ============================================================
    // QUESTION BANK
    // ============================================================

    const [questionBank, setQuestionBank] = useState([]);


    // ============================================================
    // SELECTED QUESTIONS
    // The order in this array is the interview order.
    // ============================================================

    const [selectedQuestions, setSelectedQuestions] = useState([]);


    // ============================================================
    // GET EMPLOYER EMAIL
    // ============================================================

    const getEmployerEmail = () => {

        const possibleKeys = [
            "userEmail",
            "email",
            "employerEmail",
            "loggedInEmail"
        ];

        for (const key of possibleKeys) {

            const value = localStorage.getItem(key);

            if (value && value.trim()) {

                console.log(
                    `Employer email found using "${key}":`,
                    value
                );

                return value.trim();
            }
        }


        const storedUser =
            localStorage.getItem("user");

        if (storedUser) {

            try {

                const user =
                    JSON.parse(storedUser);

                if (user?.email) {

                    console.log(
                        "Employer email found inside user object:",
                        user.email
                    );

                    return user.email.trim();
                }

            } catch (error) {

                console.error(
                    "Could not read stored user:",
                    error
                );
            }
        }


        const storedEmployer =
            localStorage.getItem("employer");

        if (storedEmployer) {

            try {

                const employer =
                    JSON.parse(storedEmployer);

                if (employer?.email) {

                    console.log(
                        "Employer email found inside employer object:",
                        employer.email
                    );

                    return employer.email.trim();
                }

            } catch (error) {

                console.error(
                    "Could not read stored employer:",
                    error
                );
            }
        }


        console.error(
            "NO EMPLOYER EMAIL FOUND IN LOCAL STORAGE"
        );

        return null;
    };


    // ============================================================
    // LOAD ONLY THIS EMPLOYER'S QUESTION BANK
    // ============================================================

    useEffect(() => {

        const loadQuestionBank = async () => {

            const employerEmail =
                getEmployerEmail();

            console.log(
                "Logged-in employer email:",
                employerEmail
            );


            if (!employerEmail) {

                setQuestionsLoading(false);

                setError(
                    "Your employer account could not be identified. Please log in again."
                );

                return;
            }


            try {

                setQuestionsLoading(true);

                setError("");


                const response =
                    await fetch(
                        `http://localhost:8080/api/questions?email=${encodeURIComponent(
                            employerEmail
                        )}`
                    );


                const data =
                    await response
                        .json()
                        .catch(() => []);


                console.log(
                    "Questions returned for employer:",
                    data
                );


                if (!response.ok) {

                    throw new Error(
                        data?.message ||
                        "Failed to load your question bank."
                    );
                }


                setQuestionBank(
                    Array.isArray(data)
                        ? data
                        : []
                );


            } catch (err) {

                console.error(
                    "Question bank error:",
                    err
                );

                setError(
                    err.message ||
                    "Unable to load your question bank."
                );


            } finally {

                setQuestionsLoading(false);
            }
        };


        loadQuestionBank();

    }, []);


    // ============================================================
    // HANDLE INTERVIEW DETAILS + SETTINGS
    // ============================================================

    const handleChange = (e) => {

        const {
            name,
            value,
            type,
            checked
        } = e.target;


        setInterview((current) => ({
            ...current,

            [name]:
                type === "checkbox"
                    ? checked
                    : value
        }));


        setError("");
    };


    // ============================================================
    // CHECK WHETHER QUESTION IS SELECTED
    // ============================================================

    const isQuestionSelected = (questionId) => {

        return selectedQuestions.some(
            (question) =>
                question.id === questionId
        );
    };


    // ============================================================
    // SELECT / REMOVE QUESTION
    // ============================================================

    const toggleQuestion = (question) => {

        setError("");


        if (
            isQuestionSelected(question.id)
        ) {

            setSelectedQuestions(
                (current) =>
                    current.filter(
                        (selected) =>
                            selected.id !== question.id
                    )
            );

            return;
        }


        setSelectedQuestions(
            (current) => [
                ...current,
                question
            ]
        );
    };


    // ============================================================
    // REMOVE SELECTED QUESTION
    // ============================================================

    const removeSelectedQuestion = (questionId) => {

        setSelectedQuestions(
            (current) =>
                current.filter(
                    (question) =>
                        question.id !== questionId
                )
        );
    };


    // ============================================================
    // MOVE QUESTION UP
    // ============================================================

    const moveQuestionUp = (index) => {

        if (index === 0) {
            return;
        }


        const updatedQuestions = [
            ...selectedQuestions
        ];


        const currentQuestion =
            updatedQuestions[index];


        updatedQuestions[index] =
            updatedQuestions[index - 1];


        updatedQuestions[index - 1] =
            currentQuestion;


        setSelectedQuestions(
            updatedQuestions
        );
    };


    // ============================================================
    // MOVE QUESTION DOWN
    // ============================================================

    const moveQuestionDown = (index) => {

        if (
            index ===
            selectedQuestions.length - 1
        ) {
            return;
        }


        const updatedQuestions = [
            ...selectedQuestions
        ];


        const currentQuestion =
            updatedQuestions[index];


        updatedQuestions[index] =
            updatedQuestions[index + 1];


        updatedQuestions[index + 1] =
            currentQuestion;


        setSelectedQuestions(
            updatedQuestions
        );
    };


    // ============================================================
    // SEARCH QUESTION BANK
    // ============================================================

    const filteredQuestions =
        questionBank.filter((question) => {

            const search =
                searchTerm
                    .toLowerCase()
                    .trim();


            if (!search) {
                return true;
            }


            return (
                question.questionText
                    ?.toLowerCase()
                    .includes(search) ||

                question.category
                    ?.toLowerCase()
                    .includes(search) ||

                question.difficulty
                    ?.toLowerCase()
                    .includes(search)
            );
        });


    // ============================================================
    // VALIDATE DETAILS
    // ============================================================

    const validateDetails = () => {

        if (!interview.title.trim()) {

            setError(
                "Please enter an interview title."
            );

            return false;
        }


        setError("");

        return true;
    };


    // ============================================================
    // VALIDATE QUESTIONS
    // ============================================================

    const validateQuestions = () => {

        if (
            selectedQuestions.length === 0
        ) {

            setError(
                "Please select at least one question from your question bank."
            );

            return false;
        }


        setError("");

        return true;
    };


    // ============================================================
    // VALIDATE SETTINGS
    // ============================================================

    const validateSettings = () => {

        if (!interview.position.trim()) {

            setError(
                "Please enter the position for this interview."
            );

            return false;
        }


        if (!interview.department.trim()) {

            setError(
                "Please enter the department for this interview."
            );

            return false;
        }


        if (!interview.employmentType) {

            setError(
                "Please select the employment type."
            );

            return false;
        }


        if (!interview.location.trim()) {

            setError(
                "Please enter the interview location."
            );

            return false;
        }


        // If a deadline has been selected,
        // make sure it is in the future.

        if (
            !interview.noDeadline &&
            interview.deadline
        ) {

            const selectedDate =
                new Date(interview.deadline);


            if (
                selectedDate <= new Date()
            ) {

                setError(
                    "The candidate deadline must be in the future."
                );

                return false;
            }
        }


        setError("");

        return true;
    };


    // ============================================================
    // NEXT STEP
    // ============================================================

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


    // ============================================================
    // PREVIOUS STEP
    // ============================================================

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


    // ============================================================
    // CREATE INTERVIEW
    //
    // NOTE:
    // The settings are currently kept in frontend state.
    // We will connect position, department, employment type,
    // location and deadline to the backend after the frontend
    // flow has been completed.
    // ============================================================

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


        const employerEmail =
            getEmployerEmail();


        if (!employerEmail) {

            setError(
                "Your employer account could not be identified. Please log in again."
            );

            return;
        }


        setLoading(true);

        setError("");

        setSuccess("");


        try {

            const questionIds =
                selectedQuestions.map(
                    (question) =>
                        question.id
                );


            const requestBody = {

                title:
                    interview.title.trim(),

                description:
                    interview.description.trim(),

                employerEmail:
                    employerEmail,

                questionIds:
                    questionIds
            };


            console.log(
                "Creating interview:",
                requestBody
            );


            const response =
                await fetch(
                    "http://localhost:8080/api/interviews",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                requestBody
                            )
                    }
                );


            const data =
                await response
                    .json()
                    .catch(() => null);


            if (!response.ok) {

                if (
                    typeof data ===
                    "string"
                ) {

                    throw new Error(data);
                }


                throw new Error(
                    data?.message ||
                    "Failed to create interview."
                );
            }


            console.log(
                "Interview created successfully:",
                data
            );


            setSuccess(
                "Interview created successfully as a draft."
            );


            setTimeout(() => {

                navigate(
                    "/dashboard/interviews"
                );

            }, 1200);


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


    // ============================================================
    // FORMAT DEADLINE FOR REVIEW
    // ============================================================

    const formatDeadline = () => {

        if (
            interview.noDeadline ||
            !interview.deadline
        ) {

            return "No deadline";
        }


        const date =
            new Date(interview.deadline);


        if (Number.isNaN(date.getTime())) {

            return "No deadline";
        }


        return date.toLocaleString(
            undefined,
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );
    };


    // ============================================================
    // RENDER
    // ============================================================

    return (

        <div className="create-interview-page">


            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="create-header">

                <div>

                    <h1>
                        Create Interview
                    </h1>

                    <p>
                        Build professional interview assessments
                        for your candidates in just a few simple steps.
                    </p>

                </div>


                <button
                    className="save-draft"
                    type="button"
                    disabled={loading}
                    onClick={() => {

                        setSuccess(
                            "Your current interview details are saved on this page."
                        );

                    }}
                >
                    Save Draft
                </button>

            </div>


            {/* ==================================================
                PROGRESS
            ================================================== */}

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


            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (

                <div className="form-error">
                    {error}
                </div>

            )}


            {/* ==================================================
                SUCCESS
            ================================================== */}

            {success && (

                <div className="form-success">
                    {success}
                </div>

            )}


            {/* ==================================================
                STEP 1 — DETAILS
            ================================================== */}

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

                        <div className="form-group full-width">

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


                        <div className="form-group full-width">

                            <label>
                                Description
                            </label>

                            <textarea
                                rows="7"
                                name="description"
                                value={
                                    interview.description
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Describe this interview assessment and what candidates can expect..."
                                disabled={loading}
                            />

                        </div>

                    </div>

                </div>

            )}


            {/* ==================================================
                STEP 2 — QUESTIONS
            ================================================== */}

            {step === 2 && (

                <div className="content-card questions-card">

                    <div className="card-title questions-header">

                        <div>

                            <h2>
                                Select Interview Questions
                            </h2>

                            <p>
                                Choose questions from your
                                question bank for this interview.
                            </p>

                        </div>


                        <div className="selected-count">

                            <HiOutlineQuestionMarkCircle />

                            <span>
                                {selectedQuestions.length}
                            </span>

                            selected

                        </div>

                    </div>


                    {/* INFORMATION */}

                    <div className="question-info">

                        <HiOutlineQuestionMarkCircle />

                        <div>

                            <strong>
                                Build your interview assessment
                            </strong>

                            <p>
                                Select the questions you want
                                candidates to answer. You can
                                arrange the selected questions
                                in the order you prefer.
                            </p>

                        </div>

                    </div>


                    {/* SEARCH */}

                    <div className="question-search">

                        <HiOutlineMagnifyingGlass />

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) =>
                                setSearchTerm(
                                    e.target.value
                                )
                            }
                            placeholder="Search your question bank..."
                            disabled={
                                questionsLoading ||
                                loading
                            }
                        />

                    </div>


                    {/* QUESTION BANK */}

                    <div className="question-bank-section">

                        <div className="section-heading">

                            <h3>
                                Your Question Bank
                            </h3>

                            <span>

                                {
                                    filteredQuestions.length
                                }{" "}

                                question

                                {
                                    filteredQuestions.length !==
                                    1
                                        ? "s"
                                        : ""
                                }

                            </span>

                        </div>


                        {questionsLoading ? (

                            <div className="question-bank-message">

                                <div className="loading-spinner"></div>

                                <p>
                                    Loading your question bank...
                                </p>

                            </div>

                        ) : questionBank.length === 0 ? (

                            <div className="question-bank-empty">

                                <HiOutlineQuestionMarkCircle />

                                <h3>
                                    Your question bank is empty
                                </h3>

                                <p>
                                    Create questions in your
                                    Question Bank first, then
                                    return here to use them.
                                </p>

                                <button
                                    type="button"
                                    className="add-question-btn"
                                    onClick={() =>
                                        navigate(
                                            "/dashboard/questions"
                                        )
                                    }
                                >

                                    <HiOutlinePlus />

                                    Go to Question Bank

                                </button>

                            </div>

                        ) : filteredQuestions.length === 0 ? (

                            <div className="question-bank-message">

                                <p>
                                    No questions match your search.
                                </p>

                            </div>

                        ) : (

                            <div className="question-bank-list">

                                {filteredQuestions.map(
                                    (question) => {

                                        const selected =
                                            isQuestionSelected(
                                                question.id
                                            );


                                        return (

                                            <div
                                                key={
                                                    question.id
                                                }
                                                className={`question-bank-item ${
                                                    selected
                                                        ? "selected"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    toggleQuestion(
                                                        question
                                                    )
                                                }
                                            >

                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        selected
                                                    }
                                                    onChange={() =>
                                                        toggleQuestion(
                                                            question
                                                        )
                                                    }
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                />


                                                <div className="question-bank-content">

                                                    <div className="question-bank-text">

                                                        {
                                                            question.questionText
                                                        }

                                                    </div>


                                                    <div className="question-meta">

                                                        {question.category && (

                                                            <span className="question-category">

                                                                {
                                                                    question.category
                                                                }

                                                            </span>

                                                        )}


                                                        {question.difficulty && (

                                                            <span className="question-difficulty">

                                                                {
                                                                    question.difficulty
                                                                }

                                                            </span>

                                                        )}


                                                        {question.responseDuration && (

                                                            <span className="question-duration">

                                                                {
                                                                    question.responseDuration
                                                                }{" "}
                                                                seconds

                                                            </span>

                                                        )}

                                                    </div>

                                                </div>

                                            </div>

                                        );
                                    }
                                )}

                            </div>

                        )}

                    </div>


                    {/* SELECTED QUESTIONS */}

                    {selectedQuestions.length > 0 && (

                        <div className="selected-questions-section">

                            <div className="section-heading">

                                <div>

                                    <h3>
                                        Interview Order
                                    </h3>

                                    <p>
                                        Candidates will receive
                                        these questions in this order.
                                    </p>

                                </div>

                            </div>


                            <div className="selected-questions-list">

                                {selectedQuestions.map(
                                    (
                                        question,
                                        index
                                    ) => (

                                        <div
                                            key={
                                                question.id
                                            }
                                            className="selected-question-item"
                                        >

                                            <div className="question-number">

                                                {index + 1}

                                            </div>


                                            <div className="selected-question-content">

                                                <strong>
                                                    {
                                                        question.questionText
                                                    }
                                                </strong>

                                                <small>
                                                    {
                                                        question.category ||
                                                        "General"
                                                    }
                                                </small>

                                            </div>


                                            <div className="question-actions">

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
                                                            selectedQuestions.length -
                                                            1 ||
                                                        loading
                                                    }
                                                >

                                                    <HiOutlineChevronDown />

                                                </button>


                                                <button
                                                    type="button"
                                                    title="Remove question"
                                                    className="delete-question"
                                                    onClick={() =>
                                                        removeSelectedQuestion(
                                                            question.id
                                                        )
                                                    }
                                                    disabled={
                                                        loading
                                                    }
                                                >

                                                    <HiOutlineTrash />

                                                </button>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        </div>

                    )}

                </div>

            )}


            {/* ==================================================
                STEP 3 — SETTINGS
            ================================================== */}

            {step === 3 && (

                <div className="content-card">

                    <div className="card-title">

                        <h2>
                            Interview Settings
                        </h2>

                        <p>
                            Add the position details and decide
                            when candidates must complete the interview.
                        </p>

                    </div>


                    <div className="form-grid">


                        {/* POSITION */}

                        <div className="form-group">

                            <label>
                                Position
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
                                placeholder="e.g. Junior Software Developer"
                                disabled={loading}
                            />

                        </div>


                        {/* DEPARTMENT */}

                        <div className="form-group">

                            <label>
                                Department
                            </label>

                            <input
                                type="text"
                                name="department"
                                value={
                                    interview.department
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="e.g. Information Technology"
                                disabled={loading}
                            />

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
                                disabled={loading}
                            >

                                <option value="">
                                    Select employment type
                                </option>

                                <option value="FULL_TIME">
                                    Full-time
                                </option>

                                <option value="PART_TIME">
                                    Part-time
                                </option>

                                <option value="CONTRACT">
                                    Contract
                                </option>

                                <option value="INTERNSHIP">
                                    Internship
                                </option>

                                <option value="TEMPORARY">
                                    Temporary
                                </option>

                            </select>

                        </div>


                        {/* LOCATION */}

                        <div className="form-group">

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
                                placeholder="e.g. Johannesburg / Remote / Hybrid"
                                disabled={loading}
                            />

                        </div>


                        {/* DEADLINE */}

                        <div className="form-group full-width">

                            <label>
                                Candidate Deadline
                            </label>

                            <div className="deadline-input-wrapper">

                                <HiOutlineCalendarDays />

                                <input
                                    type="datetime-local"
                                    name="deadline"
                                    value={
                                        interview.deadline
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={
                                        loading ||
                                        interview.noDeadline
                                    }
                                />

                            </div>


                            <p className="form-help-text">
                                Set the date and time by which
                                candidates must complete this interview.
                            </p>

                        </div>


                        {/* NO DEADLINE */}

                        <div className="form-group full-width">

                            <label className="checkbox-setting">

                                <input
                                    type="checkbox"
                                    name="noDeadline"
                                    checked={
                                        interview.noDeadline
                                    }
                                    onChange={(e) => {

                                        handleChange(e);

                                        if (
                                            e.target.checked
                                        ) {

                                            setInterview(
                                                (current) => ({
                                                    ...current,
                                                    noDeadline: true,
                                                    deadline: ""
                                                })
                                            );
                                        }

                                    }}
                                    disabled={loading}
                                />

                                <span>
                                    No deadline
                                </span>

                            </label>

                            <p className="form-help-text">
                                Candidates can complete the interview
                                at any time if no deadline is selected.
                            </p>

                        </div>


                        {/* DEADLINE INFORMATION */}

                        <div className="question-info full-width">

                            <HiOutlineCalendarDays />

                            <div>

                                <strong>
                                    Candidate deadline
                                </strong>

                                <p>

                                    {interview.noDeadline
                                        ? "There is currently no deadline. You can enable a deadline above."
                                        : interview.deadline
                                            ? `Candidates must complete this interview by ${formatDeadline()}.`
                                            : "Choose a date and time above for the candidate deadline."
                                    }

                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            )}


            {/* ==================================================
                STEP 4 — PUBLISH / REVIEW
            ================================================== */}

            {step === 4 && (

                <div className="content-card publish-card">

                    <div className="card-title">

                        <h2>
                            Review Interview
                        </h2>

                        <p>
                            Review everything before creating
                            the interview.
                        </p>

                    </div>


                    {/* SUMMARY */}

                    <div className="publish-summary">


                        <div>

                            <strong>
                                Interview Title
                            </strong>

                            <span>
                                {
                                    interview.title ||
                                    "Not specified"
                                }
                            </span>

                        </div>


                        <div>

                            <strong>
                                Description
                            </strong>

                            <span>
                                {
                                    interview.description ||
                                    "No description provided"
                                }
                            </span>

                        </div>


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


                        <div>

                            <strong>
                                Employment Type
                            </strong>

                            <span>
                                {
                                    interview.employmentType
                                        ? interview.employmentType
                                            .replace("_", " ")
                                        : "Not specified"
                                }
                            </span>

                        </div>


                        <div>

                            <strong>
                                Location
                            </strong>

                            <span>
                                {
                                    interview.location ||
                                    "Not specified"
                                }
                            </span>

                        </div>


                        <div>

                            <strong>
                                Candidate Deadline
                            </strong>

                            <span>
                                {
                                    formatDeadline()
                                }
                            </span>

                        </div>


                        <div>

                            <strong>
                                Questions
                            </strong>

                            <span>
                                {
                                    selectedQuestions.length
                                }
                            </span>

                        </div>

                    </div>


                    {/* QUESTIONS */}

                    <div className="publish-questions">

                        <h3>
                            Interview Questions
                        </h3>


                        {selectedQuestions.map(
                            (
                                question,
                                index
                            ) => (

                                <div
                                    className="publish-question"
                                    key={
                                        question.id
                                    }
                                >

                                    <span>
                                        {index + 1}.
                                    </span>


                                    <div>

                                        <strong>
                                            {
                                                question.questionText
                                            }
                                        </strong>


                                        <small>

                                            {
                                                question.category ||
                                                "General"
                                            }

                                            {" • "}

                                            {
                                                question.difficulty ||
                                                "Not specified"
                                            }

                                            {
                                                question.responseDuration
                                                    ? ` • ${question.responseDuration} seconds`
                                                    : ""
                                            }

                                        </small>

                                    </div>

                                </div>

                            )
                        )}

                    </div>


                    {/* DRAFT NOTICE */}

                    <div className="draft-notice">

                        <strong>
                            Ready to create?
                        </strong>

                        <p>
                            Your interview will initially be
                            created as a <strong>Draft</strong>.
                            You can publish it later when it
                            is ready to be shared with candidates.
                        </p>

                    </div>

                </div>

            )}


            {/* ==================================================
                NAVIGATION BUTTONS
            ================================================== */}

            <div className="wizard-buttons">


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


                {step < 4 && (

                    <button
                        type="button"
                        className="next-btn"
                        onClick={
                            nextStep
                        }
                        disabled={
                            loading ||
                            (
                                step === 2 &&
                                questionsLoading
                            )
                        }
                    >
                        Next →
                    </button>

                )}


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

export default CreateInterviewPage;
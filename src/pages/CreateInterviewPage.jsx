import "../styles/CreateInterviewPage.css";
import { useState } from "react";
import {
    HiOutlineClipboardDocumentList,
    HiOutlineQuestionMarkCircle,
    HiOutlineCog6Tooth,
    HiOutlinePaperAirplane
} from "react-icons/hi2";

function CreateInterviewPage() {

    const [step, setStep] = useState(1);

    const [interview, setInterview] = useState({
        title: "",
        position: "",
        department: "",
        employmentType: "",
        location: "",
        description: ""
    });

    const nextStep = () => {

        if (step < 4) {

            setStep(step + 1);

        }

    };

    const previousStep = () => {

        if (step > 1) {

            setStep(step - 1);

        }

    };

    const handleChange = (e) => {

        setInterview({

            ...interview,

            [e.target.name]: e.target.value

        });

    };

    return (

        <div className="create-interview-page">

            {/* ================= Header ================= */}

            <div className="create-header">

                <div>

                    <h1>Create Interview</h1>

                    <p>
                        Build professional interview assessments for your
                        candidates in just a few simple steps.
                    </p>

                </div>

                <button className="save-draft">

                    Save Draft

                </button>

            </div>

            {/* ================= Progress ================= */}

            <div className="progress-card">

                <div className={`step ${step >= 1 ? "active" : ""}`}>

                    <div className="step-circle">

                        <HiOutlineClipboardDocumentList />

                    </div>

                    <span>Details</span>

                </div>

                <div className="step-line"></div>

                <div className={`step ${step >= 2 ? "active" : ""}`}>

                    <div className="step-circle">

                        <HiOutlineQuestionMarkCircle />

                    </div>

                    <span>Questions</span>

                </div>

                <div className="step-line"></div>

                <div className={`step ${step >= 3 ? "active" : ""}`}>

                    <div className="step-circle">

                        <HiOutlineCog6Tooth />

                    </div>

                    <span>Settings</span>

                </div>

                <div className="step-line"></div>

                <div className={`step ${step >= 4 ? "active" : ""}`}>

                    <div className="step-circle">

                        <HiOutlinePaperAirplane />

                    </div>

                    <span>Publish</span>

                </div>

            </div>

            {/* ================= Step Content ================= */}

            {step === 1 && (

                <div className="content-card">

                    <div className="card-title">

                        <h2>Interview Details</h2>

                        <p>
                            Enter the basic information for this interview.
                        </p>

                    </div>

                    <div className="form-grid">

                        <div className="form-group">

                            <label>Interview Title</label>

                            <input
                                type="text"
                                name="title"
                                value={interview.title}
                                onChange={handleChange}
                                placeholder="Graduate Software Developer Interview"
                            />

                        </div>

                        <div className="form-group">

                            <label>Job Position</label>

                            <input
                                type="text"
                                name="position"
                                value={interview.position}
                                onChange={handleChange}
                                placeholder="Software Developer"
                            />

                        </div>

                        <div className="form-group">

                            <label>Department</label>

                            <select
                                name="department"
                                value={interview.department}
                                onChange={handleChange}
                            >

                                <option value="">
                                    Select Department
                                </option>

                                <option>
                                    Human Resources
                                </option>

                                <option>
                                    Information Technology
                                </option>

                                <option>
                                    Finance
                                </option>

                                <option>
                                    Marketing
                                </option>

                            </select>

                        </div>

                        <div className="form-group">

                            <label>Employment Type</label>

                            <select
                                name="employmentType"
                                value={interview.employmentType}
                                onChange={handleChange}
                            >

                                <option value="">
                                    Select Employment Type
                                </option>

                                <option>
                                    Full Time
                                </option>

                                <option>
                                    Part Time
                                </option>

                                <option>
                                    Internship
                                </option>

                                <option>
                                    Contract
                                </option>

                            </select>

                        </div>

                        <div className="form-group full-width">

                            <label>Location</label>

                            <input
                                type="text"
                                name="location"
                                value={interview.location}
                                onChange={handleChange}
                                placeholder="Johannesburg, South Africa"
                            />

                        </div>

                        <div className="form-group full-width">

                            <label>Description</label>

                            <textarea

                                rows="6"

                                name="description"

                                value={interview.description}

                                onChange={handleChange}

                                placeholder="Describe this interview assessment..."

                            />

                        </div>

                    </div>

                </div>

            )}

            {/* Temporary Placeholder */}

            {step === 2 && (

                <div className="coming-soon">

                    <h2>Questions</h2>

                    <p>
                        This section will be built in Part 2.
                    </p>

                </div>

            )}

            {step === 3 && (

                <div className="coming-soon">

                    <h2>Interview Settings</h2>

                    <p>
                        This section will be built in Part 3.
                    </p>

                </div>

            )}

            {step === 4 && (

                <div className="coming-soon">

                    <h2>Publish Interview</h2>

                    <p>
                        This section will be built in Part 3.
                    </p>

                </div>

            )}

            {/* ================= Navigation ================= */}

            <div className="wizard-buttons">

                <button

                    className="previous-btn"

                    onClick={previousStep}

                    disabled={step === 1}

                >

                    ← Previous

                </button>

                <button

                    className="next-btn"

                    onClick={nextStep}

                >

                    {step === 4 ? "Finish" : "Next →"}

                </button>

            </div>

        </div>

    );

}

export default CreateInterviewPage;
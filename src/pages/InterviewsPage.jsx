import { useNavigate } from "react-router-dom";

function InterviewsPage() {
    const navigate = useNavigate();

    return (
        <div
            style={{
                minHeight: "100%",
                padding: "35px",
                boxSizing: "border-box",
            }}
        >
            {/* PAGE HEADER */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "35px",
                    gap: "20px",
                }}
            >
                <div>
                    <h1
                        style={{
                            margin: "0 0 8px 0",
                            fontSize: "32px",
                            fontWeight: "700",
                            color: "#173b7a",
                        }}
                    >
                        Interviews
                    </h1>

                    <p
                        style={{
                            margin: 0,
                            fontSize: "16px",
                            color: "#64748b",
                        }}
                    >
                        Create and manage video interviews.
                    </p>
                </div>

                {/* CREATE INTERVIEW BUTTON */}
                <button
                    onClick={() => navigate("/dashboard/interviews/create")}
                    style={{
                        border: "none",
                        borderRadius: "10px",
                        padding: "14px 24px",
                        background:
                            "linear-gradient(135deg, #3155d9, #673de6)",
                        color: "#ffffff",
                        fontSize: "15px",
                        fontWeight: "600",
                        cursor: "pointer",
                        boxShadow: "0 5px 15px rgba(49, 85, 217, 0.25)",
                    }}
                >
                    + Create Interview
                </button>
            </div>

            {/* EMPTY INTERVIEWS CARD */}
            <div
                style={{
                    background: "#ffffff",
                    borderRadius: "18px",
                    minHeight: "250px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    padding: "40px",
                    boxSizing: "border-box",
                    boxShadow: "0 5px 20px rgba(15, 23, 42, 0.05)",
                    border: "1px solid #e5eaf2",
                }}
            >
                {/* ICON */}
                <div
                    style={{
                        width: "65px",
                        height: "65px",
                        borderRadius: "50%",
                        background: "#eef2ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "18px",
                        fontSize: "28px",
                    }}
                >
                    🎥
                </div>

                <h2
                    style={{
                        margin: "0 0 10px 0",
                        fontSize: "24px",
                        fontWeight: "700",
                        color: "#173b7a",
                    }}
                >
                    No interviews created
                </h2>

                <p
                    style={{
                        margin: "0 0 25px 0",
                        fontSize: "15px",
                        color: "#64748b",
                    }}
                >
                    Your employer interviews will appear here.
                </p>

                {/* CREATE INTERVIEW BUTTON */}
                <button
                    onClick={() =>
                        navigate("/dashboard/interviews/create")
                    }
                    style={{
                        border: "none",
                        borderRadius: "10px",
                        padding: "13px 25px",
                        background:
                            "linear-gradient(135deg, #3155d9, #673de6)",
                        color: "#ffffff",
                        fontSize: "15px",
                        fontWeight: "600",
                        cursor: "pointer",
                        boxShadow:
                            "0 5px 15px rgba(49, 85, 217, 0.25)",
                    }}
                >
                    + Create Your First Interview
                </button>
            </div>
        </div>
    );
}

export default InterviewsPage;
import "../styles/AlertModal.css";

function AlertModal({

                        open,
                        type = "success",
                        title,
                        message,
                        buttonText = "OK",
                        onClose

                    }) {

    if (!open) return null;

    const icon = {

        success: "✓",
        error: "✕",
        warning: "!"

    };

    return (

        <div className="alert-overlay">

            <div className="alert-modal">

                <div className={`alert-icon ${type}`}>

                    {icon[type]}

                </div>

                <h2>{title}</h2>

                <p>{message}</p>

                <button
                    className="alert-btn"
                    onClick={onClose}
                >

                    {buttonText}

                </button>

            </div>

        </div>

    );

}

export default AlertModal;
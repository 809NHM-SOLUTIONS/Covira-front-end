import Swal from "sweetalert2";

export const successAlert = (title, text) => {

    return Swal.fire({

        icon: "success",

        title,

        text,

        showConfirmButton: false,

        timer: 1800,

        background: "#ffffff",

        color: "#163047",

        customClass:{

            popup:"covira-popup",
            title:"covira-title",
            htmlContainer:"covira-text",
            confirmButton:"covira-button"

        }

    });

};

export const errorAlert = (title,text)=>{

    return Swal.fire({

        icon:"error",

        title,

        text,

        confirmButtonText:"Try Again",

        confirmButtonColor:"#00A99D",

        background:"#ffffff",

        color:"#163047",

        customClass:{

            popup:"covira-popup",
            title:"covira-title",
            htmlContainer:"covira-text",
            confirmButton:"covira-button"

        }

    });

};

export const warningAlert=(title,text)=>{

    return Swal.fire({

        icon:"warning",

        title,

        text,

        confirmButtonText:"Okay",

        confirmButtonColor:"#00A99D",

        background:"#ffffff",

        color:"#163047",

        customClass:{

            popup:"covira-popup",
            title:"covira-title",
            htmlContainer:"covira-text",
            confirmButton:"covira-button"

        }

    });

};

/*
 * In-app confirmation (replaces the browser's window.confirm popup).
 * Resolves to true when the user confirms, false otherwise.
 *
 * tone: "primary" (teal), "warning" (amber) or "danger" (red).
 * icon:  optional. "archive" shows an archive box; anything else
 *        (or nothing) keeps the default "!" mark.
 */
const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (ch) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    }[ch]));

const ICON_PATHS = {
    // Heroicons "archive-box" (outline)
    archive:
        '<path d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/>',
};

export const confirmAlert = async ({
    title,
    text,
    confirmText = "Confirm",
    cancelText = "Cancel",
    tone = "primary",
    icon = "",
}) => {

    const colours = {
        primary: "#00A99D",
        warning: "#B54708",
        danger: "#E0433D",
    };

    const colour = colours[tone] || colours.primary;

    const badgeClass =
        tone === "danger"
            ? " covira-swal-badge-error"
            : tone === "warning"
            ? " covira-swal-badge-warning"
            : "";

    const result = await Swal.fire({

        html: `
            <div class="covira-swal">
                <div class="covira-swal-badge${badgeClass}">
                    ${
                        ICON_PATHS[icon]
                            ? `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${colour}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[icon]}</svg>`
                            : `<svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                        <path d="M12 7v6M12 17v.01" stroke="${colour}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>`
                    }
                </div>
                <h2>${escapeHtml(title)}</h2>
                <p>${escapeHtml(text)}</p>
            </div>
        `,

        showCancelButton: true,

        confirmButtonText: confirmText,

        cancelButtonText: cancelText,

        confirmButtonColor: tone === "danger" ? "#d33" : "#00A99D",

        cancelButtonColor: "#6b7280",

        background: "#ffffff",

        customClass: {
            popup: "covira-swal-popup",
        },

    });

    return result.isConfirmed;

};
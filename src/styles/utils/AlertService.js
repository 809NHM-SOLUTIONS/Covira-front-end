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
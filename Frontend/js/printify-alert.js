/* =====================================================
   PRINTIFY - REUSABLE SWEETALERT2 HELPER
   Shared notification and confirmation functions.
===================================================== */

(function () {
    "use strict";

    function isSweetAlertAvailable() {
        return typeof window.Swal !== "undefined";
    }

    function popup(options) {
        if (!isSweetAlertAvailable()) {
            console.error("SweetAlert2 is not loaded.");
            return Promise.resolve({ isConfirmed: false });
        }

        return window.Swal.fire({
            customClass: {
                popup: "printify-swal-popup",
                title: "printify-swal-title",
                htmlContainer: "printify-swal-content",
                confirmButton: "printify-swal-confirm",
                cancelButton: "printify-swal-cancel",
                denyButton: "printify-swal-deny"
            },
            buttonsStyling: false,
            backdrop: "rgba(0, 8, 3, 0.30)",
            heightAuto: false,
            scrollbarPadding: false,
            ...options
        });
    }

    window.PrintifyAlert = {

        success: function (title, message) {
            return popup({
                icon: "success",
                title: title || "Success",
                text: message || "",
                confirmButtonText: "Okay"
            });
        },

        error: function (title, message) {
            return popup({
                icon: "error",
                title: title || "Something went wrong",
                text: message || "Please try again.",
                confirmButtonText: "Okay"
            });
        },

        warning: function (title, message) {
            return popup({
                icon: "warning",
                title: title || "Warning",
                text: message || "",
                confirmButtonText: "Okay"
            });
        },

        info: function (title, message) {
            return popup({
                icon: "info",
                title: title || "Information",
                text: message || "",
                confirmButtonText: "Okay"
            });
        },

        confirm: function (title, message, confirmText, cancelText) {
            return popup({
                icon: "question",
                title: title || "Are you sure?",
                text: message || "Please confirm this action.",
                showCancelButton: true,
                confirmButtonText: confirmText || "Yes, continue",
                cancelButtonText: cancelText || "Cancel",
                reverseButtons: true,
                focusCancel: true
            });
        },

        deleteConfirm: function (title, message) {
            return popup({
                icon: "warning",
                title: title || "Delete this record?",
                text: message || "This action cannot be undone.",
                showCancelButton: true,
                confirmButtonText: "Yes, delete",
                cancelButtonText: "Cancel",
                confirmButtonColor: "#d94343",
                reverseButtons: true,
                focusCancel: true
            });
        },

        loading: function (title, message) {
            if (!isSweetAlertAvailable()) return;

            window.Swal.fire({
                title: title || "Please wait...",
                text: message || "Processing your request.",
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                customClass: {
                    popup: "printify-swal-popup",
                    title: "printify-swal-title",
                    htmlContainer: "printify-swal-content"
                },
                didOpen: function () {
                    window.Swal.showLoading();
                }
            });
        },

        close: function () {
            if (isSweetAlertAvailable()) {
                window.Swal.close();
            }
        },

        toast: function (icon, title) {
            if (!isSweetAlertAvailable()) {
                console.log(title || "");
                return;
            }

            return window.Swal.fire({
                toast: true,
                position: "top-end",
                icon: icon || "success",
                title: title || "Done",
                showConfirmButton: false,
                timer: 2500,
                timerProgressBar: true,
                customClass: {
                    popup: "printify-swal-popup",
                    title: "printify-swal-title"
                },
                background: "rgba(7, 29, 15, 0.92)",
                color: "#ffffff"
            });
        }
    };

})();
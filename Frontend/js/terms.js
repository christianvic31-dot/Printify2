
/* ==========================================
   PRINTIFY CALAPAN
   TERMS AND CONDITIONS JAVASCRIPT
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    // Back to registration
    const backButtons = document.querySelectorAll(
        ".back-button, .accept-button"
    );

    backButtons.forEach(function (button) {
        button.addEventListener("click", function (event) {

            const destination = button.getAttribute("href");

            if (!destination) {
                event.preventDefault();
                window.location.href = "register.html";
            }

        });
    });

});

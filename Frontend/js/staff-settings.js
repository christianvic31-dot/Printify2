document.addEventListener("DOMContentLoaded", function () {
    const themeSelect = document.getElementById("themeSelect");
    const settingsMessage = document.getElementById("settingsMessage");
    const form = document.getElementById("passwordForm");
    const passwordMessage = document.getElementById("passwordMessage");
    const changePasswordButton = document.getElementById("changePasswordButton");
    const currentPassword = document.getElementById("currentPassword");
    const newPassword = document.getElementById("newPassword");
    const confirmPassword = document.getElementById("confirmPassword");

    try {
        themeSelect.value = localStorage.getItem("printify-theme") || "light";
    } catch (error) {
        themeSelect.value = "light";
    }

    themeSelect.addEventListener("change", function () {
        const theme = themeSelect.value === "light" ? "light" : "dark";
        document.body.classList.toggle("light-mode", theme === "light");
        document.body.classList.toggle("dark-mode", theme !== "light");
        try {
            localStorage.setItem("printify-theme", theme);
            PrintifyStaff.setMessage(settingsMessage, "Theme preference saved.", "success");
        } catch (error) {
            PrintifyStaff.setMessage(settingsMessage, "Unable to save the theme preference.", "error");
        }
    });

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        if (newPassword.value !== confirmPassword.value) {
            PrintifyStaff.setMessage(passwordMessage, "The new passwords do not match.", "error");
            return;
        }
        if (!/^(?=.*\p{Lu})(?=.*\p{Ll})(?=.*\p{Nd})(?=.*[^\p{L}\p{N}\s])\S{8,128}$/u.test(newPassword.value)) {
            PrintifyStaff.setMessage(passwordMessage, "Use 8-128 characters with uppercase, lowercase, a number, and a symbol; no spaces.", "error");
            return;
        }

        changePasswordButton.disabled = true;
        PrintifyStaff.setMessage(passwordMessage, "Updating password...", "");
        try {
            await PrintifyStaff.request("/api/auth/change-password", "POST", {
                currentPassword: currentPassword.value,
                newPassword: newPassword.value
            });
            form.reset();
            PrintifyStaff.setMessage(passwordMessage, "Password updated.", "success");
        } catch (error) {
            PrintifyStaff.setMessage(passwordMessage, error.message, "error");
        } finally {
            changePasswordButton.disabled = false;
        }
    });
});

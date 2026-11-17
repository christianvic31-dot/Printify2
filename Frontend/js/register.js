
/* ==========================================
   PRINTIFY CALAPAN
   REGISTER PAGE JAVASCRIPT
   BACKEND CONNECTED
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    const API_URL = "/api/auth/register";

    // ELEMENTS
    const registerForm = document.getElementById("registerForm");

    const fullName = document.getElementById("fullName");
    const username = document.getElementById("username");
    const email = document.getElementById("email");
    const setupToken = document.getElementById("setupToken");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");

    const agreeTerms = document.getElementById("agreeTerms");

    const registerMessage = document.getElementById("registerMessage");

    const strengthBar = document.getElementById("strengthBar");
    const strengthText = document.getElementById("strengthText");

    const registerButton = document.getElementById("registerButton");
    const registerButtonText = document.getElementById("registerButtonText");


    // ==========================================
    // 1. PASSWORD VISIBILITY
    // ==========================================

    function setupPasswordToggle(inputId, buttonId) {

        const input = document.getElementById(inputId);
        const button = document.getElementById(buttonId);

        button.addEventListener("click", function () {

            const icon = button.querySelector("i");

            if (input.type === "password") {

                input.type = "text";

                icon.classList.remove("fa-eye-slash");
                icon.classList.add("fa-eye");

                button.setAttribute("aria-label", "Hide password");

            } else {

                input.type = "password";

                icon.classList.remove("fa-eye");
                icon.classList.add("fa-eye-slash");

                button.setAttribute("aria-label", "Show password");

            }

        });

    }

    setupPasswordToggle("password", "togglePassword");
    setupPasswordToggle("confirmPassword", "toggleConfirmPassword");


    // ==========================================
    // 2. PASSWORD REQUIREMENTS
    // ==========================================

    function updateRequirement(id, condition) {

        const element = document.getElementById(id);

        if (element) {
            element.classList.toggle("valid", condition);
        }

    }


    // ==========================================
    // 3. PASSWORD STRENGTH
    // ==========================================

    function checkPasswordStrength(value) {

        let score = 0;

        const hasLength = value.length >= 8;
        const hasUppercase = /[A-Z]/.test(value);
        const hasLowercase = /[a-z]/.test(value);
        const hasNumber = /[0-9]/.test(value);
        const hasSpecial = /[^A-Za-z0-9\s]/.test(value);
        const hasNoSpaces = !/\s/.test(value);

        updateRequirement("lengthRequirement", hasLength);
        updateRequirement("uppercaseRequirement", hasUppercase);
        updateRequirement("lowercaseRequirement", hasLowercase);
        updateRequirement("numberRequirement", hasNumber);
        updateRequirement("specialRequirement", hasSpecial);
        updateRequirement("spaceRequirement", hasNoSpaces);

        if (hasLength) score++;
        if (hasUppercase) score++;
        if (hasLowercase) score++;
        if (hasNumber) score++;
        if (hasSpecial) score++;
        if (hasNoSpaces) score++;

        strengthBar.style.width = (score / 6) * 100 + "%";

        if (value.length === 0) {

            strengthText.textContent = "Password strength";
            strengthBar.style.background = "transparent";

        } else if (score <= 2) {

            strengthText.textContent = "Weak password";
            strengthBar.style.background = "#E74C3C";

        } else if (score <= 4) {

            strengthText.textContent = "Medium password";
            strengthBar.style.background = "#F1C40F";

        } else {

            strengthText.textContent = "Strong password";
            strengthBar.style.background = "#19E51B";

        }

    }

    password.addEventListener("input", function () {
        checkPasswordStrength(password.value);
    });


    // ==========================================
    // 4. ERROR MESSAGES
    // ==========================================

    function clearError(id) {

        const element = document.getElementById(id);

        if (element) {
            element.textContent = "";
        }

    }

    fullName.addEventListener("input", () => clearError("nameError"));
    username.addEventListener("input", () => clearError("usernameError"));
    email.addEventListener("input", () => clearError("emailError"));
    setupToken.addEventListener("input", () => clearError("setupTokenError"));
    password.addEventListener("input", () => clearError("passwordError"));
    confirmPassword.addEventListener("input", () => clearError("confirmPasswordError"));

    agreeTerms.addEventListener("change", () => clearError("termsError"));


    // ==========================================
    // 5. FORM VALIDATION
    // ==========================================

    function validateForm() {

        let isValid = true;

        registerMessage.textContent = "";
        registerMessage.className = "register-message";

        const nameValue = fullName.value.trim();
        const usernameValue = username.value.trim();
        const emailValue = email.value.trim();

        const passwordValue = password.value;
        const confirmValue = confirmPassword.value;

        const namePattern = /^[\p{L}][\p{L}\s.'-]*$/u;
        const usernamePattern = /^[a-zA-Z0-9_]{4,20}$/;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const passwordValid =
            passwordValue.length >= 8 &&
            /[A-Z]/.test(passwordValue) &&
            /[a-z]/.test(passwordValue) &&
            /[0-9]/.test(passwordValue) &&
            /[^A-Za-z0-9\s]/.test(passwordValue) &&
            !/\s/.test(passwordValue);


        if (!nameValue) {

            document.getElementById("nameError").textContent =
                "Please enter your full name.";

            isValid = false;

        } else if (!namePattern.test(nameValue) || nameValue.length > 100) {

            document.getElementById("nameError").textContent =
                "Please enter a valid name.";

            isValid = false;

        }


        if (!usernameValue) {

            document.getElementById("usernameError").textContent =
                "Please enter a username.";

            isValid = false;

        } else if (!usernamePattern.test(usernameValue)) {

            document.getElementById("usernameError").textContent =
                "Username must be 4-20 characters using letters, numbers, or underscores.";

            isValid = false;

        }


        if (!emailValue) {

            document.getElementById("emailError").textContent =
                "Please enter your email address.";

            isValid = false;

        } else if (!emailPattern.test(emailValue) || emailValue.length > 254) {

            document.getElementById("emailError").textContent =
                "Please enter a valid email address.";

            isValid = false;

        }

        if (!setupToken.value) {
            document.getElementById("setupTokenError").textContent =
                "Enter the one-time Admin setup key.";
            isValid = false;
        }


        if (!passwordValue) {

            document.getElementById("passwordError").textContent =
                "Please enter a password.";

            isValid = false;

        } else if (!passwordValid) {

            document.getElementById("passwordError").textContent =
                "Your password does not meet all the requirements.";

            isValid = false;

        }


        if (!confirmValue) {

            document.getElementById("confirmPasswordError").textContent =
                "Please confirm your password.";

            isValid = false;

        } else if (passwordValue !== confirmValue) {

            document.getElementById("confirmPasswordError").textContent =
                "Passwords do not match.";

            isValid = false;

        }


        if (!agreeTerms.checked) {

            document.getElementById("termsError").textContent =
                "Please agree to the Terms and Conditions.";

            isValid = false;

        }

        return isValid;

    }


    // ==========================================
    // 6. LOADING BUTTON
    // ==========================================

    function setLoading(isLoading) {

        registerButton.disabled = isLoading;

        registerButtonText.textContent = isLoading
            ? "Creating Account..."
            : "Create Account";

    }


    // ==========================================
    // 7. REGISTER SUBMISSION
    // ==========================================

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        if (!validateForm()) {

            registerMessage.textContent =
                "Please check the required fields.";

            registerMessage.classList.add("error");

            return;

        }

        setLoading(true);

        try {

            const response = await fetch(API_URL, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "include",

                body: JSON.stringify({

                    fullName: fullName.value.trim(),
                    username: username.value.trim(),
                    email: email.value.trim(),
                    password: password.value,
                    setupToken: setupToken.value

                })

            });


            const responseText = await response.text();

            console.log("Registration HTTP Status:", response.status);
            console.log("Registration Response:", responseText);

            let data = {};

            if (responseText.trim()) {

                try {

                    data = JSON.parse(responseText);

                } catch {

                    throw new Error(
                        "Invalid response received from the server."
                    );

                }

            }


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    data.title ||
                    "Unable to create your account."
                );

            }


            // SUCCESS

            registerMessage.textContent =
                data.message || "Account created successfully.";

            registerMessage.classList.add("success");

            registerForm.reset();

            checkPasswordStrength("");

            setTimeout(function () {

                window.location.href = "login.html";

            }, 2000);


        } catch (error) {

            console.error("Registration error:", error);

            registerMessage.textContent =
                error.message === "Failed to fetch"
                    ? "Unable to connect to the server. Please try again."
                    : error.message;

            registerMessage.classList.add("error");

        } finally {

            setLoading(false);

        }

    });


    // ==========================================
    // 8. TERMS AND CONDITIONS
    // ==========================================

    document.getElementById("termsLink").addEventListener("click", function (event) {

        event.preventDefault();

        window.location.href = "terms-conditions.html";

    });

});

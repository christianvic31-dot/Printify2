
/* ==========================================
   PRINTIFY LOGIN JAVASCRIPT
========================================== */

// ==========================================
// 1. BACKEND API URL
// ==========================================

const API_URL = "/api/auth/login";

// ==========================================
// 2. GET HTML ELEMENTS
// ==========================================

const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const rememberMe = document.getElementById("rememberMe");
const loginButton = document.getElementById("loginButton");
const errorMessage = document.getElementById("errorMessage");

// ==========================================
// 3. SHOW / HIDE PASSWORD
// ==========================================

if (togglePassword && passwordInput) {

    togglePassword.addEventListener("click", function () {

        const isPassword = passwordInput.type === "password";

        passwordInput.type = isPassword ? "text" : "password";

        const icon = this.querySelector("i");

        if (icon) {

            if (isPassword) {

                icon.classList.remove("fa-eye-slash");
                icon.classList.add("fa-eye");

                this.setAttribute("aria-label", "Hide password");

            } else {

                icon.classList.remove("fa-eye");
                icon.classList.add("fa-eye-slash");

                this.setAttribute("aria-label", "Show password");

            }

        }

    });

}

// ==========================================
// 4. ERROR MESSAGE
// ==========================================

function showError(message) {

    if (!errorMessage) return;

    errorMessage.textContent = message;
    errorMessage.classList.add("show");

}

function hideError() {

    if (!errorMessage) return;

    errorMessage.textContent = "";
    errorMessage.classList.remove("show");

}

// ==========================================
// 5. LOGIN BUTTON LOADING
// ==========================================

function setLoading(isLoading) {

    if (!loginButton) return;

    loginButton.disabled = isLoading;

    const buttonText = loginButton.querySelector("span");

    if (buttonText) {

        buttonText.textContent = isLoading
            ? "Logging in..."
            : "Log in";

    }

}

// ==========================================
// 6. ROLE-BASED REDIRECTION
// ==========================================

function redirectUser(role) {

    if (role === "Admin") {

        // ADMIN: dashboard, orders, inventory, staff, reports
        window.location.href = "dashboard.html";

    } else if (role === "Staff") {

        // STAFF: staff portal (sariling orders lang)
        window.location.href = "staff-dashboard.html";

    } else {

        throw new Error(
            "Unable to verify your account role."
        );

    }

}

// ==========================================
// 6B. CLEAN UP PREVIOUS BROWSER DATA
// ==========================================

// Burahin ang naiwang data ng nakaraang user sa browser na ito.
["printifyOrders", "printifyStaff", "printify-staff-orders-demo",
    "printify-user-name", "printify-user-email", "staffName", "staffEmail"
].forEach(function (key) {
    try { localStorage.removeItem(key); } catch (error) { /* ignore */ }
});

// ==========================================
// 7. LOGIN FORM SUBMISSION
// ==========================================

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        hideError();

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        // CHECK REQUIRED FIELDS
        if (!username || !password) {

            showError("Please enter your username and password.");

            return;

        }

        setLoading(true);

        try {

            // SEND LOGIN REQUEST
            const response = await fetch(API_URL, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "include",

                body: JSON.stringify({

                    username: username,
                    password: password,

                    rememberMe: rememberMe
                        ? rememberMe.checked
                        : false

                })

            });

            // READ BACKEND RESPONSE
            const responseText = await response.text();

            console.log("Login HTTP Status:", response.status);
            console.log("Login Backend Response:", responseText);

            // CHECK EMPTY RESPONSE
            if (!responseText.trim()) {

                throw new Error(
                    `Backend returned an empty response. HTTP Status: ${response.status}`
                );

            }

            // CONVERT RESPONSE TO JSON
            let data;

            try {

                data = JSON.parse(responseText);

            } catch {

                throw new Error(
                    "Backend returned an invalid response. Check the backend terminal."
                );

            }

            // CHECK LOGIN RESULT
            if (!response.ok) {

                throw new Error(
                    data.message ||
                    data.title ||
                    "Login failed."
                );

            }

            // VERIFY ACCOUNT ROLE
            if (!data.role) {

                throw new Error(
                    "The backend did not return your account role."
                );

            }

            console.log("Login successful!");
            console.log("User:", data.username);
            console.log("Role:", data.role);

            // REDIRECT BASED ON ROLE
            redirectUser(data.role);

        } catch (error) {

            console.error("Login error:", error);

            showError(
                error.message ||
                "An unexpected error occurred."
            );

        } finally {

            setLoading(false);

        }

    });

}

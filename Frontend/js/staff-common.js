document.addEventListener("DOMContentLoaded", function () {
    window.PrintifyStaff = {
        request: async function (url, method, body) {
            const response = await fetch(url, {
                method: method || "GET",
                credentials: "same-origin",
                headers: body === undefined ? {} : { "Content-Type": "application/json" },
                body: body === undefined ? undefined : JSON.stringify(body)
            });
            let data = null;
            try {
                data = await response.json();
            } catch (error) {
                data = null;
            }
            if (!response.ok) {
                throw new Error((data && data.message) || "The request failed. Please try again.");
            }
            return data;
        },
        setMessage: function (element, text, type) {
            if (!element) return;
            element.textContent = text || "";
            element.classList.toggle("error", type === "error");
            element.classList.toggle("success", type === "success");
        },
        escapeHTML: function (value) {
            return String(value ?? "").replace(/[&<>"']/g, character => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            })[character]);
        }
    };

    const user = window.PrintifyAuth && window.PrintifyAuth.user
        ? window.PrintifyAuth.user
        : {};
    const body = document.body;
    const name = user.fullName || user.username || "Staff Member";
    const initials = name.trim().split(/\s+/).slice(0, 2)
        .map(part => part.charAt(0).toUpperCase()).join("") || "S";

    document.querySelectorAll("[data-staff-name]").forEach(element => {
        element.textContent = name;
    });
    document.querySelectorAll("[data-staff-email]").forEach(element => {
        element.textContent = user.email || "";
    });
    document.querySelectorAll("[data-staff-initials]").forEach(element => {
        element.textContent = initials;
    });

    const date = document.getElementById("currentDate");
    if (date) {
        date.textContent = new Date().toLocaleDateString("en-PH", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    }

    const year = String(new Date().getFullYear());
    document.querySelectorAll("[data-current-year]").forEach(element => {
        element.textContent = year;
    });

    function applyTheme(theme) {
        body.classList.toggle("light-mode", theme === "light");
        body.classList.toggle("dark-mode", theme !== "light");
        const themeSelect = document.getElementById("themeSelect");
        if (themeSelect) themeSelect.value = theme;
    }

    let theme = "light";
    try {
        theme = localStorage.getItem("printify-theme") || "light";
    } catch (error) {
        console.warn("Unable to load saved theme.");
    }
    applyTheme(theme);

    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
        themeToggle.addEventListener("click", function () {
            theme = body.classList.contains("light-mode") ? "dark" : "light";
            applyTheme(theme);
            try {
                localStorage.setItem("printify-theme", theme);
            } catch (error) {
                console.warn("Unable to save theme.");
            }
        });
    }

    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    const menuToggle = document.getElementById("menuToggle");

    function closeSidebar() {
        body.classList.add("sidebar-hidden");
        if (overlay) overlay.classList.remove("show");
        if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
    }

    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", function () {
            const open = body.classList.contains("sidebar-hidden");
            body.classList.toggle("sidebar-hidden", !open);
            if (overlay) overlay.classList.toggle("show", open);
            menuToggle.setAttribute("aria-expanded", String(open));
        });
    }
    if (overlay) overlay.addEventListener("click", closeSidebar);

    const notificationButton = document.getElementById("notificationButton");
    if (notificationButton) {
        notificationButton.addEventListener("click", function () {
            window.location.href = "staff-notifications.html";
        });
    }

    const logoutButtons = [
        document.getElementById("logoutButton"),
        document.getElementById("sidebarLogoutButton")
    ].filter(Boolean);

    logoutButtons.forEach(button => {
        button.addEventListener("click", function () {
            if (window.PrintifyAPI) {
                window.PrintifyAPI.logout();
            } else {
                window.location.replace("login.html");
            }
        });
    });
});


/* =====================================================
   PRINTIFY CALAPAN
   SETTINGS PAGE FUNCTIONALITY
   Profile | Security | Appearance | Preferences
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // ELEMENTS
    // ==========================================

    const sidebar = document.getElementById("sidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const menuToggle = document.getElementById("menuToggle");

    const themeToggle = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");

    const profileButton = document.getElementById("profileButton");
    const profileDropdown = document.getElementById("profileDropdown");

    const logoutButton = document.getElementById("logoutButton");
    const notificationButton = document.getElementById("notificationButton");

    const currentDate = document.getElementById("currentDate");
    const currentYear = document.getElementById("currentYear");

    const settingsToast = document.getElementById("settingsToast");
    const settingsToastText = document.getElementById("settingsToastText");

    const darkModeToggle = document.getElementById("darkModeToggle");
    const appearanceStatus = document.getElementById("appearanceStatus");

    const profileForm = document.getElementById("profileForm");
    const passwordForm = document.getElementById("passwordForm");
    const shopForm = document.getElementById("shopForm");

    const resetSettingsButton = document.getElementById("resetSettingsButton");
    const savePreferencesButton = document.getElementById("savePreferencesButton");

    // Appearance elements
    const backgroundImageInput = document.getElementById("backgroundImageInput");
    const resetBackgroundButton = document.getElementById("resetBackgroundButton");
    const backgroundFileName = document.getElementById("backgroundFileName");
    const backgroundColorInput = document.getElementById("backgroundColorInput");
    const backgroundBlurSlider = document.getElementById("backgroundBlurSlider");
    const backgroundBlurValue = document.getElementById("backgroundBlurValue");
    const selectedColorText = document.getElementById("selectedColorText");
    const saveAppearanceButton = document.getElementById("saveAppearanceButton");
    const appearanceLivePreview = document.getElementById("appearanceLivePreview");

    // Password elements
    const currentPassword = document.getElementById("currentPassword");
    const newPassword = document.getElementById("newPassword");
    const confirmPassword = document.getElementById("confirmPassword");
    const updatePasswordButton = document.getElementById("updatePasswordButton");


    // ==========================================
    // STORAGE KEYS
    // ==========================================

    const SETTINGS_KEY = "printifySettings";
    const THEME_KEY = "printify-theme";
    const SIDEBAR_KEY = "printify-sidebar-hidden";
    const APPEARANCE_KEY = "printifyAppearance";

    // Change this URL if your ASP.NET Core API uses another route.
    const PASSWORD_API_URL = "/api/auth/change-password";

    const MAX_BACKGROUND_SIZE = 1.5 * 1024 * 1024;


    // ==========================================
    // DEFAULT SETTINGS
    // ==========================================

    const defaultSettings = {

        profile: {
            name: "Administrator",
            email: "",
            username: "admin"
        },

        shop: {
            name: "Printify Calapan",
            email: "",
            phone: "",
            address: ""
        },

        preferences: {
            lowStock: true,
            outOfStock: true,
            orders: true,
            currency: "PHP"
        }

    };

    const defaultAppearance = {
        backgroundImage: "",
        backgroundFileName: "",
        backgroundColor: "#07130B",
        blur: 12
    };


    let settings = loadSettings();
    let appearance = loadAppearance();
    let toastTimeout;


    // ==========================================
    // LOAD SETTINGS
    // ==========================================

    function loadSettings() {

        try {

            const savedSettings = localStorage.getItem(SETTINGS_KEY);

            if (!savedSettings) {
                return JSON.parse(JSON.stringify(defaultSettings));
            }

            const parsed = JSON.parse(savedSettings);

            return {

                profile: {
                    ...defaultSettings.profile,
                    ...(parsed.profile || {})
                },

                shop: {
                    ...defaultSettings.shop,
                    ...(parsed.shop || {})
                },

                preferences: {
                    ...defaultSettings.preferences,
                    ...(parsed.preferences || {})
                }

            };

        } catch (error) {

            console.error("Unable to load settings:", error);

            return JSON.parse(JSON.stringify(defaultSettings));

        }

    }


    function saveSettingsToStorage() {

        try {

            localStorage.setItem(
                SETTINGS_KEY,
                JSON.stringify(settings)
            );

            return true;

        } catch (error) {

            console.error("Unable to save settings:", error);
            showToast("Unable to save settings. Browser storage may be full.");

            return false;

        }

    }


    // ==========================================
    // LOAD APPEARANCE
    // ==========================================

    function loadAppearance() {

        try {

            const saved = localStorage.getItem(APPEARANCE_KEY);

            if (!saved) {
                return { ...defaultAppearance };
            }

            return {
                ...defaultAppearance,
                ...JSON.parse(saved)
            };

        } catch (error) {

            console.error("Unable to load appearance:", error);
            return { ...defaultAppearance };

        }

    }


    function saveAppearanceToStorage() {

        try {

            localStorage.setItem(
                APPEARANCE_KEY,
                JSON.stringify(appearance)
            );

            return true;

        } catch (error) {

            console.error("Unable to save appearance:", error);

            showToast(
                "Unable to save background. Try using a smaller image."
            );

            return false;

        }

    }


    // ==========================================
    // TOAST NOTIFICATION
    // ==========================================

    function showToast(message, type = "success") {

        if (!settingsToast || !settingsToastText) return;

        settingsToastText.textContent = message;

        const toastIcon = settingsToast.querySelector("i");

        if (toastIcon) {

            toastIcon.className = type === "error"
                ? "fa-solid fa-circle-exclamation"
                : "fa-solid fa-circle-check";

        }

        settingsToast.classList.toggle("error", type === "error");
        settingsToast.classList.add("show");

        clearTimeout(toastTimeout);

        toastTimeout = setTimeout(function () {
            settingsToast.classList.remove("show");
        }, 3500);

    }


    // ==========================================
    // SIDEBAR
    // ==========================================

    function isMobile() {
        return window.matchMedia("(max-width: 850px)").matches;
    }


    function openSidebar() {

        if (!sidebar) return;

        sidebar.classList.remove("is-hidden");

        if (isMobile()) {

            document.body.classList.add("mobile-sidebar-open");

            if (sidebarOverlay) {
                sidebarOverlay.classList.add("show");
            }

        } else {

            document.body.classList.remove("sidebar-hidden");

            localStorage.setItem(SIDEBAR_KEY, "false");

        }

    }


    function closeSidebar() {

        if (!sidebar) return;

        sidebar.classList.add("is-hidden");

        if (sidebarOverlay) {
            sidebarOverlay.classList.remove("show");
        }

        document.body.classList.remove("mobile-sidebar-open");

        if (!isMobile()) {

            document.body.classList.add("sidebar-hidden");

            localStorage.setItem(SIDEBAR_KEY, "true");

        }

    }


    function initializeSidebar() {

        if (!sidebar) return;

        if (isMobile()) {

            sidebar.classList.add("is-hidden");
            document.body.classList.add("sidebar-hidden");

        } else {

            const savedState = localStorage.getItem(SIDEBAR_KEY);

            if (savedState === null || savedState === "true") {

                sidebar.classList.add("is-hidden");
                document.body.classList.add("sidebar-hidden");

            } else {

                sidebar.classList.remove("is-hidden");
                document.body.classList.remove("sidebar-hidden");

            }

        }

    }


    if (menuToggle) {

        menuToggle.addEventListener("click", function () {

            if (!sidebar) return;

            if (sidebar.classList.contains("is-hidden")) {
                openSidebar();
            } else {
                closeSidebar();
            }

        });

    }


    if (sidebarOverlay) {
        sidebarOverlay.addEventListener("click", closeSidebar);
    }


    if (sidebar) {

        sidebar.querySelectorAll(".nav-link").forEach(function (link) {

            link.addEventListener("click", function () {

                if (isMobile()) {
                    closeSidebar();
                }

            });

        });

    }


    window.addEventListener("resize", function () {

        if (!sidebar) return;

        if (isMobile()) {

            sidebar.classList.add("is-hidden");

            if (sidebarOverlay) {
                sidebarOverlay.classList.remove("show");
            }

            document.body.classList.remove("mobile-sidebar-open");
            document.body.classList.add("sidebar-hidden");

        } else {

            if (sidebarOverlay) {
                sidebarOverlay.classList.remove("show");
            }

            document.body.classList.remove("mobile-sidebar-open");

            const savedState = localStorage.getItem(SIDEBAR_KEY);

            if (savedState === "false") {

                sidebar.classList.remove("is-hidden");
                document.body.classList.remove("sidebar-hidden");

            } else {

                sidebar.classList.add("is-hidden");
                document.body.classList.add("sidebar-hidden");

            }

        }

    });


    initializeSidebar();


    // ==========================================
    // THEME
    // ==========================================

    function updateThemeIcon(isDark) {

        if (!themeIcon) return;

        if (isDark) {

            themeIcon.src = "image/lightmode_icon.png";
            themeIcon.alt = "Switch to light mode";

            if (themeToggle) {
                themeToggle.setAttribute("aria-label", "Switch to light mode");
                themeToggle.title = "Switch to light mode";
            }

        } else {

            themeIcon.src = "image/nightmode_icon.png";
            themeIcon.alt = "Switch to dark mode";

            if (themeToggle) {
                themeToggle.setAttribute("aria-label", "Switch to dark mode");
                themeToggle.title = "Switch to dark mode";
            }

        }

    }


    function applyTheme(isDark) {

        document.body.classList.toggle("dark-mode", isDark);

        localStorage.setItem(
            THEME_KEY,
            isDark ? "dark" : "light"
        );

        updateThemeIcon(isDark);

        if (darkModeToggle) {
            darkModeToggle.checked = isDark;
        }

        if (appearanceStatus) {

            appearanceStatus.textContent = isDark
                ? "Dark Mode Active"
                : "Light Mode Active";

        }

    }


    function initializeTheme() {

        const savedTheme =
            localStorage.getItem(THEME_KEY) ||
            localStorage.getItem("printifyTheme") ||
            "light";

        applyTheme(savedTheme === "dark");

    }


    if (themeToggle) {

        themeToggle.addEventListener("click", function () {

            const isDark = !document.body.classList.contains("dark-mode");

            applyTheme(isDark);

        });

    }


    if (darkModeToggle) {

        darkModeToggle.addEventListener("change", function () {

            applyTheme(this.checked);

            showToast(
                this.checked
                    ? "Dark mode enabled."
                    : "Light mode enabled."
            );

        });

    }


    initializeTheme();


    // ==========================================
    // PROFILE DROPDOWN
    // ==========================================

    if (profileButton && profileDropdown) {

        profileButton.addEventListener("click", function (event) {

            event.stopPropagation();

            profileDropdown.classList.toggle("show");

            profileButton.setAttribute(
                "aria-expanded",
                profileDropdown.classList.contains("show")
            );

        });


        profileDropdown.addEventListener("click", function (event) {
            event.stopPropagation();
        });


        document.addEventListener("click", function () {

            profileDropdown.classList.remove("show");

            profileButton.setAttribute("aria-expanded", "false");

        });

    }


    // ==========================================
    // DATE AND YEAR
    // ==========================================

    function updateDate() {

        const now = new Date();

        if (currentDate) {

            const formattedDate = now.toLocaleDateString("en-PH", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric"
            });

            currentDate.innerHTML = `
                <i class="fa-regular fa-calendar"></i>
                <span>${formattedDate}</span>
            `;

        }

        if (currentYear) {
            currentYear.textContent = now.getFullYear();
        }

    }

    updateDate();


    // ==========================================
    // SETTINGS TABS
    // ==========================================

    const settingsTabs = document.querySelectorAll(".settings-tab");
    const settingsPanels = document.querySelectorAll(".settings-panel");

    settingsTabs.forEach(function (tab) {

        tab.addEventListener("click", function () {

            const targetId = this.dataset.target;

            settingsTabs.forEach(function (item) {
                item.classList.remove("active");
            });

            settingsPanels.forEach(function (panel) {
                panel.classList.remove("active");
            });

            this.classList.add("active");

            const targetPanel = document.getElementById(targetId);

            if (targetPanel) {
                targetPanel.classList.add("active");
            }

        });

    });


    // ==========================================
    // PROFILE SETTINGS
    // ==========================================

    function getInitials(name) {

        return (name || "Administrator")
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(function (word) {
                return word.charAt(0).toUpperCase();
            })
            .join("") || "AD";

    }


    function updateProfilePreview() {

        const name = settings.profile.name || "Administrator";
        const initials = getInitials(name);

        const profileNamePreview = document.getElementById("profileNamePreview");
        const avatarPreview = document.getElementById("avatarPreview");

        if (profileNamePreview) {
            profileNamePreview.textContent = name;
        }

        if (avatarPreview) {
            avatarPreview.textContent = initials;
        }

        document.querySelectorAll(
            ".profile-button .profile-avatar, .dropdown-profile .profile-avatar"
        ).forEach(function (avatar) {
            avatar.textContent = initials;
        });

        const profileName = document.querySelector(
            ".profile-button .profile-information strong"
        );

        if (profileName) {
            profileName.textContent = name;
        }

        const dropdownName = document.querySelector(
            ".dropdown-profile strong"
        );

        if (dropdownName) {
            dropdownName.textContent = name;
        }

    }


    function loadProfileSettings() {

        document.getElementById("adminName").value =
            settings.profile.name;

        document.getElementById("adminEmail").value =
            settings.profile.email;

        document.getElementById("adminUsername").value =
            settings.profile.username;

        updateProfilePreview();

    }


    if (profileForm) {

        profileForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const name = document.getElementById("adminName").value.trim();
            const email = document.getElementById("adminEmail").value.trim();
            const username = document.getElementById("adminUsername").value.trim();

            if (!name || !email || !username) {
                showToast("Please complete all required fields.", "error");
                return;
            }

            settings.profile = {
                name: name,
                email: email,
                username: username
            };

            if (!saveSettingsToStorage()) return;

            updateProfilePreview();

            showToast("Profile settings saved successfully.");

        });

    }


    // ==========================================
    // PASSWORD VISIBILITY
    // ==========================================

    document.querySelectorAll(".password-visibility").forEach(function (button) {

        button.addEventListener("click", function () {

            const inputId = this.dataset.password;
            const input = document.getElementById(inputId);

            if (!input) return;

            const icon = this.querySelector("i");
            const isPassword = input.type === "password";

            input.type = isPassword ? "text" : "password";

            if (icon) {
                icon.className = isPassword
                    ? "fa-regular fa-eye-slash"
                    : "fa-regular fa-eye";
            }

            this.setAttribute(
                "aria-label",
                isPassword ? "Hide password" : "Show password"
            );

        });

    });


    // ==========================================
    // CHANGE PASSWORD
    // ==========================================

    if (passwordForm) {

        passwordForm.addEventListener("submit", async function (event) {

            event.preventDefault();

            const current = currentPassword.value;
            const newPass = newPassword.value;
            const confirm = confirmPassword.value;

            if (!current || !newPass || !confirm) {

                showToast("Please complete all password fields.", "error");
                return;

            }

            if (newPass.length < 8) {

                showToast("New password must be at least 8 characters.", "error");
                newPassword.focus();
                return;

            }

            if (newPass !== confirm) {

                showToast("New password and confirmation do not match.", "error");
                confirmPassword.focus();
                return;

            }

            if (current === newPass) {

                showToast("Your new password must be different from your current password.", "error");
                newPassword.focus();
                return;

            }

            const confirmed = window.confirm(
                "Are you sure you want to change your password?"
            );

            if (!confirmed) return;

            const originalButtonHTML = updatePasswordButton.innerHTML;

            updatePasswordButton.disabled = true;
            updatePasswordButton.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Verifying...';

            try {

                const token = localStorage.getItem("printifyToken");

                const headers = {
                    "Content-Type": "application/json"
                };

                if (token) {
                    headers.Authorization = "Bearer " + token;
                }

                const response = await fetch(PASSWORD_API_URL, {

                    method: "POST",

                    headers: headers,

                    body: JSON.stringify({

                        currentPassword: current,
                        newPassword: newPass

                    })

                });

                let result = {};

                try {
                    result = await response.json();
                } catch (error) {
                    result = {};
                }

                if (!response.ok) {

                    const errorMessage =
                        result.message ||
                        result.error ||
                        (response.status === 401
                            ? "Your current password is incorrect."
                            : "Unable to update password. Please check your account.");

                    throw new Error(errorMessage);

                }

                passwordForm.reset();

                showToast(
                    result.message || "Password updated successfully."
                );

            } catch (error) {

                console.error("Password update error:", error);

                if (error instanceof TypeError) {

                    showToast(
                        "Cannot connect to the password API. Please check your backend.",
                        "error"
                    );

                } else {

                    showToast(error.message, "error");

                }

            } finally {

                updatePasswordButton.disabled = false;
                updatePasswordButton.innerHTML = originalButtonHTML;

            }

        });

    }


    // ==========================================
    // SHOP INFORMATION
    // ==========================================

    function loadShopSettings() {

        document.getElementById("shopName").value =
            settings.shop.name;

        document.getElementById("shopEmail").value =
            settings.shop.email;

        document.getElementById("shopPhone").value =
            settings.shop.phone;

        document.getElementById("shopAddress").value =
            settings.shop.address;

    }


    if (shopForm) {

        shopForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const name = document.getElementById("shopName").value.trim();

            if (!name) {

                showToast("Shop name is required.", "error");
                return;

            }

            settings.shop = {

                name: name,

                email: document.getElementById("shopEmail").value.trim(),

                phone: document.getElementById("shopPhone").value.trim(),

                address: document.getElementById("shopAddress").value.trim()

            };

            if (!saveSettingsToStorage()) return;

            showToast("Shop information saved successfully.");

        });

    }


    // ==========================================
    // BACKGROUND LAYER
    // ==========================================

    let backgroundLayer = document.getElementById("printifyBackgroundLayer");

    if (!backgroundLayer) {

        backgroundLayer = document.createElement("div");

        backgroundLayer.id = "printifyBackgroundLayer";

        backgroundLayer.setAttribute("aria-hidden", "true");

        document.body.prepend(backgroundLayer);

    }

    Object.assign(backgroundLayer.style, {

        position: "fixed",
        inset: "-35px",
        zIndex: "-1",
        pointerEvents: "none",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "cover",
        transition: "filter 0.2s ease, background-color 0.2s ease"

    });


    function applyBackgroundPreview() {

        const color = appearance.backgroundColor || "#07130B";
        const blur = Number(appearance.blur) || 0;

        document.body.style.backgroundColor = color;

        backgroundLayer.style.backgroundColor = color;
        backgroundLayer.style.filter = "blur(" + blur + "px)";

        if (appearance.backgroundImage) {

            backgroundLayer.style.backgroundImage =
                'url("' + appearance.backgroundImage + '")';

        } else {

            backgroundLayer.style.backgroundImage =
                'url("image/printify_bg.jpg")';

        }

        if (appearanceLivePreview) {

            appearanceLivePreview.style.backgroundColor = color;

            appearanceLivePreview.style.backgroundImage =
                appearance.backgroundImage
                    ? 'url("' + appearance.backgroundImage + '")'
                    : 'url("image/printify_bg.jpg")';

            appearanceLivePreview.style.backgroundSize = "cover";
            appearanceLivePreview.style.backgroundPosition = "center";

            appearanceLivePreview.style.setProperty(
                "--settings-preview-blur",
                blur + "px"
            );

            appearanceLivePreview.style.setProperty(
                "--settings-preview-color",
                color
            );

            const previewBody = appearanceLivePreview.querySelector(".preview-body");

            if (previewBody) {
                previewBody.style.backdropFilter = "blur(" + blur + "px)";
                previewBody.style.webkitBackdropFilter = "blur(" + blur + "px)";
            }

        }

    }


    // ==========================================
    // LOAD APPEARANCE CONTROLS
    // ==========================================

    function loadAppearanceSettings() {

        if (backgroundColorInput) {
            backgroundColorInput.value = appearance.backgroundColor;
        }

        if (backgroundBlurSlider) {
            backgroundBlurSlider.value = appearance.blur;
        }

        if (backgroundBlurValue) {
            backgroundBlurValue.textContent = appearance.blur + "px";
        }

        if (selectedColorText) {
            selectedColorText.textContent = appearance.backgroundColor.toUpperCase();
        }

        if (backgroundFileName) {

            backgroundFileName.textContent =
                appearance.backgroundFileName ||
                "Default background is active.";

        }

        updateActiveColorPreset();
        applyBackgroundPreview();

    }


    // ==========================================
    // COLOR PRESETS
    // ==========================================

    function updateActiveColorPreset() {

        document.querySelectorAll(".color-preset").forEach(function (button) {

            button.classList.toggle(
                "active",
                button.dataset.color.toLowerCase() ===
                appearance.backgroundColor.toLowerCase()
            );

        });

    }


    document.querySelectorAll(".color-preset").forEach(function (button) {

        button.addEventListener("click", function () {

            appearance.backgroundColor = this.dataset.color;

            if (backgroundColorInput) {
                backgroundColorInput.value = appearance.backgroundColor;
            }

            if (selectedColorText) {
                selectedColorText.textContent =
                    appearance.backgroundColor.toUpperCase();
            }

            updateActiveColorPreset();
            applyBackgroundPreview();

        });

    });


    if (backgroundColorInput) {

        backgroundColorInput.addEventListener("input", function () {

            appearance.backgroundColor = this.value;

            if (selectedColorText) {
                selectedColorText.textContent = this.value.toUpperCase();
            }

            updateActiveColorPreset();
            applyBackgroundPreview();

        });

    }


    // ==========================================
    // BACKGROUND IMAGE UPLOAD
    // ==========================================

    if (backgroundImageInput) {

        backgroundImageInput.addEventListener("change", function () {

            const file = this.files[0];

            if (!file) return;

            if (!file.type.startsWith("image/")) {

                showToast("Please select a valid image file.", "error");
                this.value = "";
                return;

            }

            if (file.size > MAX_BACKGROUND_SIZE) {

                showToast(
                    "Image is too large. Please choose an image below 1.5 MB.",
                    "error"
                );

                this.value = "";
                return;

            }

            const reader = new FileReader();

            reader.onload = function (event) {

                appearance.backgroundImage = event.target.result;
                appearance.backgroundFileName = file.name;

                applyBackgroundPreview();

                if (backgroundFileName) {
                    backgroundFileName.textContent = file.name;
                }

                showToast("Background preview updated. Save to apply your changes.");

            };

            reader.onerror = function () {

                showToast("Unable to read the selected image.", "error");

            };

            reader.readAsDataURL(file);

        });

    }


    // ==========================================
    // RESTORE DEFAULT BACKGROUND
    // ==========================================

    if (resetBackgroundButton) {

        resetBackgroundButton.addEventListener("click", function () {

            const confirmed = window.confirm(
                "Restore the default Printify background?"
            );

            if (!confirmed) return;

            appearance.backgroundImage = "";
            appearance.backgroundFileName = "";

            if (backgroundImageInput) {
                backgroundImageInput.value = "";
            }

            if (backgroundFileName) {
                backgroundFileName.textContent =
                    "Default background is active.";
            }

            applyBackgroundPreview();

            showToast("Default background preview restored. Save to apply.");

        });

    }


    // ==========================================
    // BACKGROUND BLUR SLIDER
    // ==========================================

    if (backgroundBlurSlider) {

        backgroundBlurSlider.addEventListener("input", function () {

            appearance.blur = Number(this.value);

            if (backgroundBlurValue) {
                backgroundBlurValue.textContent = appearance.blur + "px";
            }

            applyBackgroundPreview();

        });

    }


    // ==========================================
    // SAVE APPEARANCE
    // ==========================================

    if (saveAppearanceButton) {

        saveAppearanceButton.addEventListener("click", function () {

            if (!saveAppearanceToStorage()) return;

            applyBackgroundPreview();

            showToast("Appearance settings saved successfully.");

        });

    }


    // ==========================================
    // SYSTEM PREFERENCES
    // ==========================================

    function loadPreferences() {

        document.getElementById("lowStockNotification").checked =
            settings.preferences.lowStock;

        document.getElementById("outOfStockNotification").checked =
            settings.preferences.outOfStock;

        document.getElementById("orderNotification").checked =
            settings.preferences.orders;

        document.getElementById("defaultCurrency").value =
            settings.preferences.currency;

    }


    if (savePreferencesButton) {

        savePreferencesButton.addEventListener("click", function () {

            settings.preferences = {

                lowStock: document.getElementById(
                    "lowStockNotification"
                ).checked,

                outOfStock: document.getElementById(
                    "outOfStockNotification"
                ).checked,

                orders: document.getElementById(
                    "orderNotification"
                ).checked,

                currency: document.getElementById(
                    "defaultCurrency"
                ).value

            };

            if (!saveSettingsToStorage()) return;

            showToast("System preferences saved successfully.");

        });

    }


    // ==========================================
    // RESET SETTINGS
    // ==========================================

    if (resetSettingsButton) {

        resetSettingsButton.addEventListener("click", function () {

            const confirmed = window.confirm(
                "Are you sure you want to reset your settings? " +
                "Your inventory and orders will not be deleted."
            );

            if (!confirmed) return;

            settings = JSON.parse(JSON.stringify(defaultSettings));
            appearance = { ...defaultAppearance };

            if (!saveSettingsToStorage()) return;
            if (!saveAppearanceToStorage()) return;

            loadProfileSettings();
            loadShopSettings();
            loadPreferences();
            loadAppearanceSettings();

            applyTheme(false);

            showToast("Settings have been restored to default.");

        });

    }


    // ==========================================
    // NOTIFICATIONS
    // ==========================================

    if (notificationButton) {

        notificationButton.addEventListener("click", function () {

            showToast("Your system notifications are available here.");

        });

    }


    // ==========================================
    // LOGOUT
    // ==========================================

    if (logoutButton) {

        logoutButton.addEventListener("click", function () {

            const confirmed = confirm(
                "Are you sure you want to log out?"
            );

            if (confirmed) {
                (window.PrintifyAPI ? PrintifyAPI.logout() : (window.location.href = "login.html"));
            }

        });

    }


    // ==========================================
    // ESCAPE KEY
    // ==========================================

    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape") {

            if (profileDropdown) {
                profileDropdown.classList.remove("show");
            }

            if (isMobile() && sidebar && !sidebar.classList.contains("is-hidden")) {
                closeSidebar();
            }

        }

    });


    // ==========================================
    // INITIALIZE PAGE
    // ==========================================

    loadProfileSettings();
    loadShopSettings();
    loadPreferences();
    loadAppearanceSettings();

    console.log("Printify Settings initialized successfully.");

});

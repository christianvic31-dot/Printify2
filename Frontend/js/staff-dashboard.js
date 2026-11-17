
document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // PRINTIFY STAFF DASHBOARD
    // ==========================================

    const API_URL = window.location.origin;

    const body = document.body;

    const sidebar = document.getElementById("sidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const menuToggle = document.getElementById("menuToggle");

    const themeToggle = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");

    const currentDate = document.getElementById("currentDate");
    const currentYear = document.getElementById("currentYear");
    const sidebarYear = document.getElementById("sidebarYear");

    const profileButton = document.getElementById("profileButton");
    const profileDropdown = document.getElementById("profileDropdown");

    const notificationButton = document.getElementById("notificationButton");

    const logoutButton = document.getElementById("logoutButton");
    const sidebarLogoutButton = document.getElementById("sidebarLogoutButton");

    const orderSearch = document.getElementById("orderSearch");
    const orderStatusFilter = document.getElementById("orderStatusFilter");
    const myOrdersBody = document.getElementById("myOrdersBody");
    const orderCount = document.getElementById("orderCount");


    // ==========================================
    // 1. CURRENT DATE AND YEAR
    // ==========================================

    function updateDate() {

        const now = new Date();

        if (currentDate) {
            currentDate.innerHTML = `
                <i class="fa-regular fa-calendar"></i>
                <span>${now.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                })}</span>
            `;
        }

        if (currentYear) {
            currentYear.textContent = now.getFullYear();
        }

        if (sidebarYear) {
            sidebarYear.textContent = now.getFullYear();
        }
    }

    updateDate();


    // ==========================================
    // 2. SIDEBAR
    // ==========================================

    function openSidebar() {
        body.classList.remove("sidebar-hidden");

        if (sidebarOverlay) {
            sidebarOverlay.classList.add("show");
        }
    }

    function closeSidebar() {
        body.classList.add("sidebar-hidden");

        if (sidebarOverlay) {
            sidebarOverlay.classList.remove("show");
        }
    }

    if (menuToggle) {
        menuToggle.addEventListener("click", function () {

            if (body.classList.contains("sidebar-hidden")) {
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

                if (window.innerWidth <= 900) {
                    closeSidebar();
                }

            });

        });
    }

    window.addEventListener("resize", function () {

        if (window.innerWidth > 900) {

            if (sidebarOverlay) {
                sidebarOverlay.classList.remove("show");
            }

        } else {

            if (body.classList.contains("sidebar-hidden")) {
                closeSidebar();
            }

        }

    });


    // ==========================================
    // 3. LIGHT MODE / DARK MODE
    // SAME STORAGE KEY AS ADMIN DASHBOARD
    // ==========================================

    function applyTheme(theme) {

        const isDark = theme === "dark";

        body.classList.toggle("dark-mode", isDark);

        if (themeIcon) {
            themeIcon.alt = isDark ? "Dark Mode" : "Light Mode";

            themeIcon.style.filter = isDark
                ? "brightness(0) invert(1)"
                : "none";
        }

        if (themeToggle) {
            themeToggle.setAttribute(
                "aria-label",
                isDark ? "Switch to light mode" : "Switch to dark mode"
            );

            themeToggle.setAttribute(
                "title",
                isDark ? "Switch to light mode" : "Switch to dark mode"
            );
        }
    }

    let savedTheme = "light";

    try {
        savedTheme = localStorage.getItem("printify-theme") || "light";
    } catch (error) {
        console.warn("Could not load saved theme.");
    }

    applyTheme(savedTheme);

    if (themeToggle) {

        themeToggle.addEventListener("click", function () {

            const newTheme = body.classList.contains("dark-mode")
                ? "light"
                : "dark";

            applyTheme(newTheme);

            try {
                localStorage.setItem("printify-theme", newTheme);
            } catch (error) {
                console.warn("Could not save theme.");
            }

        });

    }


    // ==========================================
    // 4. PROFILE DROPDOWN
    // ==========================================

    if (profileButton && profileDropdown) {

        profileButton.addEventListener("click", function (event) {

            event.stopPropagation();

            const isOpen = profileDropdown.classList.toggle("show");

            profileButton.classList.toggle("active", isOpen);
            profileButton.setAttribute("aria-expanded", isOpen);

        });

        document.addEventListener("click", function (event) {

            if (!profileButton.contains(event.target) &&
                !profileDropdown.contains(event.target)) {

                profileDropdown.classList.remove("show");
                profileButton.classList.remove("active");
                profileButton.setAttribute("aria-expanded", "false");

            }

        });

    }


    // ==========================================
    // 5. NOTIFICATIONS
    // ==========================================

    if (notificationButton) {

        notificationButton.addEventListener("click", function () {
            window.location.href = "staff-notifications.html";
        });

    }


    // ==========================================
    // 6. STAFF ACCOUNT INFORMATION
    // ==========================================

    function getInitials(name) {

        if (!name) return "S";

        const parts = name.trim().split(/\s+/);

        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }

        return parts[0].substring(0, 2).toUpperCase();
    }

    function setText(id, value) {

        const element = document.getElementById(id);

        if (element && value !== undefined && value !== null) {
            element.textContent = value;
        }

    }

    function displayStaffAccount(user) {

        const fullName =
            user.fullName ||
            user.full_name ||
            user.name ||
            user.username ||
            "Staff Member";

        const email = user.email || "No email available";

        const initials = getInitials(fullName);

        setText("profileName", fullName);
        setText("dropdownName", fullName);
        setText("dropdownEmail", email);
        setText("sidebarName", fullName);

        setText("profileAvatar", initials);
        setText("dropdownAvatar", initials);
        setText("sidebarAvatar", initials);

    }

    async function loadStaffAccount() {

        try {

            const response = await fetch(`${API_URL}/api/auth/me`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (response.status === 401 || response.status === 403) {
                window.location.replace("login.html");
                return;
            }

            if (!response.ok) {
                throw new Error("Unable to retrieve account information.");
            }

            const result = await response.json();

            const user = result.user || result.data || result;

            const role = String(
                user.role || user.userRole || ""
            ).toLowerCase();

            if (role === "admin" || role === "administrator") {
                window.location.replace("dashboard.html");
                return;
            }

            if (role && role !== "staff") {
                window.location.replace("login.html");
                return;
            }

            displayStaffAccount(user);

        } catch (error) {

            console.error("Staff account error:", error);

        }

    }

    loadStaffAccount();


    // ==========================================
    // 7. LOGOUT
    // ==========================================

    async function logoutStaff() {

        let confirmed = false;

        if (typeof Swal !== "undefined") {

            const result = await Swal.fire({
                title: "Log Out?",
                text: "Are you sure you want to sign out of your staff account?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, Log Out",
                cancelButtonText: "Cancel",
                confirmButtonColor: "#19e51b",
                cancelButtonColor: "#555555",
                background: "#102016",
                color: "#ffffff",
                reverseButtons: true
            });

            confirmed = result.isConfirmed;

        } else {

            confirmed = window.confirm("Are you sure you want to log out?");

        }

        if (!confirmed) return;

        try {

            const response = await fetch(`${API_URL}/api/auth/logout`, {
                method: "POST",
                credentials: "include"
            });

            if (response.ok || response.status === 401) {
                window.location.replace("login.html");
                return;
            }

            throw new Error("Logout request failed.");

        } catch (error) {

            console.error("Logout error:", error);

            if (typeof Swal !== "undefined") {

                Swal.fire({
                    icon: "error",
                    title: "Logout Failed",
                    text: "Unable to log out. Please try again.",
                    background: "#102016",
                    color: "#ffffff",
                    confirmButtonColor: "#19e51b"
                });

            } else {

                alert("Unable to log out. Please try again.");

            }

        }

    }

    if (logoutButton) {
        logoutButton.addEventListener("click", logoutStaff);
    }

    if (sidebarLogoutButton) {
        sidebarLogoutButton.addEventListener("click", logoutStaff);
    }


    // ==========================================
    // 8. ORDER SEARCH AND STATUS FILTER
    // ==========================================

    function filterOrders() {

        if (!myOrdersBody) return;

        const searchValue = orderSearch
            ? orderSearch.value.trim().toLowerCase()
            : "";

        const statusValue = orderStatusFilter
            ? orderStatusFilter.value.toLowerCase()
            : "all";

        const rows = Array.from(
            myOrdersBody.querySelectorAll("tr")
        );

        let visibleCount = 0;

        rows.forEach(function (row) {

            if (row.querySelector(".empty-table")) {
                return;
            }

            const rowText = row.textContent.toLowerCase();

            const statusElement = row.querySelector(
                ".order-status, .table-status, .status-badge"
            );

            const rowStatus = statusElement
                ? statusElement.textContent.trim().toLowerCase()
                : "";

            const matchesSearch = rowText.includes(searchValue);

            const matchesStatus =
                statusValue === "all" ||
                rowStatus.includes(statusValue);

            const shouldShow = matchesSearch && matchesStatus;

            row.style.display = shouldShow ? "" : "none";

            if (shouldShow) {
                visibleCount++;
            }

        });

        if (orderCount) {
            orderCount.textContent =
                `Showing ${visibleCount} order${visibleCount === 1 ? "" : "s"}`;
        }

    }

    if (orderSearch) {
        orderSearch.addEventListener("input", filterOrders);
    }

    if (orderStatusFilter) {
        orderStatusFilter.addEventListener("change", filterOrders);
    }


    // ==========================================
    // 9. INITIAL ORDER COUNT
    // ==========================================

    function updateOrderCount() {

        if (!myOrdersBody || !orderCount) return;

        const rows = Array.from(
            myOrdersBody.querySelectorAll("tr")
        ).filter(function (row) {
            return !row.querySelector(".empty-table");
        });

        const count = rows.length;

        orderCount.textContent =
            `Showing ${count} order${count === 1 ? "" : "s"}`;

    }

    updateOrderCount();


    // ==========================================
    // 10. CLOSE DROPDOWN WHEN ESCAPE IS PRESSED
    // ==========================================

    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape") {

            if (profileDropdown) {
                profileDropdown.classList.remove("show");
            }

            if (profileButton) {
                profileButton.classList.remove("active");
                profileButton.setAttribute("aria-expanded", "false");
            }

            if (window.innerWidth <= 900) {
                closeSidebar();
            }

        }

    });


    // ==========================================
    // 11. STAFF DASHBOARD INITIAL STATE + SUMMARY
    // ADDED ONLY: existing handlers above remain unchanged.
    // ==========================================

    // Start with sidebar visible, including if an old HTML file has sidebar-hidden.
    body.classList.remove("sidebar-hidden");
    if (sidebar) sidebar.classList.remove("is-hidden");
    if (sidebarOverlay) sidebarOverlay.classList.remove("show");

    const summaryWrite = (id, value) => {
        const target = document.getElementById(id);
        if (target) target.textContent = String(value);
    };
    const summaryNormalize = value => String(value || "").trim().toLowerCase();
    const summaryDateKey = date =>
        [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0")].join("-");

    function summaryIsToday(value) {
        const raw = String(value || "").trim();
        if (!raw) return false;
        if (/\btoday\b/i.test(raw)) return true;
        const current = summaryDateKey(new Date());
        if (raw.includes(current)) return true;
        const parsed = new Date(raw);
        return !Number.isNaN(parsed.getTime()) && summaryDateKey(parsed) === current;
    }

    function refreshStaffSummary() {
        // Counts only rows currently supplied to this staff's table.
        // For database-wide accurate totals, a staff-scoped summary API is needed.
        const table = document.getElementById("myOrdersBody");
        if (!table) return;
        const rows = Array.from(table.querySelectorAll("tr")).filter(row =>
            row.querySelectorAll("td").length >= 5 &&
            !row.querySelector(".empty-table, [colspan]")
        );
        let pending = 0;
        let completedToday = 0;
        rows.forEach(row => {
            const cells = row.querySelectorAll("td");
            const status = summaryNormalize(cells[3]?.textContent);
            const orderDate = cells[4]?.textContent || "";
            if (/pending|processing|in progress|in-progress|queued|assigned/.test(status)) pending++;
            if (/completed|complete|done|finished/.test(status) && summaryIsToday(orderDate)) completedToday++;
        });
        summaryWrite("assignedOrders", rows.length);
        summaryWrite("pendingTasks", pending);
        summaryWrite("completedToday", completedToday);
    }

    function refreshStaffAttendance() {
        const badge = document.getElementById("todayAttendanceBadge");
        const text = badge?.textContent?.trim();
        if (text && !/^(loading|please wait|--|status)$/i.test(text)) {
            summaryWrite("attendanceStatus", text);
        }
    }

    // Staff orders and attendance can arrive asynchronously from other scripts.
    if (myOrdersBody) {
        let scheduled = false;
        new MutationObserver(() => {
            if (scheduled) return;
            scheduled = true;
            queueMicrotask(() => {
                scheduled = false;
                refreshStaffSummary();
            });
        }).observe(myOrdersBody, { childList: true, subtree: true, characterData: true });
        refreshStaffSummary();
    }

    const attendanceBadge = document.getElementById("todayAttendanceBadge");
    if (attendanceBadge) {
        new MutationObserver(refreshStaffAttendance).observe(attendanceBadge,
            { childList: true, subtree: true, characterData: true });
        refreshStaffAttendance();
    }

});

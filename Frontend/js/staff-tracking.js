/* =========================================================
   PRINTIFY CALAPAN
   STAFF TRACKING PAGE JAVASCRIPT
   Inventory / Dashboard-Matched Functionality
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    // ==================================================
    // 1. ELEMENTS
    // ==================================================

    const body = document.body;

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

    const totalStaff = document.getElementById("totalStaff");
    const currentlyWorking = document.getElementById("currentlyWorking");
    const clockedOut = document.getElementById("clockedOut");
    const lateToday = document.getElementById("lateToday");

    const workingStaffList = document.getElementById("workingStaffList");
    const workingStaffCount = document.getElementById("workingStaffCount");
    const recentActivityList = document.getElementById("recentActivityList");

    const searchInput = document.getElementById("searchInput");
    const dateFilter = document.getElementById("dateFilter");
    const statusFilter = document.getElementById("statusFilter");

    const attendanceTableBody = document.getElementById("attendanceTableBody");
    const resultsCount = document.getElementById("resultsCount");

    const resetFiltersButton = document.getElementById("resetFiltersButton");
    const exportButton = document.getElementById("exportButton");

    const scanQRButton = document.getElementById("scanQRButton");
    const qrModal = document.getElementById("qrModal");
    const closeQRModal = document.getElementById("closeQRModal");

    const scannerVideo = document.getElementById("scannerVideo");
    const scannerPlaceholder = document.getElementById("scannerPlaceholder");
    const scannerMessage = document.getElementById("scannerMessage");

    const startCameraButton = document.getElementById("startCameraButton");
    const stopCameraButton = document.getElementById("stopCameraButton");

    const manualStaffId = document.getElementById("manualStaffId");
    const manualScanButton = document.getElementById("manualScanButton");

    const resultModal = document.getElementById("resultModal");
    const resultIcon = document.getElementById("resultIcon");
    const resultTitle = document.getElementById("resultTitle");
    const resultMessage = document.getElementById("resultMessage");
    const resultStaffInformation = document.getElementById("resultStaffInformation");
    const closeResultModal = document.getElementById("closeResultModal");

    const toastMessage = document.getElementById("toastMessage");
    const toastText = document.getElementById("toastText");

    const mobileScreen = window.matchMedia("(max-width: 850px)");

    let toastTimer;
    let cameraStream = null;
    let cameraRequestId = 0;
    let isCameraStarting = false;
    let scannerTimer = null;
    let barcodeDetector = null;
    let qrScanCanvas = null;
    let qrScanContext = null;
    let isScanning = false;


    // ==================================================
    // 2. DATE AND YEAR
    // ==================================================

    function getToday() {

        const now = new Date();

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;

    }


    function updateDate() {

        if (!currentDate) return;

        const dateText = currentDate.querySelector("span");

        if (dateText) {

            dateText.textContent = new Date().toLocaleDateString("en-PH", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric"
            });

        }

    }


    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    updateDate();


    // ==================================================
    // 3. SIDEBAR SHOW AND HIDE
    // Same behavior as Inventory
    // ==================================================

    function saveSidebarState(isHidden) {

        try {

            localStorage.setItem(
                "printify-sidebar-hidden",
                String(isHidden)
            );

        } catch (error) {

            console.warn("Unable to save sidebar preference.");

        }

    }


    function closeMobileSidebar() {

        if (!sidebar) return;

        sidebar.classList.add("is-hidden");

        if (sidebarOverlay) {
            sidebarOverlay.classList.remove("show");
        }

        body.classList.remove("mobile-sidebar-open");

        if (menuToggle) {
            menuToggle.setAttribute("aria-expanded", "false");
        }

    }


    function openMobileSidebar() {

        if (!sidebar) return;

        sidebar.classList.remove("is-hidden");

        if (sidebarOverlay) {
            sidebarOverlay.classList.add("show");
        }

        body.classList.add("mobile-sidebar-open");

        if (menuToggle) {
            menuToggle.setAttribute("aria-expanded", "true");
        }

    }


    function updateDesktopSidebar() {

        if (!sidebar) return;

        let isHidden = true;

        try {

            const savedState = localStorage.getItem(
                "printify-sidebar-hidden"
            );

            if (savedState === null) {

                isHidden = true;
                saveSidebarState(true);

            } else {

                isHidden = savedState === "true";

            }

        } catch (error) {

            isHidden = true;

        }

        sidebar.classList.toggle("is-hidden", isHidden);

        body.classList.toggle("sidebar-hidden", isHidden);

        if (sidebarOverlay) {
            sidebarOverlay.classList.remove("show");
        }

        body.classList.remove("mobile-sidebar-open");

        if (menuToggle) {

            menuToggle.setAttribute(
                "aria-expanded",
                String(!isHidden)
            );

        }

    }


    function updateSidebarForScreen() {

        if (!sidebar) return;

        if (mobileScreen.matches) {

            sidebar.classList.add("is-hidden");

            if (sidebarOverlay) {
                sidebarOverlay.classList.remove("show");
            }

            body.classList.remove("mobile-sidebar-open");

            if (menuToggle) {
                menuToggle.setAttribute("aria-expanded", "false");
            }

        } else {

            updateDesktopSidebar();

        }

    }


    if (menuToggle) {

        menuToggle.addEventListener("click", function () {

            if (!sidebar) return;

            if (mobileScreen.matches) {

                const isOpen = !sidebar.classList.contains("is-hidden");

                if (isOpen) {
                    closeMobileSidebar();
                } else {
                    openMobileSidebar();
                }

            } else {

                const isHidden = sidebar.classList.toggle("is-hidden");

                body.classList.toggle("sidebar-hidden", isHidden);

                saveSidebarState(isHidden);

                menuToggle.setAttribute(
                    "aria-expanded",
                    String(!isHidden)
                );

            }

        });

    }


    if (sidebarOverlay) {

        sidebarOverlay.addEventListener("click", function () {
            closeMobileSidebar();
        });

    }


    if (sidebar) {

        sidebar.querySelectorAll(".nav-link").forEach(function (link) {

            link.addEventListener("click", function () {

                if (mobileScreen.matches) {
                    closeMobileSidebar();
                }

            });

        });

    }


    if (typeof mobileScreen.addEventListener === "function") {

        mobileScreen.addEventListener("change", updateSidebarForScreen);

    } else {

        mobileScreen.addListener(updateSidebarForScreen);

    }

    updateSidebarForScreen();


    // ==================================================
    // 4. LIGHT MODE AND DARK MODE
    // Same storage key and icons as Inventory
    // ==================================================

    function updateThemeIcon(isDark) {

        if (!themeIcon) return;

        themeIcon.src = isDark
            ? "image/lightmode_icon.png"
            : "image/nightmode_icon.png";

        themeIcon.alt = isDark
            ? "Switch to light mode"
            : "Switch to dark mode";

        themeIcon.classList.add("theme-image-icon");

    }


    function applyTheme(theme) {

        const isDark = theme === "dark";

        body.classList.toggle("dark-mode", isDark);

        updateThemeIcon(isDark);

        if (themeToggle) {

            const label = isDark
                ? "Switch to light mode"
                : "Switch to dark mode";

            themeToggle.setAttribute("aria-label", label);
            themeToggle.setAttribute("title", label);

        }

    }


    let savedTheme = "light";

    try {

        savedTheme = localStorage.getItem("printify-theme") || "light";

    } catch (error) {

        console.warn("Unable to load saved theme.");

    }

    applyTheme(savedTheme);


    if (themeToggle) {

        themeToggle.addEventListener("click", function () {

            const currentTheme = body.classList.contains("dark-mode")
                ? "dark"
                : "light";

            const newTheme = currentTheme === "dark"
                ? "light"
                : "dark";

            applyTheme(newTheme);

            try {

                localStorage.setItem("printify-theme", newTheme);

            } catch (error) {

                console.warn("Unable to save theme.");

            }

        });

    }


    // ==================================================
    // 5. PROFILE DROPDOWN
    // ==================================================

    if (profileButton && profileDropdown) {

        profileButton.addEventListener("click", function (event) {

            event.stopPropagation();

            const isOpen = profileDropdown.classList.toggle("show");

            profileButton.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

        });


        profileDropdown.addEventListener("click", function (event) {
            event.stopPropagation();
        });


        document.addEventListener("click", function () {

            profileDropdown.classList.remove("show");

            profileButton.setAttribute("aria-expanded", "false");

        });


        document.addEventListener("keydown", function (event) {

            if (event.key === "Escape") {

                profileDropdown.classList.remove("show");

                profileButton.setAttribute("aria-expanded", "false");

            }

        });

    }


    // ==================================================
    // 6. ACTIVE SIDEBAR LINK
    // ==================================================

    if (sidebar) {

        const currentPage = window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();

        sidebar.querySelectorAll(".nav-link").forEach(function (link) {

            const href = link.getAttribute("href");

            if (!href) return;

            const linkPage = href
                .split("/")
                .pop()
                .toLowerCase();

            link.classList.toggle(
                "active",
                linkPage === currentPage
            );

        });

    }


   
document.addEventListener("DOMContentLoaded", () => {
    const logoutButton = document.querySelector(
        "#logoutButton, #logoutBtn, [data-action='logout']"
    );

    if (!logoutButton) {
        console.warn("Logout button not found.");
        return;
    }

    logoutButton.addEventListener("click", async (event) => {
        event.preventDefault();

        if (!confirm("Are you sure you want to log out?")) {
            return;
        }

        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error("Logout request failed.");
            }

            // Redirect only after successful server logout.
            window.location.replace("/login.html");
        } catch (error) {
            console.error("Logout error:", error);
            alert("Logout failed. Please try again.");
        }
    });
});



    // ==================================================
    // 8. SAMPLE STAFF
    // ==================================================

    const defaultStaff = [

        {
            id: "STF-001",
            name: "John Michael Reyes",
            position: "Printing Operator"
        },

        {
            id: "STF-002",
            name: "Angela Marie Santos",
            position: "Customer Service Staff"
        },

        {
            id: "STF-003",
            name: "Mark Joseph Cruz",
            position: "Printing Assistant"
        },

        {
            id: "STF-004",
            name: "Samantha Garcia",
            position: "Cashier"
        },

        {
            id: "STF-005",
            name: "Daniel Mendoza",
            position: "Production Staff"
        }

    ];


    // ==================================================
    // 9. SAMPLE ATTENDANCE
    // ==================================================

    function createDateOffset(daysAgo) {

        const date = new Date();

        date.setDate(date.getDate() - daysAgo);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;

    }


    const defaultAttendance = [

        {
            id: "ATT-001",
            staffId: "STF-001",
            date: getToday(),
            timeIn: "08:02",
            timeOut: "",
            status: "Working"
        },

        {
            id: "ATT-002",
            staffId: "STF-002",
            date: getToday(),
            timeIn: "08:15",
            timeOut: "",
            status: "Late"
        },

        {
            id: "ATT-003",
            staffId: "STF-003",
            date: getToday(),
            timeIn: "07:55",
            timeOut: "17:00",
            status: "Completed"
        },

        {
            id: "ATT-004",
            staffId: "STF-004",
            date: getToday(),
            timeIn: "08:00",
            timeOut: "17:05",
            status: "Completed"
        },

        {
            id: "ATT-005",
            staffId: "STF-005",
            date: createDateOffset(1),
            timeIn: "08:10",
            timeOut: "17:00",
            status: "Late"
        },

        {
            id: "ATT-006",
            staffId: "STF-001",
            date: createDateOffset(1),
            timeIn: "07:58",
            timeOut: "17:00",
            status: "Completed"
        },

        {
            id: "ATT-007",
            staffId: "STF-002",
            date: createDateOffset(2),
            timeIn: "08:05",
            timeOut: "17:00",
            status: "Completed"
        },

        {
            id: "ATT-008",
            staffId: "STF-003",
            date: createDateOffset(2),
            timeIn: "08:20",
            timeOut: "17:00",
            status: "Late"
        }

    ];


    // ==================================================
    // 10. LOAD AND SAVE DATA
    // ==================================================

    function loadData(key, defaultData) {

        try {

            const savedData = localStorage.getItem(key);

            if (savedData !== null) {

                const parsedData = JSON.parse(savedData);

                if (Array.isArray(parsedData)) {
                    return parsedData;
                }

            }

        } catch (error) {

            console.error("Unable to load saved data:", error);

        }

        return defaultData.map(function (item) {
            return { ...item };
        });

    }


    const staff = loadData(
        "printifyStaff",
        defaultStaff
    );


    let attendance = loadData(
        "printifyAttendance",
        []
    );


    function saveAttendance() {

        try {

            localStorage.setItem(
                "printifyAttendance",
                JSON.stringify(attendance)
            );

        } catch (error) {

            console.error("Unable to save attendance:", error);

            showToast(
                "Unable to save attendance in this browser.",
                "error"
            );

        }

    }


    // Database is authoritative; localStorage remains a fallback if server is unavailable.
    function loadAttendanceFromServer() {
        if (!window.PrintifyAPI || typeof window.PrintifyAPI.request !== "function") return;
        const result = window.PrintifyAPI.request("GET", "/api/staff/attendance");
        if (result.status !== 200 || !result.data || !Array.isArray(result.data.items)) {
            console.warn("Attendance server unavailable; displaying locally saved records.");
            return;
        }
        attendance = result.data.items.map(function (record) {
            return {
                id: String(record.id), staffId: record.staffId,
                date: record.date, timeIn: record.timeIn || "",
                timeOut: record.timeOut || "", status: record.status || "Working"
            };
        });
        saveAttendance();
    }

    function loadStaffFromServer() {
        if (!window.PrintifyAPI || typeof window.PrintifyAPI.request !== "function") return;
        const result = window.PrintifyAPI.request("GET", "/api/staff");
        if (result.status !== 200 || !result.data || !Array.isArray(result.data.items)) return;
        staff.splice(0, staff.length, ...result.data.items.map(function (item) {
            return {
                id: String(item.staffCode || item.staffId || item.code || item.id),
                name: String(item.name || item.fullName || "Staff"),
                position: String(item.position || "Staff Member")
            };
        }));
    }

    // ==================================================
    // 11. HELPER FUNCTIONS
    // ==================================================

    function escapeHTML(value) {

        return String(value).replace(/[&<>"']/g, function (character) {

            const replacements = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            };

            return replacements[character];

        });

    }


    function getStaff(staffId) {

        return staff.find(function (item) {
            return item.id === staffId;
        });

    }


    function getInitials(name) {

        return String(name)
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map(function (word) {
                return word.charAt(0).toUpperCase();
            })
            .join("");

    }


    function formatTime(time) {

        if (!time) return "--";

        const parts = time.split(":");

        let hours = Number(parts[0]);
        const minutes = parts[1];

        const period = hours >= 12 ? "PM" : "AM";

        hours = hours % 12 || 12;

        return `${hours}:${minutes} ${period}`;

    }


    function formatDate(dateValue) {

        if (!dateValue) return "--";

        const parts = dateValue.split("-");

        const date = new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
            Number(parts[2])
        );

        return date.toLocaleDateString("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });

    }


    function calculateWorkingHours(timeIn, timeOut) {

        if (!timeIn || !timeOut) {
            return "In Progress";
        }

        const start = timeIn.split(":").map(Number);
        const end = timeOut.split(":").map(Number);

        const startMinutes = start[0] * 60 + start[1];
        const endMinutes = end[0] * 60 + end[1];

        let difference = endMinutes - startMinutes;

        if (difference < 0) {
            difference += 1440;
        }

        const hours = Math.floor(difference / 60);
        const minutes = difference % 60;

        return `${hours}h ${minutes}m`;

    }


    function getTodayAttendance() {

        return attendance.filter(function (record) {
            return record.date === getToday();
        });

    }


    function showToast(message, type = "success") {

        if (!toastMessage || !toastText) return;

        clearTimeout(toastTimer);

        toastText.textContent = message;

        const icon = toastMessage.querySelector("i");

        if (icon) {

            if (type === "error") {

                icon.className = "fa-solid fa-circle-exclamation";
                toastMessage.style.borderLeftColor = "#ff6262";
                toastMessage.style.color = "#ff8585";

            } else {

                icon.className = "fa-solid fa-circle-check";
                toastMessage.style.borderLeftColor = "#19e51b";
                toastMessage.style.color = "#25d366";

            }

        }

        toastMessage.classList.add("show");

        toastTimer = setTimeout(function () {

            toastMessage.classList.remove("show");

        }, 3000);

    }


    // ==================================================
    // 12. UPDATE SUMMARY CARDS
    // ==================================================

    function updateSummary() {

        const todayRecords = getTodayAttendance();

        const workingCount = todayRecords.filter(function (record) {
            return !record.timeOut;
        }).length;

        const completedCount = todayRecords.filter(function (record) {
            return Boolean(record.timeOut);
        }).length;

        const lateCount = todayRecords.filter(function (record) {
            return record.status === "Late";
        }).length;


        if (totalStaff) {
            totalStaff.textContent = staff.length;
        }

        if (currentlyWorking) {
            currentlyWorking.textContent = workingCount;
        }

        if (clockedOut) {
            clockedOut.textContent = completedCount;
        }

        if (lateToday) {
            lateToday.textContent = lateCount;
        }

    }


    // ==================================================
    // 13. DISPLAY CURRENTLY WORKING STAFF
    // ==================================================

    function renderWorkingStaff() {

        if (!workingStaffList) return;

        const todayRecords = getTodayAttendance();

        const workingRecords = todayRecords.filter(function (record) {
            return !record.timeOut;
        });


        if (workingRecords.length === 0) {

            workingStaffList.innerHTML = `
                <div class="empty-tracking">
                    <i class="fa-solid fa-users"></i>
                    <strong>No staff currently working</strong>
                    <p>Staff attendance will appear here after clock-in.</p>
                </div>
            `;

        } else {

            workingStaffList.innerHTML = workingRecords.map(function (record) {

                const member = getStaff(record.staffId);

                if (!member) return "";

                return `
                    <div class="working-staff-item">

                        <div class="working-staff-information">

                            <div class="staff-avatar">
                                ${escapeHTML(getInitials(member.name))}
                            </div>

                            <div class="working-staff-details">

                                <strong>${escapeHTML(member.name)}</strong>

                                <span>
                                    ${escapeHTML(member.position)}
                                    · ${escapeHTML(member.id)}
                                </span>

                            </div>

                        </div>

                        <div class="working-time">

                            <strong>${formatTime(record.timeIn)}</strong>

                            <span>Time In</span>

                        </div>

                    </div>
                `;

            }).join("");

        }


        if (workingStaffCount) {

            workingStaffCount.textContent =
                `${workingRecords.length} staff member(s) on duty`;

        }

    }


    // ==================================================
    // 14. DISPLAY RECENT ACTIVITY
    // ==================================================

    function renderRecentActivity() {

        if (!recentActivityList) return;

        const sortedRecords = [...attendance].sort(function (a, b) {

            const first = new Date(`${a.date}T${a.timeIn}`);
            const second = new Date(`${b.date}T${b.timeIn}`);

            return second - first;

        }).slice(0, 5);


        if (sortedRecords.length === 0) {

            recentActivityList.innerHTML = `
                <div class="empty-tracking">
                    <i class="fa-solid fa-clock-rotate-left"></i>
                    <strong>No recent activity</strong>
                    <p>Attendance activity will appear here.</p>
                </div>
            `;

            return;

        }


        recentActivityList.innerHTML = sortedRecords.map(function (record) {

            const member = getStaff(record.staffId);

            if (!member) return "";

            let activityIcon = "fa-right-to-bracket";
            let activityClass = "";
            let activityTitle = "Clocked In";
            let activityDescription =
                `${member.name} clocked in at ${formatTime(record.timeIn)}.`;


            if (record.timeOut) {

                activityIcon = "fa-right-from-bracket";
                activityClass = "clock-out";
                activityTitle = "Clocked Out";

                activityDescription =
                    `${member.name} clocked out at ${formatTime(record.timeOut)}.`;

            } else if (record.status === "Late") {

                activityIcon = "fa-clock";
                activityClass = "late";
                activityTitle = "Late Clock In";

                activityDescription =
                    `${member.name} clocked in late at ${formatTime(record.timeIn)}.`;

            }


            return `
                <div class="activity-item">

                    <div class="activity-icon ${activityClass}">
                        <i class="fa-solid ${activityIcon}"></i>
                    </div>

                    <div class="activity-details">

                        <strong>${activityTitle}</strong>

                        <p>${escapeHTML(activityDescription)}</p>

                        <span>${formatDate(record.date)}</span>

                    </div>

                </div>
            `;

        }).join("");

    }


    // ==================================================
    // 15. DISPLAY ATTENDANCE TABLE
    // ==================================================

    function renderAttendance() {

        if (!attendanceTableBody) return;

        const searchTerm = searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

        const selectedDate = dateFilter
            ? dateFilter.value
            : "";

        const selectedStatus = statusFilter
            ? statusFilter.value
            : "all";


        const filteredRecords = [...attendance]
            .filter(function (record) {

                const member = getStaff(record.staffId);

                if (!member) return false;

                const matchesSearch =
                    member.name.toLowerCase().includes(searchTerm) ||
                    member.id.toLowerCase().includes(searchTerm);

                const matchesDate =
                    !selectedDate ||
                    record.date === selectedDate;

                const matchesStatus =
                    selectedStatus === "all" ||
                    record.status === selectedStatus;

                return matchesSearch && matchesDate && matchesStatus;

            })
            .sort(function (a, b) {

                const first = new Date(`${a.date}T${a.timeIn}`);
                const second = new Date(`${b.date}T${b.timeIn}`);

                return second - first;

            });


        if (filteredRecords.length === 0) {

            attendanceTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-tracking">

                        <i class="fa-solid fa-calendar-xmark"></i>

                        <strong>No attendance records found</strong>

                        <p>Try changing your search or filters.</p>

                    </td>
                </tr>
            `;

            if (resultsCount) {
                resultsCount.textContent = "Showing 0 records";
            }

            return;

        }


        attendanceTableBody.innerHTML = filteredRecords.map(function (record) {

            const member = getStaff(record.staffId);

            if (!member) return "";

            let statusClass = "working";

            if (record.status === "Completed") {
                statusClass = "completed";
            } else if (record.status === "Late") {
                statusClass = "late";
            }


            return `
                <tr>

                    <td>

                        <div class="table-staff">

                            <div class="table-staff-avatar">
                                ${escapeHTML(getInitials(member.name))}
                            </div>

                            <div class="table-staff-details">

                                <strong>${escapeHTML(member.name)}</strong>

                                <span>${escapeHTML(member.id)}</span>

                            </div>

                        </div>

                    </td>

                    <td>${formatDate(record.date)}</td>

                    <td>${formatTime(record.timeIn)}</td>

                    <td>${formatTime(record.timeOut)}</td>

                    <td>
                        ${calculateWorkingHours(record.timeIn, record.timeOut)}
                    </td>

                    <td>

                        <span class="attendance-status ${statusClass}">
                            ${escapeHTML(record.status)}
                        </span>

                    </td>

                </tr>
            `;

        }).join("");


        if (resultsCount) {

            resultsCount.textContent =
                `Showing ${filteredRecords.length} of ${attendance.length} records`;

        }

    }


    // ==================================================
    // 16. REFRESH STAFF TRACKING
    // ==================================================

    function refreshTracking() {

        updateSummary();
        renderWorkingStaff();
        renderRecentActivity();
        renderAttendance();

    }


    // ==================================================
    // 17. OPEN QR MODAL
    // ==================================================

    function openQRModal() {

        if (!qrModal) return;

        qrModal.classList.add("show");
        qrModal.setAttribute("aria-hidden", "false");

        body.style.overflow = "hidden";

        if (manualStaffId) {
            manualStaffId.value = "";
        }

        if (scannerMessage) {
            scannerMessage.textContent = "Camera scanner is ready.";
        }

        startCamera();

    }


    // ==================================================
    // 18. CLOSE QR MODAL
    // ==================================================

    function closeQRScanner() {

        stopCamera();

        if (!qrModal) return;

        qrModal.classList.remove("show");
        qrModal.setAttribute("aria-hidden", "true");

        body.style.overflow = "";

    }


    // ==================================================
    // 19. OPEN RESULT MODAL
    // ==================================================

    function showResult(success, title, message, staffInformation = "") {

        if (!resultModal) return;

        resultIcon.classList.toggle("error", !success);

        resultIcon.innerHTML = success
            ? '<i class="fa-solid fa-circle-check"></i>'
            : '<i class="fa-solid fa-circle-exclamation"></i>';

        resultTitle.textContent = title;
        resultMessage.textContent = message;

        resultStaffInformation.textContent = staffInformation;

        resultModal.classList.add("show");
        resultModal.setAttribute("aria-hidden", "false");

        body.style.overflow = "hidden";

    }


    function closeResult() {

        if (!resultModal) return;

        resultModal.classList.remove("show");
        resultModal.setAttribute("aria-hidden", "true");

        body.style.overflow = "";

    }


    // ==================================================
    // 20. PROCESS STAFF ATTENDANCE
    // ==================================================

    function processAttendance(staffId) {

        const scannedValue = String(staffId || "").trim();
        let normalizedId = scannedValue.toUpperCase();
        let endpoint = "/api/staff/attendance/scan";
        let requestBody = { staffCode: normalizedId };

        try {
            const scannedUrl = new URL(scannedValue);
            const scannedStaffCode = scannedUrl.pathname.endsWith("/attendance-scan.html")
                ? scannedUrl.searchParams.get("staffCode")
                : "";

            if (scannedStaffCode) {
                requestBody = { staffCode: scannedStaffCode };
                normalizedId = scannedStaffCode.toUpperCase();
            }
        } catch (error) {
            // Manual Staff ID entry is not a URL.
        }

        if (!normalizedId) {
            showToast("Please enter a Staff ID.", "error");
            return;
        }

        if (!window.PrintifyAPI) {
            showResult(false, "Verification Failed", "The attendance server is unavailable.");
            return;
        }

        const result = window.PrintifyAPI.request(
            "POST",
            endpoint,
            requestBody
        );

        if (!result || result.status < 200 || result.status >= 300) {
            const message = result && result.data && result.data.message
                ? result.data.message
                : "Unable to verify this Staff ID with the server.";
            const title = result && result.status === 404
                ? "Staff Not Found"
                : result && result.status === 409
                    ? "Attendance Not Recorded"
                    : "Verification Failed";

            showResult(false, title, message, normalizedId);
            return;
        }

        const verified = result.data;

        if (!verified || !verified.staffId || !verified.staffName || !verified.date) {
            showResult(false, "Verification Failed", "The server returned an invalid attendance response.");
            return;
        }

        const record = {
            id: "ATT-SERVER-" + String(verified.id),
            staffId: verified.staffId,
            date: verified.date,
            timeIn: verified.timeIn,
            timeOut: verified.timeOut || "",
            status: verified.status
        };
        const existingIndex = attendance.findIndex(function (item) {
            return item.staffId === record.staffId && item.date === record.date;
        });

        if (existingIndex >= 0) {
            attendance[existingIndex] = record;
        } else {
            attendance.unshift(record);
        }

        loadAttendanceFromServer();
        refreshTracking();
        closeQRScanner();

        const isClockOut = verified.action === "Clock Out";
        const actionText = isClockOut ? "Clock Out" : "Clock In";
        const timeText = isClockOut ? verified.timeOut : verified.timeIn;

        showResult(
            true,
            `${actionText} Successful`,
            `${verified.staffName} has successfully ${isClockOut ? "clocked out" : "clocked in"}.`,
            `Staff ID: ${verified.staffId} | ${isClockOut ? "Time Out" : "Time In"}: ${formatTime(timeText)}`
        );

    }


    // ==================================================
    // 21. MANUAL STAFF ID SCANNING
    // ==================================================

    if (manualScanButton) {

        manualScanButton.addEventListener("click", function () {

            processAttendance(manualStaffId.value);

        });

    }


    if (manualStaffId) {

        manualStaffId.addEventListener("keydown", function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                processAttendance(manualStaffId.value);

            }

        });

    }


    // ==================================================
    // 22. CAMERA QR SCANNER
    // Requires HTTPS or localhost and camera permission
    // ==================================================

    function updateCameraButtons() {

        if (startCameraButton) {
            startCameraButton.disabled = isCameraStarting || Boolean(cameraStream);
        }

        if (stopCameraButton) {
            stopCameraButton.disabled = !isCameraStarting && !cameraStream;
        }

    }


    async function startCamera() {

        if (!window.isSecureContext) {

            const secureAddress = new URL(window.location.href);
            secureAddress.protocol = "https:";

            scannerMessage.textContent =
                "Camera access requires HTTPS. Open " + secureAddress.origin + secureAddress.pathname;

            showToast("Open this page using HTTPS to scan QR codes.", "error");
            return;

        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {

            scannerMessage.textContent =
                "Camera access is not supported by this browser.";

            showToast("Camera is not supported.", "error");
            return;

        }

        const supportsNativeQr = typeof window.BarcodeDetector === "function";
        const supportsJsQr = typeof window.jsQR === "function";

        if (!supportsNativeQr && !supportsJsQr) {

            scannerMessage.textContent =
                "QR scanner could not load. Check the internet connection or enter the Staff ID manually.";

            showToast(
                "QR scanner could not load. Enter the Staff ID manually.",
                "error"
            );

            return;

        }

        if (cameraStream || isCameraStarting) {
            return;
        }

        const requestId = ++cameraRequestId;
        isCameraStarting = true;
        updateCameraButtons();

        try {

            barcodeDetector = supportsNativeQr
                ? new window.BarcodeDetector({ formats: ["qr_code"] })
                : null;

            if (!barcodeDetector) {
                qrScanCanvas = document.createElement("canvas");
                qrScanContext = qrScanCanvas.getContext("2d", { willReadFrequently: true });

                if (!qrScanContext) {
                    throw new Error("Unable to initialize the QR scanner.");
                }
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment"
                },
                audio: false
            });

            if (requestId !== cameraRequestId) {
                stream.getTracks().forEach(function (track) {
                    track.stop();
                });
                return;
            }

            cameraStream = stream;
            scannerVideo.srcObject = cameraStream;
            scannerVideo.hidden = false;
            scannerPlaceholder.style.display = "none";

            await scannerVideo.play();

            isScanning = true;
            scannerMessage.textContent =
                "Camera is active. Position the QR code inside the frame.";
            scanForQRCode();

        } catch (error) {

            console.error("Camera error:", error);

            if (requestId !== cameraRequestId) {
                return;
            }

            stopCamera();

            if (error && error.name === "NotAllowedError") {
                scannerMessage.textContent = "Camera permission was denied. Allow camera access and try again.";
            } else if (error && error.name === "NotFoundError") {
                scannerMessage.textContent = "No camera was found on this device.";
            } else if (error && error.name === "NotReadableError") {
                scannerMessage.textContent = "The camera is already in use by another application.";
            } else {
                scannerMessage.textContent = "Unable to access camera. Check browser permissions.";
            }

            showToast(scannerMessage.textContent, "error");

        } finally {

            if (requestId === cameraRequestId) {
                isCameraStarting = false;
                updateCameraButtons();
            }

        }

    }


    async function scanForQRCode() {

        if (!isScanning || !scannerVideo) {
            return;
        }

        try {

            if (scannerVideo.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA) {
                let scannedValue = "";

                if (barcodeDetector) {
                    const codes = await barcodeDetector.detect(scannerVideo);
                    scannedValue = codes.length > 0 ? codes[0].rawValue : "";
                } else if (qrScanCanvas && qrScanContext && typeof window.jsQR === "function") {
                    const videoWidth = scannerVideo.videoWidth;
                    const videoHeight = scannerVideo.videoHeight;
                    const scale = Math.min(1, 640 / Math.max(videoWidth, videoHeight));
                    const width = Math.max(1, Math.round(videoWidth * scale));
                    const height = Math.max(1, Math.round(videoHeight * scale));

                    if (qrScanCanvas.width !== width || qrScanCanvas.height !== height) {
                        qrScanCanvas.width = width;
                        qrScanCanvas.height = height;
                    }

                    qrScanContext.drawImage(scannerVideo, 0, 0, width, height);
                    const image = qrScanContext.getImageData(0, 0, width, height);
                    const code = window.jsQR(image.data, width, height, {
                        inversionAttempts: "dontInvert"
                    });

                    scannedValue = code ? code.data : "";
                }

                if (scannedValue) {
                    isScanning = false;
                    stopCamera();
                    processAttendance(scannedValue);
                    return;
                }

            }

        } catch (error) {

            console.warn("QR scan error:", error);

        }


        if (isScanning) {

            scannerTimer = barcodeDetector
                ? requestAnimationFrame(scanForQRCode)
                : window.setTimeout(scanForQRCode, 150);

        }

    }


    function stopCamera() {

        cameraRequestId++;
        isCameraStarting = false;
        isScanning = false;

        if (scannerTimer !== null) {

            cancelAnimationFrame(scannerTimer);
            window.clearTimeout(scannerTimer);

            scannerTimer = null;

        }


        if (cameraStream) {

            cameraStream.getTracks().forEach(function (track) {
                track.stop();
            });

            cameraStream = null;

        }

        barcodeDetector = null;
        qrScanCanvas = null;
        qrScanContext = null;


        if (scannerVideo) {

            scannerVideo.pause();
            scannerVideo.srcObject = null;
            scannerVideo.hidden = true;

        }


        if (scannerPlaceholder) {
            scannerPlaceholder.style.display = "flex";
        }

        updateCameraButtons();

    }


    if (startCameraButton) {
        startCameraButton.addEventListener("click", startCamera);
    }

    if (stopCameraButton) {

        stopCameraButton.addEventListener("click", function () {

            stopCamera();

            if (scannerMessage) {
                scannerMessage.textContent = "Camera stopped.";
            }

        });

    }

    updateCameraButtons();


    // ==================================================
    // 23. SEARCH AND FILTERS
    // ==================================================

    if (searchInput) {
        searchInput.addEventListener("input", renderAttendance);
    }

    if (dateFilter) {
        dateFilter.addEventListener("change", renderAttendance);
    }

    if (statusFilter) {
        statusFilter.addEventListener("change", renderAttendance);
    }


    if (resetFiltersButton) {

        resetFiltersButton.addEventListener("click", function () {

            if (searchInput) {
                searchInput.value = "";
            }

            if (dateFilter) {
                dateFilter.value = "";
            }

            if (statusFilter) {
                statusFilter.value = "all";
            }

            renderAttendance();

            showToast("Filters have been reset.");

        });

    }


    // ==================================================
    // 24. EXPORT ATTENDANCE TO CSV
    // ==================================================

    function exportAttendance() {

        const searchTerm = searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

        const selectedDate = dateFilter
            ? dateFilter.value
            : "";

        const selectedStatus = statusFilter
            ? statusFilter.value
            : "all";


        const filteredRecords = attendance.filter(function (record) {

            const member = getStaff(record.staffId);

            if (!member) return false;

            const matchesSearch =
                member.name.toLowerCase().includes(searchTerm) ||
                member.id.toLowerCase().includes(searchTerm);

            const matchesDate =
                !selectedDate ||
                record.date === selectedDate;

            const matchesStatus =
                selectedStatus === "all" ||
                record.status === selectedStatus;

            return matchesSearch && matchesDate && matchesStatus;

        });


        if (filteredRecords.length === 0) {

            showToast(
                "There are no attendance records to export.",
                "error"
            );

            return;

        }


        const headers = [
            "Attendance ID",
            "Staff ID",
            "Staff Name",
            "Date",
            "Time In",
            "Time Out",
            "Working Hours",
            "Status"
        ];


        const rows = filteredRecords.map(function (record) {

            const member = getStaff(record.staffId);

            return [

                record.id,
                member.id,
                member.name,
                record.date,
                formatTime(record.timeIn),
                formatTime(record.timeOut),
                calculateWorkingHours(record.timeIn, record.timeOut),
                record.status

            ];

        });


        function escapeCSV(value) {

            return '"' +
                String(value).replace(/"/g, '""') +
                '"';

        }


        const csvContent = [
            headers.map(escapeCSV).join(","),
            ...rows.map(function (row) {
                return row.map(escapeCSV).join(",");
            })
        ].join("\n");


        const blob = new Blob(
            ["\uFEFF" + csvContent],
            {
                type: "text/csv;charset=utf-8;"
            }
        );


        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        link.download =
            "Printify_Attendance_" + getToday() + ".csv";

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        showToast("Attendance exported successfully.");

    }


    if (exportButton) {
        exportButton.addEventListener("click", exportAttendance);
    }


    // ==================================================
    // 25. QR MODAL BUTTONS
    // ==================================================

    if (scanQRButton) {
        scanQRButton.addEventListener("click", openQRModal);
    }

    if (closeQRModal) {
        closeQRModal.addEventListener("click", closeQRScanner);
    }


    if (qrModal) {

        qrModal.addEventListener("click", function (event) {

            if (event.target === qrModal) {
                closeQRScanner();
            }

        });

    }


    if (closeResultModal) {
        closeResultModal.addEventListener("click", closeResult);
    }


    if (resultModal) {

        resultModal.addEventListener("click", function (event) {

            if (event.target === resultModal) {
                closeResult();
            }

        });

    }


    document.addEventListener("keydown", function (event) {

        if (event.key !== "Escape") return;

        if (qrModal && qrModal.classList.contains("show")) {
            closeQRScanner();
        }

        if (resultModal && resultModal.classList.contains("show")) {
            closeResult();
        }

    });


    // ==================================================
    // 26. NOTIFICATIONS
    // ==================================================

    if (notificationButton) {

        notificationButton.addEventListener("click", function () {

            const todayRecords = getTodayAttendance();

            const workingCount = todayRecords.filter(function (record) {
                return !record.timeOut;
            }).length;

            const lateCount = todayRecords.filter(function (record) {
                return record.status === "Late";
            }).length;


            if (lateCount > 0) {

                showToast(
                    `${lateCount} staff member(s) arrived late today.`
                );

            } else if (workingCount > 0) {

                showToast(
                    `${workingCount} staff member(s) are currently working.`
                );

            } else {

                showToast("No new attendance notifications.");

            }

        });

    }


    // ==================================================
    // 27. ACCESSIBILITY SETTINGS
    // ==================================================

    if (menuToggle) {

        menuToggle.setAttribute(
            "aria-controls",
            "sidebar"
        );

    }

    if (sidebar) {

        sidebar.setAttribute(
            "aria-label",
            "Main navigation"
        );

    }


    // ==================================================
    // 28. INITIAL DISPLAY
    // ==================================================

    loadStaffFromServer();
    loadAttendanceFromServer();
    refreshTracking();

    console.log("Printify Staff Tracking initialized successfully.");

});
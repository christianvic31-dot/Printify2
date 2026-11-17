
/* ==========================================================
   PRINTIFY - STAFF MANAGEMENT
   COMPLETE JAVASCRIPT
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const $ = id => document.getElementById(id);

    const STAFF_KEY = "printifyStaff";
    const ARCHIVE_KEY = "printifyArchivedStaff";
    const THEME_KEY = "printify-theme";
    const SIDEBAR_KEY = "printify-sidebar-hidden";

    const api = window.PrintifyAPI;
    const body = document.body;

    let staffList = [];
    let archivedStaff = [];
    let viewedStaff = null;
    let selectedStaffId = null;
    let showingArchived = false;
    let archiveTransitioning = false;
    let toastTimer = null;
    let loggingOut = false;

    /* ================= UTILITIES ================= */

    function safe(value) {
        return String(value ?? "").replace(
            /[&<>"']/g,
            c => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            })[c]
        );
    }

    function initials(name) {
        return String(name || "")
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(x => x[0]?.toUpperCase() || "")
            .join("") || "ST";
    }

    function dateText(value) {
        if (!value) return "—";

        const date = new Date(value);

        return Number.isNaN(date.getTime())
            ? String(value)
            : date.toLocaleDateString("en-PH", {
                year: "numeric",
                month: "short",
                day: "numeric"
            });
    }

    function readArray(key) {
        try {
            const result = JSON.parse(
                localStorage.getItem(key) || "[]"
            );

            return Array.isArray(result) ? result : [];
        } catch {
            return [];
        }
    }

    function saveData() {
        localStorage.setItem(
            STAFF_KEY,
            JSON.stringify(staffList)
        );

        localStorage.setItem(
            ARCHIVE_KEY,
            JSON.stringify(archivedStaff)
        );
    }

    function getStaff(id) {
        return staffList.find(
            x => String(x.id) === String(id)
        );
    }

    function isArchived(staff) {
        return archivedStaff.some(x =>
            String(x.id) === String(staff.id) ||
            (
                x.userId != null &&
                staff.userId != null &&
                String(x.userId) === String(staff.userId)
            )
        );
    }

    function toast(message, type = "success") {
        const container = $("toastMessage");
        const label = $("toastText");
        const icon = $("toastIcon");

        if (!container || !label) {
            alert(message);
            return;
        }

        clearTimeout(toastTimer);

        label.textContent = message;

        if (icon) {
            icon.className =
                type === "error"
                    ? "fa-solid fa-circle-exclamation"
                    : type === "info"
                        ? "fa-solid fa-circle-info"
                        : "fa-solid fa-circle-check";

            icon.style.color =
                type === "error" ? "#ff7777" :
                type === "info" ? "#79bfff" :
                "#19e51b";
        }

        container.classList.add("show");

        toastTimer = setTimeout(() => {
            container.classList.remove("show");
        }, 3500);
    }

    async function confirmAction(
        title,
        message,
        confirmText,
        danger = false
    ) {
        if (window.Swal) {
            const result = await Swal.fire({
                title,
                text: message,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: confirmText,
                cancelButtonText: "Cancel",
                confirmButtonColor: danger
                    ? "#d94444"
                    : "#19c72a",
                cancelButtonColor: "#64748b",
                reverseButtons: true
            });

            return result.isConfirmed;
        }

        return confirm(title + "\n" + message);
    }

    /* ================= BACKEND ================= */

    async function request(method, path, payload) {
        if (!api || typeof api.request !== "function") {
            throw new Error(
                "Printify backend connection is unavailable."
            );
        }

        const result = await api.request(
            method,
            path,
            payload
        );

        if (
            !result ||
            result.status < 200 ||
            result.status >= 300
        ) {
            throw new Error(
                result?.data?.message ||
                result?.data?.error ||
                "Server request failed."
            );
        }

        return result.data;
    }

    function loadData() {
        staffList = readArray(STAFF_KEY);
        archivedStaff = readArray(ARCHIVE_KEY);
    }

    async function refreshFromServer() {
        if (!api || typeof api.fetchStaff !== "function") {
            return;
        }

        try {
            const result = await api.fetchStaff();

            if (Array.isArray(result)) {
                staffList = result.filter(
                    staff => !isArchived(staff)
                );

                saveData();
            }
        } catch (error) {
            console.error(error);
            toast("Could not refresh staff records.", "error");
        }
    }

    /* ================= THEME ================= */

    function applyTheme(theme) {
        const dark = theme === "dark";

        body.classList.toggle("dark-mode", dark);

        document.documentElement.classList.toggle(
            "initial-dark",
            dark
        );

        const icon = $("themeIcon");

        if (icon) {
            icon.src = dark
                ? "image/lightmode_icon.png"
                : "image/nightmode_icon.png";
        }

        $("themeToggle")?.setAttribute(
            "aria-label",
            dark
                ? "Switch to light mode"
                : "Switch to dark mode"
        );

        localStorage.setItem(THEME_KEY, theme);
    }

    applyTheme(
        localStorage.getItem(THEME_KEY) === "dark"
            ? "dark"
            : "light"
    );

    $("themeToggle")?.addEventListener("click", () => {
        applyTheme(
            body.classList.contains("dark-mode")
                ? "light"
                : "dark"
        );
    });

    /* ================= SIDEBAR ================= */

    const mobile = window.matchMedia(
        "(max-width: 850px)"
    );

    function setSidebar(open, persist = true) {
        body.classList.toggle("sidebar-hidden", !open);

        $("sidebar")?.classList.toggle(
            "is-hidden",
            !open
        );

        const overlayVisible = mobile.matches && open;

        $("sidebarOverlay")?.classList.toggle(
            "active",
            overlayVisible
        );

        $("sidebarOverlay")?.classList.toggle(
            "show",
            overlayVisible
        );

        $("menuToggle")?.setAttribute(
            "aria-expanded",
            String(open)
        );

        document.documentElement.classList.toggle(
            "initial-sidebar-hidden",
            !open
        );

        if (persist && !mobile.matches) {
            localStorage.setItem(
                SIDEBAR_KEY,
                String(!open)
            );
        }
    }

    function initializeSidebar() {
        const hidden =
            localStorage.getItem(SIDEBAR_KEY) === "true";

        setSidebar(
            !mobile.matches && !hidden,
            false
        );

        body.classList.add("sidebar-ready");
    }

    $("menuToggle")?.addEventListener("click", () => {
        setSidebar(
            body.classList.contains("sidebar-hidden")
        );
    });

    $("sidebarOverlay")?.addEventListener(
        "click",
        () => setSidebar(false, false)
    );

    if (mobile.addEventListener) {
        mobile.addEventListener(
            "change",
            initializeSidebar
        );
    }

    initializeSidebar();

    /* ================= PROFILE ================= */

    $("profileButton")?.addEventListener(
        "click",
        event => {
            event.stopPropagation();

            const menu = $("profileDropdown");
            if (!menu) return;

            const open = menu.classList.toggle("active");

            $("profileButton").setAttribute(
                "aria-expanded",
                String(open)
            );
        }
    );

    document.addEventListener("click", event => {
        const button = $("profileButton");
        const menu = $("profileDropdown");

        if (
            button &&
            menu &&
            !button.contains(event.target) &&
            !menu.contains(event.target)
        ) {
            menu.classList.remove("active");

            button.setAttribute(
                "aria-expanded",
                "false"
            );
        }
    });

    /* ================= LOGOUT ================= */

    async function logout() {
        if (loggingOut) return;

        const yes = await confirmAction(
            "Log out of Printify?",
            "Are you sure you want to end your session?",
            "Yes, Log Out"
        );

        if (!yes) return;

        loggingOut = true;

        try {
            if (api && typeof api.logout === "function") {
                await api.logout();
            } else {
                localStorage.removeItem("token");
                localStorage.removeItem("accessToken");
                localStorage.removeItem("user");
            }

            location.replace("login.html");
        } catch (error) {
            loggingOut = false;
            toast(error.message, "error");
        }
    }

    $("logoutButton")?.addEventListener("click", logout);
    $("sidebarLogoutButton")?.addEventListener("click", logout);

    $("notificationButton")?.addEventListener(
        "click",
        () => toast("No new notifications.", "info")
    );

    /* ================= DATE ================= */

    const dateSpan = $("currentDate")?.querySelector("span");

    if (dateSpan) {
        dateSpan.textContent =
            new Date().toLocaleDateString("en-PH", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric"
            });
    }

    if ($("currentYear")) {
        $("currentYear").textContent =
            new Date().getFullYear();
    }

    /* ================= MODALS ================= */

    function showModal(id) {
        const modal = $(id);
        if (!modal) return;

        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");

        body.style.overflow = "hidden";
    }

    function hideModal(id) {
        const modal = $(id);
        if (!modal) return;

        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");

        if (!document.querySelector(".modal-overlay.active")) {
            body.style.overflow = "";
        }
    }

    function closeForm() {
        hideModal("staffFormModal");

        $("staffForm")?.reset();

        if ($("editingStaffId")) {
            $("editingStaffId").value = "";
        }
    }

    $("closeStaffFormModal")?.addEventListener(
        "click",
        closeForm
    );

    $("cancelStaffForm")?.addEventListener(
        "click",
        closeForm
    );

    $("closeViewStaffModal")?.addEventListener(
        "click",
        () => hideModal("viewStaffModal")
    );

    $("closeViewStaffButton")?.addEventListener(
        "click",
        () => hideModal("viewStaffModal")
    );

    /* ================= FILTERS ================= */

    function updatePositions() {
        const select = $("positionFilter");
        if (!select) return;

        const current = select.value;

        const source = showingArchived
            ? archivedStaff
            : staffList;

        const positions = [
            ...new Set(
                source
                    .map(x => x.position)
                    .filter(Boolean)
            )
        ].sort();

        select.innerHTML =
            '<option value="all">All Positions</option>' +
            positions.map(position => `
                <option value="${safe(position)}">
                    ${safe(position)}
                </option>
            `).join("");

        select.value = positions.includes(current)
            ? current
            : "all";
    }

    function matchesFilters(person, archived = false) {
        const search = ($("searchInput")?.value || "")
            .trim()
            .toLowerCase();

        const position =
            $("positionFilter")?.value || "all";

        const status =
            $("statusFilter")?.value || "all";

        const matchesSearch = [
            person.name,
            person.id,
            person.email,
            person.phone,
            person.position,
            person.username
        ].some(value =>
            String(value || "")
                .toLowerCase()
                .includes(search)
        );

        return matchesSearch &&
            (
                position === "all" ||
                person.position === position
            ) &&
            (
                archived ||
                status === "all" ||
                person.status === status
            );
    }

    function updateCounts(shown, total) {
        if ($("resultsCount")) {
            $("resultsCount").textContent =
                `Showing ${shown} of ${total} ` +
                (
                    showingArchived
                        ? "archived staff members"
                        : "staff members"
                );
        }

        if ($("staffCountBadge")) {
            $("staffCountBadge").textContent =
                `${total} ${total === 1 ? "record" : "records"}`;
        }
    }

    /* ================= ACTIVE STAFF TABLE ================= */

    function renderStaff() {
        const tbody = $("staffTableBody");
        if (!tbody) return;

        if (!showingArchived) updatePositions();

        const items = staffList.filter(
            x => matchesFilters(x, false)
        );

        tbody.innerHTML = items.length
            ? items.map(staff => {
                const orders = staff.orders || {};
                const status = staff.status || "Inactive";

                return `
                    <tr>
                        <td>
                            <div class="staff-name-cell">
                                <div class="staff-avatar">
                                    ${safe(initials(staff.name))}
                                </div>

                                <div class="staff-name-information">
                                    <strong>${safe(staff.name)}</strong>
                                    <span>${safe(staff.email)}</span>
                                </div>
                            </div>
                        </td>

                        <td>
                            <span class="staff-id">
                                ${safe(staff.id)}
                            </span>
                        </td>

                        <td>${safe(staff.position)}</td>
                        <td>${safe(staff.phone)}</td>

                        <td>
                            <strong>${safe(orders.total ?? 0)}</strong>
                            total
                            <br>
                            <small>
                                ${safe(orders.pending ?? 0)} pending ·
                                ${safe(orders.inProgress ?? 0)} in progress ·
                                ${safe(orders.completed ?? 0)} done
                            </small>
                        </td>

                        <td>${safe(dateText(staff.dateAdded))}</td>

                        <td>
                            <span class="staff-status ${
                                status === "Active"
                                    ? "active"
                                    : "inactive"
                            }">
                                ${safe(status)}
                            </span>
                        </td>

                        <td>
                            <div class="staff-actions">
                                <button
                                    type="button"
                                    class="action-button"
                                    data-action="view"
                                    data-id="${safe(staff.id)}"
                                    title="View Staff"
                                >
                                    <i class="fa-regular fa-eye"></i>
                                </button>

                                <button
                                    type="button"
                                    class="action-button"
                                    data-action="edit"
                                    data-id="${safe(staff.id)}"
                                    title="Edit Staff"
                                >
                                    <i class="fa-solid fa-pen"></i>
                                </button>

                                <button
                                    type="button"
                                    class="action-button archive archive-action"
                                    data-action="archive"
                                    data-id="${safe(staff.id)}"
                                    title="Archive Staff"
                                >
                                    <i class="fa-solid fa-box-archive"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join("")
            : `
                <tr>
                    <td colspan="8" class="empty-state">
                        No staff members found.
                    </td>
                </tr>
            `;

        if (!showingArchived) {
            updateCounts(items.length, staffList.length);
        }
    }

    /* ================= ARCHIVED STAFF TABLE ================= */

    function renderArchived() {
        const tbody = $("archivedStaffTableBody");
        if (!tbody) return;

        if (showingArchived) updatePositions();

        const items = archivedStaff.filter(
            x => matchesFilters(x, true)
        );

        tbody.innerHTML = items.length
            ? items.map(staff => `
                <tr>
                    <td>
                        <div class="staff-name-cell">
                            <div class="staff-avatar">
                                ${safe(initials(staff.name))}
                            </div>

                            <div class="staff-name-information">
                                <strong>${safe(staff.name)}</strong>
                                <span>${safe(staff.email)}</span>
                            </div>
                        </div>
                    </td>

                    <td>
                        <span class="staff-id">
                            ${safe(staff.id)}
                        </span>
                    </td>

                    <td>${safe(staff.position)}</td>
                    <td>${safe(staff.phone || "—")}</td>
                    <td>${safe(dateText(staff.archivedAt))}</td>

                    <td>
                        <div class="staff-actions">
                            <button
                                type="button"
                                class="action-button restore-action"
                                data-archive-action="restore"
                                data-id="${safe(staff.id)}"
                                title="Restore Staff"
                            >
                                <i class="fa-solid fa-rotate-left"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join("")
            : `
                <tr>
                    <td colspan="6" class="empty-state">
                        No archived staff members found.
                    </td>
                </tr>
            `;

        if (showingArchived) {
            updateCounts(items.length, archivedStaff.length);
        }
    }

    /* ================= ARCHIVE ANIMATION ================= */

    const activeWrapper = $("activeStaffTableWrapper");
    const archivedWrapper = $("archivedStaffTableWrapper");
    const archiveButton = $("archivedStaffButton");

    function updateArchiveHeader() {
        if ($("staffDirectoryHeading")) {
            $("staffDirectoryHeading").textContent =
                showingArchived
                    ? "Archived Staff"
                    : "Staff Directory";
        }

        if ($("staffDirectorySubtitle")) {
            $("staffDirectorySubtitle").textContent =
                showingArchived
                    ? "View and restore archived staff records."
                    : "View staff details, manage accounts, and monitor staff status.";
        }

        if ($("archiveToggleText")) {
            $("archiveToggleText").textContent =
                showingArchived
                    ? "Active Staff"
                    : "Archived Staff";
        }

        if ($("addStaffButton")) {
            $("addStaffButton").hidden = showingArchived;
        }

        const statusGroup =
            $("statusFilter")?.closest(".staff-filter-group");

        if (statusGroup) {
            statusGroup.hidden = showingArchived;
        }

        if (archiveButton) {
            archiveButton.classList.toggle(
                "archive-view-active",
                showingArchived
            );

            archiveButton.setAttribute(
                "aria-pressed",
                String(showingArchived)
            );

            const icon = archiveButton.querySelector("i");

            if (icon) {
                icon.className = showingArchived
                    ? "fa-solid fa-users"
                    : "fa-solid fa-box-archive";
            }
        }

        if ($("searchInput")) {
            $("searchInput").placeholder =
                showingArchived
                    ? "Search archived staff..."
                    : "Search staff name or ID...";
        }
    }

    function switchStaffView(toArchived) {
        if (
            archiveTransitioning ||
            showingArchived === toArchived
        ) {
            return;
        }

        if (!activeWrapper || !archivedWrapper) {
            toast("Archive table is missing in HTML.", "error");
            return;
        }

        archiveTransitioning = true;

        const outgoing = showingArchived
            ? archivedWrapper
            : activeWrapper;

        const incoming = toArchived
            ? archivedWrapper
            : activeWrapper;

        if (archiveButton) {
            archiveButton.disabled = true;
        }

        outgoing.classList.add("staff-view-exit");

        setTimeout(() => {
            outgoing.hidden = true;
            outgoing.classList.remove("staff-view-exit");

            showingArchived = toArchived;

            if ($("searchInput")) {
                $("searchInput").value = "";
            }

            if ($("positionFilter")) {
                $("positionFilter").value = "all";
            }

            if ($("statusFilter")) {
                $("statusFilter").value = "all";
            }

            updateArchiveHeader();
            updatePositions();

            if (showingArchived) {
                renderArchived();
            } else {
                renderStaff();
            }

            incoming.hidden = false;
            incoming.classList.add("staff-view-enter");

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    incoming.classList.add(
                        "staff-view-enter-active"
                    );
                });
            });

            setTimeout(() => {
                incoming.classList.remove(
                    "staff-view-enter",
                    "staff-view-enter-active"
                );

                archiveTransitioning = false;

                if (archiveButton) {
                    archiveButton.disabled = false;
                }
            }, 300);
        }, 160);
    }

    archiveButton?.addEventListener("click", () => {
        switchStaffView(!showingArchived);
    });

    /* ================= ADD STAFF ================= */

    function addStaff() {
        $("staffForm")?.reset();

        if ($("editingStaffId")) {
            $("editingStaffId").value = "";
        }

        if ($("staffStatus")) {
            $("staffStatus").value = "Active";
        }

        if ($("staffUsername")) {
            $("staffUsername").disabled = false;
            $("staffUsername").required = true;
        }

        if ($("staffPassword")) {
            $("staffPassword").required = true;
        }

        if ($("staffPasswordLabel")) {
            $("staffPasswordLabel").textContent =
                "Login Password";
        }

        if ($("staffPasswordRequired")) {
            $("staffPasswordRequired").hidden = false;
        }

        if ($("staffFormTitle")) {
            $("staffFormTitle").textContent =
                "Add New Staff";
        }

        if ($("staffFormSubtitle")) {
            $("staffFormSubtitle").textContent =
                "Enter the staff member's information below.";
        }

        if ($("saveStaffButton")) {
            $("saveStaffButton").innerHTML =
                '<i class="fa-solid fa-floppy-disk"></i> Save Staff';
        }

        showModal("staffFormModal");
    }

    $("addStaffButton")?.addEventListener(
        "click",
        addStaff
    );

    /* ================= EDIT STAFF ================= */

    function editStaff(id) {
        const staff = getStaff(id);

        if (!staff) {
            toast("Staff not found.", "error");
            return;
        }

        $("staffForm")?.reset();

        const values = {
            editingStaffId: staff.id,
            staffName: staff.name,
            staffEmail: staff.email,
            staffPhone: staff.phone,
            staffPosition: staff.position,
            staffAddress: staff.address,
            staffStatus: staff.status || "Active",
            staffUsername: staff.username
        };

        for (const [key, value] of Object.entries(values)) {
            if ($(key)) {
                $(key).value = value || "";
            }
        }

        if ($("staffUsername")) {
            $("staffUsername").disabled = true;
            $("staffUsername").required = false;
        }

        if ($("staffPassword")) {
            $("staffPassword").required = false;
            $("staffPassword").value = "";
        }

        if ($("staffPasswordLabel")) {
            $("staffPasswordLabel").textContent =
                "New Password (optional)";
        }

        if ($("staffPasswordRequired")) {
            $("staffPasswordRequired").hidden = true;
        }

        if ($("staffFormTitle")) {
            $("staffFormTitle").textContent =
                "Edit Staff Information";
        }

        if ($("staffFormSubtitle")) {
            $("staffFormSubtitle").textContent =
                "Update the information of this staff member.";
        }

        if ($("saveStaffButton")) {
            $("saveStaffButton").innerHTML =
                '<i class="fa-solid fa-floppy-disk"></i> Update Staff';
        }

        showModal("staffFormModal");
    }

    /* ================= SAVE STAFF ================= */

    $("staffForm")?.addEventListener(
        "submit",
        async event => {
            event.preventDefault();

            const id = $("editingStaffId")?.value || "";
            const name = $("staffName")?.value.trim() || "";
            const email = $("staffEmail")?.value.trim().toLowerCase() || "";
            const phone = $("staffPhone")?.value.trim() || "";
            const position = $("staffPosition")?.value || "";
            const address = $("staffAddress")?.value.trim() || "";
            const status = $("staffStatus")?.value || "Active";
            const username = $("staffUsername")?.value.trim() || "";
            const password = $("staffPassword")?.value || "";

            if (!name || !email || !phone || !position) {
                toast("Complete all required fields.", "error");
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                toast("Invalid email address.", "error");
                return;
            }

            if (!/^09\d{9}$/.test(phone)) {
                toast(
                    "Contact number must have 11 digits starting with 09.",
                    "error"
                );
                return;
            }

            if (!id && (!username || !password)) {
                toast(
                    "Username and password are required.",
                    "error"
                );
                return;
            }

            const duplicate = [...staffList, ...archivedStaff]
                .some(x =>
                    x.email?.toLowerCase() === email &&
                    String(x.id) !== String(id)
                );

            if (duplicate) {
                toast("Email already registered.", "error");
                return;
            }

            const payload = {
                name,
                email,
                phone,
                position,
                address,
                status,
                username,
                password
            };

            const saveButton = $("saveStaffButton");

            if (saveButton) {
                saveButton.disabled = true;
            }

            try {
                if (id) {
                    const existing = getStaff(id);

                    if (!existing?.userId) {
                        throw new Error(
                            "Missing backend user ID."
                        );
                    }

                    await request(
                        "PUT",
                        "/api/staff/" +
                            encodeURIComponent(existing.userId),
                        payload
                    );
                } else {
                    await request(
                        "POST",
                        "/api/staff",
                        payload
                    );
                }

                await refreshFromServer();

                renderStaff();
                closeForm();

                toast(
                    id
                        ? "Staff updated successfully."
                        : "Staff account created successfully."
                );
            } catch (error) {
                toast(error.message, "error");
            } finally {
                if (saveButton) {
                    saveButton.disabled = false;
                }
            }
        }
    );

    /* =====================================================
       ORGANIZED STAFF INFORMATION
       ===================================================== */

    function infoItem(label, value, icon) {
        return `
            <div class="printify-detail-item">
                <div class="printify-detail-icon">
                    <i class="${icon}"></i>
                </div>

                <div class="printify-detail-text">
                    <span>${safe(label)}</span>
                    <strong>${safe(value ?? "—") || "—"}</strong>
                </div>
            </div>
        `;
    }

    function statCard(label, value, icon, type = "") {
        return `
            <div class="printify-stat-card ${type}">
                <i class="${icon}"></i>
                <strong>${safe(value ?? 0)}</strong>
                <span>${safe(label)}</span>
            </div>
        `;
    }

    function viewStaff(id) {
        const staff = getStaff(id);

        if (!staff) {
            toast("Staff record not found.", "error");
            return;
        }

        viewedStaff = staff;

        const content = $("staffDetailsContent");

        if (!content) {
            toast("Staff details container missing.", "error");
            return;
        }

        const orders = staff.orders || {};
        const status = staff.status || "Inactive";

        const statusClass =
            status === "Active"
                ? "active"
                : status === "On Leave"
                    ? "on-leave"
                    : "inactive";

        content.innerHTML = `
            <div class="printify-staff-details">

                <!-- STAFF PROFILE -->
                <div class="printify-profile-header">
                    <div class="printify-profile-avatar">
                        ${safe(initials(staff.name))}
                    </div>

                    <div class="printify-profile-identity">
                        <h3>${safe(staff.name)}</h3>

                        <p>${safe(staff.position || "Staff")}</p>

                        <span class="printify-profile-id">
                            ${safe(staff.id)}
                        </span>
                    </div>

                    <span class="printify-profile-status ${statusClass}">
                        ${safe(status)}
                    </span>
                </div>

                <!-- PERSONAL INFORMATION -->
                <section class="printify-info-section">
                    <div class="printify-section-heading">
                        <i class="fa-regular fa-address-card"></i>
                        <h4>Personal Information</h4>
                    </div>

                    <div class="printify-details-grid">
                        ${infoItem(
                            "Full Name",
                            staff.name,
                            "fa-regular fa-user"
                        )}

                        ${infoItem(
                            "Email Address",
                            staff.email,
                            "fa-regular fa-envelope"
                        )}

                        ${infoItem(
                            "Contact Number",
                            staff.phone,
                            "fa-solid fa-phone"
                        )}

                        ${infoItem(
                            "Address",
                            staff.address,
                            "fa-solid fa-location-dot"
                        )}
                    </div>
                </section>

                <!-- EMPLOYMENT DETAILS -->
                <section class="printify-info-section">
                    <div class="printify-section-heading">
                        <i class="fa-solid fa-briefcase"></i>
                        <h4>Employment Details</h4>
                    </div>

                    <div class="printify-details-grid">
                        ${infoItem(
                            "Staff ID",
                            staff.id,
                            "fa-solid fa-id-badge"
                        )}

                        ${infoItem(
                            "Position",
                            staff.position,
                            "fa-solid fa-briefcase"
                        )}

                        ${infoItem(
                            "Username",
                            staff.username,
                            "fa-solid fa-at"
                        )}

                        ${infoItem(
                            "Date Added",
                            dateText(staff.dateAdded),
                            "fa-regular fa-calendar"
                        )}
                    </div>
                </section>

                <!-- ORDER STATISTICS -->
                <section class="printify-info-section">
                    <div class="printify-section-heading">
                        <i class="fa-solid fa-chart-column"></i>
                        <h4>Order Statistics</h4>
                    </div>

                    <div class="printify-stats-grid">
                        ${statCard(
                            "Total Orders",
                            orders.total,
                            "fa-solid fa-receipt"
                        )}

                        ${statCard(
                            "Pending",
                            orders.pending,
                            "fa-regular fa-clock",
                            "pending"
                        )}

                        ${statCard(
                            "In Progress",
                            orders.inProgress,
                            "fa-solid fa-spinner",
                            "progress"
                        )}

                        ${statCard(
                            "Completed",
                            orders.completed,
                            "fa-solid fa-circle-check",
                            "completed"
                        )}
                    </div>
                </section>

            </div>
        `;

        showModal("viewStaffModal");
    }

    /* ================= STAFF INFORMATION CSS ================= */

    function installStaffDetailsStyle() {
        if ($("printifyStaffDetailsStyle")) return;

        const style = document.createElement("style");

        style.id = "printifyStaffDetailsStyle";

        style.textContent = `
            #viewStaffModal .modal-content,
            #viewStaffModal .staff-modal,
            #viewStaffModal .staff-modal-content {
                width: min(760px, 95vw) !important;
                max-width: 760px !important;
                max-height: 90vh !important;
                overflow-y: auto !important;
            }

            #viewStaffModal .printify-staff-details {
                display: flex !important;
                flex-direction: column !important;
                gap: 18px !important;
                width: 100%;
                padding: 5px 0 12px;
            }

            #viewStaffModal .printify-profile-header {
                display: flex !important;
                align-items: center !important;
                gap: 16px !important;
                padding: 20px !important;
                border-radius: 15px;
                background: rgba(25,229,27,.07);
                border: 1px solid rgba(25,229,27,.20);
            }

            #viewStaffModal .printify-profile-avatar {
                width: 65px;
                height: 65px;
                flex-shrink: 0;
                display: grid;
                place-items: center;
                border-radius: 17px;
                background: #19e51b;
                color: #09240d;
                font-size: 22px;
                font-weight: 800;
            }

            #viewStaffModal .printify-profile-identity {
                flex: 1;
                min-width: 0;
            }

            #viewStaffModal .printify-profile-identity h3 {
                margin: 0 0 6px !important;
                font-size: 19px;
                color: #ffffff;
                overflow-wrap: anywhere;
            }

            #viewStaffModal .printify-profile-identity p {
                margin: 0 0 8px !important;
                font-size: 12px;
                color: #b7c9ba;
            }

            #viewStaffModal .printify-profile-id {
                display: inline-block;
                padding: 5px 10px;
                border-radius: 7px;
                background: rgba(25,229,27,.12);
                color: #83ff8d;
                font-size: 11px;
                font-weight: 700;
            }

            #viewStaffModal .printify-profile-status {
                padding: 8px 12px;
                border-radius: 25px;
                font-size: 11px;
                font-weight: 700;
                white-space: nowrap;
            }

            #viewStaffModal .printify-profile-status.active {
                color: #80ff90;
                background: rgba(25,229,27,.14);
            }

            #viewStaffModal .printify-profile-status.inactive {
                color: #ff9999;
                background: rgba(255,88,88,.13);
            }

            #viewStaffModal .printify-profile-status.on-leave {
                color: #ffd16b;
                background: rgba(255,195,64,.13);
            }

            #viewStaffModal .printify-info-section {
                display: block !important;
                padding: 20px !important;
                border-radius: 14px;
                background: rgba(255,255,255,.035);
                border: 1px solid rgba(255,255,255,.12);
            }

            #viewStaffModal .printify-section-heading {
                display: flex !important;
                align-items: center;
                gap: 10px;
                padding-bottom: 13px;
                margin-bottom: 18px;
                border-bottom: 1px solid rgba(255,255,255,.10);
            }

            #viewStaffModal .printify-section-heading i {
                color: #19e51b;
                font-size: 15px;
            }

            #viewStaffModal .printify-section-heading h4 {
                margin: 0 !important;
                color: #ffffff;
                font-size: 13px;
                font-weight: 800;
            }

            #viewStaffModal .printify-details-grid {
                display: grid !important;
                grid-template-columns:
                    repeat(2,minmax(0,1fr)) !important;
                gap: 20px !important;
            }

            #viewStaffModal .printify-detail-item {
                display: flex !important;
                align-items: flex-start;
                gap: 12px;
                min-width: 0;
            }

            #viewStaffModal .printify-detail-icon {
                width: 36px;
                height: 36px;
                flex-shrink: 0;
                display: grid;
                place-items: center;
                border-radius: 9px;
                background: rgba(25,229,27,.10);
                color: #82ff8e;
                font-size: 13px;
            }

            #viewStaffModal .printify-detail-text {
                display: flex !important;
                flex-direction: column;
                gap: 6px;
                min-width: 0;
            }

            #viewStaffModal .printify-detail-text span {
                color: #aabdab;
                font-size: 11px;
                font-weight: 500;
            }

            #viewStaffModal .printify-detail-text strong {
                color: #ffffff;
                font-size: 13px;
                font-weight: 650;
                line-height: 1.5;
                overflow-wrap: anywhere;
            }

            #viewStaffModal .printify-stats-grid {
                display: grid !important;
                grid-template-columns:
                    repeat(4,minmax(0,1fr)) !important;
                gap: 12px !important;
            }

            #viewStaffModal .printify-stat-card {
                display: flex !important;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 10px;
                min-height: 125px;
                padding: 16px 8px;
                border-radius: 12px;
                background: rgba(25,229,27,.07);
                border: 1px solid rgba(25,229,27,.18);
                text-align: center;
            }

            #viewStaffModal .printify-stat-card i {
                font-size: 17px;
                color: #80ff8d;
            }

            #viewStaffModal .printify-stat-card strong {
                font-size: 24px;
                font-weight: 800;
                color: #ffffff;
            }

            #viewStaffModal .printify-stat-card span {
                font-size: 11px;
                color: #b8cabb;
            }

            #viewStaffModal .printify-stat-card.pending i {
                color: #ffd16b;
            }

            #viewStaffModal .printify-stat-card.progress i {
                color: #79bfff;
            }

            #viewStaffModal .printify-stat-card.completed i {
                color: #80ff8d;
            }

            @media (max-width:600px) {
                #viewStaffModal .printify-profile-header {
                    flex-wrap: wrap;
                    padding: 15px !important;
                }

                #viewStaffModal .printify-details-grid {
                    grid-template-columns: 1fr !important;
                }

                #viewStaffModal .printify-stats-grid {
                    grid-template-columns:
                        repeat(2,minmax(0,1fr)) !important;
                }

                #viewStaffModal .printify-info-section {
                    padding: 15px !important;
                }
            }
        `;

        document.head.appendChild(style);
    }

    installStaffDetailsStyle();

    /* ================= ARCHIVE STAFF ================= */

    function openArchiveConfirmation(id) {
        const staff = getStaff(id);
        if (!staff) return;

        selectedStaffId = id;

        if ($("deleteStaffName")) {
            $("deleteStaffName").textContent = staff.name;
        }

        if ($("deleteStaffTitle")) {
            $("deleteStaffTitle").textContent =
                "Archive Staff Member?";
        }

        if ($("confirmDeleteStaff")) {
            $("confirmDeleteStaff").innerHTML =
                '<i class="fa-solid fa-box-archive"></i> Archive Staff';
        }

        showModal("deleteStaffModal");
    }

    $("cancelDeleteStaff")?.addEventListener(
        "click",
        () => {
            selectedStaffId = null;
            hideModal("deleteStaffModal");
        }
    );

    $("confirmDeleteStaff")?.addEventListener(
        "click",
        async () => {
            if (!selectedStaffId) return;

            const staff = getStaff(selectedStaffId);
            if (!staff) return;

            if (!staff.userId) {
                toast(
                    "Cannot archive: Missing backend user ID.",
                    "error"
                );
                return;
            }

            const button = $("confirmDeleteStaff");
            if (button) button.disabled = true;

            try {
                await request(
                    "PUT",
                    "/api/staff/" +
                        encodeURIComponent(staff.userId),
                    {
                        name: staff.name,
                        email: staff.email,
                        phone: staff.phone,
                        position: staff.position,
                        address: staff.address || "",
                        status: "Inactive",
                        username: staff.username || "",
                        password: ""
                    }
                );

                archivedStaff = archivedStaff.filter(
                    x => String(x.id) !== String(staff.id)
                );

                archivedStaff.push({
                    ...staff,
                    previousStatus: staff.status,
                    status: "Inactive",
                    archivedAt: new Date().toISOString()
                });

                staffList = staffList.filter(
                    x => String(x.id) !== String(staff.id)
                );

                saveData();

                selectedStaffId = null;
                hideModal("deleteStaffModal");

                renderStaff();
                renderArchived();

                toast("Staff archived successfully.");
            } catch (error) {
                toast(
                    "Archive failed: " + error.message,
                    "error"
                );
            } finally {
                if (button) button.disabled = false;
            }
        }
    );

    /* ================= RESTORE STAFF ================= */

    async function restoreStaff(id) {
        const staff = archivedStaff.find(
            x => String(x.id) === String(id)
        );

        if (!staff) {
            toast("Archived staff not found.", "error");
            return;
        }

        const yes = await confirmAction(
            "Restore Staff?",
            `Restore ${staff.name} to Active Staff?`,
            "Restore Staff"
        );

        if (!yes) return;

        if (!staff.userId) {
            toast("Missing backend user ID.", "error");
            return;
        }

        try {
            await request(
                "PUT",
                "/api/staff/" +
                    encodeURIComponent(staff.userId),
                {
                    name: staff.name,
                    email: staff.email,
                    phone: staff.phone,
                    position: staff.position,
                    address: staff.address || "",
                    status: staff.previousStatus || "Active",
                    username: staff.username || "",
                    password: ""
                }
            );

            archivedStaff = archivedStaff.filter(
                x => String(x.id) !== String(id)
            );

            staffList.push({
                ...staff,
                status: staff.previousStatus || "Active"
            });

            saveData();

            await refreshFromServer();

            renderStaff();
            renderArchived();

            toast("Staff restored successfully.");
        } catch (error) {
            toast(
                "Restore failed: " + error.message,
                "error"
            );
        }
    }

    /* ================= TABLE BUTTONS ================= */

    $("staffTableBody")?.addEventListener(
        "click",
        event => {
            const button = event.target.closest(
                "[data-action]"
            );

            if (!button) return;

            const id = button.dataset.id;

            switch (button.dataset.action) {
                case "view":
                    viewStaff(id);
                    break;

                case "edit":
                    editStaff(id);
                    break;

                case "archive":
                    openArchiveConfirmation(id);
                    break;
            }
        }
    );

    $("archivedStaffTableBody")?.addEventListener(
        "click",
        event => {
            const button = event.target.closest(
                "[data-archive-action]"
            );

            if (!button) return;

            if (
                button.dataset.archiveAction === "restore"
            ) {
                restoreStaff(button.dataset.id);
            }
        }
    );

    /* ================= SEARCH AND FILTERS ================= */

    function renderCurrentView() {
        if (showingArchived) {
            renderArchived();
        } else {
            renderStaff();
        }
    }

    $("searchInput")?.addEventListener(
        "input",
        renderCurrentView
    );

    $("positionFilter")?.addEventListener(
        "change",
        renderCurrentView
    );

    $("statusFilter")?.addEventListener(
        "change",
        renderCurrentView
    );

    $("resetFiltersButton")?.addEventListener(
        "click",
        () => {
            if ($("searchInput")) {
                $("searchInput").value = "";
            }

            if ($("positionFilter")) {
                $("positionFilter").value = "all";
            }

            if ($("statusFilter")) {
                $("statusFilter").value = "all";
            }

            renderCurrentView();
        }
    );

    /* ================= EXPORT ================= */

    function getExportRows() {
        const source = showingArchived
            ? archivedStaff
            : staffList;

        return source
            .filter(x => matchesFilters(x, showingArchived))
            .map(staff => ({
                "Staff ID": staff.id,
                "Full Name": staff.name,
                "Email": staff.email,
                "Username": staff.username || "",
                "Position": staff.position,
                "Contact Number": staff.phone,
                "Status": staff.status,
                "Date Added": dateText(staff.dateAdded),
                "Archived Date": showingArchived
                    ? dateText(staff.archivedAt)
                    : ""
            }));
    }

    function csvValue(value) {
        let text = String(value ?? "");

        if (/^[\s]*[=+\-@\t\r]/.test(text)) {
            text = "'" + text;
        }

        return '"' + text.replace(/"/g, '""') + '"';
    }

    function downloadBlob(content, filename, mime) {
        const blob = new Blob([content], {
            type: mime
        });

        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");

        anchor.href = url;
        anchor.download = filename;

        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();

        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);
    }

    function exportCSV() {
        const rows = getExportRows();

        if (!rows.length) {
            toast("No records to export.", "info");
            return;
        }

        const headers = Object.keys(rows[0]);

        const csv = [
            headers.map(csvValue).join(","),
            ...rows.map(row =>
                headers.map(key =>
                    csvValue(row[key])
                ).join(",")
            )
        ].join("\r\n");

        downloadBlob(
            "\uFEFF" + csv,
            showingArchived
                ? "Printify_Archived_Staff.csv"
                : "Printify_Active_Staff.csv",
            "text/csv;charset=utf-8"
        );

        toast("CSV exported successfully.");
    }

    function exportExcel() {
        const rows = getExportRows();

        if (!rows.length) {
            toast("No records to export.", "info");
            return;
        }

        if (!window.XLSX) {
            toast(
                "Excel library unavailable. Use CSV export.",
                "error"
            );
            return;
        }

        const sanitized = rows.map(row => {
            const copy = {};

            for (const [key, value] of Object.entries(row)) {
                const text = String(value ?? "");

                copy[key] = /^[\s]*[=+\-@\t\r]/.test(text)
                    ? "'" + text
                    : text;
            }

            return copy;
        });

        const workbook = XLSX.utils.book_new();

        const worksheet =
            XLSX.utils.json_to_sheet(sanitized);

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Staff"
        );

        XLSX.writeFile(
            workbook,
            showingArchived
                ? "Printify_Archived_Staff.xlsx"
                : "Printify_Active_Staff.xlsx"
        );

        toast("Excel exported successfully.");
    }

    $("exportStaffCsvButton")?.addEventListener(
        "click",
        exportCSV
    );

    $("exportStaffExcelButton")?.addEventListener(
        "click",
        exportExcel
    );

    /* ================= QR PRINT ================= */

    function printStaffQR() {
        if (!viewedStaff) {
            toast("Please select a staff member.", "error");
            return;
        }

        if (typeof window.QRCode === "undefined") {
            toast(
                "QR library not loaded. Add qrcode.min.js to HTML.",
                "error"
            );
            return;
        }

        const staff = viewedStaff;

        // Open during the click so popup blockers
        // do not block the print window.
        const printWindow = window.open(
            "",
            "_blank",
            "width=500,height=650"
        );

        if (!printWindow) {
            toast(
                "Please allow pop-ups to print the staff QR.",
                "error"
            );
            return;
        }

        const container = document.createElement("div");

        try {
            new QRCode(container, {
                text: JSON.stringify({
                    type: "PrintifyStaff",
                    staffId: String(staff.id)
                }),
                width: 220,
                height: 220,
                correctLevel: QRCode.CorrectLevel.H
            });

            const canvas = container.querySelector("canvas");

            const image = container.querySelector("img");

            const qrUrl = canvas
                ? canvas.toDataURL("image/png")
                : image?.src;

            if (!qrUrl) {
                printWindow.close();
                toast("Could not generate staff QR.", "error");
                return;
            }

            const name = safe(staff.name);
            const id = safe(staff.id);
            const position = safe(staff.position || "Staff");

            printWindow.document.open();

            printWindow.document.write(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>Printify Staff QR</title>

                    <style>
                        * {
                            box-sizing: border-box;
                        }

                        body {
                            margin: 0;
                            padding: 35px;
                            font-family: Arial, sans-serif;
                            background: white;
                            color: #153b20;
                            text-align: center;
                        }

                        .qr-card {
                            max-width: 360px;
                            margin: auto;
                            padding: 30px;
                            border: 2px solid #168e30;
                            border-radius: 18px;
                        }

                        h1 {
                            margin: 0 0 10px;
                            color: #168e30;
                        }

                        h2 {
                            margin: 15px 0 6px;
                        }

                        p {
                            color: #53675a;
                        }

                        img {
                            display: block;
                            width: 220px;
                            height: 220px;
                            margin: 25px auto;
                        }

                        .staff-id {
                            font-weight: bold;
                            color: #168e30;
                        }

                        @media print {
                            body {
                                padding: 0;
                            }
                        }
                    </style>
                </head>

                <body>
                    <div class="qr-card">
                        <h1>Printify</h1>
                        <p>Staff Identification</p>

                        <img
                            src="${qrUrl}"
                            alt="Staff QR Code"
                        >

                        <h2>${name}</h2>
                        <p>${position}</p>

                        <p class="staff-id">
                            ${id}
                        </p>
                    </div>
                </body>
                </html>
            `);

            printWindow.document.close();

            printWindow.addEventListener("load", () => {
                printWindow.focus();
                printWindow.print();
            }, { once: true });
        } catch (error) {
            printWindow.close();
            toast(
                "QR printing failed: " + error.message,
                "error"
            );
        }
    }

    const printQRButton =
        $("printStaffQrButton") ||
        $("printStaffQRButton");

    printQRButton?.addEventListener(
        "click",
        printStaffQR
    );

    /* ================= MODAL BACKDROP ================= */

    [
        "staffFormModal",
        "viewStaffModal",
        "deleteStaffModal"
    ].forEach(id => {
        const modal = $(id);
        if (!modal) return;

        modal.addEventListener("click", event => {
            if (event.target !== modal) return;

            if (id === "staffFormModal") {
                closeForm();
            } else {
                hideModal(id);
            }
        });
    });

    document.addEventListener("keydown", event => {
        if (event.key !== "Escape") return;

        if ($("staffFormModal")?.classList.contains("active")) {
            closeForm();
        }

        if ($("viewStaffModal")?.classList.contains("active")) {
            hideModal("viewStaffModal");
        }

        if ($("deleteStaffModal")?.classList.contains("active")) {
            hideModal("deleteStaffModal");
        }
    });

    /* ================= INITIALIZE ================= */

    async function initialize() {
        loadData();

        if (activeWrapper) {
            activeWrapper.hidden = false;
        }

        if (archivedWrapper) {
            archivedWrapper.hidden = true;
        }

        updateArchiveHeader();
        renderStaff();

        await refreshFromServer();

        renderStaff();
        renderArchived();
    }

    initialize();
});

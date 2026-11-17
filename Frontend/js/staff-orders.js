
document.addEventListener("DOMContentLoaded", () => {

    // =====================================
    // ELEMENTS
    // =====================================

    const body = document.body;

    // Keep the sidebar open when the My Orders page first loads.
    if (window.innerWidth > 900) body.classList.remove("sidebar-hidden");

    const sidebar = document.getElementById("sidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const menuToggle = document.getElementById("menuToggle");

    const themeToggle = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");

    const profileButton = document.getElementById("profileButton");
    const profileDropdown = document.getElementById("profileDropdown");

    const notificationButton = document.getElementById("notificationButton");

    const orderSearch = document.getElementById("orderSearch");
    const orderStatusFilter = document.getElementById("orderStatusFilter");
    const orderSort = document.getElementById("orderSort");

    const ordersBody = document.getElementById("myOrdersBody");
    const orderCount = document.getElementById("orderCount");

    const orderModal = document.getElementById("orderModal");
    const closeOrderModal = document.getElementById("closeOrderModal");
    const cancelOrderModal = document.getElementById("cancelOrderModal");
    const saveOrderStatus = document.getElementById("saveOrderStatus");

    let selectedOrderId = null;

    const STORAGE_KEY = "printify-staff-orders-demo";
    const THEME_KEY = "printify-theme";

    // =====================================
    // SAMPLE ORDERS
    // DEMO DATA ONLY
    // =====================================

    const sampleOrders = [
        {
            id: "ORD-2026-001",
            customer: "Maria Santos",
            contact: "09XX XXX 1234",
            product: "Colored A4 Printing",
            quantity: 50,
            date: "2026-11-12",
            status: "Pending",
            payment: "Paid",
            notes: "Full color printing. Use clean A4 paper."
        },
        {
            id: "ORD-2026-002",
            customer: "John Reyes",
            contact: "09XX XXX 2345",
            product: "Document Photocopy",
            quantity: 100,
            date: "2026-11-12",
            status: "Processing",
            payment: "Partially Paid",
            notes: "Double-sided photocopy."
        },
        {
            id: "ORD-2026-003",
            customer: "Angela Cruz",
            contact: "09XX XXX 3456",
            product: "Photo Printing 4R",
            quantity: 20,
            date: "2026-11-11",
            status: "Ready for Pickup",
            payment: "Paid",
            notes: "Use glossy photo paper."
        },
        {
            id: "ORD-2026-004",
            customer: "Mark Dela Cruz",
            contact: "09XX XXX 4567",
            product: "Thesis Printing",
            quantity: 3,
            date: "2026-11-11",
            status: "Completed",
            payment: "Paid",
            notes: "Black and white, long bond paper."
        },
        {
            id: "ORD-2026-005",
            customer: "Sofia Garcia",
            contact: "09XX XXX 5678",
            product: "Tarpaulin Printing",
            quantity: 1,
            date: "2026-11-10",
            status: "Processing",
            payment: "Unpaid",
            notes: "Check the layout before printing."
        },
        {
            id: "ORD-2026-006",
            customer: "Daniel Flores",
            contact: "09XX XXX 6789",
            product: "ID Picture Printing",
            quantity: 12,
            date: "2026-11-09",
            status: "Pending",
            payment: "Paid",
            notes: "2x2 ID pictures."
        },
        {
            id: "ORD-2026-007",
            customer: "Patricia Lim",
            contact: "09XX XXX 7890",
            product: "Document Printing",
            quantity: 75,
            date: "2026-11-08",
            status: "Completed",
            payment: "Paid",
            notes: "Black and white printing."
        }
    ];

    // =====================================
    // LOAD AND SAVE ORDERS
    // =====================================

    function loadOrders() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.error("Unable to load orders:", error);
        }

        return [];
    }

    let orders = loadOrders();

    // Itala ang status na nasa server para malaman kung ano ang nabago.
    orders.forEach(order => { order._savedStatus = order.status; });

    // Status lang ang puwedeng baguhin ng Staff, at sariling order lang.
    function saveOrders() {

        const failures = [];

        orders.forEach(order => {

            if (order._savedStatus === undefined || order._savedStatus === order.status) {
                order._savedStatus = order.status;
                return;
            }

            const result = window.PrintifyAPI
                ? window.PrintifyAPI.updateOrderStatus(order.id, order.status)
                : { ok: false };

            if (result.ok) {
                order._savedStatus = order.status;
            } else {
                failures.push(result.message || "Unable to update " + order.id + ".");
                order.status = order._savedStatus;
            }

        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));

        if (failures.length > 0 && typeof Swal !== "undefined") {
            Swal.fire({
                icon: "error",
                title: "Update Failed",
                text: failures[0]
            });
        }

        return failures.length === 0;

    }

    // =====================================
    // DATE AND YEAR
    // =====================================

    function updateDate() {
        const dateContainer = document.getElementById("currentDate");

        if (dateContainer) {
            const span = dateContainer.querySelector("span");

            if (span) {
                span.textContent = new Date().toLocaleDateString("en-PH", {
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                });
            }
        }

        const year = new Date().getFullYear();

        document.getElementById("currentYear").textContent = year;
        document.getElementById("sidebarYear").textContent = year;
    }

    updateDate();

    // =====================================
    // STAFF PROFILE
    // =====================================

    function loadStaffProfile() {
        const name =
            localStorage.getItem("printify-user-name") ||
            localStorage.getItem("staffName") ||
            "Staff Member";

        const email =
            localStorage.getItem("printify-user-email") ||
            localStorage.getItem("staffEmail") ||
            "";

        const initial = name.charAt(0).toUpperCase();

        const nameElements = [
            "sidebarName",
            "profileName",
            "dropdownName"
        ];

        nameElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = name;
        });

        const emailElement = document.getElementById("dropdownEmail");

        if (emailElement) {
            emailElement.textContent = email;
        }

        const avatarElements = [
            "sidebarAvatar",
            "profileAvatar",
            "dropdownAvatar"
        ];

        avatarElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = initial;
        });
    }

    loadStaffProfile();

    // =====================================
    // SIDEBAR
    // =====================================

    function closeSidebar() {
        body.classList.add("sidebar-hidden");
        sidebarOverlay?.classList.remove("show");
    }

    function toggleSidebar() {
        body.classList.toggle("sidebar-hidden");

        if (window.innerWidth <= 900) {
            sidebarOverlay?.classList.toggle(
                "show",
                !body.classList.contains("sidebar-hidden")
            );
        }
    }

    menuToggle?.addEventListener("click", toggleSidebar);

    sidebarOverlay?.addEventListener("click", closeSidebar);

    // =====================================
    // THEME
    // =====================================

    function applyTheme() {
        const savedTheme = localStorage.getItem(THEME_KEY) || "light";

        body.classList.toggle("light-mode", savedTheme === "light");
        body.classList.toggle("dark-mode", savedTheme !== "light");

        updateThemeIcon();
    }

    function updateThemeIcon() {
        if (!themeIcon) return;

        themeIcon.src = body.classList.contains("light-mode")
            ? "image/darkmode_icon.png"
            : "image/lightmode_icon.png";
    }

    themeToggle?.addEventListener("click", () => {
        const isLight = body.classList.contains("light-mode");

        body.classList.toggle("light-mode", !isLight);
        body.classList.toggle("dark-mode", isLight);

        localStorage.setItem(THEME_KEY, isLight ? "dark" : "light");

        updateThemeIcon();
    });

    applyTheme();

    // =====================================
    // PROFILE DROPDOWN
    // =====================================

    profileButton?.addEventListener("click", event => {
        event.stopPropagation();

        const isOpen = profileDropdown.classList.toggle("show");

        profileButton.setAttribute("aria-expanded", String(isOpen));
    });

    document.addEventListener("click", event => {
        if (
            profileDropdown &&
            !profileDropdown.contains(event.target) &&
            !profileButton?.contains(event.target)
        ) {
            profileDropdown.classList.remove("show");
            profileButton?.setAttribute("aria-expanded", "false");
        }
    });

    // =====================================
    // NOTIFICATIONS
    // =====================================

    notificationButton?.addEventListener("click", () => {
        window.location.href = "staff-notifications.html";
    });

    // =====================================
    // HELPERS
    // =====================================

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[character]);
    }

    function formatDate(value) {
        if (!value) return "—";

        const date = new Date(value + "T00:00:00");

        if (Number.isNaN(date.getTime())) return "—";

        return date.toLocaleDateString("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    }

    function getStatusClass(status) {
        switch (status) {
            case "Pending":
                return "pending";

            case "Processing":
                return "processing";

            case "Ready for Pickup":
                return "ready";

            case "Completed":
                return "completed";

            case "Cancelled":
                return "cancelled";

            default:
                return "pending";
        }
    }

    // =====================================
    // UPDATE SUMMARY
    // =====================================

    function updateSummary() {
        document.getElementById("assignedOrders").textContent = orders.length;

        document.getElementById("pendingOrders").textContent =
            orders.filter(order => order.status === "Pending").length;

        document.getElementById("processingOrders").textContent =
            orders.filter(order => order.status === "Processing").length;

        document.getElementById("completedOrders").textContent =
            orders.filter(order => order.status === "Completed").length;
    }

    // =====================================
    // SEARCH, FILTER AND SORT
    // =====================================

    function getFilteredOrders() {
        const search = orderSearch.value.trim().toLowerCase();
        const status = orderStatusFilter.value;
        const sort = orderSort.value;

        let filtered = orders.filter(order => {
            const matchesSearch =
                order.id.toLowerCase().includes(search) ||
                order.customer.toLowerCase().includes(search) ||
                order.product.toLowerCase().includes(search);

            const matchesStatus =
                status === "all" ||
                order.status.toLowerCase() === status;

            return matchesSearch && matchesStatus;
        });

        filtered.sort((a, b) => {
            const first = new Date(a.date);
            const second = new Date(b.date);

            return sort === "oldest"
                ? first - second
                : second - first;
        });

        return filtered;
    }

    // =====================================
    // RENDER TABLE
    // =====================================

    function renderOrders() {
        const filtered = getFilteredOrders();

        ordersBody.innerHTML = "";

        if (filtered.length === 0) {
            ordersBody.innerHTML = `
                <tr>
                    <td colspan="6" class="orders-empty-state">
                        <i class="fa-solid fa-inbox"></i>
                        <strong>No orders found</strong>
                        <span>Try changing your search or filters.</span>
                    </td>
                </tr>
            `;

            orderCount.textContent = "Showing 0 orders";
            return;
        }

        filtered.forEach(order => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>
                    <span class="order-id-cell">${escapeHTML(order.id)}</span>
                </td>

                <td>
                    <span class="customer-name">${escapeHTML(order.customer)}</span>
                    <span class="customer-contact">${escapeHTML(order.contact)}</span>
                </td>

                <td>
                    <span class="product-name">${escapeHTML(order.product)}</span>
                    <span class="product-quantity">Quantity: ${escapeHTML(order.quantity)}</span>
                </td>

                <td>
                    <span class="order-date">${formatDate(order.date)}</span>
                </td>

                <td>
                    <span class="order-status ${getStatusClass(order.status)}">
                        ${escapeHTML(order.status)}
                    </span>
                </td>

                <td>
                    <button
                        type="button"
                        class="order-view-button"
                        data-order-id="${escapeHTML(order.id)}"
                        title="View order details">
                        <i class="fa-regular fa-eye"></i>
                    </button>
                </td>
            `;

            ordersBody.appendChild(row);
        });

        orderCount.textContent =
            `Showing ${filtered.length} of ${orders.length} orders`;
    }

    // =====================================
    // ORDER DETAILS MODAL
    // =====================================

    function openOrderModal(id) {
        const order = orders.find(item => item.id === id);

        if (!order) return;

        selectedOrderId = id;

        document.getElementById("modalOrderId").textContent = order.id;
        document.getElementById("modalCustomer").textContent = order.customer;
        document.getElementById("modalContact").textContent = order.contact;
        document.getElementById("modalProduct").textContent = order.product;
        document.getElementById("modalQuantity").textContent = order.quantity;
        document.getElementById("modalDate").textContent = formatDate(order.date);
        document.getElementById("modalPayment").textContent = order.payment;
        document.getElementById("modalNotes").textContent =
            order.notes || "No additional notes.";

        document.getElementById("modalStatus").value = order.status;

        orderModal.classList.add("show");
        body.style.overflow = "hidden";
    }

    function closeModal() {
        orderModal.classList.remove("show");
        body.style.overflow = "";
        selectedOrderId = null;
    }

    ordersBody.addEventListener("click", event => {
        const button = event.target.closest(".order-view-button");

        if (!button) return;

        openOrderModal(button.dataset.orderId);
    });

    closeOrderModal.addEventListener("click", closeModal);
    cancelOrderModal.addEventListener("click", closeModal);

    orderModal.addEventListener("click", event => {
        if (event.target === orderModal) {
            closeModal();
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeModal();

            profileDropdown?.classList.remove("show");
            profileButton?.setAttribute("aria-expanded", "false");

            if (window.innerWidth <= 900) {
                closeSidebar();
            }
        }
    });

    // =====================================
    // SAVE ORDER STATUS
    // =====================================

    saveOrderStatus.addEventListener("click", async () => {
        if (!selectedOrderId) return;

        const order = orders.find(item => item.id === selectedOrderId);

        if (!order) return;

        const newStatus = document.getElementById("modalStatus").value;

        if (order.status === newStatus) {
            closeModal();
            return;
        }

        const result = await Swal.fire({
            title: "Update Order Status?",
            text: `Change ${order.id} to ${newStatus}?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, Update",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#19e51b",
            cancelButtonColor: "#647067",
            background: body.classList.contains("light-mode")
                ? "#f3f7f3"
                : "#101a12",
            color: body.classList.contains("light-mode")
                ? "#17251a"
                : "#f3f8f3"
        });

        if (!result.isConfirmed) return;

        order.status = newStatus;

        const saved = saveOrders();
        updateSummary();
        renderOrders();
        closeModal();

        if (!saved) return;

        Swal.fire({
            icon: "success",
            title: "Status Updated",
            text: `Order ${order.id} is now ${newStatus}.`,
            timer: 1800,
            showConfirmButton: false,
            background: body.classList.contains("light-mode")
                ? "#f3f7f3"
                : "#101a12",
            color: body.classList.contains("light-mode")
                ? "#17251a"
                : "#f3f8f3"
        });
    });

    // =====================================
    // FILTER EVENTS
    // =====================================

    orderSearch.addEventListener("input", renderOrders);
    orderStatusFilter.addEventListener("change", renderOrders);
    orderSort.addEventListener("change", renderOrders);

    document.getElementById("clearOrderFilters").addEventListener("click", () => {
        orderSearch.value = "";
        orderStatusFilter.value = "all";
        orderSort.value = "newest";

        renderOrders();
    });

    // =====================================
    // REFRESH
    // =====================================

    document.getElementById("refreshOrders").addEventListener("click", () => {
        const fresh = window.PrintifyAPI && window.PrintifyAPI.fetchMyOrders();

        if (!Array.isArray(fresh)) {
            Swal.fire({
                icon: "error",
                title: "Unable to refresh orders",
                text: "Check your connection and try again."
            });
            return;
        }

        fresh.forEach(order => { order._savedStatus = order.status; });
        orders = fresh;
        updateSummary();
        renderOrders();
        updateDate();

        Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "Orders refreshed",
            showConfirmButton: false,
            timer: 1600,
            timerProgressBar: true
        });
    });

    // =====================================
    // LOGOUT
    // =====================================

    async function logout() {
        const result = await Swal.fire({
            title: "Log Out?",
            text: "Are you sure you want to end your session?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, Log Out",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#19e51b",
            cancelButtonColor: "#647067",
            background: body.classList.contains("light-mode")
                ? "#f3f7f3"
                : "#101a12",
            color: body.classList.contains("light-mode")
                ? "#17251a"
                : "#f3f8f3"
        });

        if (result.isConfirmed) {
            (window.PrintifyAPI ? PrintifyAPI.logout() : (window.location.href = "login.html"));
        }
    }

    document.getElementById("logoutButton")?.addEventListener("click", logout);
    document.getElementById("sidebarLogoutButton")?.addEventListener("click", logout);

    // =====================================
    // INITIALIZE
    // =====================================

    updateSummary();
    renderOrders();

    // Kunin ang mga bagong naka-assign na orders mula sa Admin (bawat 15 segundo).
    setInterval(() => {

        if (document.hidden || orderModal.classList.contains("show") || !window.PrintifyAPI) {
            return;
        }

        const fresh = window.PrintifyAPI.fetchMyOrders();

        if (!fresh) return;

        fresh.forEach(order => { order._savedStatus = order.status; });

        orders = fresh;
        updateSummary();
        renderOrders();

    }, 15000);

});

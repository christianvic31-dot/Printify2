
/* =========================================================
   PRINTIFY CALAPAN
   ORDERS PAGE JAVASCRIPT
   PART 1 — ELEMENTS, STORAGE AND HELPERS
========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    /* =====================================================
       1. STORAGE AND ELEMENTS
    ===================================================== */

    const ORDERS_KEY = "printifyOrders";
    const THEME_KEY = "printify-theme";
    const SIDEBAR_KEY = "printify-sidebar-hidden";

    const sidebar = document.getElementById("sidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const menuToggle = document.getElementById("menuToggle");

    const themeToggle = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");

    const currentDate = document.getElementById("currentDate");
    const currentYear = document.getElementById("currentYear");

    const profileButton = document.getElementById("profileButton");
    const profileDropdown = document.getElementById("profileDropdown");
    const logoutButton = document.getElementById("logoutButton");
    const notificationButton = document.getElementById("notificationButton");

    const totalOrders = document.getElementById("totalOrders");
    const pendingOrders = document.getElementById("pendingOrders");
    const processingOrders = document.getElementById("processingOrders");
    const completedOrders = document.getElementById("completedOrders");

    const searchOrders = document.getElementById("searchOrders");
    const clearSearch = document.getElementById("clearSearch");
    const statusFilter = document.getElementById("statusFilter");
    const paymentFilter = document.getElementById("paymentFilter");
    const resetFilters = document.getElementById("resetFilters");

    const ordersTableBody = document.getElementById("ordersTableBody");
    const emptyState = document.getElementById("emptyState");

    const recordCount = document.getElementById("recordCount");
    const tableInformation = document.getElementById("tableInformation");

    const addOrderButton = document.getElementById("addOrderButton");
    const emptyCreateButton = document.getElementById("emptyCreateButton");

    const orderModal = document.getElementById("orderModal");
    const orderForm = document.getElementById("orderForm");

    const modalTitle = document.getElementById("modalTitle");
    const editOrderId = document.getElementById("editOrderId");

    const customerName = document.getElementById("customerName");
    const customerContact = document.getElementById("customerContact");
    const printingService = document.getElementById("printingService");
    const quantity = document.getElementById("quantity");
    const unitPrice = document.getElementById("unitPrice");

    const orderDate = document.getElementById("orderDate");
    const dueDate = document.getElementById("dueDate");

    const orderStatus = document.getElementById("orderStatus");
    const paymentStatus = document.getElementById("paymentStatus");
    const amountPaid = document.getElementById("amountPaid");
    const orderNotes = document.getElementById("orderNotes");
    const assignedStaff = document.getElementById("assignedStaff");

    const orderTotalPreview = document.getElementById("orderTotalPreview");
    const formMessage = document.getElementById("formMessage");

    const closeOrderModal = document.getElementById("closeOrderModal");
    const cancelOrderButton = document.getElementById("cancelOrderButton");
    const saveOrderButton = document.getElementById("saveOrderButton");

    const viewOrderModal = document.getElementById("viewOrderModal");
    const orderDetailsContent = document.getElementById("orderDetailsContent");

    const closeViewModal = document.getElementById("closeViewModal");
    const closeViewButton = document.getElementById("closeViewButton");
    const editFromViewButton = document.getElementById("editFromViewButton");

    const exportOrdersButton = document.getElementById("exportOrdersButton");
    const exportExcelButton = document.getElementById("exportExcelButton");

    const toastMessage = document.getElementById("toastMessage");
    const toastText = document.getElementById("toastText");
    const toastIcon = document.getElementById("toastIcon");

    /* ARCHIVED ORDERS */

    const showArchivedOrdersButton =
        document.getElementById("showArchivedOrdersButton");

    const backToActiveOrdersButton =
        document.getElementById("backToActiveOrdersButton");

    const archivedOrdersPanel =
        document.getElementById("archivedOrdersPanel");

    const archivedOrdersTableBody =
        document.getElementById("archivedOrdersTableBody");

    const archivedRecordCount =
        document.getElementById("archivedRecordCount");

    const archivedEmptyState =
        document.getElementById("archivedEmptyState");

    const searchArchivedOrders =
        document.getElementById("searchArchivedOrders");

    let orders = loadOrders();
    let archivedOrders = [];

    let selectedViewOrderId = null;
    let selectedArchiveOrderId = null;
    let confirmationAction = null;

    let toastTimer = null;
    let archiveActionInProgress = false;

    /* =====================================================
       2. STORAGE
    ===================================================== */

    function loadOrders() {
        try {
            const saved = localStorage.getItem(ORDERS_KEY);

            if (!saved) return [];

            const parsed = JSON.parse(saved);

            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error("Unable to load orders:", error);
            return [];
        }
    }

    function saveOrders() {
        try {
            if (
                window.PrintifyAPI &&
                typeof window.PrintifyAPI.syncOrders === "function"
            ) {
                const result = window.PrintifyAPI.syncOrders(orders);

                if (result && result.ok === false) {
                    showToast(
                        result.message || "Unable to save orders.",
                        "error"
                    );
                    return false;
                }
            }

            localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
            return true;

        } catch (error) {
            console.error("Unable to save orders:", error);

            showToast(
                "Unable to save orders. Please check your connection.",
                "error"
            );

            return false;
        }
    }

    function loadStaffOptions() {
        try {
            const saved = JSON.parse(
                localStorage.getItem("printifyStaff") || "[]"
            );

            return Array.isArray(saved) ? saved : [];
        } catch (error) {
            return [];
        }
    }

    /* =====================================================
       3. GENERAL HELPERS
    ===================================================== */

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (character) {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };

            return entities[character];
        });
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            minimumFractionDigits: 2
        }).format(Number(value) || 0);
    }

    function formatDate(value) {
        if (!value) return "—";

        const date = new Date(value);


        if (Number.isNaN(date.getTime())) {
            return String(value);
        }

        return date.toLocaleDateString("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    }

    function getToday() {
        const today = new Date();

        return [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(2, "0"),
            String(today.getDate()).padStart(2, "0")
        ].join("-");
    }

    function showToast(message, type = "success") {
        if (!toastMessage || !toastText) {
            console.log(message);
            return;
        }

        clearTimeout(toastTimer);

        toastText.textContent = message;
        toastMessage.classList.remove("error");

        if (type === "error") {
            toastMessage.classList.add("error");

            if (toastIcon) {
                toastIcon.className =
                    "fa-solid fa-circle-exclamation";
            }
        } else if (toastIcon) {
            toastIcon.className =
                "fa-solid fa-circle-check";
        }

        toastMessage.classList.add("show");

        toastTimer = setTimeout(function () {
            toastMessage.classList.remove("show");
        }, 3000);
    }

    function getInitials(name) {
        return String(name || "")
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(part => part.charAt(0).toUpperCase())
            .join("");
    }

    function getStatusClass(status) {
        return String(status || "")
            .toLowerCase()
            .replace(/\s+/g, "-");
    }

    function getPaymentClass(status) {
        return String(status || "")
            .toLowerCase()
            .replace(/\s+/g, "-");
    }

    function generateOrderId() {
        let highestNumber = 0;

        [...orders, ...archivedOrders].forEach(function (order) {
            const match = String(
                order.id || order.Id || ""
            ).match(/ORD-(\d+)/);

            if (match) {
                highestNumber = Math.max(
                    highestNumber,
                    Number(match[1])
                );
            }
        });

        return "ORD-" +
            String(highestNumber + 1).padStart(4, "0");
    }

    function getAssignedStaffName(id) {
        if (!id) return "";

        const match = loadStaffOptions().find(function (staff) {
            return String(staff.userId) === String(id);
        });

        return match ? match.name : "";
    }

    function populateStaffSelect(selectedId, selectedName) {
        if (!assignedStaff) return;

        assignedStaff.innerHTML = "";

        const none = document.createElement("option");
        none.value = "";
        none.textContent = "Auto-assign to next active staff";
        assignedStaff.appendChild(none);

        let found = false;

        loadStaffOptions().forEach(function (staff) {
            const isSelected =
                String(staff.userId) === String(selectedId);

            if (staff.status === "Inactive" && !isSelected) {
                return;
            }

            const option = document.createElement("option");
            option.value = staff.userId;
            option.textContent =
                staff.name +
                (staff.position ? " - " + staff.position : "");

            assignedStaff.appendChild(option);

            if (isSelected) found = true;
        });

        if (selectedId && !found) {
            const option = document.createElement("option");
            option.value = selectedId;
            option.textContent =
                selectedName || "Former staff";
            assignedStaff.appendChild(option);
        }

        assignedStaff.value = selectedId || "";
    }

    function getArchivedValue(order, camelName, pascalName) {
        return order?.[camelName] ?? order?.[pascalName];
    }

    function normalizeOrdersResponse(result) {
        if (Array.isArray(result)) return result;
        if (Array.isArray(result?.data)) return result.data;
        if (Array.isArray(result?.orders)) return result.orders;
        if (Array.isArray(result?.items)) return result.items;
        if (Array.isArray(result?.data?.orders)) {
            return result.data.orders;
        }

        return null;
    }

    /* =====================================================
       4. CURRENT DATE AND YEAR
    ===================================================== */

    if (currentDate) {
        const dateText = currentDate.querySelector("span");

        if (dateText) {
            dateText.textContent = new Date().toLocaleDateString("en-PH", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric"
            });
        }
    }

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    /* =====================================================
       5. SIDEBAR
    ===================================================== */

    function isMobileView() {
        return window.matchMedia("(max-width: 850px)").matches;
    }

    function setSidebarState(hidden, save = true) {
        if (!sidebar) return;

        sidebar.classList.toggle("is-hidden", hidden);
        document.body.classList.toggle("sidebar-hidden", hidden);

        if (menuToggle) {
            menuToggle.setAttribute("aria-expanded", String(!hidden));
        }

        if (sidebarOverlay) {
            sidebarOverlay.classList.toggle(
                "show",
                !hidden && isMobileView()
            );
        }

        if (save && !isMobileView()) {
            localStorage.setItem(SIDEBAR_KEY, String(hidden));
        }
    }

    if (sidebar) {
        const saved = localStorage.getItem(SIDEBAR_KEY);

        if (isMobileView()) {
            setSidebarState(true, false);
        } else if (saved !== null) {
            setSidebarState(saved === "true", false);
        } else {
            setSidebarState(false, false);
        }
    }

    if (menuToggle) {
        menuToggle.addEventListener("click", function () {
            const hidden = sidebar
                ? sidebar.classList.contains("is-hidden")
                : true;

            setSidebarState(!hidden);
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener("click", function () {
            setSidebarState(true);
        });
    }

    window.addEventListener("resize", function () {
        if (isMobileView()) {
            setSidebarState(true, false);
        } else {
            setSidebarState(
                localStorage.getItem(SIDEBAR_KEY) === "true",
                false
            );
        }
    });

    /* =====================================================
       6. THEME
    ===================================================== */

    function applyTheme(theme) {
        const dark = theme !== "light";

        document.body.classList.toggle("dark-mode", dark);

        if (themeIcon) {
            themeIcon.src = dark
                ? "image/lightmode_icon.png"
                : "image/darkmode_icon.png";
        }

        if (themeToggle) {
            themeToggle.setAttribute(
                "aria-label",
                dark ? "Switch to light mode" : "Switch to dark mode"
            );
        }
    }

    applyTheme(localStorage.getItem(THEME_KEY) || "dark");

    if (themeToggle) {
        themeToggle.addEventListener("click", function () {
            const nextTheme = document.body.classList.contains("dark-mode")
                ? "light"
                : "dark";

            localStorage.setItem(THEME_KEY, nextTheme);
            applyTheme(nextTheme);
        });
    }

    /* =====================================================
       7. PROFILE, LOGOUT, NOTIFICATIONS
    ===================================================== */

    if (profileButton && profileDropdown) {
        profileButton.addEventListener("click", function (event) {
            event.stopPropagation();

            const isOpen = profileDropdown.classList.toggle("show");

            profileButton.setAttribute("aria-expanded", String(isOpen));
        });

        profileDropdown.addEventListener("click", function (event) {
            event.stopPropagation();
        });

        document.addEventListener("click", function () {
            profileDropdown.classList.remove("show");
            profileButton.setAttribute("aria-expanded", "false");
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            if (!window.confirm("Are you sure you want to log out?")) {
                return;
            }

            if (
                window.PrintifyAPI &&
                typeof window.PrintifyAPI.logout === "function"
            ) {
                window.PrintifyAPI.logout();
            } else {
                window.location.href = "login.html";
            }
        });
    }

    if (notificationButton) {
        notificationButton.addEventListener("click", function () {
            showToast("You are all caught up with your notifications.");
        });
    }

    /* =====================================================
       8. ORDER TOTAL
    ===================================================== */

    function calculateTotal() {
        const qty = Number(quantity?.value) || 0;
        const price = Number(unitPrice?.value) || 0;
        const total = qty * price;

        if (orderTotalPreview) {
            orderTotalPreview.textContent = formatCurrency(total);
        }

        return total;
    }

    quantity?.addEventListener("input", calculateTotal);
    unitPrice?.addEventListener("input", calculateTotal);

    /* =====================================================
       9. ORDER MODALS
    ===================================================== */

    let orderFormSnapshot = "";

    function captureOrderForm() {
        if (!orderForm) return "";

        return JSON.stringify(
            Array.from(orderForm.elements)
                .filter(element => element.id)
                .map(element => [element.id, element.value])
        );
    }

    function syncModalScroll() {
        const archive =
            document.getElementById("printifyArchiveConfirm");

        const anyOpen = [
            orderModal,
            viewOrderModal,
            archive
        ].some(element => element?.classList.contains("show"));

        document.body.classList.toggle("modal-open", anyOpen);
    }

    function openOrderModal(editing = false) {
        if (!orderModal) return;

        orderModal.classList.add("show");
        orderModal.setAttribute("aria-hidden", "false");

        if (modalTitle) {
            modalTitle.textContent = editing
                ? "Edit Order"
                : "Create New Order";
        }

        if (saveOrderButton) {
            saveOrderButton.innerHTML = editing
                ? '<i class="fa-solid fa-floppy-disk"></i> Update Order'
                : '<i class="fa-solid fa-floppy-disk"></i> Save Order';
        }

        if (formMessage) {
            formMessage.textContent = "";
            formMessage.classList.remove("show");
        }

        orderFormSnapshot = captureOrderForm();
        syncModalScroll();

        setTimeout(() => customerName?.focus(), 100);
    }

    function closeOrderModalFunction() {
        if (!orderModal) return;

        orderModal.classList.remove("show");
        orderModal.setAttribute("aria-hidden", "true");

        syncModalScroll();
    }

    function requestCloseOrderModal() {
        if (!orderModal?.classList.contains("show")) {
            return;
        }

        if (captureOrderForm() !== orderFormSnapshot) {
            const discard = window.confirm(
                "You have unsaved changes. Discard them?"
            );

            if (!discard) return;
        }

        closeOrderModalFunction();
    }

    function openViewModal() {
        if (!viewOrderModal) return;

        viewOrderModal.classList.add("show");
        viewOrderModal.setAttribute("aria-hidden", "false");

        syncModalScroll();
    }

    function closeViewModalFunction() {
        if (!viewOrderModal) return;

        viewOrderModal.classList.remove("show");
        viewOrderModal.setAttribute("aria-hidden", "true");

        syncModalScroll();
    }

    function resetOrderForm() {
        if (!orderForm) return;

        orderForm.reset();

        if (editOrderId) editOrderId.value = "";
        if (quantity) quantity.value = "1";
        if (amountPaid) amountPaid.value = "0";

        if (orderDate) orderDate.value = getToday();
        if (dueDate) dueDate.value = getToday();

        if (orderStatus) orderStatus.value = "Pending";
        if (paymentStatus) paymentStatus.value = "Unpaid";

        populateStaffSelect("", "");

        if (formMessage) {
            formMessage.textContent = "";
            formMessage.classList.remove("show");
        }

        calculateTotal();
    }

    function showFormError(message) {
        if (!formMessage) return;

        formMessage.textContent = message;
        formMessage.classList.add("show");
    }

    /* CREATE ORDER BUTTONS */

    addOrderButton?.addEventListener("click", function () {
        resetOrderForm();
        openOrderModal(false);
    });

    emptyCreateButton?.addEventListener("click", function () {
        resetOrderForm();
        openOrderModal(false);
    });

    /* CLOSE BUTTONS */

    closeOrderModal?.addEventListener(
        "click",
        requestCloseOrderModal
    );

    cancelOrderButton?.addEventListener(
        "click",
        requestCloseOrderModal
    );

    closeViewModal?.addEventListener(
        "click",
        closeViewModalFunction
    );

    closeViewButton?.addEventListener(
        "click",
        closeViewModalFunction
    );

    /* PREVENT BACKDROP FROM CLOSING */

    orderModal?.addEventListener("click", function (event) {
        if (event.target === orderModal) {
            event.preventDefault();
            event.stopPropagation();
        }
    });

    viewOrderModal?.addEventListener("click", function (event) {
        if (event.target === viewOrderModal) {
            event.preventDefault();
            event.stopPropagation();
        }
    });

    /* PREVENT ESCAPE FROM CLOSING MODALS */

    document.addEventListener("keydown", function (event) {
        if (event.key !== "Escape") return;

        const archive =
            document.getElementById("printifyArchiveConfirm");

        const anyOpen = [
            orderModal,
            viewOrderModal,
            archive
        ].some(element => element?.classList.contains("show"));

        if (anyOpen) {
            event.preventDefault();
            event.stopPropagation();
        }
    });

    /* =====================================================
       10. CREATE AND UPDATE ORDERS
    ===================================================== */

    function validateOrderForm() {
        const name = customerName?.value.trim() || "";
        const service = printingService?.value || "";

        const qty = Number(quantity?.value);
        const price = Number(unitPrice?.value);
        const paid = Number(amountPaid?.value || 0);

        const dateOrdered = orderDate?.value || "";
        const dateDue = dueDate?.value || "";

        if (!name) {
            showFormError("Please enter the customer name.");
            customerName?.focus();
            return false;
        }

        if (!service) {
            showFormError("Please select a printing service.");
            printingService?.focus();
            return false;
        }

        if (!Number.isInteger(qty) || qty <= 0) {
            showFormError("Quantity must be greater than zero.");
            quantity?.focus();
            return false;
        }

        if (!Number.isFinite(price) || price <= 0) {
            showFormError("Price per unit must be greater than zero.");
            unitPrice?.focus();
            return false;
        }

        if (!dateOrdered || !dateDue) {
            showFormError("Please select the order date and due date.");
            return false;
        }

        if (dateDue < dateOrdered) {
            showFormError(
                "Due date cannot be earlier than the order date."
            );
            dueDate?.focus();
            return false;
        }

        if (!Number.isFinite(paid) || paid < 0) {
            showFormError("Amount paid cannot be negative.");
            amountPaid?.focus();
            return false;
        }

        const total = qty * price;

        if (paid > total) {
            showFormError(
                "Amount paid cannot exceed the total order amount."
            );
            amountPaid?.focus();
            return false;
        }

        return true;
    }

    function getOrderFormData() {
        const qty = Number(quantity.value);
        const price = Number(unitPrice.value);
        const paid = Number(amountPaid?.value || 0);
        const total = qty * price;

        let finalPaymentStatus = "Unpaid";

        if (paid >= total) {
            finalPaymentStatus = "Paid";
        } else if (paid > 0) {
            finalPaymentStatus = "Partially Paid";
        }

        const staffId = assignedStaff?.value || "";
        const staffName = getAssignedStaffName(staffId);

        return {
            customerName: customerName.value.trim(),
            customerContact: customerContact?.value.trim() || "",
            printingService: printingService.value,
            quantity: qty,
            unitPrice: price,
            totalAmount: total,
            orderDate: orderDate.value,
            dueDate: dueDate.value,
            status: orderStatus?.value || "Pending",
            paymentStatus: finalPaymentStatus,
            amountPaid: paid,
            assignedStaffId: staffId,
            assignedStaffName: staffName,
            notes: orderNotes?.value.trim() || ""
        };
    }

    function createNewOrder(data) {
        const newOrder = {
            id: generateOrderId(),
            ...data,
            archived: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        orders.unshift(newOrder);

        if (!saveOrders()) {
            orders.shift();
            return false;
        }

        return true;
    }

    function updateExistingOrder(orderId, data) {
        const index = orders.findIndex(function (order) {
            return String(order.id) === String(orderId);
        });

        if (index === -1) {
            showFormError("Order not found. Please refresh the page.");
            return false;
        }

        const previousOrder = { ...orders[index] };

        orders[index] = {
            ...orders[index],
            ...data,
            id: previousOrder.id,
            createdAt: previousOrder.createdAt,
            updatedAt: new Date().toISOString()
        };

        if (!saveOrders()) {
            orders[index] = previousOrder;
            return false;
        }

        return true;
    }

    /* =====================================================
       11. SAVE ORDER BUTTON
    ===================================================== */

    orderForm?.addEventListener("submit", function (event) {
        event.preventDefault();

        if (formMessage) {
            formMessage.textContent = "";
            formMessage.classList.remove("show");
        }

        if (!validateOrderForm()) {
            return;
        }

        const data = getOrderFormData();

        const editingId = editOrderId?.value.trim() || "";
        const isEditing = editingId !== "";

        if (saveOrderButton) {
            saveOrderButton.disabled = true;
            saveOrderButton.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
        }

        try {
            let success = false;

            if (isEditing) {
                success = updateExistingOrder(editingId, data);
            } else {
                success = createNewOrder(data);
            }

            if (!success) return;

            closeOrderModalFunction();

            renderOrders();

            showToast(
                isEditing
                    ? "Order updated successfully!"
                    : "New order created successfully!"
            );

            resetOrderForm();

        } catch (error) {
            console.error("Order save error:", error);

            showFormError(
                "Unable to save order: " + error.message
            );

        } finally {
            if (saveOrderButton) {
                saveOrderButton.disabled = false;

                saveOrderButton.innerHTML =
                    '<i class="fa-solid fa-floppy-disk"></i> Save Order';
            }
        }
    });

    /* =====================================================
       12. PAYMENT STATUS AUTO UPDATE
    ===================================================== */

    function updatePaymentStatus() {
        if (!paymentStatus) return;

        const total = calculateTotal();
        const paid = Number(amountPaid?.value || 0);

        if (total <= 0 || paid <= 0) {
            paymentStatus.value = "Unpaid";
        } else if (paid >= total) {
            paymentStatus.value = "Paid";
        } else {
            paymentStatus.value = "Partially Paid";
        }
    }

    amountPaid?.addEventListener("input", updatePaymentStatus);

    quantity?.addEventListener("input", updatePaymentStatus);

    unitPrice?.addEventListener("input", updatePaymentStatus);

    /* =====================================================
       13. ORDER DATE VALIDATION
    ===================================================== */

    orderDate?.addEventListener("change", function () {
        if (!dueDate) return;

        dueDate.min = orderDate.value;

        if (dueDate.value && dueDate.value < orderDate.value) {
            dueDate.value = orderDate.value;
        }
    });

    /* =====================================================
       END OF PART 5
    ===================================================== */

    /* =====================================================
       14. ORDERS TABLE
    ===================================================== */

    function getFilteredOrders() {
        const search = (searchOrders?.value || "")
            .trim()
            .toLowerCase();

        const selectedStatus = statusFilter?.value || "All";
        const selectedPayment = paymentFilter?.value || "All";

        return orders.filter(function (order) {
            if (order.archived) return false;

            const searchableText = [
                order.id,
                order.customerName,
                order.customerContact,
                order.printingService,
                order.assignedStaffName
            ].join(" ").toLowerCase();

            const matchesSearch =
                !search || searchableText.includes(search);

            const matchesStatus =
                selectedStatus === "All" ||
                order.status === selectedStatus;

            const matchesPayment =
                selectedPayment === "All" ||
                order.paymentStatus === selectedPayment;

            return matchesSearch &&
                matchesStatus &&
                matchesPayment;
        });
    }

    function renderOrders() {
        if (!ordersTableBody) return;

        const filteredOrders = getFilteredOrders();

        ordersTableBody.innerHTML = "";

        if (recordCount) {
            recordCount.textContent =
                filteredOrders.length + " records";
        }

        if (tableInformation) {
            tableInformation.textContent =
                "Showing " + filteredOrders.length + " orders";
        }

        if (emptyState) {
            emptyState.hidden = filteredOrders.length > 0;
        }

        filteredOrders.forEach(function (order) {
            const row = document.createElement("tr");

            const initials = getInitials(order.customerName);
            const statusClass = getStatusClass(order.status);
            const paymentClass = getPaymentClass(order.paymentStatus);

            row.innerHTML = `
                <td>
                    <div class="order-id">
                        <strong>${escapeHTML(order.id)}</strong>
                    </div>
                </td>

                <td>
                    <div class="order-customer">
                        <div class="order-customer-avatar">
                            ${escapeHTML(initials)}
                        </div>

                        <div class="order-customer-information">
                            <strong>
                                ${escapeHTML(order.customerName)}
                            </strong>
                            <span>
                                ${escapeHTML(order.customerContact || "No contact")}
                            </span>
                        </div>
                    </div>
                </td>

                <td>
                    <span class="service-name">
                        ${escapeHTML(order.printingService)}
                    </span>
                </td>

                <td>
                    ${escapeHTML(order.assignedStaffName || "Unassigned")}
                </td>

                <td>
                    <div class="order-date">
                        <strong>${escapeHTML(formatDate(order.orderDate))}</strong>
                    </div>
                </td>

                <td>
                    <div class="order-date">
                        <strong>${escapeHTML(formatDate(order.dueDate))}</strong>
                    </div>
                </td>

                <td>
                    <strong class="order-price">
                        ${escapeHTML(formatCurrency(order.totalAmount))}
                    </strong>
                </td>

                <td>
                    <span class="payment-status ${paymentClass}">
                        ${escapeHTML(order.paymentStatus || "Unpaid")}
                    </span>
                </td>

                <td>
                    <span class="order-status ${statusClass}">
                        ${escapeHTML(order.status || "Pending")}
                    </span>
                </td>

                <td>
                    <div class="order-actions">
                        <button
                            type="button"
                            class="action-button view-order"
                            data-id="${escapeHTML(order.id)}"
                            title="View Order">
                            <i class="fa-solid fa-eye"></i>
                        </button>

                        <button
                            type="button"
                            class="action-button edit-order"
                            data-id="${escapeHTML(order.id)}"
                            title="Edit Order">
                            <i class="fa-solid fa-pen"></i>
                        </button>

                        <button
                            type="button"
                            class="action-button archive archive-order"
                            data-id="${escapeHTML(order.id)}"
                            title="Archive Order">
                            <i class="fa-solid fa-box-archive"></i>
                        </button>
                    </div>
                </td>
            `;

            ordersTableBody.appendChild(row);
        });
    }

    /* =====================================================
       15. SEARCH AND FILTER EVENTS
    ===================================================== */

    searchOrders?.addEventListener("input", function () {
        renderOrders();

        if (clearSearch) {
            clearSearch.classList.toggle(
                "show",
                searchOrders.value.length > 0
            );
        }
    });

    clearSearch?.addEventListener("click", function () {
        if (searchOrders) {
            searchOrders.value = "";
            searchOrders.focus();
        }

        clearSearch.classList.remove("show");
        renderOrders();
    });

    statusFilter?.addEventListener("change", renderOrders);
    paymentFilter?.addEventListener("change", renderOrders);

    resetFilters?.addEventListener("click", function () {
        if (searchOrders) searchOrders.value = "";
        if (statusFilter) statusFilter.value = "All";
        if (paymentFilter) paymentFilter.value = "All";

        clearSearch?.classList.remove("show");

        renderOrders();
        showToast("Order filters have been reset.");
    });

    /* =====================================================
       16. VIEW ORDER
    ===================================================== */

    function viewOrder(orderId) {
        const order = orders.find(function (item) {
            return String(item.id) === String(orderId);
        });

        if (!order) {
            showToast("Order not found.", "error");
            return;
        }

        selectedViewOrderId = order.id;

        if (orderDetailsContent) {
            const details = [
                ["Order ID", order.id],
                ["Customer Name", order.customerName],
                ["Contact Number", order.customerContact || "—"],
                ["Printing Service", order.printingService],
                ["Quantity", order.quantity],
                ["Price per Unit", formatCurrency(order.unitPrice)],
                ["Total Amount", formatCurrency(order.totalAmount)],
                ["Amount Paid", formatCurrency(order.amountPaid)],
                ["Balance", formatCurrency(
                    Math.max(0,
                        Number(order.totalAmount || 0) -
                        Number(order.amountPaid || 0)
                    )
                )],
                ["Order Date", formatDate(order.orderDate)],
                ["Due Date", formatDate(order.dueDate)],
                ["Order Status", order.status],
                ["Payment Status", order.paymentStatus],
                ["Assigned Staff", order.assignedStaffName || "Unassigned"],
                ["Order Notes", order.notes || "No notes"]
            ];

            orderDetailsContent.innerHTML = details.map(function (detail) {
                return `
                    <div class="order-detail-item">
                        <span>${escapeHTML(detail[0])}</span>
                        <strong>${escapeHTML(detail[1])}</strong>
                    </div>
                `;
            }).join("");
        }

        openViewModal();
    }

    /* =====================================================
       17. EDIT ORDER
    ===================================================== */

    function editOrder(orderId) {
        const order = orders.find(function (item) {
            return String(item.id) === String(orderId);
        });

        if (!order) {
            showToast("Order not found.", "error");
            return;
        }

        resetOrderForm();

        if (editOrderId) editOrderId.value = order.id;

        if (customerName) {
            customerName.value = order.customerName || "";
        }

        if (customerContact) {
            customerContact.value = order.customerContact || "";
        }

        if (printingService) {
            printingService.value = order.printingService || "";
        }

        if (quantity) {
            quantity.value = order.quantity || 1;
        }

        if (unitPrice) {
            unitPrice.value = order.unitPrice || 0;
        }

        if (orderDate) {
            orderDate.value = order.orderDate || getToday();
        }

        if (dueDate) {
            dueDate.value = order.dueDate || getToday();
            dueDate.min = orderDate?.value || getToday();
        }

        if (orderStatus) {
            orderStatus.value = order.status || "Pending";
        }

        if (paymentStatus) {
            paymentStatus.value = order.paymentStatus || "Unpaid";
        }

        if (amountPaid) {
            amountPaid.value = order.amountPaid || 0;
        }

        if (orderNotes) {
            orderNotes.value = order.notes || "";
        }

        populateStaffSelect(
            order.assignedStaffId,
            order.assignedStaffName
        );

        calculateTotal();
        openOrderModal(true);
    }

    /* =====================================================
       18. ORDER ACTION BUTTONS
    ===================================================== */

    ordersTableBody?.addEventListener("click", function (event) {
        const button = event.target.closest("button[data-id]");

        if (!button) return;

        const orderId = button.dataset.id;

        if (button.classList.contains("view-order")) {
            viewOrder(orderId);
            return;
        }

        if (button.classList.contains("edit-order")) {
            editOrder(orderId);
            return;
        }

        if (button.classList.contains("archive-order")) {
            selectedArchiveOrderId = orderId;

            if (typeof confirmArchiveOrder === "function") {
                confirmArchiveOrder(orderId);
            }
        }
    });

    editFromViewButton?.addEventListener("click", function () {
        if (!selectedViewOrderId) return;

        const orderId = selectedViewOrderId;

        closeViewModalFunction();
        editOrder(orderId);
    });

    /* =====================================================
       END OF PART 6
    ===================================================== */


    /* =====================================================
       19. ARCHIVE CONFIRMATION MODAL
    ===================================================== */

    function ensureArchiveConfirmation() {
        let overlay = document.getElementById(
            "printifyArchiveConfirm"
        );

        if (overlay) return overlay;

        overlay = document.createElement("div");
        overlay.id = "printifyArchiveConfirm";
        overlay.className = "printify-confirm-overlay";
        overlay.setAttribute("aria-hidden", "true");

        overlay.innerHTML = `
            <div class="printify-confirm-box"
                 role="alertdialog"
                 aria-modal="true"
                 aria-labelledby="printifyConfirmTitle"
                 aria-describedby="printifyConfirmMessage">

                <div style="
                    width:54px;
                    height:54px;
                    margin:0 auto 18px;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    border-radius:16px;
                    color:#19e51b;
                    background:rgba(25,229,27,.12);
                    font-size:23px;
                ">
                    <i class="fa-solid fa-circle-question"></i>
                </div>

                <h2 id="printifyConfirmTitle"
                    style="text-align:center;margin-bottom:12px;">
                    Confirm Action
                </h2>

                <p id="printifyConfirmMessage"
                   style="text-align:center;line-height:1.7;">
                </p>

                <div style="
                    display:flex;
                    justify-content:center;
                    flex-wrap:wrap;
                    gap:12px;
                    margin-top:25px;
                ">
                    <button type="button"
                            id="printifyConfirmCancel"
                            class="secondary-button">
                        Cancel
                    </button>

                    <button type="button"
                            id="printifyConfirmAccept"
                            class="primary-button"
                            style="
                                padding:11px 20px;
                                border-radius:10px;
                                border:0;
                                font-weight:700;
                                background:#19e51b;
                                color:#071007;
                            ">
                        Confirm
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        overlay.querySelector(
            "#printifyConfirmCancel"
        ).addEventListener("click", closeArchiveConfirmation);

        overlay.querySelector(
            "#printifyConfirmAccept"
        ).addEventListener("click", async function () {
            if (archiveActionInProgress) return;

            const action = confirmationAction;
            if (typeof action !== "function") return;

            archiveActionInProgress = true;
            this.disabled = true;

            try {
                await action();
            } catch (error) {
                console.error("Confirmation error:", error);
                showToast(
                    "Unable to complete the action.",
                    "error"
                );
            } finally {
                archiveActionInProgress = false;
                this.disabled = false;
            }
        });

        // Clicking outside the confirmation does nothing.
        overlay.addEventListener("click", function (event) {
            if (event.target === overlay) {
                event.preventDefault();
            }
        });

        return overlay;
    }

    function openConfirmation(options = {}) {
        const overlay = ensureArchiveConfirmation();

        const title = overlay.querySelector(
            "#printifyConfirmTitle"
        );

        const message = overlay.querySelector(
            "#printifyConfirmMessage"
        );

        const accept = overlay.querySelector(
            "#printifyConfirmAccept"
        );

        title.textContent =
            options.title || "Confirm Action";

        message.textContent =
            options.message || "Do you want to continue?";

        accept.textContent =
            options.confirmText || "Confirm";

        accept.style.background =
            options.danger ? "#ff6565" : "#19e51b";

        accept.style.color =
            options.danger ? "#ffffff" : "#071007";

        confirmationAction =
            typeof options.onConfirm === "function"
                ? options.onConfirm
                : null;

        overlay.classList.add("show");
        overlay.setAttribute("aria-hidden", "false");

        syncModalScroll();
        accept.focus();
    }

    function closeArchiveConfirmation() {
        const overlay = document.getElementById(
            "printifyArchiveConfirm"
        );

        if (!overlay || archiveActionInProgress) return;

        overlay.classList.remove("show");
        overlay.setAttribute("aria-hidden", "true");

        confirmationAction = null;
        syncModalScroll();
    }

    /* =====================================================
       20. ARCHIVE ORDER
    ===================================================== */

    function confirmArchiveOrder(orderId) {
        const order = orders.find(function (item) {
            return String(item.id) === String(orderId);
        });

        if (!order) {
            showToast("Order not found.", "error");
            return;
        }

        openConfirmation({
            title: "Archive Order?",
            message:
                "Archive order " + order.id +
                " for " + order.customerName +
                "? You can restore it later.",
            confirmText: "Archive Order",
            onConfirm: function () {
                const previousOrders = [...orders];
                const previousArchived = [...archivedOrders];

                const archivedOrder = {
                    ...order,
                    archived: true,
                    archivedAt: new Date().toISOString()
                };

                orders = orders.filter(function (item) {
                    return String(item.id) !== String(orderId);
                });

                archivedOrders.unshift(archivedOrder);

                try {
                    localStorage.setItem(
                        "printifyArchivedOrders",
                        JSON.stringify(archivedOrders)
                    );

                    if (!saveOrders()) {
                        throw new Error("Unable to save orders.");
                    }

                    closeArchiveConfirmation();
                    renderOrders();
                    renderArchivedOrders();

                    showToast("Order archived successfully!");
                } catch (error) {
                    orders = previousOrders;
                    archivedOrders = previousArchived;

                    localStorage.setItem(
                        "printifyArchivedOrders",
                        JSON.stringify(archivedOrders)
                    );

                    showToast(
                        "Unable to archive order.",
                        "error"
                    );
                }
            }
        });
    }

    /* =====================================================
       21. ARCHIVED ORDERS STORAGE
    ===================================================== */

    function loadArchivedOrders() {
        try {
            const saved = localStorage.getItem(
                "printifyArchivedOrders"
            );

            const parsed = JSON.parse(saved || "[]");

            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error(
                "Unable to load archived orders:",
                error
            );
            return [];
        }
    }

    archivedOrders = loadArchivedOrders();

    function saveArchivedOrders() {
        try {
            localStorage.setItem(
                "printifyArchivedOrders",
                JSON.stringify(archivedOrders)
            );

            return true;
        } catch (error) {
            console.error(
                "Unable to save archived orders:",
                error
            );
            return false;
        }
    }

    /* =====================================================
       22. ARCHIVED ORDERS PANEL
    ===================================================== */

    function showArchivedOrdersPanel() {
        const activePanel = document.getElementById(
            "activeOrdersPanel"
        );

        if (activePanel) activePanel.hidden = true;

        if (archivedOrdersPanel) {
            archivedOrdersPanel.hidden = false;
        }

        renderArchivedOrders();
    }

    function showActiveOrdersPanel() {
        const activePanel = document.getElementById(
            "activeOrdersPanel"
        );

        if (activePanel) activePanel.hidden = false;

        if (archivedOrdersPanel) {
            archivedOrdersPanel.hidden = true;
        }

        renderOrders();
    }

    showArchivedOrdersButton?.addEventListener(
        "click",
        showArchivedOrdersPanel
    );

    backToActiveOrdersButton?.addEventListener(
        "click",
        showActiveOrdersPanel
    );

    /* =====================================================
       23. ARCHIVED ORDERS TABLE
    ===================================================== */

    function renderArchivedOrders() {
        if (!archivedOrdersTableBody) return;

        const search = (
            searchArchivedOrders?.value || ""
        ).trim().toLowerCase();

        const filtered = archivedOrders.filter(function (order) {
            const searchable = [
                order.id,
                order.customerName,
                order.printingService,
                order.assignedStaffName
            ].join(" ").toLowerCase();

            return searchable.includes(search);
        });

        archivedOrdersTableBody.innerHTML = "";

        if (archivedRecordCount) {
            archivedRecordCount.textContent =
                filtered.length + " records";
        }

        if (archivedEmptyState) {
            archivedEmptyState.hidden = filtered.length > 0;
        }

        filtered.forEach(function (order) {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>
                    <strong style="color:#19e51b;">
                        ${escapeHTML(order.id)}
                    </strong>
                </td>

                <td>
                    ${escapeHTML(order.customerName)}
                </td>

                <td>
                    ${escapeHTML(order.printingService)}
                </td>

                <td>
                    ${escapeHTML(
                        order.assignedStaffName || "Unassigned"
                    )}
                </td>

                <td>
                    ${escapeHTML(formatDate(order.orderDate))}
                </td>

                <td>
                    <strong class="order-price">
                        ${escapeHTML(
                            formatCurrency(order.totalAmount)
                        )}
                    </strong>
                </td>

                <td>
                    <span class="payment-status ${getPaymentClass(
                        order.paymentStatus
                    )}">
                        ${escapeHTML(order.paymentStatus)}
                    </span>
                </td>

                <td>
                    <span class="order-status ${getStatusClass(
                        order.status
                    )}">
                        ${escapeHTML(order.status)}
                    </span>
                </td>

                <td>
                    ${escapeHTML(formatDate(order.archivedAt))}
                </td>

                <td>
                    <div class="order-actions">
                        <button
                            type="button"
                            class="action-button restore"
                            data-action="restore"
                            data-id="${escapeHTML(order.id)}"
                            title="Restore Order">
                            <i class="fa-solid fa-rotate-left"></i>
                        </button>

                        <button
                            type="button"
                            class="action-button delete"
                            data-action="delete"
                            data-id="${escapeHTML(order.id)}"
                            title="Permanently Delete">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;

            archivedOrdersTableBody.appendChild(row);
        });
    }

    searchArchivedOrders?.addEventListener(
        "input",
        renderArchivedOrders
    );

    /* =====================================================
       24. RESTORE ORDER
    ===================================================== */

    function confirmRestoreOrder(orderId) {
        const order = archivedOrders.find(function (item) {
            return String(item.id) === String(orderId);
        });

        if (!order) {
            showToast("Archived order not found.", "error");
            return;
        }

        openConfirmation({
            title: "Restore Order?",
            message:
                "Restore order " + order.id +
                " to the active orders list?",
            confirmText: "Restore Order",
            onConfirm: function () {
                const previousOrders = [...orders];
                const previousArchived = [...archivedOrders];

                const restoredOrder = {
                    ...order,
                    archived: false,
                    archivedAt: null,
                    updatedAt: new Date().toISOString()
                };

                archivedOrders = archivedOrders.filter(
                    function (item) {
                        return String(item.id) !== String(orderId);
                    }
                );

                orders.unshift(restoredOrder);

                if (!saveArchivedOrders() || !saveOrders()) {
                    orders = previousOrders;
                    archivedOrders = previousArchived;
                    saveArchivedOrders();

                    showToast(
                        "Unable to restore order.",
                        "error"
                    );
                    return;
                }

                closeArchiveConfirmation();
                renderArchivedOrders();
                renderOrders();

                showToast("Order restored successfully!");
            }
        });
    }

    /* =====================================================
       25. PERMANENT DELETE
    ===================================================== */

    function confirmDeleteArchivedOrder(orderId) {
        const order = archivedOrders.find(function (item) {
            return String(item.id) === String(orderId);
        });

        if (!order) {
            showToast("Archived order not found.", "error");
            return;
        }

        openConfirmation({
            title: "Permanently Delete Order?",
            message:
                "You are about to permanently delete order " +
                order.id +
                ". This cannot be undone.",
            confirmText: "Delete Permanently",
            danger: true,
            onConfirm: function () {
                const previousArchived = [...archivedOrders];

                archivedOrders = archivedOrders.filter(
                    function (item) {
                        return String(item.id) !== String(orderId);
                    }
                );

                if (!saveArchivedOrders()) {
                    archivedOrders = previousArchived;

                    showToast(
                        "Unable to delete order.",
                        "error"
                    );
                    return;
                }

                closeArchiveConfirmation();
                renderArchivedOrders();

                showToast(
                    "Archived order permanently deleted."
                );
            }
        });
    }

    /* =====================================================
       26. ARCHIVED ORDER BUTTONS
    ===================================================== */

    archivedOrdersTableBody?.addEventListener(
        "click",
        function (event) {
            const button = event.target.closest(
                "button[data-action][data-id]"
            );

            if (!button) return;

            const orderId = button.dataset.id;
            const action = button.dataset.action;

            if (action === "restore") {
                confirmRestoreOrder(orderId);
            } else if (action === "delete") {
                confirmDeleteArchivedOrder(orderId);
            }
        }
    );

    /* =====================================================
       END OF PART 7
    ===================================================== */

    /* =====================================================
       27. EXPORT HELPERS
    ===================================================== */

    function getExportData() {
        return getFilteredOrders().map(function (order) {
            return {
                "Order ID": order.id || "",
                "Customer Name": order.customerName || "",
                "Contact Number": order.customerContact || "",
                "Printing Service": order.printingService || "",
                "Quantity": Number(order.quantity) || 0,
                "Price per Unit": Number(order.unitPrice) || 0,
                "Total Amount": Number(order.totalAmount) || 0,
                "Amount Paid": Number(order.amountPaid) || 0,
                "Balance": Math.max(
                    0,
                    (Number(order.totalAmount) || 0) -
                    (Number(order.amountPaid) || 0)
                ),
                "Assigned Staff": order.assignedStaffName || "Unassigned",
                "Order Date": order.orderDate || "",
                "Due Date": order.dueDate || "",
                "Order Status": order.status || "",
                "Payment Status": order.paymentStatus || "",
                "Notes": order.notes || ""
            };
        });
    }

    function getExportFilename(extension) {
        return "Printify_Orders_" + getToday() + "." + extension;
    }

    function downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = filename;

        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(function () {
            URL.revokeObjectURL(url);
        }, 1000);
    }

    /* =====================================================
       28. EXPORT CSV
    ===================================================== */

    function escapeCSV(value) {
        let text = String(value ?? "");

        // Prevent spreadsheet formula execution.
        if (/^[\s]*[=+\-@]/.test(text)) {
            text = "'" + text;
        }

        return '"' + text.replace(/"/g, '""') + '"';
    }

    function exportOrdersCSV() {
        const data = getExportData();

        if (data.length === 0) {
            showToast("No orders available to export.", "error");
            return;
        }

        const headers = Object.keys(data[0]);

        const rows = [
            headers.map(escapeCSV).join(","),
            ...data.map(function (item) {
                return headers.map(function (header) {
                    return escapeCSV(item[header]);
                }).join(",");
            })
        ];

        const csv = "\uFEFF" + rows.join("\r\n");

        const blob = new Blob([csv], {
            type: "text/csv;charset=utf-8;"
        });

        downloadBlob(blob, getExportFilename("csv"));

        showToast("Orders exported to CSV successfully!");
    }

    exportOrdersButton?.addEventListener(
        "click",
        exportOrdersCSV
    );

    /* =====================================================
       29. EXPORT EXCEL
    ===================================================== */

    function exportOrdersExcel() {
        const data = getExportData();

        if (data.length === 0) {
            showToast("No orders available to export.", "error");
            return;
        }

        if (typeof XLSX === "undefined") {
            showToast(
                "Excel library is not available. Please check your internet connection.",
                "error"
            );
            return;
        }

        try {
            const workbook = XLSX.utils.book_new();

            const worksheet = XLSX.utils.json_to_sheet(data);

            worksheet["!cols"] = [
                { wch: 16 },
                { wch: 25 },
                { wch: 18 },
                { wch: 25 },
                { wch: 12 },
                { wch: 16 },
                { wch: 18 },
                { wch: 18 },
                { wch: 18 },
                { wch: 25 },
                { wch: 16 },
                { wch: 16 },
                { wch: 18 },
                { wch: 18 },
                { wch: 35 }
            ];

            XLSX.utils.book_append_sheet(
                workbook,
                worksheet,
                "Customer Orders"
            );

            XLSX.writeFile(
                workbook,
                getExportFilename("xlsx")
            );

            showToast("Orders exported to Excel successfully!");

        } catch (error) {
            console.error("Excel export error:", error);

            showToast(
                "Unable to export Excel file.",
                "error"
            );
        }
    }

    exportExcelButton?.addEventListener(
        "click",
        exportOrdersExcel
    );

    /* =====================================================
       30. INITIALIZE ORDERS PAGE
    ===================================================== */

    function initializeOrdersPage() {
        try {
            // Load archived orders from browser storage.
            archivedOrders = loadArchivedOrders();

            // Initialize form defaults.
            resetOrderForm();

            // Render the active orders table.
            renderOrders();

            // Prepare the archived orders table.
            renderArchivedOrders();

            // Ensure modal overlays are initially hidden.
            if (orderModal) {
                orderModal.classList.remove("show");
                orderModal.setAttribute("aria-hidden", "true");
            }

            if (viewOrderModal) {
                viewOrderModal.classList.remove("show");
                viewOrderModal.setAttribute("aria-hidden", "true");
            }

            const archiveConfirmation =
                document.getElementById("printifyArchiveConfirm");

            if (archiveConfirmation) {
                archiveConfirmation.classList.remove("show");
                archiveConfirmation.setAttribute(
                    "aria-hidden",
                    "true"
                );
            }

            syncModalScroll();

            console.log("Printify Orders page initialized.");

        } catch (error) {
            console.error(
                "Printify Orders initialization error:",
                error
            );

            showToast(
                "Unable to initialize the Orders page.",
                "error"
            );
        }
    }

    initializeOrdersPage();

}); 




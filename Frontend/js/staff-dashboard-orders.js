/* ==========================================
   STAFF DASHBOARD - SARILING ORDERS
   Ang mga order na ina-assign ng Admin sa naka-login na Staff.
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    const body = document.getElementById("myOrdersBody");
    const orderCount = document.getElementById("orderCount");
    const notificationList = document.getElementById("notificationList");

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (character) {
            return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character];
        });
    }

    function readOrders() {
        try {
            const value = JSON.parse(localStorage.getItem("printify-staff-orders-demo") || "[]");
            return Array.isArray(value) ? value : [];
        } catch (error) {
            return [];
        }
    }

    function statusClass(status) {
        return ({
            "Pending": "pending",
            "Processing": "processing",
            "Completed": "completed",
            "Cancelled": "cancelled"
        })[status] || "pending";
    }

    function formatDate(value) {
        const date = new Date(value + "T00:00:00");
        return Number.isNaN(date.getTime())
            ? "—"
            : date.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
    }

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    function render() {

        const orders = readOrders();
        const today = new Date().toLocaleDateString("en-CA");   // yyyy-MM-dd (oras ng device)

        const active = orders.filter(function (order) { return order.status !== "Cancelled"; });

        setText("assignedOrders", active.length);

        setText("pendingTasks", active.filter(function (order) {
            return order.status === "Pending" || order.status === "Processing";
        }).length);

        setText("completedToday", active.filter(function (order) {
            return order.status === "Completed" &&
                order.updatedAt &&
                new Date(order.updatedAt).toLocaleDateString("en-CA") === today;
        }).length);

        if (!body) return;

        if (orders.length === 0) {

            body.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-table">
                        <i class="fa-solid fa-inbox"></i>
                        <strong>No orders available</strong>
                        <span>Your assigned orders will appear here.</span>
                    </td>
                </tr>`;

            if (orderCount) orderCount.textContent = "Showing 0 orders";

            return;
        }

        const recent = orders.slice(0, 8);

        body.innerHTML = recent.map(function (order) {
            return `
                <tr>
                    <td><strong>${escapeHTML(order.id)}</strong></td>
                    <td>${escapeHTML(order.customer)}</td>
                    <td>${escapeHTML(order.product)} (x${escapeHTML(order.quantity)})</td>
                    <td><span class="order-status ${statusClass(order.status)}">${escapeHTML(order.status)}</span></td>
                    <td>${escapeHTML(formatDate(order.date))}</td>
                </tr>`;
        }).join("");

        if (orderCount) {
            orderCount.textContent = "Showing " + recent.length + " of " + orders.length + " orders";
        }
    }

    function renderNotifications() {
        if (!notificationList || !window.PrintifyAPI) return;

        const result = window.PrintifyAPI.request("GET", "/api/staff/me/notifications");
        if (result.status !== 200 || !result.data) return;

        const notifications = Array.isArray(result.data.items) ? result.data.items : [];
        const unread = notifications.filter(function (item) { return !item.read; }).length;

        document.querySelectorAll(".notification-dot, .notification-nav-dot").forEach(function (dot) {
            dot.style.display = unread ? "" : "none";
        });

        if (notifications.length === 0) {
            notificationList.innerHTML = `
                <div class="notification-empty">
                    <img src="image/notification_icon.png" alt="">
                    <strong>No notifications yet</strong>
                    <span>New order assignments will appear here.</span>
                </div>`;
            return;
        }

        notificationList.innerHTML = notifications.slice(0, 3).map(function (item) {
            const date = new Date(item.time);
            const time = Number.isNaN(date.getTime())
                ? item.time || ""
                : date.toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" });
            return `
                <a class="notification-item" href="staff-notifications.html">
                    <span class="notification-item-icon"><i class="fa-solid fa-bell"></i></span>
                    <span class="notification-item-content">
                        <strong>${escapeHTML(item.title || "Update")}</strong>
                        <p>${escapeHTML(item.message || "")}</p>
                        <time>${escapeHTML(time)}</time>
                    </span>
                </a>`;
        }).join("");
    }

    render();
    renderNotifications();

    setInterval(function () {

        if (document.hidden || !window.PrintifyAPI) return;

        window.PrintifyAPI.fetchMyOrders();
        render();
        renderNotifications();

    }, 15000);

});

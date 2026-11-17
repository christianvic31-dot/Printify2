document.addEventListener("DOMContentLoaded", function () {
    const list = document.getElementById("notificationList");
    const summary = document.getElementById("notificationSummary");
    const message = document.getElementById("notificationMessage");
    let notifications = [];

    function formatTime(value) {
        const date = new Date(value);
        return Number.isNaN(date.getTime())
            ? value || ""
            : date.toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" });
    }

    function render() {
        const unread = notifications.filter(item => !item.read).length;
        summary.textContent = unread
            ? `${unread} unread notification${unread === 1 ? "" : "s"}`
            : `${notifications.length} notification${notifications.length === 1 ? "" : "s"}`;

        list.innerHTML = notifications.length
            ? notifications.map(item => `
                <article class="staff-notification ${item.read ? "" : "unread"}">
                    <div>
                        <h3>${PrintifyStaff.escapeHTML(item.title || "Update")}</h3>
                        <p>${PrintifyStaff.escapeHTML(item.message || "")}</p>
                        <time>${PrintifyStaff.escapeHTML(formatTime(item.time))}</time>
                    </div>
                    ${item.read ? "" : `<button type="button" data-notification-id="${item.id}">Mark as read</button>`}
                </article>`).join("")
            : '<p class="staff-page-empty">No order notifications yet.</p>';
    }

    async function loadNotifications() {
        try {
            const result = await PrintifyStaff.request("/api/staff/me/notifications");
            notifications = Array.isArray(result.items) ? result.items : [];
            render();
            PrintifyStaff.setMessage(message, "", "");
        } catch (error) {
            PrintifyStaff.setMessage(message, error.message, "error");
        }
    }

    list.addEventListener("click", async function (event) {
        const button = event.target.closest("[data-notification-id]");
        if (!button) return;

        button.disabled = true;
        try {
            await PrintifyStaff.request(
                `/api/staff/me/notifications/${encodeURIComponent(button.dataset.notificationId)}/read`,
                "PATCH"
            );
            await loadNotifications();
        } catch (error) {
            button.disabled = false;
            PrintifyStaff.setMessage(message, error.message, "error");
        }
    });

    document.getElementById("refreshNotificationsButton").addEventListener("click", loadNotifications);
    loadNotifications();
    window.setInterval(function () {
        if (!document.hidden) loadNotifications();
    }, 30000);
});

document.addEventListener("DOMContentLoaded", function () {
    const rows = document.getElementById("attendanceRows");
    const status = document.getElementById("attendanceStatus");
    const summary = document.getElementById("attendanceSummary");
    const timeInValue = document.getElementById("timeInValue");
    const timeOutValue = document.getElementById("timeOutValue");
    const message = document.getElementById("attendanceMessage");
    const clockInButton = document.getElementById("clockInButton");
    const clockOutButton = document.getElementById("clockOutButton");
    let records = [];

    function today() {
        const now = new Date();
        return [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, "0"),
            String(now.getDate()).padStart(2, "0")
        ].join("-");
    }

    function formatDate(value) {
        const date = new Date(value + "T00:00:00");
        return Number.isNaN(date.getTime())
            ? value
            : date.toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
    }

    function currentRecord() {
        return records.find(record => record.date === today());
    }

    function render() {
        const record = currentRecord();
        status.textContent = !record
            ? "Not clocked in"
            : record.timeOut
                ? "Completed"
                : record.status || "Working";
        timeInValue.textContent = record ? record.timeIn || "—" : "—";
        timeOutValue.textContent = record ? record.timeOut || "—" : "—";
        summary.textContent = record
            ? "Attendance recorded for today."
            : "Clock in to record your attendance for today.";
        clockInButton.disabled = Boolean(record);
        clockOutButton.disabled = !record || Boolean(record.timeOut);

        rows.innerHTML = records.length
            ? records.map(record => `
                <tr>
                    <td>${PrintifyStaff.escapeHTML(formatDate(record.date || ""))}</td>
                    <td>${PrintifyStaff.escapeHTML(record.timeIn || "—")}</td>
                    <td>${PrintifyStaff.escapeHTML(record.timeOut || "—")}</td>
                    <td>${PrintifyStaff.escapeHTML(record.status || "—")}</td>
                </tr>`).join("")
            : '<tr><td class="staff-page-empty" colspan="4">No attendance records yet.</td></tr>';
    }

    async function loadAttendance() {
        try {
            const result = await PrintifyStaff.request("/api/staff/me/attendance");
            records = Array.isArray(result.items) ? result.items : [];
            render();
            PrintifyStaff.setMessage(message, "", "");
        } catch (error) {
            clockInButton.disabled = true;
            clockOutButton.disabled = true;
            summary.textContent = "Attendance could not be loaded.";
            PrintifyStaff.setMessage(message, error.message, "error");
        }
    }

    async function recordTime(action) {
        clockInButton.disabled = true;
        clockOutButton.disabled = true;
        PrintifyStaff.setMessage(message, "Saving attendance...", "");
        try {
            await PrintifyStaff.request("/api/staff/me/attendance/" + action, "POST");
            await loadAttendance();
            PrintifyStaff.setMessage(message, "Attendance saved.", "success");
        } catch (error) {
            await loadAttendance();
            PrintifyStaff.setMessage(message, error.message, "error");
        }
    }

    clockInButton.addEventListener("click", () => recordTime("clock-in"));
    clockOutButton.addEventListener("click", () => recordTime("clock-out"));
    document.getElementById("refreshAttendanceButton").addEventListener("click", loadAttendance);

    loadAttendance();
    window.setInterval(function () {
        if (!document.hidden) loadAttendance();
    }, 60000);
});

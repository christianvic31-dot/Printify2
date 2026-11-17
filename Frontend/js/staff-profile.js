document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("profileForm");
    const message = document.getElementById("profileMessage");
    const saveButton = document.getElementById("saveProfileButton");
    const fields = {
        fullName: document.getElementById("profileFullName"),
        email: document.getElementById("profileEmail"),
        phone: document.getElementById("profilePhone"),
        address: document.getElementById("profileAddress")
    };

    function fillProfile(user) {
        const staffCode = user.staffCode || "";
        fields.fullName.value = user.fullName || "";
        fields.email.value = user.email || "";
        fields.phone.value = user.phone || "";
        fields.address.value = user.address || "";
        document.getElementById("profileUsername").textContent = user.username || "—";
        document.getElementById("profileStaffCode").textContent = staffCode || "—";
        document.getElementById("profilePosition").textContent = user.position || "—";
        document.getElementById("staffAttendanceQrCodeLabel").textContent = staffCode || "—";
        window.PrintifyStaffQr.render(
            document.getElementById("staffAttendanceQr"),
            staffCode
        );
        document.querySelectorAll("[data-staff-name]").forEach(element => {
            element.textContent = user.fullName || user.username || "Staff Member";
        });
    }

    async function loadProfile() {
        try {
            const user = await PrintifyStaff.request("/api/staff/me/profile");
            fillProfile(user);
        } catch (error) {
            PrintifyStaff.setMessage(message, error.message, "error");
            saveButton.disabled = true;
        }
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        saveButton.disabled = true;
        PrintifyStaff.setMessage(message, "Saving profile...", "");
        try {
            const result = await PrintifyStaff.request("/api/staff/me/profile", "PUT", {
                fullName: fields.fullName.value,
                email: fields.email.value,
                phone: fields.phone.value,
                address: fields.address.value
            });
            fillProfile(result);
            try {
                localStorage.setItem("printify-user-name", result.fullName || "");
                localStorage.setItem("printify-user-email", result.email || "");
            } catch (error) {
                console.warn("Unable to update saved profile details.");
            }
            PrintifyStaff.setMessage(message, "Profile updated.", "success");
        } catch (error) {
            PrintifyStaff.setMessage(message, error.message, "error");
        } finally {
            saveButton.disabled = false;
        }
    });

    loadProfile();
});

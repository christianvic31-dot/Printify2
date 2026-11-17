(function () {
    "use strict";

    window.PrintifyStaffQr = {
        render: function (container, staffCode) {
            if (!container) {
                return false;
            }

            container.innerHTML = "";

            if (!staffCode) {
                container.textContent = "Staff QR code is unavailable.";
                return false;
            }

            if (["localhost", "127.0.0.1", "::1", "0.0.0.0"].includes(window.location.hostname)) {
                container.textContent = "Open Printify using this computer's network address to create a phone-ready QR code.";
                return false;
            }

            if (typeof window.QRCode !== "function") {
                container.textContent = "QR generator failed to load. Please refresh the page.";
                return false;
            }

            try {
                const attendanceUrl = new URL("/attendance-scan.html", window.location.origin);
                attendanceUrl.searchParams.set("staffCode", staffCode);

                new window.QRCode(container, {
                    text: attendanceUrl.toString(),
                    width: 220,
                    height: 220,
                    colorDark: "#111827",
                    colorLight: "#ffffff",
                    correctLevel: window.QRCode.CorrectLevel.M
                });

                container.setAttribute("role", "img");
                container.setAttribute("aria-label", "Attendance QR code");
                return true;
            } catch (error) {
                console.error("Unable to generate staff QR code:", error);
                container.textContent = "Unable to generate the staff QR code.";
                return false;
            }
        }
    };
})();

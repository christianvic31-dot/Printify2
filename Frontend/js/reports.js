/* =========================================================
   PRINTIFY CALAPAN
   REPORTS PAGE JAVASCRIPT
   INVENTORY-MATCHED FUNCTIONALITY
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // 1. ELEMENTS
    // =====================================================

    const body = document.body;

    const sidebar = document.getElementById("sidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const menuToggle = document.getElementById("menuToggle");

    const themeToggle = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");

    const notificationButton = document.getElementById("notificationButton");

    const profileButton = document.getElementById("profileButton");
    const profileDropdown = document.getElementById("profileDropdown");
    const logoutButton = document.getElementById("logoutButton");

    const currentDate = document.getElementById("currentDate");
    const currentYear = document.getElementById("currentYear");

    const salesSearch = document.getElementById("salesSearch");
    const startDate = document.getElementById("startDate");
    const endDate = document.getElementById("endDate");

    const orderStatusFilter = document.getElementById("orderStatusFilter");
    const paymentStatusFilter = document.getElementById("paymentStatusFilter");
    const clearFiltersButton = document.getElementById("clearFiltersButton");

    const salesTableBody = document.getElementById("salesTableBody");
    const salesEmptyState = document.getElementById("salesEmptyState");
    const salesRecordCount = document.getElementById("salesRecordCount");
    const salesTableInformation = document.getElementById("salesTableInformation");

    const printReportButton = document.getElementById("printReportButton");
    const exportReportButton = document.getElementById("exportReportButton");

    const toastMessage = document.getElementById("toastMessage");
    const toastIcon = document.getElementById("toastIcon");
    const toastText = document.getElementById("toastText");

    let salesChart = null;
    let orderChart = null;
    let toastTimer = null;

    const mobileBreakpoint = window.matchMedia("(max-width: 850px)");

    // =====================================================
    // 2. DATE HELPERS
    // =====================================================

    function getLocalDateString(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function getDateOffset(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);

        return getLocalDateString(date);
    }

    function formatDate(dateString) {
        if (!dateString) return "—";

        const parts = dateString.split("-");

        if (parts.length !== 3) return dateString;

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

    function updateDateInformation() {
        const today = new Date();

        if (currentDate) {
            const dateText = today.toLocaleDateString("en-PH", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric"
            });

            currentDate.innerHTML = `
                <i class="fa-regular fa-calendar"></i>
                <span>${dateText}</span>
            `;
        }

        if (currentYear) {
            currentYear.textContent = today.getFullYear();
        }

        const orderReportDate = document.getElementById("orderReportDate");

        if (orderReportDate) {
            orderReportDate.textContent = today.toLocaleDateString("en-PH", {
                month: "long",
                day: "numeric",
                year: "numeric"
            });
        }
    }

    updateDateInformation();

    // =====================================================
    // 3. SIDEBAR
    // =====================================================

    const SIDEBAR_KEY = "printify-sidebar-hidden";

    function isMobile() {
        return mobileBreakpoint.matches;
    }

    function updateSidebar() {
        if (!sidebar) return;

        const hidden = sidebar.classList.contains("is-hidden");

        // Keep body class synchronized with sidebar state.
        body.classList.toggle("sidebar-hidden", hidden);

        // Update accessibility state.
        if (menuToggle) {
            menuToggle.setAttribute("aria-expanded", String(!hidden));
        }

        // No blurred overlay on Reports.
        if (sidebarOverlay) {
            sidebarOverlay.classList.remove("show");
            sidebarOverlay.style.display = "none";
        }

        // Lock mobile scrolling only while sidebar is open.
        if (isMobile()) {
            body.classList.toggle("mobile-sidebar-open", !hidden);
        } else {
            body.classList.remove("mobile-sidebar-open");
        }
    }

    function setSidebarHidden(hidden, save = true) {
        if (!sidebar) return;

        sidebar.classList.toggle("is-hidden", hidden);

        if (save) {
            localStorage.setItem(SIDEBAR_KEY, String(hidden));
        }

        updateSidebar();
    }

    function initializeSidebar() {
        const saved = localStorage.getItem(SIDEBAR_KEY);

        if (saved === null) {
            // Default state: sidebar hidden.
            setSidebarHidden(true, false);
        } else {
            setSidebarHidden(saved === "true", false);
        }
    }

    menuToggle?.addEventListener("click", function () {
        if (!sidebar) return;

        const currentlyHidden = sidebar.classList.contains("is-hidden");

        // If hidden, open it. If open, hide it.
        setSidebarHidden(!currentlyHidden);
    });

    // Do not use an overlay click to close the sidebar.
    sidebarOverlay?.addEventListener("click", function () {
        if (isMobile()) {
            setSidebarHidden(true);
        }
    });

    // Close sidebar after selecting a page on mobile.
    sidebar?.querySelectorAll(".nav-link").forEach(function (link) {
        link.addEventListener("click", function () {
            if (isMobile()) {
                setSidebarHidden(true);
            }
        });
    });

    // Recalculate layout when screen size changes.
    mobileBreakpoint.addEventListener("change", function () {
        updateSidebar();
    });

    window.addEventListener("resize", updateSidebar);

    initializeSidebar();

    // =====================================================
    // 4. ACTIVE NAVIGATION
    // =====================================================

    const currentPage = window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();

    sidebar?.querySelectorAll(".nav-link").forEach(function (link) {
        const linkPage = link.getAttribute("href")
            ?.split("/")
            .pop()
            .toLowerCase();

        link.classList.toggle("active", linkPage === currentPage);
    });

    // =====================================================
    // 5. THEME
    // =====================================================

    const THEME_KEY = "printify-theme";

    function applyTheme(theme, save = true) {
        const selectedTheme = theme === "dark" ? "dark" : "light";

        body.classList.toggle("dark-mode", selectedTheme === "dark");

        if (themeIcon) {
            if (selectedTheme === "dark") {
                themeIcon.src = "image/lightmode_icon.png";
                themeIcon.alt = "Switch to light mode";

                themeToggle?.setAttribute("aria-label", "Switch to light mode");
                themeToggle?.setAttribute("title", "Switch to light mode");
            } else {
                themeIcon.src = "image/nightmode_icon.png";
                themeIcon.alt = "Switch to dark mode";

                themeToggle?.setAttribute("aria-label", "Switch to dark mode");
                themeToggle?.setAttribute("title", "Switch to dark mode");
            }
        }

        if (save) {
            localStorage.setItem(THEME_KEY, selectedTheme);
        }

        updateChartsTheme();
    }

    function initializeTheme() {
        const savedTheme = localStorage.getItem(THEME_KEY);
        const theme = savedTheme || "dark";

        applyTheme(theme, false);
    }

    themeToggle?.addEventListener("click", function () {
        const currentlyDark = body.classList.contains("dark-mode");

        applyTheme(currentlyDark ? "light" : "dark");
    });

    // =====================================================
    // 6. PROFILE DROPDOWN
    // =====================================================

    function closeProfileDropdown() {
        profileDropdown?.classList.remove("show");
        profileButton?.setAttribute("aria-expanded", "false");
    }

    profileButton?.addEventListener("click", function (event) {
        event.stopPropagation();

        if (!profileDropdown) return;

        const isOpen = profileDropdown.classList.contains("show");

        profileDropdown.classList.toggle("show", !isOpen);
        profileButton.setAttribute("aria-expanded", String(!isOpen));
    });

    document.addEventListener("click", function (event) {
        if (
            profileDropdown &&
            profileButton &&
            !profileDropdown.contains(event.target) &&
            !profileButton.contains(event.target)
        ) {
            closeProfileDropdown();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeProfileDropdown();

            if (isMobile() && !sidebar?.classList.contains("is-hidden")) {
                setSidebarHidden(true);
            }
        }
    });

    // =====================================================
    // 7. LOGOUT
    // =====================================================

    async function handleReportsLogout(event) {
        event.preventDefault();
        if (!window.confirm("Are you sure you want to log out?")) return;

        if (!window.PrintifyAPI || typeof window.PrintifyAPI.logout !== "function") {
            showToast("Logout service is unavailable. Please refresh and try again.", "error");
            return;
        }

        try {
            await window.PrintifyAPI.logout();
            // The shared PrintifyAPI logout function owns session cleanup and redirect.
        } catch (error) {
            console.error("Logout failed:", error);
            showToast("Unable to log out. Please try again.", "error");
        }
    }

    logoutButton?.addEventListener("click", handleReportsLogout);
    document.getElementById("sidebarLogoutButton")?.addEventListener("click", handleReportsLogout);

    // =====================================================
    // 8. TOAST NOTIFICATION
    // =====================================================

    function showToast(message, type = "success") {
        if (!toastMessage || !toastText || !toastIcon) return;

        clearTimeout(toastTimer);

        toastText.textContent = message;

        toastIcon.className = type === "error"
            ? "fa-solid fa-circle-exclamation"
            : "fa-solid fa-circle-check";

        toastMessage.style.borderLeftColor =
            type === "error" ? "#ff6262" : "#19e51b";

        toastIcon.style.color =
            type === "error" ? "#ff6262" : "#25d366";

        toastMessage.classList.add("show");

        toastTimer = setTimeout(function () {
            toastMessage.classList.remove("show");
        }, 3000);
    }

    notificationButton?.addEventListener("click", function () {
        showToast("You are all caught up!");
    });

    // =====================================================
    // 9. DEMO SALES RECORDS
    // =====================================================

    function fetchReport(url) {

        try {
            const result = window.PrintifyAPI ? window.PrintifyAPI.request("GET", url) : null;
            return result && result.status === 200 ? result.data : null;
        } catch (error) {
            console.error("Unable to load report:", error);
            return null;
        }

    }

    // Order records come from PostgreSQL (GET /api/reports/orders).
    const reportOrders = fetchReport("/api/reports/orders");
    const salesRecords = reportOrders && Array.isArray(reportOrders.items) ? reportOrders.items : [];

    // =====================================================
    // 10. FORMAT HELPERS
    // =====================================================

    function formatCurrency(amount) {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            minimumFractionDigits: 2
        }).format(Number(amount) || 0);
    }

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

    function getOrderStatusClass(status) {
        const classes = {
            "Pending": "pending",
            "Processing": "processing",
            "Ready for Pickup": "ready",
            "Completed": "completed",
            "Cancelled": "cancelled"
        };

        return classes[status] || "pending";
    }

    function getPaymentStatusClass(status) {
        const classes = {
            "Paid": "paid",
            "Partially Paid": "partially-paid",
            "Unpaid": "unpaid",
            "Refunded": "refunded"
        };

        return classes[status] || "unpaid";
    }

    // =====================================================
    // 11. FILTER SALES RECORDS
    // =====================================================

    function getFilteredRecords() {
        const searchValue = salesSearch?.value.trim().toLowerCase() || "";

        const startValue = startDate?.value || "";
        const endValue = endDate?.value || "";

        const selectedOrderStatus = orderStatusFilter?.value || "all";
        const selectedPaymentStatus = paymentStatusFilter?.value || "all";

        return salesRecords.filter(function (record) {
            const matchesSearch =
                record.orderId.toLowerCase().includes(searchValue) ||
                record.customer.toLowerCase().includes(searchValue);

            const matchesStartDate =
                !startValue || record.date >= startValue;

            const matchesEndDate =
                !endValue || record.date <= endValue;

            const matchesOrderStatus =
                selectedOrderStatus === "all" ||
                record.orderStatus === selectedOrderStatus;

            const matchesPaymentStatus =
                selectedPaymentStatus === "all" ||
                record.paymentStatus === selectedPaymentStatus;

            return (
                matchesSearch &&
                matchesStartDate &&
                matchesEndDate &&
                matchesOrderStatus &&
                matchesPaymentStatus
            );
        });
    }

    // =====================================================
    // 12. RENDER SALES TABLE
    // =====================================================

    function renderSalesTable() {
        if (!salesTableBody) return;

        const filteredRecords = getFilteredRecords();

        salesTableBody.innerHTML = "";

        filteredRecords.forEach(function (record, index) {
            const row = document.createElement("tr");

            row.style.animationDelay = `${index * 0.025}s`;

            row.innerHTML = `
                <td>
                    <span class="order-id-value">
                        ${escapeHTML(record.orderId)}
                    </span>
                </td>

                <td>
                    <span class="customer-name">
                        ${escapeHTML(record.customer)}
                    </span>
                </td>

                <td>${escapeHTML(formatDate(record.date))}</td>

                <td>
                    <span class="amount-value">
                        ${escapeHTML(formatCurrency(record.amount))}
                    </span>
                </td>

                <td>
                    <span class="report-status-badge ${getOrderStatusClass(record.orderStatus)}">
                        ${escapeHTML(record.orderStatus)}
                    </span>
                </td>

                <td>
                    <span class="payment-status-badge ${getPaymentStatusClass(record.paymentStatus)}">
                        ${escapeHTML(record.paymentStatus)}
                    </span>
                </td>
            `;

            salesTableBody.appendChild(row);
        });

        const count = filteredRecords.length;

        if (salesRecordCount) {
            salesRecordCount.textContent =
                `${count} ${count === 1 ? "record" : "records"}`;
        }

        if (salesTableInformation) {
            salesTableInformation.textContent =
                `Showing ${count} of ${salesRecords.length} records`;
        }

        if (salesEmptyState) {
            salesEmptyState.classList.toggle("show", count === 0);
        }
    }

    // =====================================================
    // 13. ORDER STATUS COUNTS
    // =====================================================

    function updateOrderCounts() {
        const statuses = {
            "Pending": "pendingOrderCount",
            "Processing": "processingOrderCount",
            "Ready for Pickup": "readyOrderCount",
            "Completed": "completedOrderCount",
            "Cancelled": "cancelledOrderCount"
        };

        const counts = {
            "Pending": 0,
            "Processing": 0,
            "Ready for Pickup": 0,
            "Completed": 0,
            "Cancelled": 0
        };

        salesRecords.forEach(function (record) {
            if (Object.prototype.hasOwnProperty.call(counts, record.orderStatus)) {
                counts[record.orderStatus]++;
            }
        });

        Object.keys(statuses).forEach(function (status) {
            const element = document.getElementById(statuses[status]);

            if (element) {
                element.textContent = counts[status];
            }
        });

        return counts;
    }

    // =====================================================
    // 14. CHART DATA
    // =====================================================

    // Chart values come from PostgreSQL (GET /api/reports/chart): amount collected per period.
    const chartData = (function () {

        const empty = { labels: [], values: [] };
        const data = fetchReport("/api/reports/chart") || {};

        return {
            daily: data.daily || empty,
            weekly: data.weekly || empty,
            monthly: data.monthly || empty,
            yearly: data.yearly || empty
        };

    })();

    // =====================================================
    // 15. CHART THEME
    // =====================================================

    function getChartColors() {
        const dark = body.classList.contains("dark-mode");

        return {
            text: dark ? "#aab7ad" : "#b3c0b5",
            grid: dark
                ? "rgba(255,255,255,0.07)"
                : "rgba(0,0,0,0.08)",
            border: "#19e51b",
            tooltipBackground: "rgba(5, 18, 10, 0.95)"
        };
    }

    function updateChartsTheme() {
        if (!salesChart && !orderChart) return;

        const colors = getChartColors();

        if (salesChart) {
            salesChart.options.scales.x.ticks.color = colors.text;
            salesChart.options.scales.y.ticks.color = colors.text;
            salesChart.options.scales.x.grid.color = colors.grid;
            salesChart.options.scales.y.grid.color = colors.grid;
            salesChart.options.plugins.legend.labels.color = colors.text;
            salesChart.options.plugins.tooltip.backgroundColor =
                colors.tooltipBackground;

            salesChart.update("none");
        }

        if (orderChart) {
            orderChart.options.plugins.legend.labels.color = colors.text;
            orderChart.options.plugins.tooltip.backgroundColor =
                colors.tooltipBackground;

            orderChart.update("none");
        }
    }

    // =====================================================
    // 16. SALES CHART
    // =====================================================

    function initializeSalesChart() {
        const canvas = document.getElementById("salesChart");

        if (!canvas || typeof Chart === "undefined") {
            console.warn("Chart.js or sales chart canvas is unavailable.");
            return;
        }

        const context = canvas.getContext("2d");
        const gradient = context.createLinearGradient(0, 0, 0, 300);

        gradient.addColorStop(0, "rgba(25, 229, 27, 0.30)");
        gradient.addColorStop(1, "rgba(25, 229, 27, 0.00)");

        const colors = getChartColors();
        const data = chartData.daily;

        salesChart = new Chart(context, {
            type: "line",

            data: {
                labels: data.labels,

                datasets: [{
                    label: "Total Sales",
                    data: data.values,
                    borderColor: "#19e51b",
                    backgroundColor: gradient,
                    borderWidth: 2.5,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: "#19e51b",
                    pointBorderColor: "#ffffff",
                    pointBorderWidth: 1.5
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,

                interaction: {
                    intersect: false,
                    mode: "index"
                },

                plugins: {
                    legend: {
                        display: false
                    },

                    tooltip: {
                        backgroundColor: colors.tooltipBackground,
                        titleColor: "#ffffff",
                        bodyColor: "#ffffff",
                        padding: 11,
                        displayColors: false,

                        callbacks: {
                            label: function (context) {
                                return `Sales: ${formatCurrency(context.parsed.y)}`;
                            }
                        }
                    }
                },

                scales: {
                    x: {
                        grid: {
                            display: false,
                            color: colors.grid
                        },

                        ticks: {
                            color: colors.text,
                            font: {
                                family: "Inter",
                                size: 9
                            }
                        }
                    },

                    y: {
                        beginAtZero: true,

                        grid: {
                            color: colors.grid
                        },

                        ticks: {
                            color: colors.text,
                            font: {
                                family: "Inter",
                                size: 9
                            },

                            callback: function (value) {
                                return "₱" + Number(value).toLocaleString("en-PH");
                            }
                        }
                    }
                }
            }
        });
    }

    // =====================================================
    // 17. UPDATE SALES CHART PERIOD
    // =====================================================

    function updateSalesChart(period) {
        if (!salesChart || !chartData[period]) return;

        const selectedData = chartData[period];

        salesChart.data.labels = selectedData.labels;
        salesChart.data.datasets[0].data = selectedData.values;

        salesChart.update();

        const labels = {
            daily: "Daily Sales",
            weekly: "Weekly Sales",
            monthly: "Monthly Sales",
            yearly: "Yearly Sales"
        };

        const chartPeriodLabel = document.getElementById("chartPeriodLabel");

        if (chartPeriodLabel) {
            chartPeriodLabel.textContent = labels[period];
        }
    }

    document.querySelectorAll(".period-button").forEach(function (button) {
        button.addEventListener("click", function () {
            document.querySelectorAll(".period-button").forEach(function (item) {
                item.classList.remove("active");
            });

            button.classList.add("active");

            updateSalesChart(button.dataset.period);
        });
    });

    // =====================================================
    // 18. ORDER DOUGHNUT CHART
    // =====================================================

    function initializeOrderChart() {
        const canvas = document.getElementById("orderChart");

        if (!canvas || typeof Chart === "undefined") {
            console.warn("Chart.js or order chart canvas is unavailable.");
            return;
        }

        const counts = updateOrderCounts();
        const colors = getChartColors();

        orderChart = new Chart(canvas.getContext("2d"), {
            type: "doughnut",

            data: {
                labels: [
                    "Pending",
                    "Processing",
                    "Ready for Pickup",
                    "Completed",
                    "Cancelled"
                ],

                datasets: [{
                    data: [
                        counts.Pending,
                        counts.Processing,
                        counts["Ready for Pickup"],
                        counts.Completed,
                        counts.Cancelled
                    ],

                    backgroundColor: [
                        "#ffbd45",
                        "#4da6ff",
                        "#a78bfa",
                        "#25d366",
                        "#ff6262"
                    ],

                    borderColor: "rgba(10, 24, 16, 0.65)",
                    borderWidth: 3,
                    hoverOffset: 7
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "70%",

                plugins: {
                    legend: {
                        display: false
                    },

                    tooltip: {
                        backgroundColor: colors.tooltipBackground,
                        titleColor: "#ffffff",
                        bodyColor: "#ffffff",
                        padding: 11
                    }
                }
            }
        });
    }

    // =====================================================
    // 19. FILTER EVENT LISTENERS
    // =====================================================

    [
        salesSearch,
        startDate,
        endDate,
        orderStatusFilter,
        paymentStatusFilter
    ].forEach(function (element) {
        if (!element) return;

        element.addEventListener("input", renderSalesTable);
        element.addEventListener("change", renderSalesTable);
    });

    // =====================================================
    // 20. CLEAR FILTERS
    // =====================================================

    clearFiltersButton?.addEventListener("click", function () {
        if (salesSearch) salesSearch.value = "";
        if (startDate) startDate.value = "";
        if (endDate) endDate.value = "";

        if (orderStatusFilter) {
            orderStatusFilter.value = "all";
        }

        if (paymentStatusFilter) {
            paymentStatusFilter.value = "all";
        }

        renderSalesTable();

        showToast("Report filters have been reset.");
    });

    // =====================================================
    // 21. EXPORT CSV
    // =====================================================

    function exportCSV() {
        const filteredRecords = getFilteredRecords();

        if (filteredRecords.length === 0) {
            showToast("No records available to export.", "error");
            return;
        }

        const headers = [
            "Order ID",
            "Customer",
            "Order Date",
            "Amount",
            "Order Status",
            "Payment Status"
        ];

        const rows = filteredRecords.map(function (record) {
            return [
                record.orderId,
                record.customer,
                record.date,
                Number(record.amount).toFixed(2),
                record.orderStatus,
                record.paymentStatus
            ];
        });

        function escapeCSV(value) {
            const text = String(value ?? "");

            return `"${text.replace(/"/g, '""')}"`;
        }

        const csvContent = [
            headers.map(escapeCSV).join(","),
            ...rows.map(function (row) {
                return row.map(escapeCSV).join(",");
            })
        ].join("\r\n");

        const blob = new Blob(
            ["\uFEFF" + csvContent],
            { type: "text/csv;charset=utf-8;" }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `Printify_Sales_Report_${getLocalDateString()}.csv`;

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);

        showToast("Sales report exported successfully.");
    }

    exportReportButton?.addEventListener("click", exportCSV);

    // =====================================================
    // 22. PRINT REPORT
    // =====================================================

    // A4 print sheet styled like Printify's Staff QR identification printout.
    printReportButton?.addEventListener("click", function () {
        const records = getFilteredRecords();
        const printWindow = window.open("", "_blank", "width=900,height=850");
        if (!printWindow) {
            showToast("Please allow pop-ups to print the report.", "error");
            return;
        }

        const logoUrl = new URL("image/printify_logo.png", window.location.href).href;
        const printedAt = new Date().toLocaleString("en-PH", {
            year: "numeric", month: "long", day: "numeric",
            hour: "numeric", minute: "2-digit"
        });
        const totalSales = records.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
        const completed = records.filter(r => r.orderStatus === "Completed").length;
        const paid = records.filter(r => r.paymentStatus === "Paid").length;
        const period = [startDate?.value, endDate?.value].filter(Boolean).join(" to ") || "All available dates";
        const chartImage = salesChart ? salesChart.toBase64Image() : "";
        const orderImage = orderChart ? orderChart.toBase64Image() : "";
        const rows = records.map(r => `
            <tr>
                <td>${escapeHTML(r.orderId)}</td>
                <td>${escapeHTML(r.customer)}</td>
                <td>${escapeHTML(formatDate(r.date))}</td>
                <td class="amount">${escapeHTML(formatCurrency(r.amount))}</td>
                <td>${escapeHTML(r.orderStatus)}</td>
                <td>${escapeHTML(r.paymentStatus)}</td>
            </tr>`).join("");

        printWindow.document.open();
        printWindow.document.write(`<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<title>Printify | Official Sales Report</title>
<style>
@page { size: A4 portrait; margin: 15mm; }
* { box-sizing: border-box; }
body { margin: 0; background: white; color: #193b29; font-family: Arial, Helvetica, sans-serif; }
.sheet { max-width: 760px; margin: auto; }
.letterhead { display: flex; align-items: center; justify-content: space-between; gap: 20px;
 padding: 12px 0 20px; border-bottom: 4px solid #176a39; }
.brand { display: flex; align-items: center; gap: 14px; }
.brand img { width: 78px; height: 78px; object-fit: contain; }
.brand-title { font-size: 26px; font-weight: 800; letter-spacing: 1.8px; color: #14532d; }
.brand-sub { font-size: 10px; color: #5d7366; text-transform: uppercase; letter-spacing: 1.1px; margin-top: 5px; }
.doc-type { text-align: right; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #14532d; }
.doc-type small { display: block; color: #728277; font-size: 10px; font-weight: 400; margin-top: 7px; }
.report-title { text-align: center; padding: 28px 0 22px; }
.eyebrow { color: #237947; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; }
h1 { font-size: 25px; margin: 10px 0; color: #143e26; }
.description { color: #6b7e70; font-size: 12px; }
.summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 12px 0 24px; }
.stat { background: #edf7ef; border: 1px solid #bdddc5; border-radius: 7px; padding: 13px; }
.stat span { display: block; color: #607967; font-size: 10px; margin-bottom: 7px; }
.stat strong { color: #14532d; font-size: 17px; }
h2 { font-size: 15px; color: #14532d; margin: 22px 0 12px; }
.charts { display: grid; grid-template-columns: 1.4fr 1fr; gap: 12px; align-items: center; }
.chart { border: 1px solid #d9e6dc; border-radius: 8px; padding: 10px; }
.chart img { display: block; width: 100%; height: auto; }
table { border-collapse: collapse; width: 100%; font-size: 9px; }
th { background: #edf7ef; color: #14532d; text-align: left; padding: 9px 6px; border-bottom: 2px solid #176a39; }
td { padding: 8px 6px; border-bottom: 1px solid #e1eae3; overflow-wrap: anywhere; }
tr { break-inside: avoid; } .amount { white-space: nowrap; }
.empty { color: #718474; font-size: 11px; text-align: center; padding: 20px; }
footer { border-top: 2px solid #176a39; margin-top: 30px; padding: 16px 0 4px;
 display: flex; justify-content: space-between; gap: 15px; font-size: 10px; color: #687b6e; line-height: 1.7; }
footer strong { color: #14532d; } .footer-right { text-align: right; }
@media screen { body { background: #eaf0eb; padding: 24px; } .sheet { background: white; padding: 30px; box-shadow: 0 6px 30px #0001; } }
@media print { .sheet { padding: 0; } .summary, .stat, th { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
</style></head><body>
<div class="sheet">
<header class="letterhead">
 <div class="brand"><img src="${logoUrl}" alt="Printify logo"><div>
 <div class="brand-title">PRINTIFY</div><div class="brand-sub">Printing Services &amp; Management</div></div></div>
 <div class="doc-type">Official Business Report<small>Sales &amp; Orders Summary</small></div>
</header>
<section class="report-title"><div class="eyebrow">Printify Business Analytics</div>
<h1>Sales &amp; Orders Report</h1><p class="description">Reporting period: ${escapeHTML(period)}</p></section>
<section class="summary">
 <div class="stat"><span>TOTAL SALES</span><strong>${escapeHTML(formatCurrency(totalSales))}</strong></div>
 <div class="stat"><span>ORDERS</span><strong>${records.length}</strong></div>
 <div class="stat"><span>COMPLETED / PAID</span><strong>${completed} / ${paid}</strong></div>
</section>
${chartImage || orderImage ? `<h2>Business Overview</h2><section class="charts">
 ${chartImage ? `<div class="chart"><img src="${chartImage}" alt="Sales chart"></div>` : ""}
 ${orderImage ? `<div class="chart"><img src="${orderImage}" alt="Order status chart"></div>` : ""}
</section>` : ""}
<h2>Sales History</h2>
<table><thead><tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Amount</th><th>Order Status</th><th>Payment</th></tr></thead>
<tbody>${rows || `<tr><td colspan="6" class="empty">No matching records</td></tr>`}</tbody></table>
<footer><div><strong>PRINTIFY • OFFICIAL DOCUMENT</strong><br>Sales and order information report.</div>
<div class="footer-right">Date Printed: ${escapeHTML(printedAt)}<br>Generated from Printify Reports</div></footer>
</div></body></html>`);
        printWindow.document.close();
        // Wait for the logo and chart images before opening the print dialog.
        const images = Array.from(printWindow.document.images);
        Promise.all(images.map(img => img.complete ? Promise.resolve() :
            new Promise(resolve => { img.onload = resolve; img.onerror = resolve; })
        )).then(() => {
            if (!printWindow.closed) {
                printWindow.focus();
                printWindow.print();
            }
        });
    });

    // =====================================================
    // 23. INITIALIZE PAGE
    // =====================================================

    initializeTheme();

    initializeSalesChart();
    initializeOrderChart();

    renderSalesTable();

    updateDateInformation();

});
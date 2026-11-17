
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const $ = id => document.getElementById(id);
    const body = document.body;
    const ARCHIVE_KEY = "printifyArchivedInventory";

    let products = [];
    let archivedProducts = [];
    let showingArchived = false;
    let formSnapshot = "";
    let confirmCallback = null;
    let toastTimer;

    // ========================================
    // HELPERS
    // ========================================

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, c => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[c]);
    }

    function money(value) {
        return Number(value || 0).toLocaleString("en-PH", {
            style: "currency",
            currency: "PHP"
        });
    }

    function statusOf(product) {
        const quantity = Number(product.quantity);
        const threshold = Number(product.threshold);

        if (quantity <= 0) return "Out of Stock";
        if (quantity <= threshold) return "Low Stock";
        return "In Stock";
    }

    function statusClass(status) {
        return status.toLowerCase().replaceAll(" ", "-");
    }

    function iconOf(category) {
        return ({
            Paper: "fa-file-lines",
            Ink: "fa-droplet",
            "Printing Supplies": "fa-print",
            Other: "fa-box"
        })[category] || "fa-box";
    }

    function toast(message, error = false) {
        const box = $("toastMessage");
        if (!box) return;

        clearTimeout(toastTimer);
        $("toastText").textContent = message;

        box.style.color = error ? "#ff9999" : "#8aff98";
        box.style.borderColor = error
            ? "rgba(255,80,80,.5)"
            : "rgba(25,229,27,.4)";

        box.classList.add("show");

        toastTimer = setTimeout(() => {
            box.classList.remove("show");
        }, 3200);
    }

    function nextId() {
        const ids = [...products, ...archivedProducts]
            .map(p => /^PRD-(\d+)$/.exec(String(p.id)))
            .filter(Boolean)
            .map(match => Number(match[1]));

        const next = Math.max(0, ...ids) + 1;
        return "PRD-" + String(next).padStart(3, "0");
    }

    // ========================================
    // EXISTING PRINTIFY API
    // ========================================

    function loadInventory() {
        if (!window.PrintifyAPI ||
            typeof PrintifyAPI.fetchInventory !== "function") {
            toast("Printify API is unavailable.", true);
            return;
        }

        try {
            const result = PrintifyAPI.fetchInventory();

            if (!Array.isArray(result)) {
                throw new Error("Invalid inventory API response.");
            }

            products = result;
        } catch (error) {
            console.error(error);
            toast("Unable to load inventory.", true);
        }
    }

    function saveInventory(items) {
        if (!window.PrintifyAPI ||
            typeof PrintifyAPI.syncInventory !== "function") {
            toast("Database API is unavailable.", true);
            return false;
        }

        try {
            const result = PrintifyAPI.syncInventory(items);

            if (!result?.ok) {
                throw new Error(result?.message || "Save failed.");
            }

            const refreshed = PrintifyAPI.fetchInventory();
            products = Array.isArray(refreshed) ? refreshed : items;
            return true;
        } catch (error) {
            console.error(error);
            toast(error.message || "Database save failed.", true);
            return false;
        }
    }

    function loadArchives() {
        try {
            const value = JSON.parse(
                localStorage.getItem(ARCHIVE_KEY) || "[]"
            );
            archivedProducts = Array.isArray(value) ? value : [];
        } catch {
            archivedProducts = [];
        }
    }

    function saveArchives(items) {
        try {
            localStorage.setItem(ARCHIVE_KEY, JSON.stringify(items));
            archivedProducts = items;
            return true;
        } catch {
            toast("Unable to save archive.", true);
            return false;
        }
    }

    // ========================================
    // MODAL SYSTEM WITH BLURRED BACKGROUND
    // ========================================

    const MODAL_IDS = [
        "productModal",
        "viewProductModal",
        "confirmationModal"
    ];

    function openModal(id) {
        const modal = $(id);
        if (!modal) return;

        modal.classList.add("show");
        modal.setAttribute("aria-hidden", "false");

        body.classList.add("inventory-modal-open");

        // Confirmation appears above the Add/Edit form.
        modal.style.zIndex =
            id === "confirmationModal" ? "100002" : "100001";
    }

    function closeModal(id) {
        const modal = $(id);
        if (!modal) return;

        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");

        const stillOpen = MODAL_IDS.some(
            modalId => $(modalId)?.classList.contains("show")
        );

        if (!stillOpen) {
            body.classList.remove("inventory-modal-open");
        }
    }

    // Clicking the blurred background does nothing.
    // Only the actual Close/Cancel buttons can close a modal.
    document.querySelectorAll(".inventory-modal-overlay")
        .forEach(overlay => {
            overlay.addEventListener("click", event => {
                if (event.target === overlay) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            });
        });

    // ========================================
    // CONFIRMATION POPUP
    // ========================================

    function confirmAction(
        title,
        message,
        callback,
        buttonLabel = "Confirm"
    ) {
        confirmCallback = callback;

        $("confirmationTitle").textContent = title;
        $("confirmationMessage").textContent = message;
        $("confirmActionButton").textContent = buttonLabel;

        openModal("confirmationModal");
    }

    $("cancelConfirmationButton").addEventListener("click", () => {
        confirmCallback = null;
        closeModal("confirmationModal");
    });

    $("confirmActionButton").addEventListener("click", () => {
        const callback = confirmCallback;
        confirmCallback = null;

        closeModal("confirmationModal");

        if (typeof callback === "function") callback();
    });

    // ========================================
    // PROTECT UNSAVED FORM DATA
    // ========================================

    function formValues() {
        return [
            "productId",
            "productName",
            "productCategory",
            "productQuantity",
            "productUnit",
            "productPrice",
            "lowStockThreshold"
        ].map(id => $(id)?.value ?? "");
    }

    function takeSnapshot() {
        formSnapshot = JSON.stringify(formValues());
    }

    function hasUnsavedChanges() {
        return JSON.stringify(formValues()) !== formSnapshot;
    }

    function requestCloseProduct() {
        if (!hasUnsavedChanges()) {
            closeModal("productModal");
            return;
        }

        confirmAction(
            "Discard Changes?",
            "You have unsaved product information. Are you sure you want to discard it?",
            () => closeModal("productModal"),
            "Discard Changes"
        );
    }

    // ========================================
    // ADD PRODUCT
    // ========================================

    function openAddProduct() {
        $("productForm").reset();
        $("productId").value = "";
        $("lowStockThreshold").value = "10";

        $("modalTitle").textContent = "Add Product";
        $("modalDescription").textContent =
            "Enter the details of the printing material.";

        $("saveProductButton").innerHTML =
            '<i class="fa-solid fa-floppy-disk"></i> Save Product';

        takeSnapshot();
        openModal("productModal");
        $("productName").focus();
    }

    // ========================================
    // EDIT PRODUCT
    // ========================================

    function openEditProduct(id) {
        const product = products.find(p => String(p.id) === String(id));

        if (!product) {
            toast("Product not found.", true);
            return;
        }

        $("productId").value = product.id;
        $("productName").value = product.name;
        $("productCategory").value = product.category;
        $("productQuantity").value = product.quantity;
        $("productUnit").value = product.unit;
        $("productPrice").value = product.price;
        $("lowStockThreshold").value = product.threshold;

        $("modalTitle").textContent = "Edit Product";
        $("modalDescription").textContent =
            "Update the details of this inventory product.";

        $("saveProductButton").innerHTML =
            '<i class="fa-solid fa-floppy-disk"></i> Update Product';

        takeSnapshot();
        openModal("productModal");
    }

    $("addProductButton").addEventListener("click", openAddProduct);
    $("closeModalButton").addEventListener("click", requestCloseProduct);
    $("cancelModalButton").addEventListener("click", requestCloseProduct);

    // ========================================
    // SAVE ADD / EDIT PRODUCT
    // ========================================

    $("productForm").addEventListener("submit", event => {
        event.preventDefault();

        const form = $("productForm");
        if (!form.reportValidity()) return;

        const id = $("productId").value;
        const name = $("productName").value.trim();
        const category = $("productCategory").value;
        const quantity = Number($("productQuantity").value);
        const unit = $("productUnit").value;
        const price = Number($("productPrice").value);
        const threshold = Number($("lowStockThreshold").value);

        if (!name || !category || !unit ||
            !Number.isInteger(quantity) || quantity < 0 ||
            !Number.isFinite(price) || price < 0 ||
            !Number.isInteger(threshold) || threshold < 0) {
            toast("Please enter valid product details.", true);
            return;
        }

        const duplicate = products.some(p =>
            String(p.name).toLowerCase() === name.toLowerCase() &&
            String(p.id) !== String(id)
        );

        if (duplicate) {
            toast("Product name already exists.", true);
            return;
        }

        const product = {
            id: id || nextId(),
            name,
            category,
            quantity,
            unit,
            price,
            threshold
        };

        const updated = id
            ? products.map(p =>
                String(p.id) === String(id)
                    ? { ...p, ...product }
                    : p
              )
            : [...products, product];

        const saveButton = $("saveProductButton");
        saveButton.disabled = true;

        try {
            if (!saveInventory(updated)) return;

            closeModal("productModal");
            renderInventory();

            toast(id
                ? "Product updated successfully."
                : "Product added successfully.");
        } finally {
            saveButton.disabled = false;
        }
    });

    // ========================================
    // VIEW PRODUCT
    // ========================================

    function openViewProduct(id, archived = false) {
        const source = archived ? archivedProducts : products;
        const product = source.find(p => String(p.id) === String(id));

        if (!product) {
            toast("Product not found.", true);
            return;
        }

        const details = [
            ["Product ID", product.id],
            ["Product Name", product.name],
            ["Category", product.category],
            ["Quantity", `${product.quantity} ${product.unit}`],
            ["Unit Price", money(product.price)],
            ["Low Stock Threshold", product.threshold],
            ["Stock Status", statusOf(product)]
        ];

        if (archived) {
            details.push([
                "Archived Date",
                product.archivedAt
                    ? new Date(product.archivedAt).toLocaleString("en-PH")
                    : "N/A"
            ]);
        }

        $("productDetailsContent").innerHTML = details.map(
            ([label, value]) => `
                <div class="product-detail-item">
                    <span>${escapeHTML(label)}</span>
                    <strong>${escapeHTML(value)}</strong>
                </div>
            `
        ).join("");

        openModal("viewProductModal");
    }

    $("closeViewModalButton").addEventListener("click", () => {
        closeModal("viewProductModal");
    });

    $("closeViewButton").addEventListener("click", () => {
        closeModal("viewProductModal");
    });

    // ========================================
    // ARCHIVE PRODUCT
    // ========================================

    function archiveProduct(id) {
        const product = products.find(p => String(p.id) === String(id));
        if (!product) return;

        confirmAction(
            "Archive Product?",
            `Are you sure you want to archive "${product.name}"? You can restore it later.`,
            () => {
                const oldArchives = [...archivedProducts];

                const nextArchives = [
                    ...archivedProducts,
                    {
                        ...product,
                        archivedAt: new Date().toISOString()
                    }
                ];

                if (!saveArchives(nextArchives)) return;

                const nextProducts = products.filter(
                    p => String(p.id) !== String(id)
                );

                if (!saveInventory(nextProducts)) {
                    saveArchives(oldArchives);
                    return;
                }

                renderInventory();
                toast("Product archived successfully.");
            },
            "Archive Product"
        );
    }

    // ========================================
    // RESTORE PRODUCT
    // ========================================

    function restoreProduct(id) {
        const product = archivedProducts.find(
            p => String(p.id) === String(id)
        );

        if (!product) return;

        confirmAction(
            "Restore Product?",
            `Restore "${product.name}" to active inventory?`,
            () => {
                if (products.some(p => String(p.id) === String(id))) {
                    toast("Product ID already exists.", true);
                    return;
                }

                const { archivedAt, ...restored } = product;

                if (!saveInventory([...products, restored])) return;

                const remaining = archivedProducts.filter(
                    p => String(p.id) !== String(id)
                );

                if (!saveArchives(remaining)) {
                    toast("Restored, but archive cleanup failed.", true);
                    renderInventory();
                    return;
                }

                renderInventory();
                toast("Product restored successfully.");
            },
            "Restore Product"
        );
    }

    // ========================================
    // PERMANENT DELETE
    // ========================================

    function permanentlyDelete(id) {
        const product = archivedProducts.find(
            p => String(p.id) === String(id)
        );

        if (!product) return;

        confirmAction(
            "Permanently Delete Product?",
            `Delete "${product.name}" permanently? This cannot be undone.`,
            () => {
                const remaining = archivedProducts.filter(
                    p => String(p.id) !== String(id)
                );

                if (!saveArchives(remaining)) return;

                renderInventory();
                toast("Product permanently deleted.");
            },
            "Delete Permanently"
        );
    }

    // ========================================
    // FILTERS
    // ========================================

    function filteredProducts() {
        const source = showingArchived ? archivedProducts : products;

        const search = $("searchInput").value.trim().toLowerCase();
        const category = $("categoryFilter").value;
        const stock = $("stockFilter").value;

        return source.filter(p => {
            const matchesSearch =
                String(p.name).toLowerCase().includes(search) ||
                String(p.id).toLowerCase().includes(search);

            const matchesCategory =
                category === "all" || p.category === category;

            const matchesStock =
                stock === "all" || statusOf(p) === stock;

            return matchesSearch && matchesCategory && matchesStock;
        });
    }

    // ========================================
    // PRODUCT TABLE
    // ========================================

    function productCell(p) {
        return `
            <div class="inventory-product">
                <div class="inventory-product-icon">
                    <i class="fa-solid ${iconOf(p.category)}"></i>
                </div>
                <div class="inventory-product-details">
                    <strong>${escapeHTML(p.name)}</strong>
                    <small class="product-id">${escapeHTML(p.id)}</small>
                </div>
            </div>
        `;
    }

    function activeRow(p) {
        const status = statusOf(p);

        return `
            <tr>
                <td>${productCell(p)}</td>
                <td>${escapeHTML(p.category)}</td>
                <td>
                    <strong>${Number(p.quantity)}</strong>
                    ${escapeHTML(p.unit)}
                </td>
                <td class="price-value">${money(p.price)}</td>
                <td>
                    <span class="inventory-status ${statusClass(status)}">
                        ${status}
                    </span>
                </td>
                <td>
                    <div class="inventory-actions">
                        <button type="button"
                                data-action="view"
                                data-id="${escapeHTML(p.id)}"
                                title="View Product">
                            <i class="fa-regular fa-eye"></i>
                        </button>
                        <button type="button"
                                data-action="edit"
                                data-id="${escapeHTML(p.id)}"
                                title="Edit Product">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button type="button"
                                class="archive-action"
                                data-action="archive"
                                data-id="${escapeHTML(p.id)}"
                                title="Archive Product">
                            <i class="fa-solid fa-box-archive"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    function archivedRow(p) {
        const date = p.archivedAt
            ? new Date(p.archivedAt).toLocaleDateString("en-PH")
            : "N/A";

        return `
            <tr>
                <td>${productCell(p)}</td>
                <td>${escapeHTML(p.category)}</td>
                <td>
                    ${Number(p.quantity)} ${escapeHTML(p.unit)}
                </td>
                <td class="price-value">${money(p.price)}</td>
                <td>${escapeHTML(date)}</td>
                <td>
                    <div class="inventory-actions">
                        <button type="button"
                                data-action="view"
                                data-id="${escapeHTML(p.id)}"
                                title="View Product">
                            <i class="fa-regular fa-eye"></i>
                        </button>
                        <button type="button"
                                class="restore-action"
                                data-action="restore"
                                data-id="${escapeHTML(p.id)}"
                                title="Restore Product">
                            <i class="fa-solid fa-rotate-left"></i>
                        </button>
                        <button type="button"
                                class="archive-action"
                                data-action="delete"
                                data-id="${escapeHTML(p.id)}"
                                title="Delete Permanently">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    function renderInventory() {
        const filtered = filteredProducts();
        const total = showingArchived
            ? archivedProducts.length
            : products.length;

        $("inventoryRecordCount").textContent =
            `${total} ${total === 1 ? "record" : "records"}`;

        $("resultsCount").textContent =
            `Showing ${filtered.length} of ${total} products`;

        $("inventoryHeading").textContent = showingArchived
            ? "Archived Products"
            : "Product Inventory";

        $("inventorySubtitle").textContent = showingArchived
            ? "Restore archived products or delete them permanently."
            : "Check product details, quantities, and stock status.";

        $("toggleArchivedButton").innerHTML = showingArchived
            ? '<i class="fa-solid fa-arrow-left"></i> Active Products'
            : '<i class="fa-solid fa-box-archive"></i> Archived Products';

        $("addProductButton").hidden = showingArchived;
        $("activeTableWrapper").hidden = showingArchived;
        $("archivedTableWrapper").hidden = !showingArchived;

        const tbody = showingArchived
            ? $("archivedInventoryTableBody")
            : $("inventoryTableBody");

        tbody.innerHTML = filtered.length
            ? filtered.map(showingArchived ? archivedRow : activeRow).join("")
            : `
                <tr>
                    <td colspan="6"
                        style="text-align:center;padding:40px;color:#b6c6b9">
                        <i class="fa-solid fa-box-open"></i>
                        <p>No products found.</p>
                    </td>
                </tr>
            `;

        updateNotifications();
    }

    function handleTableAction(event) {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const { action, id } = button.dataset;

        switch (action) {
            case "view":
                openViewProduct(id, showingArchived);
                break;
            case "edit":
                openEditProduct(id);
                break;
            case "archive":
                archiveProduct(id);
                break;
            case "restore":
                restoreProduct(id);
                break;
            case "delete":
                permanentlyDelete(id);
                break;
        }
    }

    $("inventoryTableBody").addEventListener(
        "click", handleTableAction
    );

    $("archivedInventoryTableBody").addEventListener(
        "click", handleTableAction
    );

    $("toggleArchivedButton").addEventListener("click", () => {
        showingArchived = !showingArchived;
        renderInventory();
    });

    $("searchInput").addEventListener("input", renderInventory);
    $("categoryFilter").addEventListener("change", renderInventory);
    $("stockFilter").addEventListener("change", renderInventory);

    $("resetFiltersButton").addEventListener("click", () => {
        $("searchInput").value = "";
        $("categoryFilter").value = "all";
        $("stockFilter").value = "all";
        renderInventory();
    });

    // ========================================
    // EXPORT CSV / EXCEL
    // ========================================

    function exportRows() {
        return filteredProducts().map(p => ({
            "Product ID": p.id,
            "Product Name": p.name,
            "Category": p.category,
            "Quantity": p.quantity,
            "Unit": p.unit,
            "Unit Price": p.price,
            "Threshold": p.threshold,
            "Stock Status": statusOf(p)
        }));
    }

    function downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function exportCSV() {
        const rows = exportRows();

        if (!rows.length) {
            toast("No products to export.", true);
            return;
        }

        const headers = Object.keys(rows[0]);
        const cell = value =>
            '"' + String(value ?? "").replaceAll('"', '""') + '"';

        const csv = [
            headers.map(cell).join(","),
            ...rows.map(row =>
                headers.map(header => cell(row[header])).join(",")
            )
        ].join("\r\n");

        downloadBlob(
            new Blob(["\uFEFF" + csv], {
                type: "text/csv;charset=utf-8"
            }),
            "printify-inventory.csv"
        );

        toast("CSV exported successfully.");
    }

    function exportExcel() {
        const rows = exportRows();

        if (!rows.length) {
            toast("No products to export.", true);
            return;
        }

        const headers = Object.keys(rows[0]);

        const table = `
            <table border="1">
                <thead>
                    <tr>
                        ${headers.map(h =>
                            `<th>${escapeHTML(h)}</th>`
                        ).join("")}
                    </tr>
                </thead>
                <tbody>
                    ${rows.map(row => `
                        <tr>
                            ${headers.map(h =>
                                `<td>${escapeHTML(row[h])}</td>`
                            ).join("")}
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `;

        downloadBlob(
            new Blob([table], {
                type: "application/vnd.ms-excel;charset=utf-8"
            }),
            "printify-inventory.xls"
        );

        toast("Excel-compatible file exported.");
    }

    $("exportCsvButton").addEventListener("click", exportCSV);
    $("exportExcelButton").addEventListener("click", exportExcel);

    // ========================================
    // STOCK NOTIFICATIONS
    // ========================================

    function updateNotifications() {
        const count = products.filter(
            p => statusOf(p) !== "In Stock"
        ).length;

        const dot = document.querySelector(".notification-dot");
        if (dot) dot.style.display = count ? "" : "none";
    }

    $("notificationButton").addEventListener("click", () => {
        const low = products.filter(
            p => statusOf(p) === "Low Stock"
        ).length;

        const out = products.filter(
            p => statusOf(p) === "Out of Stock"
        ).length;

        toast(low || out
            ? `${low} low-stock and ${out} out-of-stock products.`
            : "All products have sufficient stock.");
    });

    // ========================================
    // DATE AND YEAR
    // ========================================

    const dateElement = $("currentDate")?.querySelector("span");

    if (dateElement) {
        dateElement.textContent = new Date().toLocaleDateString(
            "en-PH",
            {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric"
            }
        );
    }

    $("currentYear").textContent = new Date().getFullYear();

    // ========================================
    // SIDEBAR
    // ========================================

    const sidebar = $("sidebar");
    const sidebarOverlay = $("sidebarOverlay");

    function updateSidebar() {
        if (window.innerWidth <= 850) {
            sidebar.classList.add("is-hidden");
            sidebarOverlay.classList.remove("show");
            body.classList.remove("mobile-sidebar-open");
        } else {
            const hidden =
                localStorage.getItem("printify-sidebar-hidden") === "true";

            sidebar.classList.toggle("is-hidden", hidden);
            body.classList.toggle("sidebar-hidden", hidden);
        }
    }

    $("menuToggle").addEventListener("click", () => {
        const hidden = sidebar.classList.toggle("is-hidden");

        if (window.innerWidth <= 850) {
            sidebarOverlay.classList.toggle("show", !hidden);
            body.classList.toggle("mobile-sidebar-open", !hidden);
        } else {
            body.classList.toggle("sidebar-hidden", hidden);
            localStorage.setItem(
                "printify-sidebar-hidden",
                String(hidden)
            );
        }
    });

    sidebarOverlay.addEventListener("click", () => {
        sidebar.classList.add("is-hidden");
        sidebarOverlay.classList.remove("show");
        body.classList.remove("mobile-sidebar-open");
    });

    window.addEventListener("resize", updateSidebar);

    // ========================================
    // THEME
    // ========================================

    function applyTheme(theme) {
        const dark = theme === "dark";
        body.classList.toggle("dark-mode", dark);

        $("themeIcon").src = dark
            ? "image/lightmode_icon.png"
            : "image/nightmode_icon.png";
    }

    applyTheme(localStorage.getItem("printify-theme") || "dark");

    $("themeToggle").addEventListener("click", () => {
        const theme = body.classList.contains("dark-mode")
            ? "light"
            : "dark";

        applyTheme(theme);
        localStorage.setItem("printify-theme", theme);
    });

    // ========================================
    // PROFILE AND LOGOUT
    // ========================================

    $("profileButton").addEventListener("click", event => {
        event.stopPropagation();
        $("profileDropdown").classList.toggle("show");
    });

    document.addEventListener("click", event => {
        if (!event.target.closest(".profile-container")) {
            $("profileDropdown").classList.remove("show");
        }
    });

    $("logoutButton").addEventListener("click", () => {
        confirmAction(
            "Log Out?",
            "Are you sure you want to log out?",
            () => {
                if (window.PrintifyAPI?.logout) {
                    PrintifyAPI.logout();
                } else {
                    window.location.href = "login.html";
                }
            },
            "Log Out"
        );
    });

    // ========================================
    // INITIALIZE
    // ========================================

    loadArchives();
    loadInventory();
    updateSidebar();
    renderInventory();
});

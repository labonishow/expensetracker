let currentView = "daily";

document.addEventListener("DOMContentLoaded", () => {
    const reportsModalEl = document.getElementById("reportsModal");
    if (reportsModalEl) {
        reportsModalEl.addEventListener("show.bs.modal", loadReport);
    }

    document.querySelectorAll(".report-view-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".report-view-btn").forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            currentView = btn.dataset.view;
            loadReport();
        });
    });

    const downloadBtn = document.getElementById("download-report-btn");
    if (downloadBtn) {
        downloadBtn.addEventListener("click", downloadReport);
    }
});

async function loadReport() {
    if (window.isPremiumUser !== true) return;

    const container = document.getElementById("report-table-container");
    container.innerHTML = `<p class="empty-state">Loading...</p>`;

    const token = localStorage.getItem("token");

    try {
        const response = await axios.get("/expense/report", {
            params: { view: currentView },
            headers: { Authorization: `Bearer ${token}` }
        });

        renderReport(response.data);

    } catch (error) {
        console.error("Failed to load report:", error);
        container.innerHTML = `<p class="empty-state">Could not load report. Please try again.</p>`;
    }
}

function rupee(n) {
    return `₹${Number(n).toFixed(2)}`;
}

function renderReport(data) {
    const container = document.getElementById("report-table-container");
    const { groups, totals } = data;

    if (!groups || groups.length === 0) {
        container.innerHTML = `<p class="empty-state">No transactions recorded yet.</p>`;
        return;
    }

    if (currentView === "daily") {
        renderDailyTable(container, groups, totals);
    } else {
        renderSummaryTable(container, groups, totals, currentView === "weekly" ? "Week" : "Month");
    }
}

function renderDailyTable(container, groups, totals) {
    let rows = "";

    groups.forEach((day) => {
        day.transactions.forEach((t) => {
            rows += `
                <tr>
                    <td>${t.date}</td>
                    <td>${escapeHtml(t.description)}</td>
                    <td>${escapeHtml(t.category)}</td>
                    <td class="income-col">${t.type === "income" ? t.amount.toFixed(2) : ""}</td>
                    <td class="expense-col">${t.type === "expense" ? t.amount.toFixed(2) : ""}</td>
                </tr>`;
        });

        rows += `
            <tr class="subtotal-row">
                <td colspan="3"></td>
                <td class="income-col">${day.income.toFixed(2)}</td>
                <td class="expense-col">${day.expense.toFixed(2)}</td>
            </tr>`;
    });

    container.innerHTML = `
        <table class="report-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Income</th>
                    <th>Expense</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
                <tr class="grand-total-row">
                    <td colspan="3">Total</td>
                    <td class="income-col">${rupee(totals.income)}</td>
                    <td class="expense-col">${rupee(totals.expense)}</td>
                </tr>
            </tbody>
        </table>
        <p class="savings-line">Savings = ${rupee(totals.savings)}</p>
    `;
}

function renderSummaryTable(container, groups, totals, labelHeader) {
    const rows = groups.map((g) => `
        <tr>
            <td>${g.label}</td>
            <td class="income-col">${rupee(g.income)}</td>
            <td class="expense-col">${rupee(g.expense)}</td>
            <td class="savings-col">${rupee(g.income - g.expense)}</td>
        </tr>`).join("");

    container.innerHTML = `
        <table class="report-table">
            <thead>
                <tr>
                    <th>${labelHeader}</th>
                    <th>Income</th>
                    <th>Expense</th>
                    <th>Savings</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
                <tr class="grand-total-row">
                    <td>Total</td>
                    <td class="income-col">${rupee(totals.income)}</td>
                    <td class="expense-col">${rupee(totals.expense)}</td>
                    <td class="savings-col">${rupee(totals.savings)}</td>
                </tr>
            </tbody>
        </table>
    `;
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str ?? "";
    return div.innerHTML;
}

// ---- Download (backend-generated CSV, premium only) ----
// The export route sets Content-Disposition: attachment, so simply
// navigating to the URL is enough - the browser handles the download
// on its own, no blob/fetch handling needed on our end.

function downloadReport() {
    if (window.isPremiumUser !== true) return;

    const token = localStorage.getItem("token");
    const url = `/expense/report/export?view=${currentView}&token=${encodeURIComponent(token)}`;

    window.location.href = url;
}
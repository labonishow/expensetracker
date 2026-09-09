let currentView = "daily";

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("reportsModal")?.addEventListener("show.bs.modal", loadReport);

    document.querySelectorAll(".report-view-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
            document.querySelectorAll(".report-view-btn").forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            currentView = btn.dataset.view;
            await loadReport();
        });
    });

    document.getElementById("download-report-btn")?.addEventListener("click", downloadReport);
});

async function loadReport() {
    if (!window.isPremiumUser) return;

    const container = document.getElementById("report-table-container");
    container.innerHTML = `<p class="empty-state">Loading...</p>`;

    try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("/expense/report", {
            params: { view: currentView },
            headers: { Authorization: `Bearer ${token}` }
        });

        renderReport(data.groups, data.totals);

    } catch (error) {
        console.error("Failed to load report:", error);
        container.innerHTML = `<p class="empty-state">Could not load report.</p>`;
    }
}

function rupee(n) {
    return `₹${Number(n).toFixed(2)}`;
}

function renderReport(groups, totals) {
    const container = document.getElementById("report-table-container");

    if (!groups.length) {
        container.innerHTML = `<p class="empty-state">No transactions recorded yet.</p>`;
        return;
    }

    const rows = groups
        .map(
            (g) => `
        <tr>
            <td>${g.label}</td>
            <td class="income-col">${rupee(g.income)}</td>
            <td class="expense-col">${rupee(g.expense)}</td>
            <td class="savings-col">${rupee(g.income - g.expense)}</td>
        </tr>`
        )
        .join("");

    container.innerHTML = `
        <table class="table table-sm report-table">
            <thead>
                <tr>
                    <th>Period</th>
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

// Backend hands us a downloadable URL - opening it is enough, the
// Content-Disposition header makes the browser download it automatically.
function downloadReport() {
    if (!window.isPremiumUser) return;

    const token = localStorage.getItem("token");
    window.location.href = `/expense/report/export?view=${currentView}&token=${encodeURIComponent(token)}`;
}
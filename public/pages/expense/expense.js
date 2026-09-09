const expense_URL = "/expense";
const ai_URL = "/ai/suggest-category";


axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "signup.html";
        }
        return Promise.reject(error);
    }
);

function setupCategorySuggestions() {
    const descriptionInput = document.getElementById("description");
    const suggestion = document.getElementById("category-suggestion");

    if (!descriptionInput || !suggestion) return;

    descriptionInput.addEventListener("keydown", async (e) => {
        if (e.key !== "Enter") return;

        e.preventDefault();

        const description = descriptionInput.value.trim();
        if (!description) return;

        const category = await fetchCategorySuggestion(description);

        if (category) {
            suggestion.textContent = `Suggested category: ${category}`;
            suggestion.hidden = false;
        }
    });
}

async function fetchCategorySuggestion(description) {
    try {
        const response = await axios.get(ai_URL, {
            params: { description }
        });

        return response.data.category;

    } catch (error) {
        console.log(error.message);
        return null;
    }
}



let currentPage = 0;
let totalPages = 1;


async function handleExpenseForm(event) {
    event.preventDefault();

    const amount = document.getElementById("amount").value;
    const description = document.getElementById("description").value;
    const category = document.getElementById("category").value;

    const expenseData = {
        amount,
        description,
        category
    };

    const token = localStorage.getItem("token");

    try {
        await axios.post(expense_URL, expenseData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        event.target.reset();
        document.getElementById("category-suggestion").hidden = true;

        alert("Expense added successfully!");

        await fetchExpenses(0);

    } catch (error) {
        console.log(error.message);
    }
}



function createExpenseCard(expense) {
    const expenseCard = document.createElement("div");

    expenseCard.className = "expense-card";

    expenseCard.innerHTML = `
        <div class="expense-info">

            <p class="expense-amount">
                ₹${expense.amount}
            </p>

            <p class="expense-description">
                ${expense.description}
            </p>

            <p class="expense-category">
                Category: ${expense.category}
            </p>

        </div>

        <button class="delete-expense-btn">
            Delete
        </button>
    `;

    expenseCard
        .querySelector(".delete-expense-btn")
        .addEventListener("click", () => {
            deleteExpense(expense.id);
        });

    return expenseCard;
}


// Replaces the visible list with exactly the current page's expenses.
function renderExpenses(expenses) {
    const expensesList = document.getElementById("expenses-list");
    const emptyState = document.getElementById("empty-state");

    expensesList.querySelectorAll(".expense-card").forEach((card) => card.remove());

    if (expenses.length === 0) {
        emptyState.hidden = false;
        return;
    }
    emptyState.hidden = true;

    expenses.map(createExpenseCard).forEach((card) => expensesList.appendChild(card));
}


async function deleteExpense(id) {

    const token = localStorage.getItem("token");

    try {

        await axios.delete(`${expense_URL}/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        await fetchExpenses(currentPage);

    } catch (error) {
        console.log(error.message);
    }
}


async function fetchExpenses(page = 0) {

    const token = localStorage.getItem("token");

    try {

        const response = await axios.get(expense_URL, {
            params: { page },
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        currentPage = response.data.currentPage;
        totalPages = response.data.totalPages;

        renderExpenses(response.data.expenses);
        renderPagination(); // defined in pagination.js

    } catch (error) {
        console.log(error.message);
    }
}



document.addEventListener("DOMContentLoaded", () => {

    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "signup.html";
        return;
    }

    fetchExpenses(0);
    setupCategorySuggestions();
});
const expense_URL = "/expense";
const ai_URL = "/ai/suggest-category";


// CATEGORY SUGGESTION
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


// GET AI CATEGORY SUGGESTION
async function fetchCategorySuggestion(description) {

    try {

        const response = await axios.get(ai_URL, {
            params: {
                description: description
            }
        });

        return response.data.category;

    } catch (error) {

        console.log(error.message);

        return null;
    }
}


// CREATE EXPENSE
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

        const response = await axios.post(
            expense_URL,
            expenseData,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        showExpense(response.data.expense);

        event.target.reset();

        document.getElementById(
            "category-suggestion"
        ).hidden = true;

        alert("Expense added successfully!");

    } catch (error) {

        console.log(error.message);

    }
}


// SHOW EXPENSE
function showExpense(expense) {

    const expensesList =
        document.getElementById("expenses-list");

    const emptyState =
        document.getElementById("empty-state");

    if (emptyState) {
        emptyState.remove();
    }

    const expenseCard =
        document.createElement("div");

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
        .addEventListener("click", async () => {

            await deleteExpense(
                expense.id,
                expenseCard
            );

        });

    expensesList.appendChild(expenseCard);
}


// DELETE EXPENSE
async function deleteExpense(id, expenseCard) {

    const token = localStorage.getItem("token");

    try {

        await axios.delete(
            `${expense_URL}/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        expenseCard.remove();

    } catch (error) {

        console.log(error.message);

    }
}


// LOAD EXPENSES
async function loadExpenses() {

    const token = localStorage.getItem("token");

    try {

        const response = await axios.get(
            expense_URL,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        response.data.expenses.forEach(showExpense);

    } catch (error) {

        console.log(error.message);

    }
}


// PAGE LOAD
document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const token = localStorage.getItem("token");

        if (!token) {

            window.location.href = "signup.html";

            return;
        }

        await loadExpenses();

        setupCategorySuggestions();
    }
);
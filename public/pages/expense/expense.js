const expense_URL = "/expense";
const ai_URL = "/ai/suggest-category";



let categoryTouchedByUser = false;
let suggestTimer = null;
 
function setupCategorySuggestions() {
    const descriptionInput = document.getElementById("description");
    const categorySelect = document.getElementById("category");
 
    if (!descriptionInput || !categorySelect) return;
 
    categorySelect.addEventListener("input", () => {
        categoryTouchedByUser = true;
    });
 
    descriptionInput.addEventListener("input", () => {
        clearTimeout(suggestTimer);
 
        const description = descriptionInput.value.trim();
        if (description.length < 3) return;
 
        suggestTimer = setTimeout(async () => {
            const category = await fetchCategorySuggestion(description);
 
            if (category && !categoryTouchedByUser) {
                categorySelect.value = category;
            }
        }, 600);
    });
}

async function fetchCategorySuggestion(description) {
    const token = localStorage.getItem("token");
 
    try {
        const response = await axios.post(
            ai_URL,
            { description },
            { headers: { Authorization: `Bearer ${token}` } }
        );
 
        return response.data.category;
 
    } catch (error) {
        console.log(error.message);
        return null;
    }
}
 


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
        const response = await axios.post(expense_URL, expenseData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        showExpense(response.data.expense);

        event.target.reset();
        categoryTouchedByUser = false;
        const hint = document.getElementById("category-hint");
        if (hint) hint.hidden = true;

        alert("Expense added successfully!");

    } catch (error) {
        console.log(error.message);
    }
}


function showExpense(expense) {

    const expensesList = document.getElementById("expenses-list");

    const emptyState = document.getElementById("empty-state");

    if (emptyState) {
        emptyState.remove();
    }

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
            deleteExpense(expense.id, expenseCard);
        });

    expensesList.appendChild(expenseCard);
}



async function deleteExpense(id, expenseCard) {

    const token = localStorage.getItem("token");

    try {

        await axios.delete(`${expense_URL}/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        expenseCard.remove();

    } catch (error) {
        console.log(error.message);
    }
}



async function loadExpenses() {

    const token = localStorage.getItem("token");

    try {

        const response = await axios.get(expense_URL, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        response.data.expenses.forEach(showExpense);

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

    loadExpenses();
    setupCategorySuggestions();
});
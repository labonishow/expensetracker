function renderPagination() {
    const pagination = document.getElementById("pagination");
    if (!pagination) return;

    pagination.innerHTML = "";

    

    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.textContent = "Prev";
    prevBtn.disabled = currentPage === 0;
    prevBtn.addEventListener("click", () => fetchExpenses(currentPage - 1));
    pagination.appendChild(prevBtn);

    for (let i = 0; i < totalPages; i++) {
        const pageBtn = document.createElement("button");
        pageBtn.type = "button";
        pageBtn.textContent = i + 1;
        pageBtn.className = i === currentPage ? "page-btn active" : "page-btn";
        pageBtn.addEventListener("click", () => fetchExpenses(i));
        pagination.appendChild(pageBtn);
    }

    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.textContent = "Next";
    nextBtn.disabled = currentPage >= totalPages - 1;
    nextBtn.addEventListener("click", () => fetchExpenses(currentPage + 1));
    pagination.appendChild(nextBtn);

    const info = document.createElement("span");
    info.textContent = `Page ${currentPage + 1} of ${totalPages}`;
    pagination.appendChild(info);
}
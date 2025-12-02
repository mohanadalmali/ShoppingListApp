const shoppingList = document.querySelector(".shopping-list");
const shoppingForm = document.querySelector(".shopping-form");
const filterButtons = document.querySelectorAll(".filter-buttons button");

document.addEventListener("DOMContentLoaded", initApp);

function initApp() {
    loadItems();
    if (shoppingForm) shoppingForm.addEventListener("submit", handleFormSubmit);
    for (let button of filterButtons) {
        button.addEventListener("click", handleFilterSelection);
    }
    const clearBtn = document.getElementById("clear-all");
    if (clearBtn) clearBtn.addEventListener("click", () => {
        if (confirm("Tüm liste silinsin mi?")) {
            clearAllItems();
        }
    });
}

function saveTolS() {
    const listItems = shoppingList.querySelectorAll("li");
    const liste = [];
    for (let li of listItems) {
        const id = li.getAttribute("item-id") || "";
        const nameEl = li.querySelector(".item-name");
        const name = nameEl ? nameEl.textContent.trim() : "";
        const completed = li.hasAttribute("item-completed");
        liste.push({ id, name, completed });
    }
    localStorage.setItem("shoppingItems", JSON.stringify(liste));
}

function loadItems() {
    const items = JSON.parse(localStorage.getItem("shoppingItems") || "[]");
    shoppingList.innerHTML = "";
    for (let item of items) {
        const li = createListItem(item);
        shoppingList.appendChild(li);
    }
    try { updateFilterItem(); } catch (e) { }
}

function addItem(input) {
    const value = input.value.trim();
    if (!value) return;
    const newItem = createListItem({
        id: generateId(),
        name: value,
        completed: false
    });
    shoppingList.appendChild(newItem);
    input.value = "";
    saveTolS();
    try { updateFilterItem(); } catch (e) { }
}

function generateId() {
    return Date.now().toString();
}

function handleFormSubmit(e) {
    e.preventDefault();
    const input = document.getElementById("item");
    if (!input) return;
    if (input.value.trim().length === 0) {
        alert("Yeni değer giriniz");
        return;
    }
    addItem(input);
}

function toggleCompleted(e) {
    const li = e.target.closest("li");
    if (!li) return;
    if (e.target.checked) {
        li.setAttribute("item-completed", "");
    } else {
        li.removeAttribute("item-completed");
    }
    saveTolS();
    try { updateFilterItem(); } catch (err) { }
}

function createListItem(item) {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.classList.add("form-check-input");
    input.checked = !!item.completed;
    input.addEventListener("change", toggleCompleted);

    const div = document.createElement("div");
    div.textContent = item.name || "";
    div.classList.add("item-name");
    div.tabIndex = 0;
    div.addEventListener("click", openEditMod);
    div.addEventListener("blur", saveEdit);
    div.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            div.blur();
        }
    });

    const leftSide = document.createElement("div");
    leftSide.className = "d-flex align-items-center gap-2";
    leftSide.appendChild(input);
    leftSide.appendChild(div);

    const deleteIcon = document.createElement("i");
    deleteIcon.className = "fs-3 bi bi-x text-danger delete-icon";
    deleteIcon.addEventListener("click", removItem);

    const li = document.createElement("li");
    li.setAttribute("item-id", item.id || generateId());
    li.className = "border rounded p-3 mb-1 d-flex align-items-center justify-content-between";
    if (item.completed) li.setAttribute("item-completed", "");

    li.appendChild(leftSide);
    li.appendChild(deleteIcon);

    return li;
}

function removItem(e) {
    const li = e.target.closest("li");
    if (!li) return;
    shoppingList.removeChild(li);
    saveTolS();
    try { updateFilterItem(); } catch (err) { }
}

function openEditMod(e) {
    const div = e.currentTarget || e.target;
    const li = div.closest("li");
    if (!li) return;
    if (li.hasAttribute("item-completed")) return;
    div.dataset.oldValue = div.textContent;
    div.contentEditable = "true";
    div.focus();
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(div);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
}

function saveEdit(e) {
    const div = e.target;
    const newValue = div.textContent.trim();
    const oldValue = div.dataset.oldValue || "";
    if (newValue === "") {
        alert("Boş değer olamaz!");
        div.textContent = oldValue;
    }
    div.contentEditable = "false";
    saveTolS();
}

function handleFilterSelection(e) {
    const filterBtn = e.currentTarget;
    for (let button of filterButtons) {
        button.classList.remove("btn-primary");
        button.classList.add("btn-secondary");
    }
    filterBtn.classList.remove("btn-secondary");
    filterBtn.classList.add("btn-primary");
    filterItem(filterBtn.getAttribute("item-filter"));
}

function filterItem(filterType) {
    const li_items = shoppingList.querySelectorAll("li");
    for (let item of li_items) {
        item.classList.remove("d-none");
        const completed = item.hasAttribute("item-completed");
        if (filterType === "completed") {
            if (!completed) item.classList.add("d-none");
        } else if (filterType === "uncompleted") {
            if (completed) item.classList.add("d-none");
        } else {
            item.classList.remove("d-none");
        }
    }
}

function updateFilterItem() {
    const activefilter = document.querySelector(".btn-primary[item-filter]") || document.querySelector(".filter-buttons button[item-filter]");
    if (!activefilter) return;
    filterItem(activefilter.getAttribute("item-filter"));
}

function clearAllItems() {
    shoppingList.innerHTML = "";
    localStorage.removeItem("shoppingItems");
    try { updateFilterItem(); } catch (e) { }
}

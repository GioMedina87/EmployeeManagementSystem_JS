// --- Data store + localStorage handling ------------------------

const STORAGE_KEY = "emsEmployees";

let employees = [];

// Load any saved employees when the page opens
function loadEmployees() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    employees = stored ? JSON.parse(stored) : [];
  } catch (e) {
    employees = [];
  }
}

// Save current employees to localStorage
function saveEmployees() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
}

// --- DOM references --------------------------------------------

const nameInput = document.getElementById("name-input");
const incomeInput = document.getElementById("income-input");
const idInput = document.getElementById("id-input");
const addBtn = document.getElementById("add-btn");
const tableBody = document.getElementById("employee-table-body");
const toast = document.getElementById("toast");

// --- Toast helper ----------------------------------------------

let toastTimeout;

function showToast(message) {
  toast.textContent = message;

  toast.classList.remove("hidden");
  toast.classList.add("visible");

  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }

  toastTimeout = setTimeout(() => {
    toast.classList.remove("visible");
    toast.classList.add("hidden");
  }, 2200);
}

// --- Rendering the table ---------------------------------------

function renderEmployees() {
  tableBody.innerHTML = "";

  employees.forEach((emp, index) => {
    const tr = document.createElement("tr");
    tr.classList.add("employee-row");

    const indexTd = document.createElement("td");
    indexTd.textContent = index + 1;

    const nameTd = document.createElement("td");
    nameTd.textContent = emp.name;

    const incomeTd = document.createElement("td");
    incomeTd.textContent = emp.income.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });

    const idTd = document.createElement("td");
    idTd.textContent = emp.id;

    const actionsTd = document.createElement("td");
    const delBtn = document.createElement("button");
    delBtn.textContent = "Remove";
    delBtn.className = "delete-btn";
    delBtn.addEventListener("click", () => {
      deleteEmployee(index);
    });
    actionsTd.appendChild(delBtn);

    tr.appendChild(indexTd);
    tr.appendChild(nameTd);
    tr.appendChild(incomeTd);
    tr.appendChild(idTd);
    tr.appendChild(actionsTd);

    tableBody.appendChild(tr);
  });
}

// --- Add + delete logic ----------------------------------------

function addEmployee() {
  const name = nameInput.value.trim();
  const incomeValue = incomeInput.value.trim();
  const id = idInput.value.trim();

  if (!name || !incomeValue || !id) {
    showToast("Please fill out all fields before adding.");
    return;
  }

  const income = Number(incomeValue);
  if (Number.isNaN(income) || income <= 0) {
    showToast("Income should be a positive number.");
    return;
  }

  employees.push({ name, income, id });
  saveEmployees();
  renderEmployees();

  nameInput.value = "";
  incomeInput.value = "";
  idInput.value = "";
  nameInput.focus();

  showToast("Employee added to the list.");
}

function deleteEmployee(index) {
  const removed = employees.splice(index, 1);
  saveEmployees();
  renderEmployees();

  if (removed[0]) {
    showToast(`Removed ${removed[0].name} from the list.`);
  } else {
    showToast("Employee removed.");
  }
}

// --- Event wiring ----------------------------------------------

addBtn.addEventListener("click", addEmployee);

// Allow Enter key to add when typing in any input
[nameInput, incomeInput, idInput].forEach((input) => {
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      addEmployee();
    }
  });
});

// --- Init ------------------------------------------------------

loadEmployees();
renderEmployees();



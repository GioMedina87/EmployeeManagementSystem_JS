// === DOM references ===
const nameInput = document.getElementById("employeeName");
const incomeInput = document.getElementById("income");
const idInput = document.getElementById("employeeId");
const addBtn = document.getElementById("addEmployeeBtn");

const tableBody = document.getElementById("employeeTableBody");
const cardsContainer = document.getElementById("employeeCards");
const employeeTable = document.getElementById("employeeTable");

const searchInput = document.getElementById("searchInput");
const summaryBar = document.getElementById("summaryBar");

const tableViewBtn = document.getElementById("tableViewBtn");
const cardViewBtn = document.getElementById("cardViewBtn");

const exportBtn = document.getElementById("exportBtn");

const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

const confirmModal = document.getElementById("confirmModal");
const confirmMessage = document.getElementById("confirmMessage");
const cancelDeleteBtn = document.getElementById("cancelDelete");
const confirmDeleteBtn = document.getElementById("confirmDelete");

const toastContainer = document.getElementById("toastContainer");

// === State ===
let employees = [];
let searchTerm = "";
let viewMode = "table"; // "table" or "cards"
let pendingDeleteId = null;

// === Local storage helpers ===
const STORAGE_KEY = "gio_employee_list";

function loadEmployees() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      employees = JSON.parse(data);
    }
  } catch (err) {
    console.error("Error loading employees:", err);
  }
}

function saveEmployees() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
}

// === Toast ===
function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 200);
  }, 2200);
}

// === Theme ===
const THEME_KEY = "gio_theme";

function applyTheme(theme) {
  if (theme === "light") {
    document.body.classList.add("light-mode");
    themeIcon.textContent = "🌙";
  } else {
    document.body.classList.remove("light-mode");
    themeIcon.textContent = "☀️";
  }
}

function loadTheme() {
  const stored = localStorage.getItem(THEME_KEY) || "dark";
  applyTheme(stored);
}

function toggleTheme() {
  const isLight = document.body.classList.toggle("light-mode");
  const theme = isLight ? "light" : "dark";
  localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
}

// === Summary bar ===
function updateSummary(filteredEmployees) {
  const data = filteredEmployees ?? employees;

  const total = data.length;
  const totalIncome = data.reduce((sum, emp) => sum + (Number(emp.income) || 0), 0);
  const avgIncome = total ? (totalIncome / total).toFixed(2) : "0.00";
  const highest = data.reduce(
    (best, emp) =>
      Number(emp.income) > Number(best.income || 0) ? emp : best,
    {}
  );

  summaryBar.innerHTML = `
    <div class="summary-card">
      <div class="summary-label">Total Employees</div>
      <div class="summary-value">${total}</div>
    </div>
    <div class="summary-card">
      <div class="summary-label">Average Income</div>
      <div class="summary-value">$${avgIncome}</div>
    </div>
    <div class="summary-card">
      <div class="summary-label">Total Income</div>
      <div class="summary-value">$${totalIncome.toLocaleString()}</div>
    </div>
    <div class="summary-card">
      <div class="summary-label">Highest Income</div>
      <div class="summary-value">
        ${highest.name ? `${highest.name} ($${Number(highest.income).toLocaleString()})` : "—"}
      </div>
    </div>
  `;
}

// === Rendering ===
function getFilteredEmployees() {
  if (!searchTerm.trim()) return employees;

  const term = searchTerm.toLowerCase();
  return employees.filter((emp) => {
    return (
      emp.name.toLowerCase().includes(term) ||
      String(emp.income).toLowerCase().includes(term) ||
      String(emp.employeeId).toLowerCase().includes(term)
    );
  });
}

function renderTable(filtered) {
  employeeTable.classList.remove("hidden");
  cardsContainer.classList.add("hidden");

  tableBody.innerHTML = "";

  filtered.forEach((emp, index) => {
    const tr = document.createElement("tr");
    tr.className = "employee-row";
    tr.dataset.id = emp.id;

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${emp.name}</td>
      <td>$${Number(emp.income).toLocaleString()}</td>
      <td>${emp.employeeId}</td>
      <td>
        <button class="action-btn action-edit" data-id="${emp.id}">Edit</button>
        <button class="action-btn action-delete" data-id="${emp.id}">Delete</button>
      </td>
    `;

    tableBody.appendChild(tr);
  });
}

function renderCards(filtered) {
  cardsContainer.classList.remove("hidden");
  employeeTable.classList.add("hidden");

  cardsContainer.innerHTML = "";

  filtered.forEach((emp) => {
    const card = document.createElement("div");
    card.className = "employee-card";
    card.dataset.id = emp.id;

    card.innerHTML = `
      <div class="employee-card-header">
        <div class="employee-card-name">${emp.name}</div>
        <div class="employee-card-id">ID: ${emp.employeeId}</div>
      </div>
      <div class="employee-card-body">
        <span>Income: $${Number(emp.income).toLocaleString()}</span>
      </div>
      <div class="employee-card-actions">
        <button class="action-btn action-edit" data-id="${emp.id}">Edit</button>
        <button class="action-btn action-delete" data-id="${emp.id}">Delete</button>
      </div>
    `;

    cardsContainer.appendChild(card);
  });
}

function renderEmployees() {
  const filtered = getFilteredEmployees();

  if (viewMode === "table") {
    renderTable(filtered);
  } else {
    renderCards(filtered);
  }

  updateSummary(filtered);
}

// === Add employee ===
function addEmployee() {
  const name = nameInput.value.trim();
  const income = incomeInput.value.trim();
  const employeeId = idInput.value.trim();

  if (!name || !income || !employeeId) {
    showToast("Please fill in all fields.");
    return;
  }

  const numericIncome = Number(income);
  if (Number.isNaN(numericIncome) || numericIncome < 0) {
    showToast("Income must be a positive number.");
    return;
  }

  const newEmployee = {
    id: Date.now().toString(),
    name,
    income: numericIncome,
    employeeId,
  };

  employees.push(newEmployee);
  saveEmployees();

  nameInput.value = "";
  incomeInput.value = "";
  idInput.value = "";
  nameInput.focus();

  renderEmployees();

  // Add "new" animation to last row/card
  const lastId = newEmployee.id;

  if (viewMode === "table") {
    const row = tableBody.querySelector(`tr[data-id="${lastId}"]`);
    if (row) {
      row.classList.add("new");
      setTimeout(() => row.classList.remove("new"), 450);
    }
  } else {
    const card = cardsContainer.querySelector(`.employee-card[data-id="${lastId}"]`);
    if (card) {
      card.classList.add("new");
      setTimeout(() => card.classList.remove("new"), 450);
    }
  }

  showToast("Employee added.");
}

// === Edit employee ===
function editEmployee(id) {
  const emp = employees.find((e) => e.id === id);
  if (!emp) return;

  const newName =
    prompt("Update employee name:", emp.name) ?? emp.name;
  const newIncomeStr =
    prompt("Update income:", emp.income) ?? String(emp.income);
  const newIncome = Number(newIncomeStr);
  if (Number.isNaN(newIncome) || newIncome < 0) {
    showToast("Income unchanged (invalid value).");
  } else {
    emp.income = newIncome;
  }

  const newEmpId =
    prompt("Update Employee ID:", emp.employeeId) ?? emp.employeeId;

  emp.name = newName.trim() || emp.name;
  emp.employeeId = newEmpId.trim() || emp.employeeId;

  saveEmployees();
  renderEmployees();
  showToast("Employee updated.");
}

// === Delete flow with modal ===
function requestDeleteEmployee(id) {
  pendingDeleteId = id;
  const emp = employees.find((e) => e.id === id);
  confirmMessage.textContent = emp
    ? `Are you sure you want to delete "${emp.name}"?`
    : "Are you sure you want to delete this employee?";

  confirmModal.classList.remove("hidden");
}

function cancelDelete() {
  pendingDeleteId = null;
  confirmModal.classList.add("hidden");
}

function confirmDelete() {
  if (!pendingDeleteId) return;

  employees = employees.filter((e) => e.id !== pendingDeleteId);
  saveEmployees();
  renderEmployees();
  showToast("Employee deleted.");

  pendingDeleteId = null;
  confirmModal.classList.add("hidden");
}

// === Export CSV ===
function exportCSV() {
  if (!employees.length) {
    showToast("No employees to export.");
    return;
  }

  const header = ["Name", "Income", "Employee ID"];
  const rows = employees.map((e) => [
    `"${e.name.replace(/"/g, '""')}"`,
    e.income,
    `"${String(e.employeeId).replace(/"/g, '""')}"`,
  ]);

  const csvContent =
    [header.join(","), ...rows.map((r) => r.join(","))].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "employees.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast("CSV downloaded.");
}

// === Event listeners ===

// Add employee (button + Enter key)
addBtn.addEventListener("click", addEmployee);

[idInput, incomeInput, nameInput].forEach((input) => {
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      addEmployee();
    }
  });
});

// Search
searchInput.addEventListener("input", (e) => {
  searchTerm = e.target.value;
  renderEmployees();
});

// View toggle
tableViewBtn.addEventListener("click", () => {
  viewMode = "table";
  tableViewBtn.classList.add("active");
  cardViewBtn.classList.remove("active");
  renderEmployees();
});

cardViewBtn.addEventListener("click", () => {
  viewMode = "cards";
  cardViewBtn.classList.add("active");
  tableViewBtn.classList.remove("active");
  renderEmployees();
});

// Export
exportBtn.addEventListener("click", exportCSV);

// Theme
themeToggle.addEventListener("click", toggleTheme);

// Table & cards actions (event delegation)
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("action-edit")) {
    const id = e.target.dataset.id;
    editEmployee(id);
  }

  if (e.target.classList.contains("action-delete")) {
    const id = e.target.dataset.id;
    requestDeleteEmployee(id);
  }
});

// Modal buttons
cancelDeleteBtn.addEventListener("click", cancelDelete);
confirmDeleteBtn.addEventListener("click", confirmDelete);

confirmModal.addEventListener("click", (e) => {
  if (e.target === confirmModal) {
    cancelDelete();
  }
});

// === Init ===
loadEmployees();
loadTheme();
renderEmployees();



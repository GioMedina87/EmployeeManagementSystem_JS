// Simple data store (kept in memory + localStorage)
let employees = [];

// DOM elements
const nameInput = document.getElementById("nameInput");
const incomeInput = document.getElementById("incomeInput");
const idInput = document.getElementById("idInput");
const addBtn = document.getElementById("addBtn");
const errorMsg = document.getElementById("errorMsg");
const employeeTableContainer = document.getElementById("employeeTableContainer");
const employeeCount = document.getElementById("employeeCount");

// Local storage key
const STORAGE_KEY = "ems_employees_gio";

/* ---------- Load & Save ---------- */

function loadEmployees() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    employees = raw ? JSON.parse(raw) : [];
  } catch (e) {
    employees = [];
  }
}

function saveEmployees() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
}

/* ---------- Rendering ---------- */

function renderEmployees() {
  employeeCount.textContent = employees.length.toString();

  if (employees.length === 0) {
    employeeTableContainer.innerHTML =
      '<div class="empty-state">No employees yet. Add one using the form above.</div>';
    return;
  }

  let html = `
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Income</th>
          <th>ID</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
  `;

  employees.forEach((emp, index) => {
    html += `
      <tr>
        <td>${index + 1}</td>
        <td>${emp.name}</td>
        <td>$${emp.income.toLocaleString()}</td>
        <td>${emp.id}</td>
        <td>
          <button class="btn btn-danger" onclick="removeEmployee(${index})">
            Remove
          </button>
        </td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  employeeTableContainer.innerHTML = html;
}

/* ---------- Actions ---------- */

function clearError() {
  errorMsg.textContent = "";
}

function showError(message) {
  errorMsg.textContent = message;
}

function clearForm() {
  nameInput.value = "";
  incomeInput.value = "";
  idInput.value = "";
  nameInput.focus();
}

function addEmployee() {
  clearError();

  const name = nameInput.value.trim();
  const incomeRaw = incomeInput.value.trim();
  const id = idInput.value.trim();

  if (!name || !incomeRaw || !id) {
    showError("Please fill in Name, Income, and Employee ID.");
    return;
  }

  const income = Number(incomeRaw);
  if (Number.isNaN(income) || income < 0) {
    showError("Income must be a valid positive number.");
    return;
  }

  employees.push({ name, income, id });
  saveEmployees();
  renderEmployees();
  clearForm();
}

function removeEmployee(index) {
  if (index < 0 || index >= employees.length) return;
  employees.splice(index, 1);
  saveEmployees();
  renderEmployees();
}

// Make removeEmployee available for inline onclick
window.removeEmployee = removeEmployee;

/* ---------- Event wiring ---------- */

addBtn.addEventListener("click", addEmployee);

[nameInput, incomeInput, idInput].forEach((input) => {
  input.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      addEmployee();
    }
  });
});

/* ---------- Init ---------- */

loadEmployees();
renderEmployees();
nameInput.focus();

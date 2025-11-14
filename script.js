let employees = [];

// Add employee
function addEmployee() {
    const name = document.getElementById("name").value.trim();
    const income = document.getElementById("income").value.trim();
    const id = document.getElementById("id").value.trim();

    if (!name || !income || !id) {
        alert("Please fill out all fields.");
        return;
    }

    const employee = {
        name,
        income: Number(income),
        id
    };

    employees.push(employee);
    displayEmployees();
    clearInputs();
}

// Display employees
function displayEmployees() {
    const listElement = document.getElementById("employeeList");
    listElement.innerHTML = "";

    employees.forEach((emp, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            ${index + 1}. ${emp.name} — $${emp.income} — ID: ${emp.id}
            <button class="remove-btn" onclick="removeEmployee(${index})">Remove</button>
        `;
        listElement.appendChild(li);
    });
}

// Remove employee
function removeEmployee(index) {
    employees.splice(index, 1);
    displayEmployees();
}

// Clear input fields
function clearInputs() {
    document.getElementById("name").value = "";
    document.getElementById("income").value = "";
    document.getElementById("id").value = "";
}


async function loadEmployees() {
    const res = await fetch("/api/employees");
    const employees = await res.json();

    const select = document.getElementById("employeeSelect");
    employees.forEach(emp => {
        const opt = document.createElement("option");
        opt.value = emp.email;
        opt.textContent = emp.name + " (" + emp.email + ")";
        select.appendChild(opt);
    });
}

document.getElementById("sendBtn").addEventListener("click", async () => {
    const email = document.getElementById("employeeSelect").value;
    const subject = document.getElementById("subject").value;
    const message = document.getElementById("message").value;

    const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, subject, message })
    });

    const data = await res.json();
    document.getElementById("result").innerText = data.message;
});

loadEmployees();

let token = localStorage.getItem("token") || "";
let chart;

// PAGE LOAD
window.onload = () => {
  if (token) {
    getRecords();
  }
};

// ================= LOGIN =================
async function login() {
  try {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("Enter email & password ❌");
      return;
    }

    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.msg || "Login failed ❌");
      return;
    }

    token = data.token;
    localStorage.setItem("token", token);

    alert("Login success ✅");
    getRecords();

  } catch (err) {
    console.log(err);
    alert("Login error ❌");
  }
}

// ================= REGISTER =================
async function register() {
  try {
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.msg || "Register failed ❌");
      return;
    }

    alert("Registered successfully ✅");

  } catch (err) {
    console.log(err);
    alert("Register error ❌");
  }
}

// ================= ADD RECORD =================
async function addRecord() {
  try {
    if (!token) {
      alert("Please login first ❌");
      return;
    }

    const amount = document.getElementById("amount").value.trim();
    const category = document.getElementById("category").value.trim();
    const note = document.getElementById("note").value.trim();

    if (!amount || !category) {
      alert("Fill all required fields ❌");
      return;
    }

    const res = await fetch("http://localhost:5000/api/records", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ amount, category, note })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.msg || "Add failed ❌");
      return;
    }

    alert("Added ✅");

    document.getElementById("amount").value = "";
    document.getElementById("category").value = "";
    document.getElementById("note").value = "";

    getRecords();
    getSummary();

  } catch (err) {
    console.log(err);
    alert("Error ❌");
  }
}

// ================= GET RECORDS =================
async function getRecords() {
  try {
    if (!token) return;

    const res = await fetch("http://localhost:5000/api/records", {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    const data = await res.json();

    renderRecords(data);
    renderChart(data);

  } catch (err) {
    console.log(err);
    alert("Error loading records ❌");
  }
}

// ================= FILTER APPLY 🔥 =================
async function applyFilter() {
  try {
    const category = document.getElementById("filterCategory").value;
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    let url = "http://localhost:5000/api/records?";

    if (category) url += `category=${category}&`;
    if (startDate && endDate) url += `startDate=${startDate}&endDate=${endDate}`;

    const res = await fetch(url, {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    const data = await res.json();

    renderRecords(data);
    renderChart(data);

  } catch (err) {
    console.log(err);
  }
}

// ================= RENDER RECORDS =================
function renderRecords(data) {
  const list = document.getElementById("list");
  const totalEl = document.getElementById("total");

  list.innerHTML = "";

  let total = 0;

  data.forEach((item) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <span>${item.amount} - ${item.category} - ${item.note}</span>
      <div class="actions">
        <button onclick="editRecord('${item._id}', '${item.amount}', '${item.category}', '${item.note}')">✏️</button>
        <button onclick="deleteRecord('${item._id}')">❌</button>
      </div>
    `;

    list.appendChild(li);
    total += Number(item.amount);
  });

  totalEl.innerText = "Total: ₹" + total;
}

// ================= DELETE =================
async function deleteRecord(id) {
  try {
    if (!confirm("Delete this record?")) return;

    await fetch(`http://localhost:5000/api/records/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    alert("Deleted ✅");
    getRecords();

  } catch (err) {
    console.log(err);
  }
}
async function getSummary() {
  const res = await fetch("http://localhost:5000/api/records/summary", {
    headers: {
      Authorization: "Bearer " + token
    }
  });

  const data = await res.json();

  document.getElementById("income").innerText = "Income: ₹" + data.income;
  document.getElementById("expense").innerText = "Expense: ₹" + data.expense;
  document.getElementById("balance").innerText = "Balance: ₹" + data.balance;

  renderChart(data.categoryWise);
}
// ================= EDIT =================
async function editRecord(id, amount, category, note) {
  try {
    const newAmount = prompt("Enter new amount", amount);
    const newCategory = prompt("Enter new category", category);
    const newNote = prompt("Enter new note", note);

    const res = await fetch(`http://localhost:5000/api/records/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({
        amount: newAmount,
        category: newCategory,
        note: newNote
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.msg || "Update failed ❌");
      return;
    }

    alert("Updated ✅");
    getRecords();

  } catch (err) {
    console.log(err);
  }
}

// ================= LOGOUT =================
function logout() {
  localStorage.removeItem("token");
  token = "";
  location.reload();
}

// ================= CHART =================
function renderChart(data) {
  const map = {};

  data.forEach(item => {
    if (!map[item.category]) {
      map[item.category] = 0;
    }
    map[item.category] += Number(item.amount);
  });

  const labels = Object.keys(map);
  const values = Object.values(map);

  const ctx = document.getElementById("chart");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [{
        data: values
      }]
    }
  });
}
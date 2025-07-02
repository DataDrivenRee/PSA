// login.js
document.addEventListener("DOMContentLoaded", () => {
  const form      = document.getElementById("loginForm");
  const emailIn   = document.getElementById("email");
  const passIn    = document.getElementById("password");
  const errMsg    = document.getElementById("errorMsg");

  // Super-user credentials (change as needed)
  const SUPER_EMAIL    = "super@psa.gov";
  const SUPER_PASSWORD = "super123";

  // Load staff list
  function loadStaff() {
    return JSON.parse(localStorage.getItem("staffAccounts") || "[]");
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    const email    = emailIn.value.trim();
    const password = passIn.value;

    // 1) Check super-user
    if (email === SUPER_EMAIL && password === SUPER_PASSWORD) {
      localStorage.setItem("userRole", "super");
      localStorage.setItem("userDept", "");      // super sees all
      localStorage.setItem("userName", "Super User");
      localStorage.setItem("userEmail", SUPER_EMAIL);
      window.location.href = "dashboard.html";
      return;
    }

    // 2) Check staffAccounts
    const staffList = loadStaff();
    const match = staffList.find(acc =>
      acc.email.toLowerCase() === email.toLowerCase()
      && acc.password === password
    );

    if (match) {
      localStorage.setItem("userRole", "staff");
      localStorage.setItem("userDept", match.dept);
      localStorage.setItem("userName", match.name);
      localStorage.setItem("userEmail", match.email);
      window.location.href = "dashboard.html";
      return;
    }

    // 3) No match: error
    errMsg.textContent = "Invalid email or password.";
  });
});

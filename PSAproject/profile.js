// profile.js
document.addEventListener("DOMContentLoaded", () => {
  const roleInput    = document.getElementById("role");
  const deptInput    = document.getElementById("dept");
  const nameInput    = document.getElementById("name");
  const emailInput   = document.getElementById("email");
  const logoutBtn    = document.getElementById("logout");
  const displayName  = document.getElementById("displayName");
  const form         = document.getElementById("profileForm");

  // Load stored values
  const role       = localStorage.getItem("userRole");
  const dept       = localStorage.getItem("userDept");
  const storedName = localStorage.getItem("userName")  || "";
  const storedEmail= localStorage.getItem("userEmail") || "";

  // Initialize form fields & greeting
  roleInput.value         = role;
  deptInput.value         = dept;
  nameInput.value         = storedName;
  emailInput.value        = storedEmail;
  displayName.textContent = storedName || "User";

  // Logout handler
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userDept");
    window.location.href = "login.html";
  });

  // Save updates & immediately update greeting
  form.addEventListener("submit", e => {
    e.preventDefault();
    const newName  = nameInput.value.trim();
    const newEmail = emailInput.value.trim();

    // Persist
    localStorage.setItem("userName",  newName);
    localStorage.setItem("userEmail", newEmail);

    // Reflect on page
    displayName.textContent = newName || "User";

    alert("Profile updated!");
  });
});

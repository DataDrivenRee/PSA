// manage-staff.js
document.addEventListener("DOMContentLoaded", () => {
  // 1) Logout
  document.getElementById("logout").onclick = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userDept");
    window.location.href = "login.html";
  };

  // 2) Seed default staff if none exist
  const DEFAULT_STAFF = [
    { id:"1",  name:"VPA", email:"vpa@psa.gov.ph",  dept:"ORD", pwd:"vpapassd" },
    { id:"2",  name:"CEN", email:"cen@psa.gov.ph",  dept:"ORD", pwd:"" },
    { id:"3",  name:"MLBS",email:"mlbs@psa.gov.ph", dept:"ORD", pwd:"" },
    { id:"4",  name:"JAA", email:"jaa@psa.gov.ph",   dept:"CRASD", pwd:"" },
    { id:"5",  name:"RVB", email:"rvb@psa.gov.ph",   dept:"CRASD", pwd:"" },
    { id:"6",  name:"MWB", email:"mwb@psa.gov.ph",   dept:"CRASD", pwd:"" },
    { id:"7",  name:"RBC", email:"rbc@psa.gov.ph",   dept:"CRASD", pwd:"" },
    { id:"8",  name:"CMD", email:"cmd@psa.gov.ph",   dept:"CRASD", pwd:"" },
    { id:"9",  name:"EEE", email:"eee@psa.gov.ph",   dept:"CRASD", pwd:"" },
    { id:"10", name:"GAT", email:"gat@psa.gov.ph",   dept:"CRASD", pwd:"" },
    { id:"11", name:"JBW", email:"jbw@psa.gov.ph",   dept:"CRASD", pwd:"" },
    { id:"12", name:"AFRB",email:"afrb@psa.gov.ph", dept:"SOCD", pwd:"" },
    { id:"13", name:"JRB", email:"jrb@psa.gov.ph",   dept:"SOCD", pwd:"" },
    { id:"14", name:"LMB", email:"lmb@psa.gov.ph",   dept:"SOCD", pwd:"" },
    { id:"15", name:"KAMC",email:"kamc@psa.gov.ph", dept:"SOCD", pwd:"" },
    { id:"16", name:"JPL", email:"jpl@psa.gov.ph",   dept:"SOCD", pwd:"" },
    { id:"17", name:"DBRL",email:"dbrl@psa.gov.ph", dept:"SOCD", pwd:"" },
    { id:"18", name:"WBM", email:"wbm@psa.gov.ph",   dept:"SOCD", pwd:"" },
    { id:"19", name:"BYM", email:"bym@psa.gov.ph",   dept:"SOCD", pwd:"" },
    { id:"20", name:"RPM", email:"rpm@psa.gov.ph",   dept:"SOCD", pwd:"" }
  ];

  function loadStaff() {
    let staff = JSON.parse(localStorage.getItem("staffList")||"null");
    if (!staff) {
      staff = DEFAULT_STAFF;
      localStorage.setItem("staffList", JSON.stringify(staff));
    }
    return staff;
  }

  function saveStaff(list) {
    localStorage.setItem("staffList", JSON.stringify(list));
  }

  // 3) Render table
  const tbody = document.querySelector("#staffTable tbody");
  function renderTable() {
    const staff = loadStaff();
    tbody.innerHTML = staff.map(u => `
      <tr data-id="${u.id}">
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>${u.dept}</td>
        <td>
          <button class="action-btn edit-btn">Edit</button>
          <button class="action-btn delete-btn">Delete</button>
        </td>
      </tr>
    `).join("");
  }

  // 4) Wire up form
  const form = document.getElementById("staffForm");
  const nameIn = document.getElementById("staffName");
  const emailIn= document.getElementById("staffEmail");
  const pwdIn  = document.getElementById("staffPassword");
  const deptIn = document.getElementById("staffDept");
  const editId = document.getElementById("editingId");

  form.addEventListener("submit", e => {
    e.preventDefault();
    const staff = loadStaff();
    if (editId.value) {
      // update
      const idx = staff.findIndex(u => u.id === editId.value);
      if (idx > -1) {
        staff[idx].name  = nameIn.value;
        staff[idx].email = emailIn.value;
        staff[idx].pwd   = pwdIn.value;
        staff[idx].dept  = deptIn.value;
      }
    } else {
      // new
      staff.push({
        id:   Date.now().toString(),
        name: nameIn.value,
        email: emailIn.value,
        pwd:  pwdIn.value,
        dept: deptIn.value
      });
    }
    saveStaff(staff);
    form.reset();
    editId.value = "";
    renderTable();
  });

  // 5) Edit/Delete buttons
  tbody.addEventListener("click", e => {
    const tr = e.target.closest("tr");
    const id = tr.dataset.id;
    const staff = loadStaff();
    if (e.target.matches(".edit-btn")) {
      const u = staff.find(x=>x.id===id);
      editId.value  = u.id;
      nameIn.value  = u.name;
      emailIn.value = u.email;
      pwdIn.value   = u.pwd;
      deptIn.value  = u.dept;
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (e.target.matches(".delete-btn")) {
      if (!confirm("Delete this staff?")) return;
      const filtered = staff.filter(x=>x.id!==id);
      saveStaff(filtered);
      renderTable();
    }
  });

  // init
  renderTable();
});
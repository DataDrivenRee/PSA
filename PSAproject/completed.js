// completed.js
document.addEventListener("DOMContentLoaded", () => {
  const container   = document.getElementById("completedSlips");
  const searchInput = document.getElementById("searchInput");

  // Force staff to their own dept
  const params     = new URLSearchParams(window.location.search);
  let deptFilter   = params.get("dept");
  const role       = localStorage.getItem("userRole");
  const userDept   = localStorage.getItem("userDept");
  if (role === 'staff') deptFilter = userDept;

  function loadSlips() {
    return JSON.parse(localStorage.getItem("routingSlips") || "[]");
  }

  function getFiltered() {
    const term = searchInput.value.trim().toLowerCase();
    return loadSlips()
      .filter(s => s.status?.toLowerCase() === "completed")
      .filter(s => !deptFilter || s.from === deptFilter)
      .filter(s => {
        if (!term) return true;
        return Object.values(s).some(v =>
          typeof v === "string" && v.toLowerCase().includes(term)
        );
      });
  }

  function sortNewestFirst(arr) {
    return arr.sort((a, b) =>
      new Date(b.completedAt || b.timestamp) -
      new Date(a.completedAt || a.timestamp)
    );
  }

  function render() {
    const all = loadSlips();
    let slips = getFiltered();
    if (!slips.length) {
      container.innerHTML = "<p>No completed slips found.</p>";
      return;
    }
    slips = sortNewestFirst(slips);

    container.innerHTML = slips.map(slip => {
      const idx = all.findIndex(s => s.id === slip.id);
      const urgentIcon = slip.urgentReason
        ? `<span title="Urgent" style="color:red;">❗️</span>`
        : "";
      const actionsText = Array.isArray(slip.actions)
        ? slip.actions.join(", ")
        : slip.actions || "-";
      const completedAt = slip.completedAt
        ? new Date(slip.completedAt).toLocaleString()
        : "—";
      const attach = slip.fileData
        ? `<p><strong>Attachment:</strong> <a href="${slip.fileData}" download="${slip.fileName}">${slip.fileName}</a></p>`
        : "";

      return `
      <div class="slip fade-in" data-index="${idx}">
        <h3>${slip.subject || "ROUTING SLIP"}${urgentIcon}</h3>
        <p><strong>From:</strong> ${slip.from || "-"} – ${slip.fromEmployee || "-"}</p>
        <p><strong>To:</strong> ${slip.to || "-"} – ${slip.toEmployee || "-"}</p>
        <p><strong>Action:</strong> ${actionsText}</p>
        ${slip.draftAction ? `<p><strong>Draft:</strong> ${slip.draftDetails}</p>` : ""}
        ${slip.urgentReason ? `<p><strong>Urgent Reason:</strong> ${slip.urgentReason}</p>` : ""}
        <p><strong>Remarks:</strong> ${slip.remarks || "-"}</p>
        <p><strong>Received By:</strong> ${slip.receivedBy || "-"}</p>
        <p><strong>Completed At:</strong> ${completedAt}</p>
        ${attach}
        <small class="timestamp"><em>Submitted:</em> ${new Date(slip.timestamp).toLocaleString()}</small>
        <div class="slip-actions">
          <button class="action-btn pending-btn">⏪ Pending</button>
          <button class="action-btn delete-btn">🗑 Trash</button>
          <button class="action-btn delete-perm-btn">❌ Delete Permanently</button>
          <button class="print-btn">🖨️ Print Slip</button>
        </div>
      </div>`;
    }).join("");
  }

  render();
  searchInput.addEventListener("input", render);

  container.addEventListener("click", e => {
    const slipEl = e.target.closest(".slip");
    if (!slipEl) return;
    const idx = +slipEl.dataset.index;
    const all = loadSlips();

    // Print this slip
    if (e.target.matches(".print-btn")) {
      printSlipPDF(all[idx]);
      return;
    }

    // Change status
    if (e.target.matches(".pending-btn")) {
      all[idx].status = "Pending";
      delete all[idx].completedAt;
    }
    if (e.target.matches(".delete-btn")) {
      all[idx].status = "Deleted";
      all[idx].deletedAt = new Date().toISOString();
    }
    if (e.target.matches(".delete-perm-btn")) {
      all.splice(idx, 1);
    }
    localStorage.setItem("routingSlips", JSON.stringify(all));
    render();
  });
});

/**
 * Build a clean HTML snippet for the slip and generate PDF.
 */
function printSlipPDF(slip) {
  const wrapper = document.createElement("div");
  Object.assign(wrapper.style, {
    padding: "20px",
    maxWidth: "700px",
    margin: "0 auto",
    fontFamily: "Arial, sans-serif",
    lineHeight: "1.4",
    background: "#fff",
    boxSizing: "border-box",
    pageBreakInside: "avoid"
  });

  const title = document.createElement("h2");
  title.textContent = "Completed Routing Slip";
  Object.assign(title.style, {
    color: "#0038a7",
    textAlign: "center",
    marginBottom: "16px"
  });
  wrapper.appendChild(title);

  const tbl = document.createElement("table");
  Object.assign(tbl.style, {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px"
  });

  const makeRow = (label, value) => {
    const tr = document.createElement("tr");
    const td1 = document.createElement("td");
    const td2 = document.createElement("td");
    td1.textContent = label;
    Object.assign(td1.style, {
      fontWeight: "bold",
      padding: "6px",
      verticalAlign: "top",
      width: "35%"
    });
    td2.textContent = value || "";
    td2.style.padding = "6px";
    tr.append(td1, td2);
    return tr;
  };

  [
    makeRow("Subject:", slip.subject),
    makeRow("From:", `${slip.from} – ${slip.fromEmployee}`),
    makeRow("To:", `${slip.to} – ${slip.toEmployee}`),
    makeRow("Action:", Array.isArray(slip.actions)? slip.actions.join(", ") : slip.actions),
    makeRow("Remarks:", slip.remarks),
    makeRow("Received By:", slip.receivedBy),
    makeRow("Completed At:", slip.completedAt ? new Date(slip.completedAt).toLocaleString() : ""),
    makeRow("Submitted:", new Date(slip.timestamp).toLocaleString())
  ].forEach(r => tbl.appendChild(r));

  wrapper.appendChild(tbl);

  const hr = document.createElement("hr");
  hr.style.margin = "16px 0";
  wrapper.appendChild(hr);

  const footer = document.createElement("p");
  footer.textContent = "Exported from PSA Routing Slip System";
  footer.style.cssText = "text-align:center; font-style:italic; margin-top:12px;";
  wrapper.appendChild(footer);

  document.body.appendChild(wrapper);

  const safeName = (slip.subject||"slip").replace(/[^a-z0-9]/gi,"_").toLowerCase();
  const opts = {
    margin:       [20,20,20,20],
    filename:     `${safeName}_completed.pdf`,
    image:        { type:"jpeg", quality:0.98 },
    html2canvas:  { scale:2, useCORS:true },
    jsPDF:        { unit:"mm", format:"letter", orientation:"portrait" },
    pagebreak:    { mode:["avoid-all","css","legacy"] }
  };
  html2pdf().set(opts).from(wrapper).save().then(() => {
    wrapper.remove();
  });
}

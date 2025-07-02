// pending.js

// 0️⃣ Request Notification permission once
if (Notification.permission === 'default') {
  Notification.requestPermission();
}

document.addEventListener("DOMContentLoaded", () => {
  // 1️⃣ Dept filter from URL
  const urlParams  = new URLSearchParams(window.location.search);
  const deptFilter = urlParams.get("dept");  // e.g. "CRASD" or null

  // 2️⃣ Load all slips
  function getAllSlips() {
    return JSON.parse(localStorage.getItem("routingSlips") || "[]");
  }

  // 3️⃣ Notify new slips in this dept
  (function notifyNew() {
    const allSlips  = getAllSlips();
    const lastCheck = parseInt(localStorage.getItem("lastCheck") || "0", 10);

    const newSlips = allSlips.filter(s =>
      s.status?.toLowerCase() === "pending" &&
      (!deptFilter || s.from === deptFilter) &&
      new Date(s.timestamp).getTime() > lastCheck
    );

    if (Notification.permission === 'granted') {
      newSlips.forEach(slip => {
        new Notification(`New Slip: ${slip.subject}`, {
          body: `From ${slip.fromEmployee} — Action: ${(slip.actions||[]).join(", ")}`,
        });
      });
    }

    localStorage.setItem("lastCheck", Date.now().toString());
  })();

  // 4️⃣ Elements
  const container   = document.getElementById("pendingSlips");
  const searchInput = document.getElementById("searchInput");

  // 5️⃣ Filter logic
  function getFiltered() {
    const term = searchInput.value.trim().toLowerCase();
    return getAllSlips()
      .filter(s => s.status?.toLowerCase() === "pending")
      .filter(s => !deptFilter || s.from === deptFilter)
      .filter(s => {
        if (!term) return true;
        return Object.values(s).some(v =>
          typeof v === "string" && v.toLowerCase().includes(term)
        );
      });
  }

  // 6️⃣ Sort newest-first
  function sortNewestFirst(slips) {
    return slips.sort((a,b) =>
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  }

  // 7️⃣ Render slips
  function render() {
    let slips = getFiltered();
    if (slips.length === 0) {
      container.innerHTML = "<p>No pending slips found.</p>";
      return;
    }

    slips = sortNewestFirst(slips);
    const all = getAllSlips();

    container.innerHTML = slips.map(slip => {
      const idx        = all.findIndex(s => s.id === slip.id);
      const urgentIcon = slip.urgentReason
        ? `<span title="Urgent" style="color:red; margin-left:6px; font-size:1.1em;">❗️</span>`
        : "";
      const actionsText = Array.isArray(slip.actions)
        ? slip.actions.join(", ")
        : (slip.actions || "-");

      return `
        <div class="slip fade-in" data-index="${idx}">
          <h3>${slip.subject || "ROUTING SLIP"} ${urgentIcon}</h3>
          <p><strong>From:</strong> ${slip.from || "-"} – ${slip.fromEmployee || "-"}</p>
          <p><strong>To:</strong> ${slip.to || "-"} – ${slip.toEmployee || "-"}</p>
          <p><strong>Action:</strong> ${actionsText}</p>
          ${slip.draftAction
            ? `<p><strong>Draft:</strong> ${slip.draftAction}${slip.draftDetails ? " – " + slip.draftDetails : ""}</p>`
            : ""
          }
          ${slip.urgentReason
            ? `<p><strong>Urgent Reason:</strong> ${slip.urgentReason}</p>`
            : ""
          }
          <p><strong>Remarks:</strong> ${slip.remarks || "-"}</p>
          <p><strong>Received By:</strong> ${slip.receivedBy || "-"}</p>
          <small class="timestamp"><em>Submitted:</em> ${new Date(slip.timestamp).toLocaleString()}</small>
          <div class="slip-actions">
            <button class="action-btn complete-btn">✅ Complete</button>
            <button class="action-btn trash-btn">🗑 Trash</button>
            <button class="action-btn edit-btn">✏️ Edit</button>
            <button class="print-btn">🖨️ Print</button>
          </div>
        </div>
      `;
    }).join("");
  }

  // 8️⃣ Initial render & search
  render();
  searchInput.addEventListener("input", render);

  // 9️⃣ Handle actions & print
  container.addEventListener("click", e => {
    const slipEl = e.target.closest(".slip");
    if (!slipEl) return;
    const idx = parseInt(slipEl.dataset.index, 10);
    if (isNaN(idx)) return;

    const all = getAllSlips();

    if (e.target.matches(".complete-btn")) {
      all[idx].status      = "Completed";
      all[idx].completedAt = new Date().toISOString();

    } else if (e.target.matches(".trash-btn")) {
      if (!confirm("Move this slip to Trash?")) return;
      all[idx].status    = "Deleted";
      all[idx].deletedAt = new Date().toISOString();

    } else if (e.target.matches(".edit-btn")) {
      localStorage.setItem("editSlipId", all[idx].id);
      return window.location.href = "routing-slip.html";

    } else if (e.target.matches(".print-btn")) {
      // Print only this slip
      const clone = slipEl.cloneNode(true);
      clone.style.margin = 0;
      clone.style.boxShadow = "none";
      const wrapper = document.createElement("div");
      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);
      window.print();
      document.body.removeChild(wrapper);
      return;
    } else {
      return;
    }

    localStorage.setItem("routingSlips", JSON.stringify(all));
    render();
  });
});

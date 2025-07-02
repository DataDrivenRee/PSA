document.addEventListener("DOMContentLoaded", () => {
  const container   = document.getElementById("urgentSlips");
  const searchInput = document.getElementById("searchInput");

  function getAllSlips() {
    return JSON.parse(localStorage.getItem("routingSlips") || "[]");
  }

  function getFiltered() {
    const term = searchInput.value.trim().toLowerCase();
    return getAllSlips()
      .filter(slip => slip.urgentReason && slip.status === "Pending")
      .filter(slip => {
        if (!term) return true;
        return Object.values(slip).some(v =>
          typeof v === "string" && v.toLowerCase().includes(term)
        );
      });
  }

  function sortNewestFirst(slips) {
    return slips.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  function render() {
    let slips = getFiltered();
    if (slips.length === 0) {
      container.innerHTML = "<p>No urgent slips found.</p>";
      return;
    }

    slips = sortNewestFirst(slips);
    const all = getAllSlips();

    container.innerHTML = slips.map(slip => {
      const idx = all.findIndex(s => s.id === slip.id);
      const actionsText = Array.isArray(slip.actions)
        ? slip.actions.join(", ")
        : (slip.actions || "-");

      return `
        <div class="slip fade-in" data-index="${idx}">
          <h3>${slip.subject || "ROUTING SLIP"}<span title="Urgent" style="color:red; margin-left:6px; font-size:1.1em;">❗️</span></h3>
          <p><strong>From:</strong> ${slip.from || "-"} – ${slip.fromEmployee || "-"}</p>
          <p><strong>To:</strong> ${slip.to || "-"} – ${slip.toEmployee || "-"}</p>
          <p><strong>Action:</strong> ${actionsText}</p>
          ${slip.draftAction ? `<p><strong>Draft:</strong> ${slip.draftAction}${slip.draftDetails ? " – " + slip.draftDetails : ""}</p>` : ""}
          <p><strong>Urgent Reason:</strong> ${slip.urgentReason}</p>
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

  render();
  searchInput.addEventListener("input", render);

  container.addEventListener("click", e => {
    const slipEl = e.target.closest(".slip");
    if (!slipEl) return;
    const idx = parseInt(slipEl.dataset.index, 10);
    if (isNaN(idx)) return;

    const all = getAllSlips();

    if (e.target.matches(".complete-btn")) {
      all[idx].status = "Completed";
      all[idx].completedAt = new Date().toISOString();
    } else if (e.target.matches(".trash-btn")) {
      if (!confirm("Move this slip to Trash?")) return;
      all[idx].status = "Deleted";
      all[idx].deletedAt = new Date().toISOString();
    } else if (e.target.matches(".edit-btn")) {
      localStorage.setItem("editSlipId", all[idx].id);
      window.location.href = "routing-slip.html";
      return;
    } else if (e.target.matches(".print-btn")) {
      const clone = slipEl.cloneNode(true);
      clone.style.margin = 0;
      clone.style.boxShadow = "none";
      const wrapper = document.createElement("div");
      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);
      window.print();
      document.body.removeChild(wrapper);
      return;
    }

    localStorage.setItem("routingSlips", JSON.stringify(all));
    render();
  });

  // Back to Top visibility
  const backBtn = document.getElementById("backToTopBtn");
  window.addEventListener("scroll", () => {
    backBtn.style.display = window.scrollY > 300 ? "block" : "none";
  });
});

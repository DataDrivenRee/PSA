document.addEventListener("DOMContentLoaded", () => {
  const container   = document.getElementById("trashSlips");
  const searchInput = document.getElementById("searchInput");

  // Get all slips from localStorage
  function getAllSlips() {
    return JSON.parse(localStorage.getItem("routingSlips") || "[]");
  }

  // Filter only deleted slips (and apply search term)
  function getFiltered() {
    const term = searchInput.value.trim().toLowerCase();
    return getAllSlips().filter(slip => {
      if (!slip.status || slip.status.toLowerCase() !== "deleted") return false;
      if (!term) return true;
      return Object.values(slip).some(
        v => typeof v === "string" && v.toLowerCase().includes(term)
      );
    });
  }

  // Sort so newest deletions come first
  function sortNewestFirst(slips) {
    return slips.sort((a, b) => {
      const dateA = new Date(b.deletedAt || b.timestamp);
      const dateB = new Date(a.deletedAt || a.timestamp);
      return dateA - dateB;
    });
  }

  // Render the list
  function render() {
    let slips = getFiltered();
    if (slips.length === 0) {
      container.innerHTML = "<p>No deleted slips found.</p>";
      return;
    }

    // Sort before rendering
    slips = sortNewestFirst(slips);

    const all = getAllSlips();
    container.innerHTML = slips.map(slip => {
      const idx = all.findIndex(s => s.id === slip.id);
      const actionsText = Array.isArray(slip.actions)
        ? slip.actions.join(", ")
        : (slip.actions || "-");
      const deletedStamp = slip.deletedAt
        ? new Date(slip.deletedAt).toLocaleString()
        : "—";
      // New: attachment link
      const attachmentLink = slip.fileData
        ? `<p><strong>Attachment:</strong> <a href="${slip.fileData}" download="${slip.fileName}">${slip.fileName}</a></p>`
        : "";

      return `
        <div class="slip fade-in" data-index="${idx}">
          <h3>${slip.subject || "ROUTING SLIP"}</h3>
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
          <p><strong>Deleted At:</strong> ${deletedStamp}</p>
          ${attachmentLink}
          <small class="timestamp"><em>Submitted:</em> ${new Date(slip.timestamp).toLocaleString()}</small>
          <div class="slip-actions">
            <button class="action-btn restore-btn">⏪ Restore</button>
            <button class="action-btn delete-perm-btn">❌ Delete Permanently</button>
          </div>
        </div>
      `;
    }).join("");
  }

  // Initial render & search hookup
  render();
  searchInput.addEventListener("input", render);

  // Handle restore & permanent delete
  container.addEventListener("click", e => {
    const slipEl = e.target.closest(".slip");
    if (!slipEl) return;
    const idx = parseInt(slipEl.dataset.index, 10);
    if (isNaN(idx)) return;

    let all = getAllSlips();
    if (e.target.matches(".restore-btn")) {
      all[idx].status = "Pending";
      delete all[idx].deletedAt;
    } else if (e.target.matches(".delete-perm-btn")) {
      all.splice(idx, 1);
    } else {
      return;
    }

    localStorage.setItem("routingSlips", JSON.stringify(all));
    render();
  });
});

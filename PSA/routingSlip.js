// routingSlip.js
document.addEventListener("DOMContentLoaded", () => {
  const form                  = document.getElementById("routingSlipForm");
  const fromSelect            = document.getElementById("from");
  const toSelect              = document.getElementById("to");
  const fromEmp               = document.getElementById("fromEmployee");
  const toEmp                 = document.getElementById("toEmployee");
  const urgentCheckbox        = document.getElementById("urgent");
  const urgentReasonContainer = document.getElementById("urgentReasonContainer");
  const draftCheckbox         = document.querySelector("input[name='action'][value='For Drafting']");
  const draftDetailsContainer = document.getElementById("draftDetailsContainer");
  const draftDetailsInput     = document.getElementById("draftDetails");
  const fileInput             = document.getElementById("file-upload");
  const signatureInput        = document.getElementById("signature-upload");
  const signaturePreview      = document.getElementById("signature-preview");
  const editingId             = localStorage.getItem("editSlipId");

  // Department → employee lists (autocomplete)
  const departments = {
    CRASD: [
      "ACOSTA, JOSE ANGELITO.", "BALA-OY, RICKSON V.", "BOLSILS, MARIBETH W.",
      "CUILAN, ROSEMARIE B.", "DULAY, CARIDAD M.", "EQUINIO, EMIMALYN E.",
      "GAMA, GLADYS C.", "GUMPAI, AIMEE C.", "JALLORINA, MARYROSE C.",
      "TOLITO, GERARD A.", "WACLIN, JULIE B.", "ABELIERA, HEAVEN LEIGH R.",
      "CHUPISNA, RICHIE MAE C.", "LAPUGAN, FRIENDLY MAY S.", "LICDAN, SHIPLENE A.",
      "MAMARIL, JENICA RUTH R.", "MANAOIS, JIRAH ANN E.", "POOTEN, JANICE B.",
      "TUAZON, SAMBOY L."
    ],
    ORD: [
      "ALIBUYOG, VILLAFE P.", "SAB-IT, MARIA LAPREM BOUVIER A.", "NGOLOB, CRISTETA"
    ],
    SOCD: [
      "BAHIT JR., ALDRIN FEDERICO R.", "AQUINO, RICK JASON P.", "BOADO, JEZL R.",
      "BUCAGAN, LORIE ANN M.", "CASTRO, KAY ANGELIKA M.", "COFOLAN, OSVALDO P.",
      "DE GUZMAN, MA. GINA V.", "LAZO, JAYSON P.", "LEGASP, DENELLE BIANCA RICA G.",
      "MAMANTEO, WARREN B.", "MATEO, BROZYBROZ Y.", "MICLAT, REYMARSON P.",
      "ALFONSO, KATE D.", "BUYAWE, RANDELL JAY P.", "CACAS, EIDREF JOFEL D.",
      "DE GUZMAN, NIMIEL ALDRIN G.", "GABUYO, SHEMIAH C.", "ODANOS, JENNILYN M.",
      "RETUTA, SHERRY MAE", "ABAGUE, TRISHA MAE"
    ]
  };

  // Populate datalists for From/To employees
  function populateEmployees(selectEl, inputEl) {
    selectEl.addEventListener("change", () => {
      const listId = `${selectEl.value}-list`;
      inputEl.setAttribute("list", listId);
      if (!document.getElementById(listId)) {
        const dl = document.createElement("datalist");
        dl.id = listId;
        (departments[selectEl.value] || []).forEach(name => {
          const opt = document.createElement("option");
          opt.value = name;
          dl.appendChild(opt);
        });
        document.body.appendChild(dl);
      }
    });
  }
  populateEmployees(fromSelect, fromEmp);
  populateEmployees(toSelect, toEmp);

  // Show/hide draft details
  draftCheckbox.addEventListener("change", e => {
    draftDetailsContainer.style.display = e.target.checked ? "block" : "none";
  });
  // Show/hide urgent reason
  urgentCheckbox.addEventListener("change", e => {
    urgentReasonContainer.style.display = e.target.checked ? "block" : "none";
  });
  // Signature preview
  signatureInput.addEventListener("change", e => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => signaturePreview.src = reader.result;
    reader.readAsDataURL(f);
  });

  // Prefill if editing
  if (editingId) {
    const slips = JSON.parse(localStorage.getItem("routingSlips") || "[]");
    const slip  = slips.find(s => s.id === editingId);
    if (slip) {
      document.getElementById("subject").value      = slip.subject || "";
      fromSelect.value                              = slip.from    || "";
      toSelect.value                                = slip.to      || "";
      fromEmp.value                                 = slip.fromEmployee || "";
      toEmp.value                                   = slip.toEmployee   || "";
      document.getElementById("remarks").value      = slip.remarks || "";
      document.getElementById("receivedBy").value   = slip.receivedBy || "";
      draftCheckbox.checked                         = slip.draftAction === "For Drafting";
      draftDetailsInput.value                       = slip.draftDetails || "";
      urgentCheckbox.checked                        = !!slip.urgentReason;
      document.getElementById("urgentReason").value = slip.urgentReason || "";
      draftDetailsContainer.style.display           = draftCheckbox.checked ? "block" : "none";
      urgentReasonContainer.style.display           = urgentCheckbox.checked ? "block" : "none";
      if (slip.signatureData) signaturePreview.src  = slip.signatureData;
      (slip.actions || []).forEach(action => {
        const cb = document.querySelector(`input[name="action"][value="${action}"]`);
        if (cb) cb.checked = true;
      });
    }
  }

  // Handle form submission
  form.addEventListener("submit", e => {
    e.preventDefault();
    const attached = fileInput.files[0];
    if (attached) {
      const fr = new FileReader();
      fr.onload = () => saveSlip(fr.result, attached.name);
      fr.readAsDataURL(attached);
    } else {
      saveSlip("", "");
    }
  });

  function saveSlip(fileData, fileName) {
    const actions = Array.from(
      document.querySelectorAll("input[name='action']:checked")
    ).map(cb => cb.value);

    const slip = {
      id:             editingId || Date.now().toString(),
      subject:        document.getElementById("subject").value.trim(),
      from:           fromSelect.value,
      to:             toSelect.value,
      fromEmployee:   fromEmp.value.trim(),
      toEmployee:     toEmp.value.trim(),
      actions,
      draftAction:    draftCheckbox.checked ? "For Drafting" : "",
      draftDetails:   draftCheckbox.checked ? draftDetailsInput.value.trim() : "",
      urgentReason:   urgentCheckbox.checked ? document.getElementById("urgentReason").value.trim() : "",
      remarks:        document.getElementById("remarks").value.trim(),
      receivedBy:     document.getElementById("receivedBy").value.trim(),
      fileData,       // base64 or ""
      fileName,       // original filename or ""
      signatureData:  signaturePreview.src || "",
      status:         "Pending",
      timestamp:      new Date().toISOString()
    };

    const all = JSON.parse(localStorage.getItem("routingSlips") || "[]");
    if (editingId) {
      const idx = all.findIndex(s => s.id === editingId);
      if (idx > -1) all[idx] = slip;
      localStorage.removeItem("editSlipId");
    } else {
      all.push(slip);
    }
    localStorage.setItem("routingSlips", JSON.stringify(all));

    window.location.href = "pending.html";
  }
});

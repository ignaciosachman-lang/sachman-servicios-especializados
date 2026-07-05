document.addEventListener("DOMContentLoaded", function () {
  const segmentTabsEl = document.getElementById("segment-tabs");
  const areaGridEl = document.getElementById("area-grid");
  const tierPillEl = document.getElementById("tier-pill");
  const summaryLinesEl = document.getElementById("summary-lines");
  const totalAmountEl = document.getElementById("total-amount");
  const summaryNoteEl = document.getElementById("summary-note");
  const form = document.getElementById("contact-form");
  const generateBtn = document.getElementById("generate-btn");
  const resultBox = document.getElementById("result-box");
  const errorText = document.getElementById("form-error");

  let currentSegment = "pyme";
  const selectedAreas = new Set(["contabilidad", "administracion"]);

  function commissionNote(area) {
    return area.commission ? " + " + Math.round(area.commission * 100) + "% comisión sobre ventas" : "";
  }

  function renderSegments() {
    segmentTabsEl.innerHTML = "";
    Object.values(SEGMENTS).forEach(function (seg) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "segment-tab" + (seg.id === currentSegment ? " active" : "");
      btn.innerHTML = "<strong>" + seg.label + "</strong><span>" + seg.tag + "</span>";
      btn.addEventListener("click", function () {
        currentSegment = seg.id;
        renderSegments();
        renderAreas();
        updateSummary();
      });
      segmentTabsEl.appendChild(btn);
    });
  }

  function renderAreas() {
    areaGridEl.innerHTML = "";
    AREAS.forEach(function (area) {
      const active = selectedAreas.has(area.id);
      const card = document.createElement("div");
      card.className = "area-card" + (active ? " active" : "");
      card.innerHTML =
        '<div class="top-row">' +
          '<div class="icon"><i class="ti ' + area.icon + '" aria-hidden="true"></i></div>' +
          '<div class="check"><i class="ti ti-check" aria-hidden="true"></i></div>' +
        "</div>" +
        "<h4>" + area.label + "</h4>" +
        '<p class="desc">' + area.description + "</p>" +
        '<div class="price">' + formatMXN(area.price[currentSegment]) + "/mes" + commissionNote(area) + "</div>";
      card.addEventListener("click", function () {
        if (selectedAreas.has(area.id)) {
          selectedAreas.delete(area.id);
        } else {
          selectedAreas.add(area.id);
        }
        renderAreas();
        updateSummary();
      });
      areaGridEl.appendChild(card);
    });
  }

  function getSelectedAreaObjects() {
    return AREAS.filter(function (a) { return selectedAreas.has(a.id); });
  }

  function computeTotal() {
    const seg = SEGMENTS[currentSegment];
    const areas = getSelectedAreaObjects();
    let subtotal = 0;
    areas.forEach(function (a) { subtotal += a.price[currentSegment]; });
    const coordApplies = areas.length >= seg.coordThreshold;
    const total = subtotal + (coordApplies ? seg.coordFee : 0);
    return { seg, areas, subtotal, coordApplies, total };
  }

  function updateSummary() {
    const { seg, areas, coordApplies, total } = computeTotal();
    const count = areas.length;

    summaryLinesEl.innerHTML = "";
    areas.forEach(function (a) {
      const line = document.createElement("div");
      line.className = "summary-line";
      line.innerHTML = "<span>" + a.label + "</span><span>" + formatMXN(a.price[currentSegment]) + commissionNote(a) + "</span>";
      summaryLinesEl.appendChild(line);
    });
    if (coordApplies) {
      const line = document.createElement("div");
      line.className = "summary-line";
      line.innerHTML = "<span>Coordinación y gobernanza</span><span>" + formatMXN(seg.coordFee) + "</span>";
      summaryLinesEl.appendChild(line);
    }

    const tier = tierFromCount(count);
    tierPillEl.textContent = tier ? tier + " · " + count + (count === 1 ? " área" : " áreas") : "Selecciona al menos un área";
    totalAmountEl.textContent = formatMXN(total);

    if (count === 0) {
      summaryNoteEl.textContent = "Elige una o más áreas para calcular tu cotización.";
    } else if (!coordApplies) {
      summaryNoteEl.textContent = "Suma " + seg.coordThreshold + " áreas o más para incluir un coordinador de cuenta único.";
    } else {
      summaryNoteEl.textContent = "Incluye coordinador de cuenta único y reporte mensual de servicio.";
    }

    generateBtn.disabled = count === 0;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const name = document.getElementById("f-name").value.trim();
    const email = document.getElementById("f-email").value.trim();
    const company = document.getElementById("f-company").value.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!name || !emailOk) {
      errorText.style.display = "block";
      return;
    }
    errorText.style.display = "none";

    const { seg, areas, coordApplies, total } = computeTotal();
    const tier = tierFromCount(areas.length);

    const lines = areas.map(function (a) {
      return "- " + a.label + ": " + formatMXN(a.price[currentSegment]) + "/mes" + commissionNote(a);
    });
    if (coordApplies) lines.push("- Coordinación y gobernanza: " + formatMXN(seg.coordFee) + "/mes");

    const bodyLines = [
      "Segmento: " + seg.label,
      "Paquete sugerido: " + tier,
      "Áreas contratadas:",
      lines.join("\n"),
      "",
      "Fee mensual estimado (+ IVA): " + formatMXN(total),
      "",
      "Nombre: " + name,
      "Empresa: " + (company || "N/A"),
      "Correo: " + email
    ];
    const body = bodyLines.join("\n");

    resultBox.classList.remove("hidden");
    resultBox.innerHTML =
      "<h3>Resumen de tu cotización</h3>" +
      "<p style='white-space:pre-line; font-size:13px; color:var(--text-muted);'>" + body.replace(/\n/g, "<br>") + "</p>" +
      '<a class="btn btn-primary" href="mailto:ignacio.sachman@livcampus.com?subject=' +
      encodeURIComponent("Solicitud de propuesta formal - " + seg.label + " - " + tier) +
      "&body=" + encodeURIComponent(body) + '">Enviar solicitud por correo</a>';

    resultBox.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  renderSegments();
  renderAreas();
  updateSummary();
});

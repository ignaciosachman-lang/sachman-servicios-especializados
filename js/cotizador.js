document.addEventListener("DOMContentLoaded", function () {
  const segmentTabsEl = document.getElementById("segment-tabs");
  const areaGridEl = document.getElementById("area-grid");
  const tierPillEl = document.getElementById("tier-pill");
  const summaryLinesEl = document.getElementById("summary-lines");
  const totalAmountEl = document.getElementById("total-amount");
  const summaryNoteEl = document.getElementById("summary-note");
  const savingsNoteEl = document.getElementById("savings-note");
  const annualToggle = document.getElementById("annual-toggle");
  const form = document.getElementById("contact-form");
  const generateBtn = document.getElementById("generate-btn");
  const resultBox = document.getElementById("result-box");
  const errorText = document.getElementById("form-error");

  let currentSegment = "pyme";
  let selectedAreas = new Set(["contabilidad", "administracion"]);

  // Prefill desde el diagnóstico operativo (?segmento=pyme&areas=contabilidad,rrhh)
  const params = new URLSearchParams(window.location.search);
  const segParam = params.get("segmento");
  const areasParam = params.get("areas");
  if (segParam && SEGMENTS[segParam]) currentSegment = segParam;
  if (areasParam) {
    const validIds = areasParam.split(",").filter(function (id) {
      return AREAS.some(function (a) { return a.id === id; });
    });
    if (validIds.length) selectedAreas = new Set(validIds);
  }

  function isAnnual() {
    return !!(annualToggle && annualToggle.checked);
  }

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
    const selectedCount = selectedAreas.size;
    AREAS.forEach(function (area) {
      const active = selectedAreas.has(area.id);
      // Si ya está seleccionada, el precio usa el conteo actual; si no, muestra el precio
      // que tendría TODO el paquete (incluida esta) si la agregas ahora.
      const previewCount = active ? Math.max(selectedCount, 1) : selectedCount + 1;
      const price = areaPrice(area, currentSegment, previewCount, isAnnual());
      const card = document.createElement("div");
      card.className = "area-card" + (active ? " active" : "");
      card.innerHTML =
        '<div class="top-row">' +
          '<div class="icon"><i class="ti ' + area.icon + '" aria-hidden="true"></i></div>' +
          '<div class="check"><i class="ti ti-check" aria-hidden="true"></i></div>' +
        "</div>" +
        "<h4>" + area.label + "</h4>" +
        '<p class="desc">' + area.description + "</p>" +
        '<div class="price">' + formatMXN(price) + "/mes" + commissionNote(area) + "</div>";
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
    const count = areas.length;
    const annual = isAnnual();
    let subtotal = 0;
    let fullPriceNoDiscount = 0;
    areas.forEach(function (a) {
      subtotal += areaPrice(a, currentSegment, count, annual);
      fullPriceNoDiscount += areaBasePrice(a, currentSegment);
    });
    const coordApplies = count >= seg.coordThreshold;
    const coordFee = coordApplies ? coordFeeAmount(currentSegment, annual) : 0;
    const total = subtotal + coordFee;
    const savings = (fullPriceNoDiscount + (coordApplies ? seg.coordFee : 0)) - total;
    return { seg, areas, subtotal, coordApplies, coordFee, total, count, annual, savings };
  }

  function updateSummary() {
    const { seg, areas, coordApplies, coordFee, total, count, annual, savings } = computeTotal();

    summaryLinesEl.innerHTML = "";
    areas.forEach(function (a) {
      const price = areaPrice(a, currentSegment, count, annual);
      const line = document.createElement("div");
      line.className = "summary-line";
      line.innerHTML = "<span>" + a.label + "</span><span>" + formatMXN(price) + commissionNote(a) + "</span>";
      summaryLinesEl.appendChild(line);
    });
    if (coordApplies) {
      const line = document.createElement("div");
      line.className = "summary-line";
      line.innerHTML = "<span>Coordinación y gobernanza</span><span>" + formatMXN(coordFee) + "</span>";
      summaryLinesEl.appendChild(line);
    }

    const tier = tierFromCount(count);
    tierPillEl.textContent = tier ? tier + " · " + count + (count === 1 ? " área" : " áreas") : "Selecciona al menos un área";
    totalAmountEl.textContent = formatMXN(total) + (annual ? "/mes (pago anual)" : "/mes");

    if (count === 0) {
      summaryNoteEl.textContent = "Elige una o más áreas para calcular tu cotización.";
    } else if (!coordApplies) {
      summaryNoteEl.textContent = "Suma " + seg.coordThreshold + " áreas o más para incluir un coordinador de cuenta único.";
    } else {
      summaryNoteEl.textContent = "Incluye coordinador de cuenta único y reporte mensual de servicio.";
    }

    if (savingsNoteEl) {
      if (count > 1 && savings > 1) {
        savingsNoteEl.textContent = "Ahorras " + formatMXN(savings) + "/mes vs. contratar cada área por separado" + (annual ? " (incluye el 5% de pago anual)." : ". Activa pago anual para un 5% adicional.");
        savingsNoteEl.style.display = "block";
      } else if (count === 1 && !annual) {
        savingsNoteEl.textContent = "Agrega más áreas o activa el pago anual para desbloquear descuentos.";
        savingsNoteEl.style.display = "block";
      } else {
        savingsNoteEl.style.display = "none";
      }
    }

    generateBtn.disabled = count === 0;
  }

  if (annualToggle) {
    annualToggle.addEventListener("change", function () {
      renderAreas();
      updateSummary();
    });
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

    const { seg, areas, coordApplies, coordFee, total, count, annual, savings } = computeTotal();
    const tier = tierFromCount(count);

    const lines = areas.map(function (a) {
      return "- " + a.label + ": " + formatMXN(areaPrice(a, currentSegment, count, annual)) + "/mes" + commissionNote(a);
    });
    if (coordApplies) lines.push("- Coordinación y gobernanza: " + formatMXN(coordFee) + "/mes");

    const bodyLines = [
      "Segmento: " + seg.label,
      "Paquete sugerido: " + tier,
      "Modalidad de pago: " + (annual ? "Anual (-5% adicional)" : "Mensual"),
      "Áreas contratadas:",
      lines.join("\n"),
      "",
      "Fee mensual estimado (+ IVA): " + formatMXN(total),
      count > 1 ? "Ahorro vs. precio individual: " + formatMXN(savings) + "/mes" : "",
      "",
      "Nombre: " + name,
      "Empresa: " + (company || "N/A"),
      "Correo: " + email
    ].filter(function (l) { return l !== ""; });
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

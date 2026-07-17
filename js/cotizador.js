document.addEventListener("DOMContentLoaded", function () {
  const segmentTabsEl = document.getElementById("segment-tabs");
  const areaGridEl = document.getElementById("area-grid");
  const volumePanelEl = document.getElementById("volume-panel");
  const tierPillEl = document.getElementById("tier-pill");
  const summaryLinesEl = document.getElementById("summary-lines");
  const totalAmountEl = document.getElementById("total-amount");
  const summaryNoteEl = document.getElementById("summary-note");
  const savingsNoteEl = document.getElementById("savings-note");
  const topeWarningEl = document.getElementById("tope-warning");
  const annualToggle = document.getElementById("annual-toggle");
  const facturacionInput = document.getElementById("f-facturacion");
  const form = document.getElementById("contact-form");
  const generateBtn = document.getElementById("generate-btn");
  const resultBox = document.getElementById("result-box");
  const errorText = document.getElementById("form-error");

  let currentSegment = "pyme";
  let selectedAreas = new Set(["contabilidad", "administracion"]);
  const volumeAnswers = {}; // { [areaId]: { [driver]: cantidad } }

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

  function facturacionMensual() {
    const v = parseFloat(facturacionInput && facturacionInput.value);
    return isNaN(v) || v <= 0 ? null : v;
  }

  function commissionNote(area) {
    return area.commission ? " + " + Math.round(area.commission * 100) + "% comisión sobre ventas" : "";
  }

  // Precio de un área ya con descuento por paquete + anual aplicado sobre el precio por volumen.
  function volumeAreaPrice(area, count, annual) {
    const seg = SEGMENTS[currentSegment];
    const basePorVolumen = computeAreaPriceByVolume(area.id, currentSegment, volumeAnswers[area.id]);
    const afterBundle = basePorVolumen * (1 - bundleDiscount(currentSegment, count));
    return annual ? afterBundle * (1 - ANNUAL_DISCOUNT) : afterBundle;
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
        renderVolumeInputs();
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
      const previewCount = active ? Math.max(selectedCount, 1) : selectedCount + 1;
      const price = volumeAreaPrice(area, previewCount, isAnnual());
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
          if (!volumeAnswers[area.id]) volumeAnswers[area.id] = {};
        }
        renderAreas();
        renderVolumeInputs();
        updateSummary();
      });
      areaGridEl.appendChild(card);
    });
  }

  function renderVolumeInputs() {
    volumePanelEl.innerHTML = "";
    const areas = getSelectedAreaObjects();
    if (!areas.length) return;

    const intro = document.createElement("p");
    intro.className = "step-label";
    intro.style.marginTop = "8px";
    intro.textContent = "Volumen real de operación (para afinar el precio de cada área)";
    volumePanelEl.appendChild(intro);

    areas.forEach(function (area) {
      const drivers = getAreaVolumeDrivers(area.id, currentSegment);
      if (!drivers.length) return;
      if (!volumeAnswers[area.id]) volumeAnswers[area.id] = {};

      const block = document.createElement("div");
      block.className = "volume-block";
      let html = "<h4><i class=\"ti " + area.icon + "\" aria-hidden=\"true\"></i> " + area.label + "</h4><div class=\"volume-fields\">";
      drivers.forEach(function (d, i) {
        const current = typeof volumeAnswers[area.id][d.driver] === "number" ? volumeAnswers[area.id][d.driver] : d.volumenBase;
        const fieldId = "vol-" + area.id + "-" + i;
        html += '<label class="volume-field"><span>' + d.driver + '</span><input type="number" id="' + fieldId + '" min="0" step="1" value="' + current + '" data-area="' + area.id + '" data-driver="' + d.driver.replace(/"/g, "&quot;") + '"></label>';
      });
      html += "</div>";
      block.innerHTML = html;
      volumePanelEl.appendChild(block);
    });

    volumePanelEl.querySelectorAll("input[data-area]").forEach(function (input) {
      input.addEventListener("input", function () {
        const areaId = input.getAttribute("data-area");
        const driver = input.getAttribute("data-driver");
        const val = parseFloat(input.value);
        if (!volumeAnswers[areaId]) volumeAnswers[areaId] = {};
        volumeAnswers[areaId][driver] = isNaN(val) ? 0 : val;
        renderAreas();
        updateSummary();
      });
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
      subtotal += volumeAreaPrice(a, count, annual);
      fullPriceNoDiscount += computeAreaPriceByVolume(a.id, currentSegment, volumeAnswers[a.id]);
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
      const price = volumeAreaPrice(a, count, annual);
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

    const factu = facturacionMensual();
    const tope = checkTopeFacturacion(total, factu, count);
    if (count > 0 && factu && tope.excede) {
      topeWarningEl.classList.remove("hidden");
      topeWarningEl.innerHTML = '<i class="ti ti-alert-triangle" aria-hidden="true"></i> Este paquete es ' + (tope.pct * 100).toFixed(1) + '% de tu facturación mensual — más del ' + (tope.tope * 100).toFixed(0) + '% que solemos recomendar como techo. Considera empezar con menos áreas.';
    } else {
      topeWarningEl.classList.add("hidden");
      topeWarningEl.innerHTML = "";
    }

    generateBtn.disabled = count === 0;
  }

  if (annualToggle) {
    annualToggle.addEventListener("change", function () {
      renderAreas();
      updateSummary();
    });
  }

  if (facturacionInput) {
    facturacionInput.addEventListener("input", updateSummary);
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
      return "- " + a.label + ": " + formatMXN(volumeAreaPrice(a, count, annual)) + "/mes" + commissionNote(a);
    });
    if (coordApplies) lines.push("- Coordinación y gobernanza: " + formatMXN(coordFee) + "/mes");

    const factu = facturacionMensual();
    const tope = checkTopeFacturacion(total, factu, count);

    const bodyLines = [
      "Segmento: " + seg.label,
      "Facturación mensual aproximada: " + (factu ? formatMXN(factu) : "no indicada"),
      "Paquete sugerido: " + tier,
      "Modalidad de pago: " + (annual ? "Anual (-5% adicional)" : "Mensual"),
      "Áreas contratadas:",
      lines.join("\n"),
      "",
      "Fee mensual estimado (+ IVA): " + formatMXN(total),
      count > 1 ? "Ahorro vs. precio individual: " + formatMXN(savings) + "/mes" : "",
      factu && tope.excede ? "Nota: este fee es " + (tope.pct * 100).toFixed(1) + "% de la facturación mensual indicada — por encima del " + (tope.tope * 100).toFixed(0) + "% recomendado." : "",
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
  renderVolumeInputs();
  updateSummary();
});

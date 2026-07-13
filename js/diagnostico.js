document.addEventListener("DOMContentLoaded", function () {
  const stepEl = document.getElementById("diag-step");
  const navEl = document.querySelector(".diag-nav");
  const backBtn = document.getElementById("btn-back");
  const nextBtn = document.getElementById("btn-next");
  const progressFill = document.getElementById("progress-fill");
  const progressLabel = document.getElementById("progress-label");
  const progressWrap = document.querySelector(".diag-progress-wrap");
  const resultsEl = document.getElementById("diag-results");

  const TOTAL_STEPS = 1 + DIAGNOSTIC_AREAS.length + 1; // segmento + 7 áreas + costo oculto
  const HIDDEN_COST_STEP = 1 + DIAGNOSTIC_AREAS.length; // último paso
  let currentStep = 0; // 0 = segmento, 1..7 = áreas, 8 = costo oculto
  let segmentId = null;
  const answers = {}; // questionId -> optionIndex (preguntas de área)
  const hiddenAnswers = {}; // horas/infodia/facturacion/repse -> optionIndex

  function currentArea() {
    return (currentStep === 0 || currentStep === HIDDEN_COST_STEP) ? null : DIAGNOSTIC_AREAS[currentStep - 1];
  }

  function isStepComplete() {
    if (currentStep === 0) return !!segmentId;
    if (currentStep === HIDDEN_COST_STEP) {
      return HIDDEN_COST_QUESTIONS.every(function (q) { return typeof hiddenAnswers[q.id] === "number"; });
    }
    const area = currentArea();
    return area.questions.every(function (q) { return typeof answers[q.id] === "number"; });
  }

  function renderSegmentStep() {
    let html = '<p class="step-label">Antes de empezar</p><h3 class="diag-question-title">' + SEGMENT_QUESTION.text + "</h3>";
    html += '<div class="diag-options">';
    SEGMENT_QUESTION.options.forEach(function (opt, i) {
      const active = segmentId === opt.segmentId;
      html += '<div class="diag-option' + (active ? " active" : "") + '" data-segment="' + opt.segmentId + '">' + opt.label + "</div>";
    });
    html += "</div>";
    stepEl.innerHTML = html;

    stepEl.querySelectorAll(".diag-option").forEach(function (el) {
      el.addEventListener("click", function () {
        segmentId = el.getAttribute("data-segment");
        renderSegmentStep();
        updateNav();
      });
    });
  }

  function renderAreaStep() {
    const area = currentArea();
    let html = '<p class="step-label">Área ' + currentStep + " de " + DIAGNOSTIC_AREAS.length + "</p>";
    html += '<h3 class="diag-question-title"><i class="ti ' + area.icon + '" aria-hidden="true"></i> ' + area.label + "</h3>";
    area.questions.forEach(function (q) {
      html += '<div class="diag-question-block">';
      html += '<p class="diag-question-text">' + q.text + "</p>";
      html += '<div class="diag-options">';
      q.options.forEach(function (opt, i) {
        const active = answers[q.id] === i;
        html += '<div class="diag-option' + (active ? " active" : "") + '" data-qid="' + q.id + '" data-idx="' + i + '">' + opt.label + "</div>";
      });
      html += "</div></div>";
    });
    stepEl.innerHTML = html;

    stepEl.querySelectorAll(".diag-option").forEach(function (el) {
      el.addEventListener("click", function () {
        const qid = el.getAttribute("data-qid");
        answers[qid] = parseInt(el.getAttribute("data-idx"), 10);
        renderAreaStep();
        updateNav();
      });
    });
  }

  function renderHiddenCostStep() {
    let html = '<p class="step-label">Antes de tu diagnóstico</p><h3 class="diag-question-title">El costo de seguir operando así</h3>';
    html += '<p class="diag-question-intro">Estas 4 preguntas no califican riesgo por área — calculan cuánto te está costando en dinero real seguir sin un sistema operativo.</p>';
    HIDDEN_COST_QUESTIONS.forEach(function (q) {
      html += '<div class="diag-question-block">';
      html += '<p class="diag-question-text">' + q.text + "</p>";
      html += '<div class="diag-options">';
      q.options.forEach(function (opt, i) {
        const active = hiddenAnswers[q.id] === i;
        html += '<div class="diag-option' + (active ? " active" : "") + '" data-hqid="' + q.id + '" data-idx="' + i + '">' + opt.label + "</div>";
      });
      html += "</div></div>";
    });
    stepEl.innerHTML = html;

    stepEl.querySelectorAll(".diag-option").forEach(function (el) {
      el.addEventListener("click", function () {
        const qid = el.getAttribute("data-hqid");
        hiddenAnswers[qid] = parseInt(el.getAttribute("data-idx"), 10);
        renderHiddenCostStep();
        updateNav();
      });
    });
  }

  function renderStep() {
    if (currentStep === 0) renderSegmentStep();
    else if (currentStep === HIDDEN_COST_STEP) renderHiddenCostStep();
    else renderAreaStep();
    progressFill.style.width = Math.round(((currentStep + 1) / (TOTAL_STEPS + 1)) * 100) + "%";
    progressLabel.textContent = "Paso " + (currentStep + 1) + " de " + (TOTAL_STEPS + 1);
    backBtn.disabled = currentStep === 0;
    updateNav();
  }

  function updateNav() {
    nextBtn.disabled = !isStepComplete();
    nextBtn.textContent = currentStep === TOTAL_STEPS - 1 ? "Ver mi diagnóstico" : "Siguiente";
  }

  backBtn.addEventListener("click", function () {
    if (currentStep > 0) {
      currentStep -= 1;
      renderStep();
    }
  });

  nextBtn.addEventListener("click", function () {
    if (!isStepComplete()) return;
    if (currentStep < TOTAL_STEPS - 1) {
      currentStep += 1;
      renderStep();
    } else {
      showResults();
    }
  });

  function riskBadgeClass(level) {
    if (level === "Alto") return "diag-badge-alto";
    if (level === "Medio") return "diag-badge-medio";
    return "diag-badge-bajo";
  }

  function showResults() {
    const seg = SEGMENTS[segmentId];
    const results = DIAGNOSTIC_AREAS.map(function (area) {
      return { area: area, result: computeAreaResult(area, answers) };
    });
    const recommended = results.filter(function (r) { return r.result.recommend; });
    const recommendedCount = recommended.length;

    let totalConGS = 0;
    let totalEquipoPropio = 0;
    recommended.forEach(function (r) {
      const areaObj = AREAS.find(function (a) { return a.id === r.area.id; });
      const price = areaPrice(areaObj, segmentId, recommendedCount, false);
      totalConGS += price;
      totalEquipoPropio += EQUIPO_BASE_COST;
      r.priceMonthly = price;
    });
    let coordFee = 0;
    if (recommendedCount >= seg.coordThreshold) {
      coordFee = coordFeeAmount(segmentId, false);
      totalConGS += coordFee;
    }
    const totalAhorro = totalEquipoPropio - totalConGS;

    // Si ninguna área calificó riesgo medio/alto, usamos Administración como punto de partida
    // (las preguntas de costo oculto son justo sobre administración, pagos y nómina).
    let inversionMensual = totalConGS;
    let inversionEsFallback = false;
    if (recommendedCount === 0) {
      const fallbackArea = AREAS.find(function (a) { return a.id === "administracion"; });
      inversionMensual = areaPrice(fallbackArea, segmentId, 1, false);
      inversionEsFallback = true;
    }

    const hidden = computeHiddenCost(hiddenAnswers);
    const netoPositivo = hidden.costoOcultoMensual >= inversionMensual;
    const delta = netoPositivo ? (hidden.costoOcultoMensual - inversionMensual) : (inversionMensual - hidden.costoOcultoMensual);

    let html = '<div class="compare-hero">';
    html += '<p class="step-label" style="margin-bottom:6px;">Antes de tu diagnóstico por área</p>';
    html += '<h2 style="margin:0 0 18px;">Lo que te cuesta seguir así, contra lo que cuesta resolverlo</h2>';
    html += '<div class="compare-grid">';
    html += '<div class="compare-card chaos">';
    html += '<p class="compare-label">Tu caos actual</p>';
    html += '<p class="compare-amount">' + formatMXN(hidden.costoOcultoMensual) + '<span>/mes</span></p>';
    html += '<p class="compare-sub">Calculado con tus horas resolviendo bomberazos' + (hidden.costoIneficiencia > 0 ? ' y la fuga estimada por decisiones e información con retraso' : '') + '.</p>';
    html += '<div class="chaos-visual" aria-hidden="true"><span class="chaos-note n1">Pagos atrasados</span><span class="chaos-note n2">Info sin actualizar</span><span class="chaos-note n3">Horas apagando fuegos</span></div>';
    html += '</div>';
    html += '<div class="compare-card order">';
    html += '<p class="compare-label">Tu inversión con Sachman</p>';
    html += '<p class="compare-amount">' + formatMXN(inversionMensual) + '<span>/mes</span></p>';
    html += '<p class="compare-sub">' + (inversionEsFallback ? 'Punto de partida sugerido (Administración) — tus 7 áreas salieron en riesgo bajo.' : 'Equipo especializado, procesos probados, tecnología y cumplimiento REPSE incluido.') + '</p>';
    html += '<div class="mini-dashboard" aria-hidden="true">';
    html += '<div class="mini-kpi"><span class="mk-label">Declaraciones a tiempo</span><span class="mk-value">100%</span></div>';
    html += '<div class="mini-kpi"><span class="mk-label">Nómina sin errores</span><span class="mk-value">99%</span></div>';
    html += '<svg class="mini-spark" viewBox="0 0 120 34" preserveAspectRatio="none"><polyline points="0,28 20,24 40,26 60,16 80,18 100,8 120,4" fill="none" stroke-width="2"/><circle cx="120" cy="4" r="3"></circle></svg>';
    html += '</div></div>';
    html += '</div>';
    html += '<p class="compare-delta">' + (netoPositivo
      ? 'Tu operación actual ya te cuesta <strong>' + formatMXN(delta) + '/mes más</strong> que resolverlo con nosotros.'
      : 'La diferencia (' + formatMXN(delta) + '/mes) es la inversión en dejar de operar a ciegas: recuperas tu tiempo, tienes cumplimiento REPSE y visibilidad real.') + '</p>';
    if (hidden.riesgoRepse) {
      html += '<div class="risk-alert"><i class="ti ti-alert-triangle" aria-hidden="true"></i><p>' + REPSE_RISK_TEXT + '</p></div>';
    }
    html += '</div>';

    html += '<div class="diag-results-header">';
    html += "<h2>Detalle por área</h2>";
    html += "<p>Segmento detectado: <strong>" + seg.label + "</strong></p>";
    html += "</div>";

    html += '<div class="diag-results-grid">';
    results.forEach(function (r) {
      const lvl = r.result.level;
      html += '<div class="diag-result-card">';
      html += '<div class="diag-result-top"><h4><i class="ti ' + r.area.icon + '" aria-hidden="true"></i> ' + r.area.label + '</h4><span class="diag-badge ' + riskBadgeClass(lvl) + '">Riesgo ' + lvl + "</span></div>";
      if (r.result.findings.length) {
        html += '<ul class="diag-findings">';
        r.result.findings.forEach(function (f) { html += "<li>" + f + "</li>"; });
        html += "</ul>";
      } else {
        html += '<p class="diag-ok-note">Vas bien en esta área — no es urgente, pero puedes agregarla cuando quieras.</p>';
      }
      if (r.result.recommend) {
        const savings = EQUIPO_BASE_COST - r.priceMonthly;
        const pct = Math.round((savings / EQUIPO_BASE_COST) * 100);
        html += '<div class="diag-cost-box">';
        html += '<p><strong>' + formatMXN(r.priceMonthly) + '/mes</strong> con Grupo Sachman</p>';
        html += '<p class="diag-cost-compare">vs. ' + formatMXN(EQUIPO_BASE_COST) + '/mes armando tu propio equipo mínimo (1 Senior + 1 Jr.)</p>';
        html += '<p class="diag-savings">Ahorras ' + formatMXN(savings) + '/mes (' + pct + '%)</p>';
        html += "</div>";
      }
      html += "</div>";
    });
    html += "</div>";

    if (recommendedCount > 0) {
      html += '<div class="diag-summary-box">';
      html += "<h3>Resumen de lo que te recomendamos contratar</h3>";
      html += "<p>" + recommendedCount + " de 7 áreas mostraron riesgo medio o alto: " + recommended.map(function (r) { return r.area.label; }).join(", ") + ".</p>";
      if (coordFee > 0) {
        html += '<div class="summary-line"><span>Coordinación y gobernanza</span><span>' + formatMXN(coordFee) + "</span></div>";
      }
      html += '<div class="diag-summary-total"><span>Fee mensual estimado (+ IVA)</span><span class="amount">' + formatMXN(totalConGS) + "</span></div>";
      html += '<p class="savings-note" style="display:block;">Ahorro estimado vs. armar tu propio equipo para estas áreas: ' + formatMXN(totalAhorro) + "/mes.</p>";
      const areaIds = recommended.map(function (r) { return r.area.id; }).join(",");
      html += '<a class="btn btn-primary" style="margin-top:14px;" href="cotizador.html?segmento=' + segmentId + "&areas=" + areaIds + '">Ajustar y ver cotización completa</a>';
      html += "</div>";
    } else {
      html += '<div class="diag-summary-box">';
      html += "<h3>Tus 7 áreas salieron en riesgo bajo</h3>";
      html += "<p>No es urgente contratar todavía, pero el costo oculto de arriba no depende del riesgo por área — es tiempo y fricción real. Explora el cotizador cuando quieras ajustar un paquete a la medida.</p>";
      html += '<a class="btn btn-primary" style="margin-top:14px;" href="cotizador.html?segmento=' + segmentId + '">Ver el cotizador de referencia</a>';
      html += "</div>";
    }

    html += '<div class="diag-lead-box">';
    html += "<h3>Recibe este diagnóstico por correo</h3>";
    html += "<p class=\"sub\">Un asesor lo revisa contigo en menos de 24 horas hábiles.</p>";
    html += '<form class="contact-form" id="diag-lead-form">';
    html += '<input type="text" id="d-name" placeholder="Nombre completo" required>';
    html += '<input type="text" id="d-company" placeholder="Empresa (opcional)">';
    html += '<input type="email" id="d-email" placeholder="Correo electrónico" required>';
    html += '<span class="error-text" id="diag-lead-error">Revisa tu nombre y correo electrónico.</span>';
    html += '<button type="submit" class="btn btn-primary">Enviar mi diagnóstico</button>';
    html += "</form>";
    html += '<div id="diag-lead-result" class="hidden" style="margin-top:14px; font-size:13px; color:var(--text-muted);"></div>';
    html += "</div>";

    resultsEl.innerHTML = html;
    resultsEl.classList.remove("hidden");
    stepEl.classList.add("hidden");
    navEl.classList.add("hidden");
    progressWrap.classList.add("hidden");

    document.getElementById("diag-lead-form").addEventListener("submit", function (e) {
      e.preventDefault();
      const name = document.getElementById("d-name").value.trim();
      const email = document.getElementById("d-email").value.trim();
      const company = document.getElementById("d-company").value.trim();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const errorText = document.getElementById("diag-lead-error");
      if (!name || !emailOk) {
        errorText.style.display = "block";
        return;
      }
      errorText.style.display = "none";

      const lines = results.map(function (r) {
        return "- " + r.area.label + ": riesgo " + r.result.level + (r.result.recommend ? " — " + formatMXN(r.priceMonthly) + "/mes (ahorras " + formatMXN(EQUIPO_BASE_COST - r.priceMonthly) + "/mes vs. equipo propio)" : " — sin urgencia");
      });
      const bodyLines = [
        "Segmento: " + seg.label,
        "",
        "Tu caos actual: " + formatMXN(hidden.costoOcultoMensual) + "/mes",
        "Tu inversión con Sachman: " + formatMXN(inversionMensual) + "/mes" + (inversionEsFallback ? " (punto de partida sugerido)" : ""),
        hidden.riesgoRepse ? "Alerta REPSE: " + REPSE_RISK_TEXT : "",
        "",
        "Áreas con riesgo medio/alto: " + (recommendedCount > 0 ? recommended.map(function (r) { return r.area.label; }).join(", ") : "ninguna"),
        "",
        "Detalle por área:",
        lines.join("\n"),
        "",
        recommendedCount > 0 ? "Fee mensual estimado (+ IVA): " + formatMXN(totalConGS) : "",
        recommendedCount > 0 ? "Ahorro estimado vs. equipo propio: " + formatMXN(totalAhorro) + "/mes" : "",
        "",
        "Nombre: " + name,
        "Empresa: " + (company || "N/A"),
        "Correo: " + email
      ].filter(function (l) { return l !== ""; });
      const body = bodyLines.join("\n");

      const resultBox = document.getElementById("diag-lead-result");
      resultBox.classList.remove("hidden");
      resultBox.innerHTML =
        "<p style='white-space:pre-line;'>" + body.replace(/\n/g, "<br>") + "</p>" +
        '<a class="btn btn-primary" href="mailto:ignacio.sachman@livcampus.com?subject=' +
        encodeURIComponent("Diagnóstico operativo - " + seg.label) +
        "&body=" + encodeURIComponent(body) + '">Enviar por correo</a>';
    });
  }

  renderStep();
});

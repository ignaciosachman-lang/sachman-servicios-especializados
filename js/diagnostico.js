document.addEventListener("DOMContentLoaded", function () {
  const stepEl = document.getElementById("diag-step");
  const navEl = document.querySelector(".diag-nav");
  const backBtn = document.getElementById("btn-back");
  const nextBtn = document.getElementById("btn-next");
  const progressFill = document.getElementById("progress-fill");
  const progressLabel = document.getElementById("progress-label");
  const progressWrap = document.querySelector(".diag-progress-wrap");
  const resultsEl = document.getElementById("diag-results");

  const LIGHT_TOTAL = 3; // dolor, horas, crecimiento
  let phase = "light"; // "light" (sin gate) -> "full" (con gate, el flujo completo)
  let lightStep = 0;
  const lightAnswers = {}; // painArea: areaId|"ninguna", horas: idx, crecimiento: idx

  const AREA_OFFSET = 2; // pasos 0=contacto, 1=segmento, así que el área empieza en el paso 2
  const TOTAL_STEPS = AREA_OFFSET + DIAGNOSTIC_AREAS.length + 1; // contacto + segmento + 7 áreas + costo oculto
  const SEGMENT_STEP = 1;
  const HIDDEN_COST_STEP = AREA_OFFSET + DIAGNOSTIC_AREAS.length; // último paso
  let currentStep = 0; // 0 = contacto, 1 = segmento, 2..8 = áreas, 9 = costo oculto
  let segmentId = null;
  let leadName = "";
  let leadEmail = "";
  let leadPhone = "";
  const answers = {}; // questionId -> optionIndex (preguntas de área)
  const hiddenAnswers = {}; // infodia/facturacion/plantilla/modalidad -> optionIndex

  function isLightStepComplete() {
    if (lightStep === 0) return typeof lightAnswers.painArea !== "undefined";
    if (lightStep === 1) return typeof lightAnswers.horas === "number";
    if (lightStep === 2) return typeof lightAnswers.crecimiento === "number";
    return false;
  }

  function renderLightStep() {
    let html = "";
    if (lightStep === 0) {
      html += '<p class="step-label">Identifiquemos el dolor primero</p><h3 class="diag-question-title">¿Cuál de estas áreas te quita más el sueño hoy?</h3>';
      html += '<div class="diag-options">';
      DIAGNOSTIC_AREAS.forEach(function (area) {
        const active = lightAnswers.painArea === area.id;
        html += '<div class="diag-option' + (active ? " active" : "") + '" data-pain="' + area.id + '"><i class="ti ' + area.icon + '" aria-hidden="true" style="margin-right:8px;"></i>' + area.label + "</div>";
      });
      const activeNone = lightAnswers.painArea === "ninguna";
      html += '<div class="diag-option' + (activeNone ? " active" : "") + '" data-pain="ninguna">No sé, todo se siente desordenado</div>';
      html += "</div>";
    } else if (lightStep === 1) {
      html += '<p class="step-label">Paso 2 de 3</p><h3 class="diag-question-title">' + LIGHT_HOURS_QUESTION.text + "</h3>";
      html += '<div class="diag-options">';
      LIGHT_HOURS_QUESTION.options.forEach(function (opt, i) {
        const active = lightAnswers.horas === i;
        html += '<div class="diag-option' + (active ? " active" : "") + '" data-light="horas" data-idx="' + i + '">' + opt.label + "</div>";
      });
      html += "</div>";
    } else if (lightStep === 2) {
      html += '<p class="step-label">Paso 3 de 3</p><h3 class="diag-question-title">' + LIGHT_GROWTH_QUESTION.text + "</h3>";
      html += '<div class="diag-options">';
      LIGHT_GROWTH_QUESTION.options.forEach(function (opt, i) {
        const active = lightAnswers.crecimiento === i;
        html += '<div class="diag-option' + (active ? " active" : "") + '" data-light="crecimiento" data-idx="' + i + '">' + opt.label + "</div>";
      });
      html += "</div>";
    }
    stepEl.innerHTML = html;

    stepEl.querySelectorAll(".diag-option[data-pain]").forEach(function (el) {
      el.addEventListener("click", function () {
        lightAnswers.painArea = el.getAttribute("data-pain");
        renderLightStep();
        updateNav();
      });
    });
    stepEl.querySelectorAll(".diag-option[data-light]").forEach(function (el) {
      el.addEventListener("click", function () {
        const key = el.getAttribute("data-light");
        lightAnswers[key] = parseInt(el.getAttribute("data-idx"), 10);
        renderLightStep();
        updateNav();
      });
    });
  }

  function currentArea() {
    return (currentStep < AREA_OFFSET || currentStep === HIDDEN_COST_STEP) ? null : DIAGNOSTIC_AREAS[currentStep - AREA_OFFSET];
  }

  function isStepComplete() {
    if (currentStep === 0) {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadEmail.trim());
      const phoneDigits = leadPhone.replace(/\D/g, "");
      return leadName.trim().length > 1 && emailOk && phoneDigits.length >= 10;
    }
    if (currentStep === SEGMENT_STEP) return !!segmentId;
    if (currentStep === HIDDEN_COST_STEP) {
      return HIDDEN_COST_QUESTIONS.every(function (q) { return typeof hiddenAnswers[q.id] === "number"; });
    }
    const area = currentArea();
    return area.questions.every(function (q) { return typeof answers[q.id] === "number"; });
  }

  function renderGateStep() {
    let html = '<p class="step-label">Antes de empezar</p><h3 class="diag-question-title">¿A dónde te enviamos tu diagnóstico?</h3>';
    html += '<p class="diag-question-intro">Lo necesitamos para enviarte tu resultado personalizado y que un asesor te contacte en menos de 24 horas hábiles.</p>';
    html += '<div class="contact-form">';
    html += '<input type="text" id="g-name" placeholder="Nombre completo" value="' + leadName.replace(/"/g, "&quot;") + '">';
    html += '<input type="email" id="g-email" placeholder="Correo electrónico" value="' + leadEmail.replace(/"/g, "&quot;") + '">';
    html += '<input type="tel" id="g-phone" placeholder="Celular / WhatsApp (10 dígitos)" value="' + leadPhone.replace(/"/g, "&quot;") + '">';
    html += "</div>";
    stepEl.innerHTML = html;

    const nameEl = document.getElementById("g-name");
    const emailEl = document.getElementById("g-email");
    const phoneEl = document.getElementById("g-phone");
    [nameEl, emailEl, phoneEl].forEach(function (el) {
      el.addEventListener("input", function () {
        leadName = nameEl.value;
        leadEmail = emailEl.value;
        leadPhone = phoneEl.value;
        updateNav();
      });
    });
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
    let html = '<p class="step-label">Área ' + (currentStep - AREA_OFFSET + 1) + " de " + DIAGNOSTIC_AREAS.length + "</p>";
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
    if (phase === "light") {
      renderLightStep();
      progressFill.style.width = Math.round(((lightStep + 1) / LIGHT_TOTAL) * 100) + "%";
      progressLabel.textContent = "Paso " + (lightStep + 1) + " de " + LIGHT_TOTAL;
      backBtn.disabled = lightStep === 0;
      updateNav();
      return;
    }
    if (currentStep === 0) renderGateStep();
    else if (currentStep === SEGMENT_STEP) renderSegmentStep();
    else if (currentStep === HIDDEN_COST_STEP) renderHiddenCostStep();
    else renderAreaStep();
    progressFill.style.width = Math.round(((currentStep + 1) / (TOTAL_STEPS + 1)) * 100) + "%";
    progressLabel.textContent = "Paso " + (currentStep + 1) + " de " + (TOTAL_STEPS + 1);
    backBtn.disabled = currentStep === 0;
    updateNav();
  }

  function updateNav() {
    if (phase === "light") {
      nextBtn.disabled = !isLightStepComplete();
      nextBtn.textContent = lightStep === LIGHT_TOTAL - 1 ? "Ver diagnóstico ligero" : "Siguiente";
      return;
    }
    nextBtn.disabled = !isStepComplete();
    nextBtn.textContent = currentStep === TOTAL_STEPS - 1 ? "Ver mi diagnóstico" : "Siguiente";
  }

  backBtn.addEventListener("click", function () {
    if (phase === "light") {
      if (lightStep > 0) {
        lightStep -= 1;
        renderStep();
      }
      return;
    }
    if (currentStep > 0) {
      currentStep -= 1;
      renderStep();
    }
  });

  nextBtn.addEventListener("click", function () {
    if (phase === "light") {
      if (!isLightStepComplete()) return;
      if (lightStep < LIGHT_TOTAL - 1) {
        lightStep += 1;
        renderStep();
      } else {
        showLightResults();
      }
      return;
    }
    if (!isStepComplete()) return;
    if (currentStep === 0) {
      submitLeadToFormspree({
        nombre: leadName.trim(),
        correo: leadEmail.trim(),
        celular: leadPhone.trim(),
        etapa: "Inicio de diagnóstico",
        origen: "diagnostico.html"
      });
    }
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

  function showLightResults() {
    const painArea = (lightAnswers.painArea && lightAnswers.painArea !== "ninguna")
      ? DIAGNOSTIC_AREAS.find(function (a) { return a.id === lightAnswers.painArea; })
      : null;
    const horasOpt = LIGHT_HOURS_QUESTION.options[lightAnswers.horas];
    const costoTiempo = horasOpt.hours * 4 * DIRECTOR_HOURLY_RATE;
    const creceOpt = LIGHT_GROWTH_QUESTION.options[lightAnswers.crecimiento];

    let html = '<div class="compare-hero light-hero">';
    html += '<p class="step-label" style="margin-bottom:6px; color:#cdd8e3;">Diagnóstico ligero</p>';
    html += '<h2 style="margin:0 0 16px;">Esto detectamos con 3 preguntas</h2>';
    if (painArea) {
      html += '<p class="light-pain"><i class="ti ' + painArea.icon + '" aria-hidden="true"></i> Tu prioridad hoy: <strong>' + painArea.label + '</strong></p>';
    }
    html += '<p class="light-cost">Solo en tiempo resolviendo problemas en vez de dirigir, tu operación pierde aprox. <strong>' + formatMXN(costoTiempo) + '/mes</strong>.</p>';
    if (creceOpt.crece) {
      html += '<div class="risk-alert"><i class="ti ti-trending-up" aria-hidden="true"></i><p>' + GROWTH_WARNING_TEXT + '</p></div>';
    }
    html += '<a class="btn btn-primary" id="btn-full-diagnostic" style="margin-top:20px;">Ver mi diagnóstico completo (5 min) →</a>';
    html += "</div>";

    resultsEl.innerHTML = html;
    resultsEl.classList.remove("hidden");
    stepEl.classList.add("hidden");
    navEl.classList.add("hidden");
    progressWrap.classList.add("hidden");

    document.getElementById("btn-full-diagnostic").addEventListener("click", function () {
      phase = "full";
      currentStep = 0;
      resultsEl.classList.add("hidden");
      resultsEl.innerHTML = "";
      stepEl.classList.remove("hidden");
      navEl.classList.remove("hidden");
      progressWrap.classList.remove("hidden");
      renderStep();
      window.scrollTo(0, 0);
    });
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

    const horasSemana = LIGHT_HOURS_QUESTION.options[lightAnswers.horas].hours;
    const hidden = computeHiddenCost(hiddenAnswers, horasSemana);
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

    if (hidden.personasPlantilla > 0) {
      const creceOpt = LIGHT_GROWTH_QUESTION.options[lightAnswers.crecimiento];
      html += '<div class="plantilla-panel">';
      html += '<h3>Tu plantilla administrativa actual</h3>';
      html += '<p>Con ' + (hidden.personasPlantilla % 1 === 0 ? hidden.personasPlantilla : '~' + hidden.personasPlantilla) + ' personas dedicadas a esto, tu costo fijo de nómina + carga social es de aprox. <strong>' + formatMXN(hidden.costoPlantilla) + '/mes</strong> — antes de contar vacaciones, IMSS o rotación.</p>';
      if (creceOpt && creceOpt.crece) {
        html += '<p class="plantilla-growth-note">' + GROWTH_WARNING_TEXT + '</p>';
      }
      html += '</div>';
    }

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
    html += "<h3>Recibe este diagnóstico completo por correo</h3>";
    html += "<p class=\"sub\">Ya tenemos tu contacto (" + leadEmail + ") — confirma tu empresa y te lo enviamos. Un asesor lo revisa contigo en menos de 24 horas hábiles.</p>";
    html += '<div class="contact-form">';
    html += '<input type="text" id="d-company" placeholder="Empresa (opcional)">';
    html += '<button type="button" class="btn btn-primary" id="diag-send-btn">Enviar mi diagnóstico</button>';
    html += "</div>";
    html += '<div id="diag-lead-result" class="hidden" style="margin-top:14px; font-size:13px; color:var(--text-muted);"></div>';
    html += "</div>";

    resultsEl.innerHTML = html;
    resultsEl.classList.remove("hidden");
    stepEl.classList.add("hidden");
    navEl.classList.add("hidden");
    progressWrap.classList.add("hidden");

    document.getElementById("diag-send-btn").addEventListener("click", function () {
      const name = leadName.trim();
      const email = leadEmail.trim();
      const phone = leadPhone.trim();
      const company = document.getElementById("d-company").value.trim();

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
        "Correo: " + email,
        "Celular: " + phone
      ].filter(function (l) { return l !== ""; });
      const body = bodyLines.join("\n");

      submitLeadToFormspree({
        nombre: name,
        correo: email,
        celular: phone,
        empresa: company || "N/A",
        etapa: "Diagnóstico completo",
        segmento: seg.label,
        tu_caos_actual: formatMXN(hidden.costoOcultoMensual) + "/mes",
        tu_inversion: formatMXN(inversionMensual) + "/mes",
        resumen: body
      });

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

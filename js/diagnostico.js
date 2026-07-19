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
  const lightAnswers = {}; // painAreas: [areaId,...]|["ninguna"], horas: idx, crecimiento: idx

  const AREA_OFFSET = 2; // pasos 0=contacto, 1=segmento, así que el área empieza en el paso 2
  const SEGMENT_STEP = 1;
  const HIDDEN_COST_STEP = AREA_OFFSET + DIAGNOSTIC_AREAS.length; // paso del costo oculto
  const BONUS_STEP = HIDDEN_COST_STEP + 1; // ronda bonus sobre áreas no marcadas (solo si hay alguna)
  let currentStep = 0; // 0 = contacto, 1 = segmento, 2..8 = áreas, 9 = costo oculto, 10 = bonus
  let segmentId = null;
  let leadName = "";
  let leadEmail = "";
  let leadPhone = "";
  const answers = {}; // questionId -> optionIndex (preguntas de área, incluye las de la ronda bonus)
  const hiddenAnswers = {}; // infodia/facturacion/plantilla/modalidad -> optionIndex

  function isPainArea(areaId) {
    return (lightAnswers.painAreas || []).indexOf(areaId) >= 0;
  }
  function markedAreaList() {
    return DIAGNOSTIC_AREAS.filter(function (a) { return isPainArea(a.id); });
  }
  function unmarkedAreaList() {
    return DIAGNOSTIC_AREAS.filter(function (a) { return !isPainArea(a.id); });
  }
  function hasBonusStep() {
    return unmarkedAreaList().length > 0;
  }
  function totalStepsCount() {
    return AREA_OFFSET + DIAGNOSTIC_AREAS.length + 1 + (hasBonusStep() ? 1 : 0);
  }
  function bonusQuestionFor(area) {
    return area.questions[1] || area.questions[0];
  }

  function isLightStepComplete() {
    if (lightStep === 0) return Array.isArray(lightAnswers.painAreas) && lightAnswers.painAreas.length > 0;
    if (lightStep === 1) return typeof lightAnswers.horas === "number";
    if (lightStep === 2) return typeof lightAnswers.crecimiento === "number";
    return false;
  }

  function renderLightStep() {
    let html = "";
    if (lightStep === 0) {
      html += '<p class="step-label">Identifiquemos el dolor primero</p><h3 class="diag-question-title">¿Cuáles de estas áreas te quitan más el sueño hoy?</h3><p class="diag-question-intro">Puedes elegir más de una — en esas nos detendremos más; en las demás iremos rápido.</p>';
      html += '<div class="diag-options">';
      DIAGNOSTIC_AREAS.forEach(function (area) {
        const active = (lightAnswers.painAreas || []).indexOf(area.id) >= 0;
        html += '<div class="diag-option' + (active ? " active" : "") + '" data-pain="' + area.id + '"><i class="ti ' + area.icon + '" aria-hidden="true" style="margin-right:8px;"></i>' + area.label + "</div>";
      });
      const activeNone = (lightAnswers.painAreas || []).indexOf("ninguna") >= 0;
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
        const val = el.getAttribute("data-pain");
        if (!Array.isArray(lightAnswers.painAreas)) lightAnswers.painAreas = [];
        if (val === "ninguna") {
          lightAnswers.painAreas = lightAnswers.painAreas.indexOf("ninguna") >= 0 ? [] : ["ninguna"];
        } else {
          lightAnswers.painAreas = lightAnswers.painAreas.filter(function (v) { return v !== "ninguna"; });
          const idx = lightAnswers.painAreas.indexOf(val);
          if (idx >= 0) lightAnswers.painAreas.splice(idx, 1);
          else lightAnswers.painAreas.push(val);
        }
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
    return (currentStep < AREA_OFFSET || currentStep === HIDDEN_COST_STEP || currentStep === BONUS_STEP) ? null : DIAGNOSTIC_AREAS[currentStep - AREA_OFFSET];
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
    if (currentStep === BONUS_STEP) {
      return unmarkedAreaList().every(function (area) { return typeof answers[bonusQuestionFor(area).id] === "number"; });
    }
    const area = currentArea();
    const qs = isPainArea(area.id) ? area.questions : [area.questions[0]];
    return qs.every(function (q) { return typeof answers[q.id] === "number"; });
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
    const deep = isPainArea(area.id);
    const questionsToShow = deep ? area.questions : [area.questions[0]];
    let html = '<p class="step-label">Área ' + (currentStep - AREA_OFFSET + 1) + " de " + DIAGNOSTIC_AREAS.length + "</p>";
    html += '<div class="area-badge ' + (deep ? "deep" : "quick") + '">' + (deep ? "Profundizando — la marcaste como prioridad" : "Revisión rápida") + "</div>";
    html += '<h3 class="diag-question-title"><i class="ti ' + area.icon + '" aria-hidden="true"></i> ' + area.label + "</h3>";
    if (!deep) html += '<p class="diag-question-intro">No la marcaste al inicio, así que vamos rápido con una sola pregunta.</p>';
    questionsToShow.forEach(function (q) {
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

  function renderBonusStep() {
    const unmarked = unmarkedAreaList();
    let html = '<p class="step-label">Última ronda</p><h3 class="diag-question-title">Unas últimas preguntas rápidas</h3>';
    html += '<p class="diag-question-intro">Sobre las áreas que no marcaste al inicio — para detectar si hay algo ahí que valga la pena revisar.</p>';
    unmarked.forEach(function (area) {
      const q = bonusQuestionFor(area);
      html += '<div class="diag-question-block">';
      html += '<p class="diag-question-text"><i class="ti ' + area.icon + '" aria-hidden="true" style="margin-right:6px;"></i>' + q.text + "</p>";
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
        renderBonusStep();
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
    else if (currentStep === BONUS_STEP) renderBonusStep();
    else renderAreaStep();
    const total = totalStepsCount();
    progressFill.style.width = Math.round(((currentStep + 1) / (total + 1)) * 100) + "%";
    progressLabel.textContent = "Paso " + (currentStep + 1) + " de " + (total + 1);
    backBtn.disabled = false;
    updateNav();
  }

  function updateNav() {
    if (phase === "light") {
      nextBtn.disabled = !isLightStepComplete();
      nextBtn.textContent = lightStep === LIGHT_TOTAL - 1 ? "Ver diagnóstico ligero" : "Siguiente";
      return;
    }
    nextBtn.disabled = !isStepComplete();
    const isLastStep = currentStep === HIDDEN_COST_STEP ? !hasBonusStep() : currentStep === BONUS_STEP;
    nextBtn.textContent = isLastStep ? "Ver mi diagnóstico" : "Siguiente";
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
      return;
    }
    // currentStep === 0 (gate): no hay paso previo dentro de la fase completa,
    // regresamos al teaser del diagnóstico ligero en vez de dejar el botón sin efecto.
    phase = "light";
    showLightResults();
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
    if (currentStep === HIDDEN_COST_STEP) {
      if (hasBonusStep()) currentStep = BONUS_STEP;
      else { showResults(); return; }
    } else if (currentStep === BONUS_STEP) {
      showResults();
      return;
    } else {
      currentStep += 1;
    }
    renderStep();
  });

  function riskBadgeClass(level) {
    if (level === "Alto") return "diag-badge-alto";
    if (level === "Medio") return "diag-badge-medio";
    return "diag-badge-bajo";
  }

  function showLightResults() {
    const painAreaIds = (lightAnswers.painAreas || []).filter(function (v) { return v !== "ninguna"; });
    const painAreas = painAreaIds
      .map(function (id) { return DIAGNOSTIC_AREAS.find(function (a) { return a.id === id; }); })
      .filter(Boolean);
    const horasOpt = LIGHT_HOURS_QUESTION.options[lightAnswers.horas];
    const costoTiempo = horasOpt.hours * 4 * DIRECTOR_HOURLY_RATE;
    const creceOpt = LIGHT_GROWTH_QUESTION.options[lightAnswers.crecimiento];

    let html = '<div class="compare-hero light-hero">';
    html += '<p class="step-label" style="margin-bottom:6px; color:#cdd8e3;">Diagnóstico ligero</p>';
    html += '<h2 style="margin:0 0 16px;">Esto detectamos con 3 preguntas</h2>';
    if (painAreas.length) {
      const painLabels = painAreas.map(function (a) { return a.label; }).join(", ");
      html += '<p class="light-pain"><i class="ti ' + painAreas[0].icon + '" aria-hidden="true"></i> ' + (painAreas.length > 1 ? "Tus prioridades hoy: " : "Tu prioridad hoy: ") + '<strong>' + painLabels + '</strong></p>';
    }
    html += '<p class="light-cost">Solo en tiempo resolviendo problemas en vez de dirigir, tu operación pierde aprox. <strong>' + formatMXN(costoTiempo) + '/mes</strong>.</p>';
    if (creceOpt.crece) {
      html += '<div class="risk-alert"><i class="ti ti-trending-up" aria-hidden="true"></i><p>' + GROWTH_WARNING_TEXT + '</p></div>';
    }
    const waMsgLight = "Hola, hice el diagnóstico ligero en el sitio" + (painAreas.length ? " y quiero platicar sobre " + painAreas.map(function (a) { return a.label; }).join(", ") : "") + ", ¿me pueden contactar?";
    html += '<div class="wa-cta-row" style="margin-top:20px;">';
    html += '<a class="btn btn-primary" id="btn-full-diagnostic">Ver mi diagnóstico completo (5 min) →</a>';
    html += '<a class="btn btn-outline" href="' + whatsappLink(waMsgLight) + '" target="_blank" rel="noopener"><i class="ti ti-brand-whatsapp" aria-hidden="true"></i> Prefiero WhatsApp</a>';
    html += "</div>";
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
    const marked = markedAreaList();
    const unmarked = unmarkedAreaList();

    const results = DIAGNOSTIC_AREAS.map(function (area) {
      const deep = isPainArea(area.id);
      const qIds = deep
        ? area.questions.map(function (q) { return q.id; })
        : [area.questions[0].id, bonusQuestionFor(area).id];
      const result = computeAreaResultForQuestions(area, answers, qIds);
      return { area: area, result: result, deep: deep };
    });

    const horasSemana = LIGHT_HOURS_QUESTION.options[lightAnswers.horas].hours;
    const hidden = computeHiddenCost(hiddenAnswers, horasSemana);
    const creceOpt = LIGHT_GROWTH_QUESTION.options[lightAnswers.crecimiento];

    // Riesgo legal (cualitativo, no en pesos): se apoya en el riesgo REPSE y en las áreas de
    // cumplimiento (Contabilidad/RRHH/Administración — SAT, IMSS, INFONAVIT).
    const complianceIds = ["contabilidad", "rrhh", "administracion"];
    const complianceResults = results.filter(function (r) { return complianceIds.indexOf(r.area.id) >= 0; });
    const complianceAlto = complianceResults.filter(function (r) { return r.result.level === "Alto"; });
    const complianceMedio = complianceResults.filter(function (r) { return r.result.level === "Medio"; });
    let riesgoLegalLevel = "Bajo";
    if (hidden.riesgoRepse || complianceAlto.length > 0) riesgoLegalLevel = "Alto";
    else if (complianceMedio.length > 0) riesgoLegalLevel = "Medio";
    const riesgoLegalNotas = [];
    if (hidden.riesgoRepse) riesgoLegalNotas.push(REPSE_RISK_TEXT);
    complianceAlto.concat(complianceMedio).forEach(function (r) {
      if (r.result.findings.length) riesgoLegalNotas.push(r.result.findings[0]);
    });
    if (!riesgoLegalNotas.length) riesgoLegalNotas.push("No detectamos señales claras de riesgo legal/fiscal con lo que contestaste — sigue siendo bueno validarlo con un especialista de vez en cuando.");

    // Crecimiento (cualitativo, no en pesos).
    const crecimientoEnRiesgo = !!(creceOpt && creceOpt.crece);

    // Señales detectadas: áreas no marcadas que, con la pregunta rápida + la de la ronda bonus,
    // salieron en riesgo medio o alto — candidatas a explorar aunque el cliente no las haya marcado.
    const signals = results.filter(function (r) { return !r.deep && r.result.recommend; });

    let html = '<div class="compare-hero">';
    html += '<p class="step-label" style="margin-bottom:6px;">Tu diagnóstico' + (seg ? " · " + seg.label : "") + '</p>';
    html += '<h2 style="margin:0 0 18px;">Esto es lo que encontramos en tu operación</h2>';

    html += '<div class="dimension-grid">';
    html += '<div class="dimension-tile"><p class="dt-label">Tiempo</p><p class="dt-value">' + formatMXN(hidden.costoTiempo) + '<span>/mes</span></p><p class="dt-note">resolviendo problemas en vez de dirigir</p></div>';
    html += '<div class="dimension-tile"><p class="dt-label">Dinero</p><p class="dt-value">' + formatMXN(hidden.costoIneficiencia) + '<span>/mes</span></p><p class="dt-note">' + (hidden.costoIneficiencia > 0 ? "en fugas por decisiones e información con retraso" : "sin fuga estimada con lo que contestaste") + '</p></div>';
    html += '<div class="dimension-tile"><p class="dt-label">Riesgo legal</p><p class="dt-value dt-chip ' + riskBadgeClass(riesgoLegalLevel) + '">' + riesgoLegalLevel + '</p><p class="dt-note">SAT · IMSS · INFONAVIT</p></div>';
    html += '<div class="dimension-tile"><p class="dt-label">Crecimiento</p><p class="dt-value dt-chip ' + (crecimientoEnRiesgo ? "diag-badge-medio" : "diag-badge-bajo") + '">' + (crecimientoEnRiesgo ? "Atención" : "Controlado") + '</p><p class="dt-note">' + (crecimientoEnRiesgo ? "vas a crecer y esto se multiplica" : "estable por ahora") + "</p></div>";
    html += "</div>";

    if (hidden.riesgoRepse || riesgoLegalNotas.length) {
      html += '<div class="risk-alert" style="margin-top:18px;"><i class="ti ti-alert-triangle" aria-hidden="true"></i><p>' + riesgoLegalNotas[0] + "</p></div>";
    }
    if (crecimientoEnRiesgo) {
      html += '<div class="risk-alert"><i class="ti ti-trending-up" aria-hidden="true"></i><p>' + GROWTH_WARNING_TEXT + "</p></div>";
    }

    if (hidden.personasPlantilla > 0) {
      html += '<div class="plantilla-panel">';
      html += "<h3>Tu plantilla administrativa actual</h3>";
      html += "<p>Con " + (hidden.personasPlantilla % 1 === 0 ? hidden.personasPlantilla : "~" + hidden.personasPlantilla) + " personas dedicadas a esto, tu costo fijo de nómina + carga social es de aprox. <strong>" + formatMXN(hidden.costoPlantilla) + "/mes</strong> — antes de contar vacaciones, IMSS o rotación.</p>";
      html += "</div>";
    }
    html += "</div>";

    html += '<div class="diag-results-header">';
    html += "<h2>Detalle por área</h2>";
    html += "</div>";

    html += '<div class="diag-results-grid">';
    results.forEach(function (r) {
      const lvl = r.result.level;
      html += '<div class="diag-result-card">';
      html += '<div class="diag-result-top"><h4><i class="ti ' + r.area.icon + '" aria-hidden="true"></i> ' + r.area.label + '</h4><span class="diag-badge ' + riskBadgeClass(lvl) + '">Riesgo ' + lvl + "</span></div>";
      if (!r.deep) html += '<p class="diag-ok-note" style="margin-bottom:8px;"><i class="ti ti-bolt" aria-hidden="true"></i> Revisión rápida — no la marcaste como prioridad</p>';
      if (r.result.findings.length) {
        html += '<ul class="diag-findings">';
        r.result.findings.forEach(function (f) { html += "<li>" + f + "</li>"; });
        html += "</ul>";
      } else {
        html += '<p class="diag-ok-note">Vas bien en esta área — no es urgente, pero puedes profundizar cuando quieras.</p>';
      }
      html += "</div>";
    });
    html += "</div>";

    if (signals.length) {
      html += '<div class="signals-box">';
      html += '<p class="signals-title"><i class="ti ti-bulb" aria-hidden="true"></i> Señales detectadas</p>';
      signals.forEach(function (r) {
        html += '<p class="signals-line">' + r.area.label + ": con lo que contestaste, esta área también podría estar costándote más de lo que crees — vale la pena revisarla.</p>";
      });
      html += "</div>";
    }

    const areasRiesgo = results.filter(function (r) { return r.result.level !== "Bajo"; }).map(function (r) { return r.area.label; });

    html += '<div class="diag-summary-box">';
    html += "<h3>¿Qué sigue?</h3>";
    html += "<p>" + (areasRiesgo.length
      ? "Detectamos riesgo medio o alto en " + areasRiesgo.length + " de 7 áreas: " + areasRiesgo.join(", ") + ". Un asesor revisa esto contigo y te da precio y alcance a la medida — sin compromiso."
      : "Tus áreas salieron en riesgo bajo, pero el costo de tiempo y dinero de arriba es real. Un asesor puede orientarte sobre por dónde empezar.") + "</p>";
    html += '<a class="btn btn-primary" style="margin-top:14px;" href="' + whatsappLink("Hola, ya vi mi diagnóstico operativo" + (seg ? " (segmento " + seg.label + ")" : "") + " y quiero platicar con un asesor sobre precio y alcance.") + '" target="_blank" rel="noopener">Platicar con un asesor sobre precio y alcance</a>';
    html += "</div>";

    // Ya tenemos nombre, correo y celular desde el paso inicial — el registro se envía
    // en automático, sin depender de que la persona haga clic en nada más.
    const summaryLines = results.map(function (r) {
      return "- " + r.area.label + ": riesgo " + r.result.level + (r.deep ? "" : " (revisión rápida)") + (r.result.findings.length ? " — " + r.result.findings[0] : "");
    });
    const summaryBodyLines = [
      "Segmento: " + (seg ? seg.label : "no indicado"),
      "",
      "Costo en tiempo: " + formatMXN(hidden.costoTiempo) + "/mes",
      "Costo en dinero (fuga por info/decisiones tardías): " + formatMXN(hidden.costoIneficiencia) + "/mes",
      "Riesgo legal (SAT/IMSS/INFONAVIT): " + riesgoLegalLevel,
      "Crecimiento: " + (crecimientoEnRiesgo ? "en riesgo — planea crecer en los próximos 12 meses" : "controlado"),
      hidden.riesgoRepse ? "Alerta REPSE: " + REPSE_RISK_TEXT : "",
      "",
      "Áreas marcadas como prioridad por el cliente: " + (marked.length ? marked.map(function (a) { return a.label; }).join(", ") : "ninguna"),
      "Áreas con riesgo medio/alto: " + (areasRiesgo.length ? areasRiesgo.join(", ") : "ninguna"),
      signals.length ? "Señales de cross-sell (no marcadas, riesgo detectado): " + signals.map(function (r) { return r.area.label; }).join(", ") : "",
      "",
      "Detalle por área:",
      summaryLines.join("\n"),
      "",
      "Nombre: " + leadName.trim(),
      "Correo: " + leadEmail.trim(),
      "Celular: " + leadPhone.trim()
    ].filter(function (l) { return l !== ""; });
    const summaryBody = summaryBodyLines.join("\n");

    submitLeadToFormspree({
      nombre: leadName.trim(),
      correo: leadEmail.trim(),
      celular: leadPhone.trim(),
      etapa: "Diagnóstico completo",
      segmento: seg ? seg.label : "",
      costo_tiempo: formatMXN(hidden.costoTiempo) + "/mes",
      costo_dinero: formatMXN(hidden.costoIneficiencia) + "/mes",
      riesgo_legal: riesgoLegalLevel,
      resumen: summaryBody
    });

    const mailtoBase = "mailto:ignacio.sachman@livcampus.com?subject=" + encodeURIComponent("Diagnóstico operativo" + (seg ? " - " + seg.label : "")) + "&body=";

    html += '<div class="diag-lead-box">';
    html += "<h3>¿Quieres una copia en tu correo?</h3>";
    html += "<p class=\"sub\">Ya le avisamos a nuestro equipo con tus datos — un asesor te contacta en menos de 24 horas hábiles. Esto de aquí es opcional, solo si además quieres guardarte una copia.</p>";
    html += '<div class="contact-form">';
    html += '<input type="text" id="d-company" placeholder="Empresa (opcional, se incluye en tu copia)">';
    html += '<a class="btn btn-primary" id="diag-send-btn" href="' + mailtoBase + encodeURIComponent(summaryBody) + '">Enviarme una copia por correo</a>';
    html += "</div>";
    html += "</div>";

    const waMsgFull = "Hola, ya completé mi diagnóstico operativo" + (seg ? " (segmento " + seg.label + ")" : "") + " y me gustaría agendar una llamada.";
    html += '<p class="wa-note"><a href="' + whatsappLink(waMsgFull) + '" target="_blank" rel="noopener"><i class="ti ti-brand-whatsapp" aria-hidden="true"></i> ¿Prefieres hablar ya? Escríbenos por WhatsApp</a></p>';

    resultsEl.innerHTML = html;
    resultsEl.classList.remove("hidden");
    stepEl.classList.add("hidden");
    navEl.classList.add("hidden");
    progressWrap.classList.add("hidden");

    document.getElementById("d-company").addEventListener("input", function (e) {
      const company = e.target.value.trim();
      const bodyWithCompany = company ? summaryBody + "\nEmpresa: " + company : summaryBody;
      document.getElementById("diag-send-btn").href = mailtoBase + encodeURIComponent(bodyWithCompany);
    });
  }

  renderStep();
});

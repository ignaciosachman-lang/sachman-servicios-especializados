// Motor de datos del diagnóstico operativo gratuito.
// Cada área tiene 3-5 preguntas de opción múltiple; cada opción tiene un nivel de riesgo
// (bajo/medio/alto) y, si aplica, un "hallazgo" explicando el riesgo concreto.
// El resultado por área es un promedio de riesgo (0=bajo,1=medio,2=alto) que se traduce
// a un nivel y a una recomendación de contratar o no esa área.

const EQUIPO_BASE_COST = 67900; // costo fijo mensual de armar tu propio equipo mínimo (1 Sr + 1 Jr) por área
const DIRECTOR_HOURLY_RATE = 700; // MXN/hora — valor de referencia de la hora de quien dirige
const INEFICIENCIA_RATE = 0.02; // % de la facturación mensual que se estima como fuga por decisiones/cobranza tardías
const ADMIN_STAFF_COST_PER_PERSON = 19500; // MXN/mes cargado (sueldo + carga social) por persona administrativa — mismo supuesto "Auxiliar" de los manuales de área
const GROWTH_WARNING_TEXT = "Cuando creces, la tentación es contratar más gente — cada persona nueva agrega cargas fijas de nómina (IMSS, INFONAVIT, aguinaldo, prima vacacional) sin importar si el crecimiento es temporal. Con un servicio como el nuestro, la capacidad escala contigo sin ese compromiso fijo.";

// ---- Etapa 1: diagnóstico ligero (sin gate, 3 preguntas) ----

const LIGHT_HOURS_QUESTION = {
  id: "horas",
  text: "¿Cuántas horas a la semana pasas resolviendo problemas de administración, pagos o nóminas?",
  options: [
    { label: "2 a 5 horas", hours: 3.5 },
    { label: "5 a 10 horas", hours: 7.5 },
    { label: "Más de 10 horas", hours: 12 }
  ]
};

const LIGHT_GROWTH_QUESTION = {
  id: "crecimiento",
  text: "¿Planeas crecer en ventas u operación en los próximos 12 meses?",
  options: [
    { label: "Sí, ya lo tengo en el radar", crece: true },
    { label: "Tal vez, todavía no es seguro", crece: true },
    { label: "No, por ahora estable", crece: false }
  ]
};
// TODO: pega aquí tu endpoint de Formspree (https://formspree.io/f/xxxxxxxx) para que el
// lead se capture aunque la persona abandone el diagnóstico a la mitad. Mientras esté vacío,
// no se envía nada (no rompe nada, solo no captura en tiempo real).
const FORMSPREE_ENDPOINT = "";

function submitLeadToFormspree(payload) {
  if (!FORMSPREE_ENDPOINT) return;
  fetch(FORMSPREE_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(payload)
  }).catch(function () {});
}

const REPSE_RISK_TEXT = "Para modalidad in-house, la ley exige que el proveedor de personal especializado esté registrado ante REPSE (STPS) — trabajar con un proveedor sin registro expone a la no deducibilidad de esos pagos y a responsabilidad solidaria en IMSS/INFONAVIT (Art. 15-A a 15-D LFT, multas de 2,000 a 50,000 UMA por subcontratación indebida). Grupo Sachman opera con REPSE vigente, así que ese riesgo queda cubierto si trabajas con nosotros en esa modalidad.";

const HIDDEN_COST_QUESTIONS = [
  {
    id: "infodia",
    text: "¿Tu información financiera está al día para tomar decisiones o se revisa hasta el cierre de mes?",
    options: [
      { label: "Al día, la reviso cuando la necesito", retraso: false },
      { label: "Con retraso, se revisa hasta el cierre de mes", retraso: true }
    ]
  },
  {
    id: "facturacion",
    text: "¿Cuál es tu facturación mensual aproximada?",
    options: [
      { label: "Menos de $100,000 MXN", monto: 75000 },
      { label: "$100,000 a $500,000 MXN", monto: 300000 },
      { label: "$500,000 a $2,000,000 MXN", monto: 1250000 },
      { label: "Más de $2,000,000 MXN", monto: 2500000 }
    ]
  },
  {
    id: "plantilla",
    text: "¿Cuántas personas tienes hoy en nómina dedicadas a funciones administrativas (no ventas ni producción)?",
    options: [
      { label: "Ninguna — lo hago yo o está afuera", personas: 0 },
      { label: "1 a 2 personas", personas: 1.5 },
      { label: "3 a 5 personas", personas: 4 },
      { label: "Más de 5 personas", personas: 6 }
    ]
  },
  {
    id: "modalidad",
    text: "¿El servicio lo necesitas remoto o requieres personal trabajando dentro de tus instalaciones (in-house)?",
    options: [
      { label: "Remoto — no necesito personal en sitio", riesgo: false },
      { label: "In-house, y no estoy seguro/a si mi proveedor actual tiene REPSE vigente", riesgo: true },
      { label: "In-house, y ya verifiqué que sí cuenta con REPSE", riesgo: false }
    ]
  }
];

// hiddenAnswers: { infodia: idx, facturacion: idx, plantilla: idx, modalidad: idx }
// horasSemana: número de horas/semana capturado en la etapa ligera (LIGHT_HOURS_QUESTION)
function computeHiddenCost(hiddenAnswers, horasSemana) {
  const qInfo = HIDDEN_COST_QUESTIONS[0].options[hiddenAnswers.infodia];
  const qFact = HIDDEN_COST_QUESTIONS[1].options[hiddenAnswers.facturacion];
  const qPlant = HIDDEN_COST_QUESTIONS[2].options[hiddenAnswers.plantilla];
  const qRepse = HIDDEN_COST_QUESTIONS[3].options[hiddenAnswers.modalidad];

  const costoTiempo = (typeof horasSemana === "number") ? horasSemana * 4 * DIRECTOR_HOURLY_RATE : 0;
  const costoIneficiencia = (qInfo && qInfo.retraso && qFact) ? qFact.monto * INEFICIENCIA_RATE : 0;
  const costoOcultoMensual = costoTiempo + costoIneficiencia;
  const riesgoRepse = !!(qRepse && qRepse.riesgo);
  const personasPlantilla = qPlant ? qPlant.personas : 0;
  const costoPlantilla = personasPlantilla * ADMIN_STAFF_COST_PER_PERSON;

  return {
    costoTiempo: costoTiempo,
    costoIneficiencia: costoIneficiencia,
    costoOcultoMensual: costoOcultoMensual,
    riesgoRepse: riesgoRepse,
    personasPlantilla: personasPlantilla,
    costoPlantilla: costoPlantilla
  };
}

const SEGMENT_QUESTION = {
  id: "segmento",
  text: "¿Cuántas personas trabajan en tu operación, incluyéndote?",
  options: [
    { label: "Soy yo solo / trabajo como persona física o freelance", segmentId: "pf" },
    { label: "Entre 2 y 50 personas", segmentId: "pyme" },
    { label: "Más de 50 personas", segmentId: "grande" }
  ]
};

const DIAGNOSTIC_AREAS = [
  {
    id: "contabilidad",
    label: "Contabilidad",
    icon: "ti-calculator",
    questions: [
      {
        id: "c1",
        text: "¿Quién lleva tu contabilidad hoy?",
        options: [
          { label: "Yo mismo o nadie de forma formal", risk: 2, finding: "No tienes contabilidad formal — estás expuesto a errores fiscales y a no poder comprobar tus operaciones ante el SAT." },
          { label: "Un contador externo por honorarios, sin contrato ni proceso claro", risk: 1, finding: "Tu contabilidad depende de una relación informal, sin SLA ni respaldo si esa persona falla o se va." },
          { label: "Un despacho o contador interno con proceso definido", risk: 0 }
        ]
      },
      {
        id: "c2",
        text: "¿Tu e.firma y Buzón Tributario están vigentes y accesibles?",
        options: [
          { label: "No sé o no tengo acceso", risk: 2, finding: "Sin acceso a tu e.firma y Buzón Tributario no puedes atender requerimientos del SAT a tiempo." },
          { label: "Sí, pero no la reviso ni renuevo seguido", risk: 1, finding: "Una e.firma vencida sin monitoreo puede dejarte sin poder facturar o declarar justo cuando lo necesitas." },
          { label: "Sí, vigente y monitoreada", risk: 0 }
        ]
      },
      {
        id: "c3",
        text: "¿Cuándo presentaste tu última declaración anual?",
        options: [
          { label: "No la he presentado o no estoy seguro", risk: 2, finding: "No presentar la declaración anual genera multas y recargos que crecen con el tiempo." },
          { label: "Se presentó, pero tarde o con errores", risk: 1, finding: "Declaraciones tardías o con errores son la causa más común de requerimientos y multas del SAT." },
          { label: "A tiempo y sin observaciones", risk: 0 }
        ]
      },
      {
        id: "c4",
        text: "¿Tienes algún requerimiento o adeudo abierto con el SAT?",
        options: [
          { label: "Sí, tengo requerimientos sin resolver", risk: 2, finding: "Un requerimiento sin atender puede escalar a embargo de cuentas o cancelación de sellos digitales." },
          { label: "No estoy seguro", risk: 1, finding: "No saber si tienes adeudos abiertos es en sí mismo un riesgo — puede haber algo corriendo sin que lo sepas." },
          { label: "No, estoy al corriente", risk: 0 }
        ]
      },
      {
        id: "c5",
        text: "¿Cómo revisas tus CFDI emitidos y recibidos?",
        options: [
          { label: "No los reviso, no sé si están completos", risk: 2, finding: "CFDI sin conciliar significa que probablemente estás dejando deducciones sin aprovechar o facturando mal." },
          { label: "Los reviso ocasionalmente", risk: 1 },
          { label: "Los reviso y concilio cada mes", risk: 0 }
        ]
      }
    ]
  },
  {
    id: "administracion",
    label: "Administración",
    icon: "ti-clipboard-list",
    questions: [
      {
        id: "a1",
        text: "¿Cómo llevas el control de tus cuentas por cobrar y pagar?",
        options: [
          { label: "No tengo un control claro", risk: 2, finding: "Sin control de cuentas por cobrar y pagar, es común perder dinero por cobros que nunca se hacen y pagos duplicados." },
          { label: "Excel básico, sin seguimiento sistemático", risk: 1 },
          { label: "Sistema o proceso definido con seguimiento", risk: 0 }
        ]
      },
      {
        id: "a2",
        text: "¿Con qué frecuencia concilias tus cuentas bancarias?",
        options: [
          { label: "Nunca o rara vez", risk: 2, finding: "Sin conciliación bancaria regular, errores y cargos indebidos pueden pasar meses sin detectarse." },
          { label: "Cada varios meses", risk: 1 },
          { label: "Cada mes", risk: 0 }
        ]
      },
      {
        id: "a3",
        text: "¿Tu facturación (CFDI) es automatizada o depende de que alguien la haga manual cada vez?",
        options: [
          { label: "Totalmente manual, se me olvida o me atraso", risk: 2, finding: "Facturación manual e inconsistente retrasa tu cobranza y genera fricción con tus clientes." },
          { label: "Manual pero consistente", risk: 1 },
          { label: "Automatizada o con proceso claro", risk: 0 }
        ]
      },
      {
        id: "a4",
        text: "¿Sabes hoy cuánto te deben tus clientes y cuánto le debes a tus proveedores?",
        options: [
          { label: "No tengo idea", risk: 2, finding: "No conocer tu posición de cobros y pagos te deja tomando decisiones de flujo de efectivo a ciegas." },
          { label: "Más o menos", risk: 1 },
          { label: "Sí, con precisión", risk: 0 }
        ]
      }
    ]
  },
  {
    id: "rrhh",
    label: "RRHH",
    icon: "ti-users",
    questions: [
      {
        id: "r1",
        text: "¿Cómo manejas la nómina hoy?",
        options: [
          { label: "Manual, cálculo a mano sin sistema", risk: 2, finding: "El cálculo manual de nómina es la causa más común de errores en pagos, IMSS e ISN." },
          { label: "Ayuda externa ocasional, sin proceso fijo", risk: 1 },
          { label: "Sistema o despacho con proceso mensual definido", risk: 0 }
        ]
      },
      {
        id: "r2",
        text: "¿Tus colaboradores están dados de alta correctamente en el IMSS?",
        options: [
          { label: "No estoy seguro, sé que hay pendientes", risk: 2, finding: "Altas IMSS incompletas o atrasadas son causa directa de multas y de dejar a tu personal sin cobertura." },
          { label: "Están dados de alta pero no reviso si está actualizado", risk: 1 },
          { label: "Sí, verificado y actualizado", risk: 0 }
        ]
      },
      {
        id: "r3",
        text: "¿Tienes contratos laborales firmados y expedientes completos de tu personal?",
        options: [
          { label: "No, o expedientes incompletos", risk: 2, finding: "Sin contratos y expedientes completos, una demanda laboral es mucho más difícil y cara de defender." },
          { label: "Algunos sí, otros no", risk: 1 },
          { label: "Sí, completos", risk: 0 }
        ]
      },
      {
        id: "r4",
        text: "¿Te preocupa una posible demanda laboral o auditoría del IMSS?",
        options: [
          { label: "Sí, ya tuve una o me preocupa mucho", risk: 2, finding: "Antecedentes o riesgo de demandas laborales sin un proceso de RRHH formal suelen repetirse." },
          { label: "Es una posibilidad que no he evaluado", risk: 1 },
          { label: "No, tengo todo en regla", risk: 0 }
        ]
      }
    ]
  },
  {
    id: "sistemas",
    label: "Sistemas / IT",
    icon: "ti-device-desktop",
    questions: [
      {
        id: "s1",
        text: "¿Quién da soporte técnico cuando algo falla?",
        options: [
          { label: "Nadie, lo resuelvo yo como puedo", risk: 2, finding: "Sin soporte técnico definido, cada falla de sistema se convierte en tiempo perdido de operación." },
          { label: "Alguien informal, sin disponibilidad garantizada", risk: 1 },
          { label: "Un proveedor o equipo con proceso de soporte", risk: 0 }
        ]
      },
      {
        id: "s2",
        text: "¿Tienes respaldo (backup) de tu información crítica?",
        options: [
          { label: "No tengo respaldo", risk: 2, finding: "Sin respaldo, un solo equipo dañado o un ransomware puede borrar información que no se recupera." },
          { label: "Respaldo manual e inconsistente", risk: 1 },
          { label: "Respaldo automático y probado", risk: 0 }
        ]
      },
      {
        id: "s3",
        text: "¿Qué tan expuesto estás a un problema de seguridad (phishing, ransomware, accesos no controlados)?",
        options: [
          { label: "No lo he evaluado", risk: 2, finding: "No evaluar tu exposición a riesgos de seguridad es la forma más común en que las PyME sufren un incidente." },
          { label: "Algo he hecho, pero no estoy seguro", risk: 1 },
          { label: "Tengo políticas y controles definidos", risk: 0 }
        ]
      },
      {
        id: "s4",
        text: "¿Tus licencias de software están vigentes y controladas?",
        options: [
          { label: "No sé, probablemente no", risk: 2, finding: "Licencias vencidas o sin control exponen a tu empresa a riesgos legales y de continuidad." },
          { label: "Parcialmente", risk: 1 },
          { label: "Sí, controladas", risk: 0 }
        ]
      }
    ]
  },
  {
    id: "compras",
    label: "Compras",
    icon: "ti-shopping-cart",
    questions: [
      {
        id: "co1",
        text: "¿Cómo eliges y negocias con tus proveedores?",
        options: [
          { label: "Sin proceso, cada quien negocia como puede", risk: 2, finding: "Sin proceso de compras, es muy probable que estés pagando distintos precios por lo mismo entre áreas o momentos." },
          { label: "Hay algo de negociación pero no comparamos opciones", risk: 1 },
          { label: "Proceso de cotización y negociación definido", risk: 0 }
        ]
      },
      {
        id: "co2",
        text: "¿Tienes visibilidad de cuánto gastas en compras al mes?",
        options: [
          { label: "No", risk: 2, finding: "Sin visibilidad del gasto en compras, es imposible identificar dónde estás pagando de más." },
          { label: "Aproximado", risk: 1 },
          { label: "Preciso y con seguimiento", risk: 0 }
        ]
      },
      {
        id: "co3",
        text: "¿Sientes que pagas de más por falta de negociación o por comprar de forma urgente?",
        options: [
          { label: "Sí, con frecuencia", risk: 2, finding: "Comprar de forma reactiva y urgente suele costar entre 10% y 30% más que con negociación planeada." },
          { label: "A veces", risk: 1 },
          { label: "Rara vez", risk: 0 }
        ]
      }
    ]
  },
  {
    id: "ventas",
    label: "Ventas",
    icon: "ti-trending-up",
    questions: [
      {
        id: "v1",
        text: "¿Tienes un proceso definido de seguimiento a prospectos (CRM o similar)?",
        options: [
          { label: "No, cada quien lleva su propio control", risk: 2, finding: "Sin CRM ni proceso, los prospectos se pierden entre personas y nadie da seguimiento consistente." },
          { label: "Excel o notas, sin sistema", risk: 1 },
          { label: "CRM o sistema con seguimiento estructurado", risk: 0 }
        ]
      },
      {
        id: "v2",
        text: "¿Cuánto tardas en promedio en enviar una cotización?",
        options: [
          { label: "Varios días, no hay tiempo definido", risk: 2, finding: "Tardar varios días en cotizar es una de las principales razones por las que se pierden ventas ante la competencia." },
          { label: "2-3 días", risk: 1 },
          { label: "Menos de 48 horas", risk: 0 }
        ]
      },
      {
        id: "v3",
        text: "¿Sabes cuántos prospectos se te escapan por falta de seguimiento?",
        options: [
          { label: "No lo sé, probablemente varios", risk: 2, finding: "No medir prospectos perdidos significa que no puedes corregir la fuga de ventas potenciales." },
          { label: "Algunos, no llevo el conteo", risk: 1 },
          { label: "Tengo control y son pocos", risk: 0 }
        ]
      }
    ]
  },
  {
    id: "marketing",
    label: "Marketing y Redes",
    icon: "ti-speakerphone",
    questions: [
      {
        id: "m1",
        text: "¿Tienes presencia activa y consistente en redes sociales?",
        options: [
          { label: "No, o muy esporádica", risk: 2, finding: "Sin presencia consistente, tu negocio pierde visibilidad frente a competidores que sí publican regularmente." },
          { label: "Ocasional, sin calendario", risk: 1 },
          { label: "Constante, con calendario de contenido", risk: 0 }
        ]
      },
      {
        id: "m2",
        text: "¿Sabes qué resultados te están dando tus esfuerzos de marketing (si los tienes)?",
        options: [
          { label: "No mido nada", risk: 2, finding: "Sin métricas, es imposible saber si el dinero y tiempo en marketing está generando retorno." },
          { label: "Mido algo pero sin claridad", risk: 1 },
          { label: "Tengo métricas claras y reporto resultados", risk: 0 }
        ]
      },
      {
        id: "m3",
        text: "¿Tu identidad de marca (logo, colores, mensajes) es consistente en todos tus materiales?",
        options: [
          { label: "No, es inconsistente", risk: 2, finding: "Una identidad inconsistente reduce la confianza y el reconocimiento de marca frente a tus clientes." },
          { label: "Parcialmente", risk: 1 },
          { label: "Sí, consistente", risk: 0 }
        ]
      }
    ]
  }
];

function riskLevelFromScore(avg) {
  if (avg >= 1.3) return "Alto";
  if (avg >= 0.6) return "Medio";
  return "Bajo";
}

// answers: { [questionId]: optionIndex }
function computeAreaResult(area, answers) {
  let total = 0;
  const findings = [];
  area.questions.forEach(function (q) {
    const idx = answers[q.id];
    const opt = typeof idx === "number" ? q.options[idx] : null;
    const risk = opt ? opt.risk : 0;
    total += risk;
    if (opt && opt.finding && risk > 0) findings.push(opt.finding);
  });
  const avg = area.questions.length ? total / area.questions.length : 0;
  const level = riskLevelFromScore(avg);
  const recommend = level !== "Bajo";
  return { areaId: area.id, avg: avg, level: level, findings: findings, recommend: recommend };
}

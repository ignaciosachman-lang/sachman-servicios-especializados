// Modelo de precios homologados con descuento progresivo por paquete + descuento por pago anual.
// Definido directamente por el usuario (2026-07):
// - Precio individual por área (1 sola área contratada) y precio "piso" al contratar las 7 áreas.
// - El descuento crece de forma LINEAL según cuántas áreas contrates: 1 área = 0% descuento,
//   7 áreas = descuento máximo del segmento. Cada área adicional reduce el precio de todas
//   las áreas contratadas de forma pareja.
// - Pago anual: -5% adicional sobre el precio que resulte (individual o con descuento de paquete).
// - Marketing tiene precio base más alto en Persona física y PyME; en Gran empresa está
//   unificado con el resto de las áreas (mismo precio base, mismo descuento).

const WHATSAPP_NUMBER = "524424528401"; // WhatsApp Business de Grupo Sachman (formato internacional, sin +)

function whatsappLink(message) {
  return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
}

const SEGMENTS = {
  pf: {
    id: "pf",
    label: "Persona física",
    tag: "Profesionistas independientes, honorarios, RESICO",
    basePrice: 2500,
    marketingBasePrice: 4000,
    maxBundleDiscount: 0.20,
    coordFee: 1000,
    coordThreshold: 3
  },
  pyme: {
    id: "pyme",
    label: "PyME",
    tag: "Empresas pequeñas y medianas en crecimiento",
    basePrice: 15000,
    marketingBasePrice: 30000,
    maxBundleDiscount: 0.20,
    coordFee: 5115,
    coordThreshold: 3
  },
  grande: {
    id: "grande",
    label: "Gran empresa",
    tag: "Corporativos y grupos con operación compleja",
    basePrice: 50000,
    marketingBasePrice: 50000,
    maxBundleDiscount: 0.18,
    coordFee: 18370,
    coordThreshold: 3
  }
};

const ANNUAL_DISCOUNT = 0.05;
const TOTAL_AREAS = 7;

const AREAS = [
  {
    id: "contabilidad",
    label: "Contabilidad",
    icon: "ti-calculator",
    description: "Pólizas, declaraciones, estados financieros y cumplimiento SAT."
  },
  {
    id: "administracion",
    label: "Administración",
    icon: "ti-clipboard-list",
    description: "Tesorería, cuentas por pagar/cobrar, facturación y KPIs."
  },
  {
    id: "rrhh",
    label: "RRHH",
    icon: "ti-users",
    description: "Nómina, altas/bajas IMSS, reclutamiento y liquidaciones."
  },
  {
    id: "sistemas",
    label: "Sistemas / IT",
    icon: "ti-device-desktop",
    description: "Correo corporativo, soporte helpdesk, ERP y seguridad."
  },
  {
    id: "compras",
    label: "Compras",
    icon: "ti-shopping-cart",
    description: "Sourcing de proveedores, negociación y órdenes de compra."
  },
  {
    // Incluye comisión variable sobre ventas generadas, además del fee fijo mensual.
    id: "ventas",
    label: "Ventas / Representaciones comerciales",
    icon: "ti-trending-up",
    description: "Representación comercial, canal y seguimiento a clientes.",
    commission: 0.05
  },
  {
    id: "marketing",
    label: "Marketing y Redes",
    icon: "ti-speakerphone",
    description: "Redes sociales, contenido, publicidad digital y SEO."
  }
];

function areaBasePrice(area, segmentId) {
  const seg = SEGMENTS[segmentId];
  return area.id === "marketing" ? seg.marketingBasePrice : seg.basePrice;
}

// Descuento por tamaño de paquete: 0% con 1 área, hasta maxBundleDiscount con las 7.
function bundleDiscount(segmentId, count) {
  if (count <= 1) return 0;
  const seg = SEGMENTS[segmentId];
  const n = Math.min(count, TOTAL_AREAS);
  return seg.maxBundleDiscount * (n - 1) / (TOTAL_AREAS - 1);
}

function areaPrice(area, segmentId, count, annual) {
  const base = areaBasePrice(area, segmentId);
  const afterBundle = base * (1 - bundleDiscount(segmentId, count));
  return annual ? afterBundle * (1 - ANNUAL_DISCOUNT) : afterBundle;
}

function coordFeeAmount(segmentId, annual) {
  const seg = SEGMENTS[segmentId];
  return annual ? seg.coordFee * (1 - ANNUAL_DISCOUNT) : seg.coordFee;
}

function tierFromCount(count) {
  if (count <= 0) return null;
  if (count <= 2) return "Básico";
  if (count <= 4) return "Profesional";
  return "Integral";
}

function formatMXN(value) {
  return "$" + Math.round(value).toLocaleString("es-MX") + " MXN";
}

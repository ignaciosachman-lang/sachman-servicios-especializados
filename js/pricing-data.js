// Datos base de segmentos, áreas y precios de referencia.
// Precios estimados con base en investigación de mercado (México, 2026) y en la
// propuesta real entregada a INCARGO.MX para el segmento "Gran empresa".
// Ajustar libremente conforme se definan costos reales por área.

const SEGMENTS = {
  pf: {
    id: "pf",
    label: "Persona física",
    tag: "Profesionistas independientes, honorarios, RESICO",
    coordFee: 350,
    coordThreshold: 3
  },
  pyme: {
    id: "pyme",
    label: "PyME",
    tag: "Empresas pequeñas y medianas en crecimiento",
    coordFee: 4500,
    coordThreshold: 3
  },
  grande: {
    id: "grande",
    label: "Gran empresa",
    tag: "Corporativos y grupos con operación compleja",
    coordFee: 18000,
    coordThreshold: 3
  }
};

const AREAS = [
  {
    id: "contabilidad",
    label: "Contabilidad",
    icon: "ti-calculator",
    description: "Pólizas, declaraciones, estados financieros y cumplimiento SAT.",
    price: { pf: 900, pyme: 9000, grande: 32000 }
  },
  {
    id: "administracion",
    label: "Administración",
    icon: "ti-clipboard-list",
    description: "Tesorería, cuentas por pagar/cobrar, facturación y KPIs.",
    price: { pf: 600, pyme: 7000, grande: 30000 }
  },
  {
    id: "rrhh",
    label: "RRHH",
    icon: "ti-users",
    description: "Nómina, altas/bajas IMSS, reclutamiento y liquidaciones.",
    price: { pf: 350, pyme: 8000, grande: 32000 }
  },
  {
    id: "sistemas",
    label: "Sistemas / IT",
    icon: "ti-device-desktop",
    description: "Correo corporativo, soporte helpdesk, ERP y seguridad.",
    price: { pf: 450, pyme: 9500, grande: 40000 }
  },
  {
    id: "compras",
    label: "Compras",
    icon: "ti-shopping-cart",
    description: "Sourcing de proveedores, negociación y órdenes de compra.",
    price: { pf: 400, pyme: 7000, grande: 25000 }
  },
  {
    id: "ventas",
    label: "Ventas / Representaciones comerciales",
    icon: "ti-trending-up",
    description: "Representación comercial, canal y seguimiento a clientes.",
    price: { pf: 500, pyme: 9000, grande: 25000 }
  },
  {
    id: "marketing",
    label: "Marketing y Redes",
    icon: "ti-speakerphone",
    description: "Redes sociales, contenido, publicidad digital y SEO.",
    price: { pf: 1800, pyme: 13000, grande: 50000 }
  }
];

function tierFromCount(count) {
  if (count <= 0) return null;
  if (count <= 2) return "Básico";
  if (count <= 4) return "Profesional";
  return "Integral";
}

function formatMXN(value) {
  return "$" + Math.round(value).toLocaleString("es-MX") + " MXN";
}

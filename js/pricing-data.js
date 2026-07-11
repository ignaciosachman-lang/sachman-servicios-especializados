// Datos base de segmentos, áreas y precios de referencia.
// Precios base del modelo de costeo (Plan_Costeo_Precios_Servicios_Especializados.xlsx),
// +10% de ajuste general, con un piso de $1,000 MXN para cualquier servicio individual (+ IVA).
// Ajustar horas/sueldos en el Excel y volver a correr esta actualización si cambian los supuestos.

const SEGMENTS = {
  pf: {
    id: "pf",
    label: "Persona física",
    tag: "Profesionistas independientes, honorarios, RESICO",
    coordFee: 1000,
    coordThreshold: 3
  },
  pyme: {
    id: "pyme",
    label: "PyME",
    tag: "Empresas pequeñas y medianas en crecimiento",
    coordFee: 5115,
    coordThreshold: 3
  },
  grande: {
    id: "grande",
    label: "Gran empresa",
    tag: "Corporativos y grupos con operación compleja",
    coordFee: 18370,
    coordThreshold: 3
  }
};

const AREAS = [
  {
    id: "contabilidad",
    label: "Contabilidad",
    icon: "ti-calculator",
    description: "Pólizas, declaraciones, estados financieros y cumplimiento SAT.",
    price: { pf: 1650, pyme: 9900, grande: 40590 }
  },
  {
    id: "administracion",
    label: "Administración",
    icon: "ti-clipboard-list",
    description: "Tesorería, cuentas por pagar/cobrar, facturación y KPIs.",
    price: { pf: 1000, pyme: 7370, grande: 28490 }
  },
  {
    id: "rrhh",
    label: "RRHH",
    icon: "ti-users",
    description: "Nómina, altas/bajas IMSS, reclutamiento y liquidaciones.",
    price: { pf: 1000, pyme: 7370, grande: 31570 }
  },
  {
    id: "sistemas",
    label: "Sistemas / IT",
    icon: "ti-device-desktop",
    description: "Correo corporativo, soporte helpdesk, ERP y seguridad.",
    price: { pf: 1000, pyme: 8635, grande: 36300 }
  },
  {
    // Grande ajustado manualmente: el costeo daba $10,100, pero se decidió mantener el precio de negocio
    // (criterio de mercado, no de costo/hora), + 10% general.
    id: "compras",
    label: "Compras",
    icon: "ti-shopping-cart",
    description: "Sourcing de proveedores, negociación y órdenes de compra.",
    price: { pf: 1000, pyme: 4730, grande: 27500 }
  },
  {
    // Incluye comisión variable sobre ventas generadas, además del fee fijo mensual.
    id: "ventas",
    label: "Ventas / Representaciones comerciales",
    icon: "ti-trending-up",
    description: "Representación comercial, canal y seguimiento a clientes.",
    price: { pf: 1000, pyme: 6380, grande: 19800 },
    commission: 0.05
  },
  {
    // Ajustado a tarifa de despacho/agencia independiente promedio de mercado
    // (no al modelo de costeo interno), + 10% general.
    id: "marketing",
    label: "Marketing y Redes",
    icon: "ti-speakerphone",
    description: "Redes sociales, contenido, publicidad digital y SEO.",
    price: { pf: 3300, pyme: 22000, grande: 49500 }
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

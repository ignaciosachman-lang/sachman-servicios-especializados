// Datos base de segmentos, áreas y precios de referencia.
// Precios calculados con el modelo de costeo (Plan_Costeo_Precios_Servicios_Especializados.xlsx):
// costo/hora (sueldo x carga social / horas facturables) x horas por cliente, +15% overhead,
// entre (1 - margen objetivo por segmento: PF 30%, PyME 40%, Gran empresa 50%).
// Ajustar horas/sueldos en el Excel y volver a correr esta actualización si cambian los supuestos.

const SEGMENTS = {
  pf: {
    id: "pf",
    label: "Persona física",
    tag: "Profesionistas independientes, honorarios, RESICO",
    coordFee: 500,
    coordThreshold: 3
  },
  pyme: {
    id: "pyme",
    label: "PyME",
    tag: "Empresas pequeñas y medianas en crecimiento",
    coordFee: 4650,
    coordThreshold: 3
  },
  grande: {
    id: "grande",
    label: "Gran empresa",
    tag: "Corporativos y grupos con operación compleja",
    coordFee: 16700,
    coordThreshold: 3
  }
};

const AREAS = [
  {
    id: "contabilidad",
    label: "Contabilidad",
    icon: "ti-calculator",
    description: "Pólizas, declaraciones, estados financieros y cumplimiento SAT.",
    price: { pf: 1500, pyme: 9000, grande: 36900 }
  },
  {
    id: "administracion",
    label: "Administración",
    icon: "ti-clipboard-list",
    description: "Tesorería, cuentas por pagar/cobrar, facturación y KPIs.",
    price: { pf: 650, pyme: 6700, grande: 25900 }
  },
  {
    id: "rrhh",
    label: "RRHH",
    icon: "ti-users",
    description: "Nómina, altas/bajas IMSS, reclutamiento y liquidaciones.",
    price: { pf: 400, pyme: 6700, grande: 28700 }
  },
  {
    id: "sistemas",
    label: "Sistemas / IT",
    icon: "ti-device-desktop",
    description: "Correo corporativo, soporte helpdesk, ERP y seguridad.",
    price: { pf: 650, pyme: 7850, grande: 33000 }
  },
  {
    id: "compras",
    label: "Compras",
    icon: "ti-shopping-cart",
    description: "Sourcing de proveedores, negociación y órdenes de compra.",
    price: { pf: 500, pyme: 4300, grande: 10100 }
  },
  {
    id: "ventas",
    label: "Ventas / Representaciones comerciales",
    icon: "ti-trending-up",
    description: "Representación comercial, canal y seguimiento a clientes.",
    price: { pf: 650, pyme: 5800, grande: 18800 }
  },
  {
    id: "marketing",
    label: "Marketing y Redes",
    icon: "ti-speakerphone",
    description: "Redes sociales, contenido, publicidad digital y SEO.",
    price: { pf: 1300, pyme: 7050, grande: 21200 }
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

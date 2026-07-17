// Generado desde el Excel de costeo por actividad (Plan_Costeo_Precios_Servicios_Especializados.xlsx, pestana 'Costeo por Actividad').
// Cada fila = 1 actividad. tipo 'fijo' no cambia con el volumen del cliente; 'volumen' escala segun driver x cantidad real.
// precio = precio de la actividad al volumenBase (o precio fijo total si tipo='fijo'). precioPorUnidad = precio / volumenBase (solo tipo='volumen').
const ACTIVITY_COSTING = [
  {area:'marketing',segmento:'pf',actividad:'Gestion basica de 1-2 redes sociales',tipo:'fijo',driver:'',volumenBase:null,precio:433.08,precioPorUnidad:null},
  {area:'marketing',segmento:'pf',actividad:'Publicacion de contenido',tipo:'volumen',driver:'# posts/semana',volumenBase:2.5,precio:649.61,precioPorUnidad:259.85},
  {area:'marketing',segmento:'pf',actividad:'Reporte mensual de desempeno',tipo:'fijo',driver:'',volumenBase:null,precio:216.54,precioPorUnidad:null},
  {area:'marketing',segmento:'pyme',actividad:'Reporte mensual de desempeno',tipo:'fijo',driver:'',volumenBase:null,precio:414.06,precioPorUnidad:null},
  {area:'marketing',segmento:'pyme',actividad:'Estrategia de marketing y calendario editorial (prorrateada)',tipo:'fijo',driver:'',volumenBase:null,precio:1242.17,precioPorUnidad:null},
  {area:'marketing',segmento:'pyme',actividad:'Gestion de redes sociales multi-plataforma',tipo:'volumen',driver:'# publicaciones/semana',volumenBase:4.5,precio:1242.17,precioPorUnidad:276.04},
  {area:'marketing',segmento:'pyme',actividad:'Diseno grafico y produccion de contenido',tipo:'volumen',driver:'# piezas/mes',volumenBase:12,precio:1656.23,precioPorUnidad:138.02},
  {area:'marketing',segmento:'pyme',actividad:'Publicidad digital Meta/Google Ads',tipo:'volumen',driver:'presupuesto de pauta MXN/mes',volumenBase:15000,precio:1656.23,precioPorUnidad:0.11},
  {area:'marketing',segmento:'pyme',actividad:'Community management',tipo:'volumen',driver:'# mensajes/mes',volumenBase:100,precio:828.11,precioPorUnidad:8.28},
  {area:'marketing',segmento:'grande',actividad:'Reporte mensual de desempeno',tipo:'fijo',driver:'',volumenBase:null,precio:814.58,precioPorUnidad:null},
  {area:'marketing',segmento:'grande',actividad:'Estrategia de marketing y calendario editorial (prorrateada)',tipo:'fijo',driver:'',volumenBase:null,precio:2443.75,precioPorUnidad:null},
  {area:'marketing',segmento:'grande',actividad:'Gestion de redes sociales multi-plataforma',tipo:'volumen',driver:'# publicaciones/semana',volumenBase:6,precio:2443.75,precioPorUnidad:407.29},
  {area:'marketing',segmento:'grande',actividad:'Diseno grafico y produccion de contenido',tipo:'volumen',driver:'# piezas/mes',volumenBase:25,precio:3258.33,precioPorUnidad:130.33},
  {area:'marketing',segmento:'grande',actividad:'Publicidad digital Meta/Google Ads',tipo:'volumen',driver:'presupuesto de pauta MXN/mes',volumenBase:50000,precio:3258.33,precioPorUnidad:0.07},
  {area:'marketing',segmento:'grande',actividad:'Community management',tipo:'volumen',driver:'# mensajes/mes',volumenBase:300,precio:1629.17,precioPorUnidad:5.43},
  {area:'marketing',segmento:'grande',actividad:'SEO y posicionamiento web',tipo:'fijo',driver:'',volumenBase:null,precio:2443.75,precioPorUnidad:null},
  {area:'marketing',segmento:'grande',actividad:'Gestion de pagina web / landing pages',tipo:'fijo',driver:'',volumenBase:null,precio:2443.75,precioPorUnidad:null},
  {area:'marketing',segmento:'grande',actividad:'Email marketing y campanas',tipo:'volumen',driver:'# campanas/mes',volumenBase:4,precio:2443.75,precioPorUnidad:610.94},
  {area:'administracion',segmento:'pf',actividad:'Facturacion CFDI por servicios',tipo:'volumen',driver:'# facturas emitidas/mes',volumenBase:8,precio:243.6,precioPorUnidad:30.45},
  {area:'administracion',segmento:'pf',actividad:'Control de cobros',tipo:'fijo',driver:'',volumenBase:null,precio:243.6,precioPorUnidad:null},
  {area:'administracion',segmento:'pf',actividad:'Recordatorios de pago a proveedores',tipo:'fijo',driver:'',volumenBase:null,precio:81.2,precioPorUnidad:null},
  {area:'administracion',segmento:'pf',actividad:'Checklist administrativo mensual',tipo:'fijo',driver:'',volumenBase:null,precio:81.2,precioPorUnidad:null},
  {area:'administracion',segmento:'pyme',actividad:'Facturacion CFDI',tipo:'volumen',driver:'# facturas emitidas/mes',volumenBase:40,precio:716.35,precioPorUnidad:17.91},
  {area:'administracion',segmento:'pyme',actividad:'Control de cobros',tipo:'fijo',driver:'',volumenBase:null,precio:716.35,precioPorUnidad:null},
  {area:'administracion',segmento:'pyme',actividad:'Recordatorios de pago',tipo:'fijo',driver:'',volumenBase:null,precio:238.78,precioPorUnidad:null},
  {area:'administracion',segmento:'pyme',actividad:'Checklist administrativo',tipo:'fijo',driver:'',volumenBase:null,precio:238.78,precioPorUnidad:null},
  {area:'administracion',segmento:'pyme',actividad:'Control de cuentas por pagar',tipo:'volumen',driver:'# facturas por pagar/mes',volumenBase:25,precio:716.35,precioPorUnidad:28.65},
  {area:'administracion',segmento:'pyme',actividad:'Control de cuentas por cobrar',tipo:'volumen',driver:'# facturas por cobrar/mes',volumenBase:30,precio:716.35,precioPorUnidad:23.88},
  {area:'administracion',segmento:'pyme',actividad:'Catalogo y gestion de proveedores',tipo:'fijo',driver:'',volumenBase:null,precio:477.57,precioPorUnidad:null},
  {area:'administracion',segmento:'pyme',actividad:'Tesoreria flujo de caja semanal',tipo:'fijo',driver:'',volumenBase:null,precio:955.14,precioPorUnidad:null},
  {area:'administracion',segmento:'pyme',actividad:'Timbrado CFDI de nomina',tipo:'volumen',driver:'# empleados en nomina',volumenBase:8,precio:716.35,precioPorUnidad:89.54},
  {area:'administracion',segmento:'pyme',actividad:'Dashboard de KPIs administrativos',tipo:'fijo',driver:'',volumenBase:null,precio:716.35,precioPorUnidad:null},
  {area:'administracion',segmento:'pyme',actividad:'Reembolsos y viaticos',tipo:'volumen',driver:'# solicitudes/mes',volumenBase:10,precio:477.57,precioPorUnidad:47.76},
  {area:'administracion',segmento:'grande',actividad:'Facturacion CFDI',tipo:'volumen',driver:'# facturas emitidas/mes',volumenBase:150,precio:1896.1,precioPorUnidad:12.64},
  {area:'administracion',segmento:'grande',actividad:'Control de cobros',tipo:'fijo',driver:'',volumenBase:null,precio:1896.1,precioPorUnidad:null},
  {area:'administracion',segmento:'grande',actividad:'Recordatorios de pago',tipo:'fijo',driver:'',volumenBase:null,precio:632.03,precioPorUnidad:null},
  {area:'administracion',segmento:'grande',actividad:'Checklist administrativo',tipo:'fijo',driver:'',volumenBase:null,precio:632.03,precioPorUnidad:null},
  {area:'administracion',segmento:'grande',actividad:'Control de cuentas por pagar',tipo:'volumen',driver:'# facturas por pagar/mes',volumenBase:100,precio:1896.1,precioPorUnidad:18.96},
  {area:'administracion',segmento:'grande',actividad:'Control de cuentas por cobrar',tipo:'volumen',driver:'# facturas por cobrar/mes',volumenBase:120,precio:1896.1,precioPorUnidad:15.8},
  {area:'administracion',segmento:'grande',actividad:'Catalogo y gestion de proveedores',tipo:'fijo',driver:'',volumenBase:null,precio:1264.07,precioPorUnidad:null},
  {area:'administracion',segmento:'grande',actividad:'Tesoreria flujo de caja semanal',tipo:'fijo',driver:'',volumenBase:null,precio:2528.13,precioPorUnidad:null},
  {area:'administracion',segmento:'grande',actividad:'Timbrado CFDI de nomina',tipo:'volumen',driver:'# empleados en nomina',volumenBase:40,precio:1896.1,precioPorUnidad:47.4},
  {area:'administracion',segmento:'grande',actividad:'Dashboard de KPIs administrativos',tipo:'fijo',driver:'',volumenBase:null,precio:1896.1,precioPorUnidad:null},
  {area:'administracion',segmento:'grande',actividad:'Reembolsos y viaticos',tipo:'volumen',driver:'# solicitudes/mes',volumenBase:30,precio:1264.07,precioPorUnidad:42.14},
  {area:'administracion',segmento:'grande',actividad:'Gestion de contratos de proveedores',tipo:'volumen',driver:'# contratos activos',volumenBase:15,precio:2528.13,precioPorUnidad:168.54},
  {area:'administracion',segmento:'grande',actividad:'Proyecciones financieras a 12 meses (prorrateada)',tipo:'fijo',driver:'',volumenBase:null,precio:3160.16,precioPorUnidad:null},
  {area:'administracion',segmento:'grande',actividad:'Reportes ejecutivos para direccion',tipo:'fijo',driver:'',volumenBase:null,precio:2528.13,precioPorUnidad:null},
  {area:'ventas',segmento:'pf',actividad:'Representacion comercial basica',tipo:'fijo',driver:'',volumenBase:null,precio:324.81,precioPorUnidad:null},
  {area:'ventas',segmento:'pf',actividad:'Elaboracion de cotizaciones simples',tipo:'volumen',driver:'# cotizaciones/mes',volumenBase:3,precio:216.54,precioPorUnidad:72.18},
  {area:'ventas',segmento:'pf',actividad:'Reporte mensual de actividad',tipo:'fijo',driver:'',volumenBase:null,precio:108.27,precioPorUnidad:null},
  {area:'ventas',segmento:'pyme',actividad:'Representacion comercial',tipo:'fijo',driver:'',volumenBase:null,precio:1158.62,precioPorUnidad:null},
  {area:'ventas',segmento:'pyme',actividad:'Reporte mensual de actividad',tipo:'fijo',driver:'',volumenBase:null,precio:386.21,precioPorUnidad:null},
  {area:'ventas',segmento:'pyme',actividad:'Gestion de cuentas clave',tipo:'volumen',driver:'# cuentas clave',volumenBase:5,precio:1158.62,precioPorUnidad:231.72},
  {area:'ventas',segmento:'pyme',actividad:'CRM y pipeline de ventas',tipo:'fijo',driver:'',volumenBase:null,precio:772.42,precioPorUnidad:null},
  {area:'ventas',segmento:'pyme',actividad:'Cotizaciones y seguimiento comercial',tipo:'volumen',driver:'# cotizaciones/mes',volumenBase:15,precio:1158.62,precioPorUnidad:77.24},
  {area:'ventas',segmento:'pyme',actividad:'Reportes de ventas y forecast',tipo:'fijo',driver:'',volumenBase:null,precio:772.42,precioPorUnidad:null},
  {area:'ventas',segmento:'pyme',actividad:'Facturacion de comision',tipo:'fijo',driver:'',volumenBase:null,precio:386.21,precioPorUnidad:null},
  {area:'ventas',segmento:'grande',actividad:'Gestion de cuentas clave',tipo:'volumen',driver:'# cuentas clave',volumenBase:15,precio:2974.26,precioPorUnidad:198.28},
  {area:'ventas',segmento:'grande',actividad:'CRM y pipeline de ventas',tipo:'fijo',driver:'',volumenBase:null,precio:1982.84,precioPorUnidad:null},
  {area:'ventas',segmento:'grande',actividad:'Cotizaciones y seguimiento comercial',tipo:'volumen',driver:'# cotizaciones/mes',volumenBase:40,precio:2974.26,precioPorUnidad:74.36},
  {area:'ventas',segmento:'grande',actividad:'Reportes de ventas y forecast',tipo:'fijo',driver:'',volumenBase:null,precio:1982.84,precioPorUnidad:null},
  {area:'ventas',segmento:'grande',actividad:'Facturacion de comision',tipo:'fijo',driver:'',volumenBase:null,precio:991.42,precioPorUnidad:null},
  {area:'ventas',segmento:'grande',actividad:'Desarrollo de nuevos clientes/mercados',tipo:'fijo',driver:'',volumenBase:null,precio:3965.68,precioPorUnidad:null},
  {area:'ventas',segmento:'grande',actividad:'Representacion ante distribuidores/canal',tipo:'volumen',driver:'# distribuidores/canales',volumenBase:5,precio:3965.68,precioPorUnidad:793.14},
  {area:'sistemas',segmento:'pf',actividad:'Soporte tecnico basico',tipo:'volumen',driver:'# tickets/mes',volumenBase:2,precio:324.81,precioPorUnidad:162.4},
  {area:'sistemas',segmento:'pf',actividad:'Backup de informacion',tipo:'fijo',driver:'',volumenBase:null,precio:216.54,precioPorUnidad:null},
  {area:'sistemas',segmento:'pf',actividad:'Checklist de seguridad basica',tipo:'fijo',driver:'',volumenBase:null,precio:108.27,precioPorUnidad:null},
  {area:'sistemas',segmento:'pyme',actividad:'Soporte tecnico basico',tipo:'volumen',driver:'# tickets/mes',volumenBase:15,precio:1121.25,precioPorUnidad:74.75},
  {area:'sistemas',segmento:'pyme',actividad:'Backup de informacion',tipo:'fijo',driver:'',volumenBase:null,precio:747.5,precioPorUnidad:null},
  {area:'sistemas',segmento:'pyme',actividad:'Checklist de seguridad basica',tipo:'fijo',driver:'',volumenBase:null,precio:373.75,precioPorUnidad:null},
  {area:'sistemas',segmento:'pyme',actividad:'Gestion de usuarios y permisos',tipo:'volumen',driver:'# usuarios',volumenBase:10,precio:747.5,precioPorUnidad:74.75},
  {area:'sistemas',segmento:'pyme',actividad:'Soporte tecnico helpdesk SLA 4h',tipo:'volumen',driver:'# tickets/mes',volumenBase:15,precio:1495,precioPorUnidad:99.67},
  {area:'sistemas',segmento:'pyme',actividad:'Gestion de licencias de software',tipo:'volumen',driver:'# licencias',volumenBase:5,precio:747.5,precioPorUnidad:149.5},
  {area:'sistemas',segmento:'pyme',actividad:'Backup y respaldo',tipo:'fijo',driver:'',volumenBase:null,precio:1121.25,precioPorUnidad:null},
  {area:'sistemas',segmento:'pyme',actividad:'Seguridad informatica basica',tipo:'fijo',driver:'',volumenBase:null,precio:1121.25,precioPorUnidad:null},
  {area:'sistemas',segmento:'pyme',actividad:'Gestion de dominio web y DNS',tipo:'fijo',driver:'',volumenBase:null,precio:373.75,precioPorUnidad:null},
  {area:'sistemas',segmento:'grande',actividad:'Soporte tecnico basico',tipo:'volumen',driver:'# tickets/mes',volumenBase:60,precio:3192.55,precioPorUnidad:53.21},
  {area:'sistemas',segmento:'grande',actividad:'Backup de informacion',tipo:'fijo',driver:'',volumenBase:null,precio:2128.37,precioPorUnidad:null},
  {area:'sistemas',segmento:'grande',actividad:'Checklist de seguridad basica',tipo:'fijo',driver:'',volumenBase:null,precio:1064.18,precioPorUnidad:null},
  {area:'sistemas',segmento:'grande',actividad:'Gestion de usuarios y permisos',tipo:'volumen',driver:'# usuarios',volumenBase:45,precio:2128.37,precioPorUnidad:47.3},
  {area:'sistemas',segmento:'grande',actividad:'Soporte tecnico helpdesk',tipo:'volumen',driver:'# tickets/mes',volumenBase:60,precio:4256.73,precioPorUnidad:70.95},
  {area:'sistemas',segmento:'grande',actividad:'Gestion de licencias de software',tipo:'volumen',driver:'# licencias',volumenBase:20,precio:2128.37,precioPorUnidad:106.42},
  {area:'sistemas',segmento:'grande',actividad:'Backup y respaldo',tipo:'fijo',driver:'',volumenBase:null,precio:3192.55,precioPorUnidad:null},
  {area:'sistemas',segmento:'grande',actividad:'Seguridad informatica basica',tipo:'fijo',driver:'',volumenBase:null,precio:3192.55,precioPorUnidad:null},
  {area:'sistemas',segmento:'grande',actividad:'Gestion de dominio web y DNS',tipo:'fijo',driver:'',volumenBase:null,precio:1064.18,precioPorUnidad:null},
  {area:'sistemas',segmento:'grande',actividad:'Seguridad informatica avanzada',tipo:'fijo',driver:'',volumenBase:null,precio:5320.91,precioPorUnidad:null},
  {area:'sistemas',segmento:'grande',actividad:'Soporte helpdesk prioritario SLA 2h',tipo:'volumen',driver:'# tickets/mes',volumenBase:60,precio:5320.91,precioPorUnidad:88.68},
  {area:'rrhh',segmento:'pf',actividad:'Contrato de trabajo estandar',tipo:'volumen',driver:'# altas/mes',volumenBase:0.3,precio:54.66,precioPorUnidad:182.21},
  {area:'rrhh',segmento:'pf',actividad:'Alta del trabajador IMSS/INFONAVIT',tipo:'volumen',driver:'# movimientos/mes',volumenBase:0.5,precio:82,precioPorUnidad:163.99},
  {area:'rrhh',segmento:'pf',actividad:'Procesamiento de nomina',tipo:'volumen',driver:'# empleados',volumenBase:1,precio:109.33,precioPorUnidad:109.33},
  {area:'rrhh',segmento:'pf',actividad:'Pago SUA',tipo:'fijo',driver:'',volumenBase:null,precio:82,precioPorUnidad:null},
  {area:'rrhh',segmento:'pf',actividad:'Aguinaldo (prorrateado)',tipo:'fijo',driver:'',volumenBase:null,precio:54.66,precioPorUnidad:null},
  {area:'rrhh',segmento:'pyme',actividad:'Altas/bajas/modificaciones de salario',tipo:'volumen',driver:'# movimientos/mes',volumenBase:2,precio:802.32,precioPorUnidad:401.16},
  {area:'rrhh',segmento:'pyme',actividad:'Procesamiento de nomina',tipo:'volumen',driver:'# empleados',volumenBase:8,precio:1337.19,precioPorUnidad:167.15},
  {area:'rrhh',segmento:'pyme',actividad:'Pago SUA',tipo:'fijo',driver:'',volumenBase:null,precio:802.32,precioPorUnidad:null},
  {area:'rrhh',segmento:'pyme',actividad:'Aguinaldo/vacaciones/prima (prorrateada)',tipo:'fijo',driver:'',volumenBase:null,precio:802.32,precioPorUnidad:null},
  {area:'rrhh',segmento:'pyme',actividad:'PTU anual (prorrateada)',tipo:'fijo',driver:'',volumenBase:null,precio:534.88,precioPorUnidad:null},
  {area:'rrhh',segmento:'pyme',actividad:'Reclutamiento (hasta 3 vacantes/mes)',tipo:'volumen',driver:'# vacantes/mes',volumenBase:1,precio:1069.76,precioPorUnidad:1069.76},
  {area:'rrhh',segmento:'pyme',actividad:'Onboarding y expediente',tipo:'volumen',driver:'# altas/mes',volumenBase:1,precio:534.88,precioPorUnidad:534.88},
  {area:'rrhh',segmento:'pyme',actividad:'Liquidaciones y finiquitos',tipo:'volumen',driver:'# bajas/mes',volumenBase:0.5,precio:802.32,precioPorUnidad:1604.63},
  {area:'rrhh',segmento:'grande',actividad:'Altas/bajas/modificaciones de salario',tipo:'volumen',driver:'# movimientos/mes',volumenBase:6,precio:3075.43,precioPorUnidad:512.57},
  {area:'rrhh',segmento:'grande',actividad:'Procesamiento de nomina',tipo:'volumen',driver:'# empleados',volumenBase:40,precio:5125.71,precioPorUnidad:128.14},
  {area:'rrhh',segmento:'grande',actividad:'Pago SUA',tipo:'fijo',driver:'',volumenBase:null,precio:3075.43,precioPorUnidad:null},
  {area:'rrhh',segmento:'grande',actividad:'Aguinaldo/vacaciones/prima (prorrateada)',tipo:'fijo',driver:'',volumenBase:null,precio:3075.43,precioPorUnidad:null},
  {area:'rrhh',segmento:'grande',actividad:'PTU anual (prorrateada)',tipo:'fijo',driver:'',volumenBase:null,precio:2050.29,precioPorUnidad:null},
  {area:'rrhh',segmento:'grande',actividad:'Reclutamiento sin limite',tipo:'volumen',driver:'# vacantes/mes',volumenBase:3,precio:4100.57,precioPorUnidad:1366.86},
  {area:'rrhh',segmento:'grande',actividad:'Onboarding y expediente',tipo:'volumen',driver:'# altas/mes',volumenBase:3,precio:2050.29,precioPorUnidad:683.43},
  {area:'rrhh',segmento:'grande',actividad:'Liquidaciones y finiquitos',tipo:'volumen',driver:'# bajas/mes',volumenBase:2,precio:3075.43,precioPorUnidad:1537.71},
  {area:'rrhh',segmento:'grande',actividad:'Encuestas de clima organizacional (prorrateada)',tipo:'fijo',driver:'',volumenBase:null,precio:3075.43,precioPorUnidad:null},
  {area:'contabilidad',segmento:'pf',actividad:'Registro de ingresos y gastos',tipo:'volumen',driver:'# operaciones/mes',volumenBase:15,precio:456.32,precioPorUnidad:30.42},
  {area:'contabilidad',segmento:'pf',actividad:'Revision de CFDI',tipo:'volumen',driver:'# CFDI/mes',volumenBase:10,precio:342.24,precioPorUnidad:34.22},
  {area:'contabilidad',segmento:'pf',actividad:'Declaracion mensual IVA+ISR',tipo:'fijo',driver:'',volumenBase:null,precio:570.39,precioPorUnidad:null},
  {area:'contabilidad',segmento:'pf',actividad:'Checklist mensual',tipo:'fijo',driver:'',volumenBase:null,precio:114.08,precioPorUnidad:null},
  {area:'contabilidad',segmento:'pf',actividad:'Declaracion anual ISR (prorrateada)',tipo:'fijo',driver:'',volumenBase:null,precio:47.57,precioPorUnidad:null},
  {area:'contabilidad',segmento:'pyme',actividad:'Registro de ingresos y gastos',tipo:'volumen',driver:'# operaciones/mes',volumenBase:80,precio:1029.89,precioPorUnidad:12.87},
  {area:'contabilidad',segmento:'pyme',actividad:'Revision de CFDI',tipo:'volumen',driver:'# CFDI/mes',volumenBase:60,precio:772.42,precioPorUnidad:12.87},
  {area:'contabilidad',segmento:'pyme',actividad:'Checklist mensual',tipo:'fijo',driver:'',volumenBase:null,precio:257.47,precioPorUnidad:null},
  {area:'contabilidad',segmento:'pyme',actividad:'Catalogo de cuentas y contabilidad electronica',tipo:'fijo',driver:'',volumenBase:null,precio:1029.89,precioPorUnidad:null},
  {area:'contabilidad',segmento:'pyme',actividad:'Conciliacion bancaria formal',tipo:'volumen',driver:'# cuentas bancarias',volumenBase:2,precio:772.42,precioPorUnidad:386.21},
  {area:'contabilidad',segmento:'pyme',actividad:'DIOT',tipo:'volumen',driver:'# proveedores/mes',volumenBase:15,precio:1029.89,precioPorUnidad:68.66},
  {area:'contabilidad',segmento:'pyme',actividad:'Pagos provisionales ISR+IVA',tipo:'fijo',driver:'',volumenBase:null,precio:1287.36,precioPorUnidad:null},
  {area:'contabilidad',segmento:'pyme',actividad:'Estados financieros',tipo:'fijo',driver:'',volumenBase:null,precio:1029.89,precioPorUnidad:null},
  {area:'contabilidad',segmento:'pyme',actividad:'Declaracion anual ISR persona moral (prorrateada)',tipo:'fijo',driver:'',volumenBase:null,precio:1287.36,precioPorUnidad:null},
  {area:'contabilidad',segmento:'pyme',actividad:'Atencion basica a requerimientos SAT',tipo:'fijo',driver:'',volumenBase:null,precio:514.94,precioPorUnidad:null},
  {area:'contabilidad',segmento:'grande',actividad:'Registro de ingresos y gastos',tipo:'volumen',driver:'# operaciones/mes',volumenBase:300,precio:2836.67,precioPorUnidad:9.46},
  {area:'contabilidad',segmento:'grande',actividad:'Revision de CFDI',tipo:'volumen',driver:'# CFDI/mes',volumenBase:250,precio:2127.5,precioPorUnidad:8.51},
  {area:'contabilidad',segmento:'grande',actividad:'Checklist mensual',tipo:'fijo',driver:'',volumenBase:null,precio:709.17,precioPorUnidad:null},
  {area:'contabilidad',segmento:'grande',actividad:'Catalogo de cuentas y contabilidad electronica',tipo:'fijo',driver:'',volumenBase:null,precio:2836.67,precioPorUnidad:null},
  {area:'contabilidad',segmento:'grande',actividad:'Conciliacion bancaria formal',tipo:'volumen',driver:'# cuentas bancarias',volumenBase:4,precio:2127.5,precioPorUnidad:531.88},
  {area:'contabilidad',segmento:'grande',actividad:'DIOT',tipo:'volumen',driver:'# proveedores/mes',volumenBase:50,precio:2836.67,precioPorUnidad:56.73},
  {area:'contabilidad',segmento:'grande',actividad:'Pagos provisionales ISR+IVA',tipo:'fijo',driver:'',volumenBase:null,precio:3545.83,precioPorUnidad:null},
  {area:'contabilidad',segmento:'grande',actividad:'Estados financieros',tipo:'fijo',driver:'',volumenBase:null,precio:2836.67,precioPorUnidad:null},
  {area:'contabilidad',segmento:'grande',actividad:'Declaracion anual ISR persona moral (prorrateada)',tipo:'fijo',driver:'',volumenBase:null,precio:3545.83,precioPorUnidad:null},
  {area:'contabilidad',segmento:'grande',actividad:'Atencion requerimientos SAT complejos',tipo:'fijo',driver:'',volumenBase:null,precio:2127.5,precioPorUnidad:null},
  {area:'contabilidad',segmento:'grande',actividad:'Analisis financiero y de tendencias (prorrateado)',tipo:'fijo',driver:'',volumenBase:null,precio:2836.67,precioPorUnidad:null},
  {area:'contabilidad',segmento:'grande',actividad:'Consolidacion financiera multi-empresa',tipo:'volumen',driver:'# empresas del grupo',volumenBase:3,precio:3545.83,precioPorUnidad:1181.94},
  {area:'contabilidad',segmento:'grande',actividad:'Soporte en operaciones intercompania',tipo:'volumen',driver:'# transacciones intercompania/mes',volumenBase:20,precio:2127.5,precioPorUnidad:106.38},
  {area:'contabilidad',segmento:'grande',actividad:'Reportes ejecutivos para direccion',tipo:'fijo',driver:'',volumenBase:null,precio:2836.67,precioPorUnidad:null},
  {area:'compras',segmento:'pf',actividad:'Catalogo basico de proveedores',tipo:'fijo',driver:'',volumenBase:null,precio:86.02,precioPorUnidad:null},
  {area:'compras',segmento:'pf',actividad:'Comparacion de precios',tipo:'volumen',driver:'# compras/mes',volumenBase:3,precio:258.07,precioPorUnidad:86.02},
  {area:'compras',segmento:'pf',actividad:'Validacion 69-B SAT',tipo:'volumen',driver:'# proveedores nuevos/mes',volumenBase:1,precio:172.04,precioPorUnidad:172.04},
  {area:'compras',segmento:'pyme',actividad:'Catalogo de proveedores',tipo:'fijo',driver:'',volumenBase:null,precio:203.68,precioPorUnidad:null},
  {area:'compras',segmento:'pyme',actividad:'Comparacion de precios',tipo:'volumen',driver:'# compras/mes',volumenBase:12,precio:611.05,precioPorUnidad:50.92},
  {area:'compras',segmento:'pyme',actividad:'Validacion 69-B SAT',tipo:'volumen',driver:'# proveedores nuevos/mes',volumenBase:3,precio:407.37,precioPorUnidad:135.79},
  {area:'compras',segmento:'pyme',actividad:'Sourcing y evaluacion de proveedores',tipo:'volumen',driver:'# proveedores evaluados/mes',volumenBase:8,precio:611.05,precioPorUnidad:76.38},
  {area:'compras',segmento:'pyme',actividad:'Negociacion de condiciones comerciales',tipo:'volumen',driver:'# proveedores/mes',volumenBase:15,precio:814.74,precioPorUnidad:54.32},
  {area:'compras',segmento:'pyme',actividad:'Emision y seguimiento de OC',tipo:'volumen',driver:'# ordenes de compra/mes',volumenBase:15,precio:814.74,precioPorUnidad:54.32},
  {area:'compras',segmento:'pyme',actividad:'Control de inventario',tipo:'fijo',driver:'',volumenBase:null,precio:407.37,precioPorUnidad:null},
  {area:'compras',segmento:'pyme',actividad:'KPIs de compras',tipo:'fijo',driver:'',volumenBase:null,precio:407.37,precioPorUnidad:null},
  {area:'compras',segmento:'grande',actividad:'Catalogo de proveedores',tipo:'fijo',driver:'',volumenBase:null,precio:372.83,precioPorUnidad:null},
  {area:'compras',segmento:'grande',actividad:'Sourcing y evaluacion de proveedores',tipo:'volumen',driver:'# proveedores evaluados/mes',volumenBase:20,precio:1118.48,precioPorUnidad:55.92},
  {area:'compras',segmento:'grande',actividad:'Negociacion de condiciones comerciales',tipo:'volumen',driver:'# proveedores/mes',volumenBase:50,precio:1491.31,precioPorUnidad:29.83},
  {area:'compras',segmento:'grande',actividad:'Emision y seguimiento de OC',tipo:'volumen',driver:'# ordenes de compra/mes',volumenBase:50,precio:1491.31,precioPorUnidad:29.83},
  {area:'compras',segmento:'grande',actividad:'Control de inventario',tipo:'fijo',driver:'',volumenBase:null,precio:745.65,precioPorUnidad:null},
  {area:'compras',segmento:'grande',actividad:'KPIs de compras',tipo:'fijo',driver:'',volumenBase:null,precio:745.65,precioPorUnidad:null},
  {area:'compras',segmento:'grande',actividad:'Licitaciones RFQ',tipo:'volumen',driver:'# licitaciones/mes',volumenBase:2,precio:1864.14,precioPorUnidad:932.07},
  {area:'compras',segmento:'grande',actividad:'Gestion de contratos con proveedores',tipo:'volumen',driver:'# contratos activos',volumenBase:15,precio:1118.48,precioPorUnidad:74.57},
  {area:'compras',segmento:'grande',actividad:'Soporte comercio exterior',tipo:'fijo',driver:'',volumenBase:null,precio:1118.48,precioPorUnidad:null},
];

// Devuelve los drivers de volumen (unicos) que aplican a un area+segmento, con su etiqueta y valor base sugerido.
function getAreaVolumeDrivers(areaId, segmentId) {
  const seen = {};
  const out = [];
  ACTIVITY_COSTING.forEach(function (row) {
    if (row.area !== areaId || row.segmento !== segmentId || row.tipo !== "volumen") return;
    if (seen[row.driver]) return;
    seen[row.driver] = true;
    out.push({ driver: row.driver, volumenBase: row.volumenBase });
  });
  return out;
}

// Precio mensual del area para un cliente especifico, dado el volumen real que reporto por cada driver.
// volumenInputs: { [driver]: cantidad }  -- si un driver no viene, se usa el volumenBase como referencia.
function computeAreaPriceByVolume(areaId, segmentId, volumenInputs) {
  volumenInputs = volumenInputs || {};
  let total = 0;
  ACTIVITY_COSTING.forEach(function (row) {
    if (row.area !== areaId || row.segmento !== segmentId) return;
    if (row.tipo === "fijo") {
      total += row.precio;
    } else {
      const cantidad = (typeof volumenInputs[row.driver] === "number" && volumenInputs[row.driver] >= 0)
        ? volumenInputs[row.driver]
        : row.volumenBase;
      total += row.precioPorUnidad * cantidad;
    }
  });
  return total;
}

// Tope de fee relativo a facturacion mensual del cliente (supuesto editable).
const TOPE_FACTURACION = { unaArea: 0.08, paqueteCompleto: 0.18 };

function checkTopeFacturacion(feeMensualTotal, facturacionMensual, numAreas) {
  if (!facturacionMensual || facturacionMensual <= 0) return { excede: false, pct: null, tope: null };
  const pct = feeMensualTotal / facturacionMensual;
  const tope = numAreas <= 1 ? TOPE_FACTURACION.unaArea : TOPE_FACTURACION.paqueteCompleto;
  return { excede: pct > tope, pct: pct, tope: tope };
}


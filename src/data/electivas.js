// Catálogo de materias electivas — Ing. Civil ITBA
// Fuente: plan-estudio-civil-2025.pdf (itba.edu.ar/grado/ingenieria-civil)
//
// OJO: el PDF publica SOLO los nombres. No trae códigos, créditos ni
// correlativas. Los créditos de acá abajo son una ESTIMACIÓN (3 por defecto,
// 6 para las de matemática) y son editables desde el panel de electivas.
// Corregilos con los datos reales del SGA cuando los tengas.

export const CREDITOS_ELECTIVAS_REQ = 30;

const cat = (categoria, nombres, cred = 3) =>
  nombres.map(nombre => ({
    id: 'EL-' + nombre.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    nombre,
    categoria,
    cred,
  }));

export const electivasCatalogo = [
  ...cat('Gestión y Negocios', [
    'Desarrollo de Negocios',
    'Sistema Monetario y Financiero en Argentina',
    'Economía Empresaria',
    'Introducción a las Finanzas',
    'Finanzas de la Empresa',
    'Estructura de las Organizaciones',
    'Marketing',
    'Planeamiento Estratégico',
    'Teoría de la Decisión',
    'Gestión de Calidad',
    'Gestión de Proyectos',
    'Formulación y Evaluación de Proyectos',
    'Evaluación de Proyectos',
    'Calidad',
    'Gestión de Servicios',
  ]),
  ...cat('Datos e IA', [
    'Sistemas de Inteligencia Artificial',
    'Estructura de Datos y Programación',
    'Gestión de Datos',
    'Redes Neuronales',
    'Deep Learning',
  ]),
  ...cat('Matemática', [
    'Análisis Matemático IV',
    'Análisis Matemático V',
    'Complementos de Matemática V',
    'Métodos Numéricos Avanzados',
  ], 6),
  ...cat('Ingeniería y Diseño', [
    'Representación Gráfica para Ingeniería Civil',
    'Acústica para Ingenieros',
    'Prototipado e Impresión 3D',
    'Energías Renovables',
    'Energías Convencionales',
  ]),
  ...cat('Humanidades y Desarrollo', [
    'Filosofía',
    'Ética en los Negocios',
    'Comunicación Estratégica',
    'Creatividad',
    'Formación para Emprendedores',
    'Neurociencias y Desarrollo Productivo',
    'Introducción a la Investigación',
  ]),
];

export const categoriasElectivas = [...new Set(electivasCatalogo.map(e => e.categoria))];

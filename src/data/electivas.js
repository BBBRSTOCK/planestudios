// Catálogo de materias electivas — Ing. Civil ITBA
//
// Datos tomados del listado oficial de electivas del plan (código, créditos,
// créditos requeridos y correlativas). Reemplaza a la lista del PDF de
// difusión, que estaba desactualizada y sólo publicaba los nombres.
//
// cred     : créditos que otorga la materia
// reqCred  : créditos de la carrera que hay que tener aprobados para cursarla
// corr     : correlativas (códigos de materias del plan o de otras electivas)

export const CREDITOS_ELECTIVAS_REQ = 30;

export const electivasCatalogo = [
  // --- Gestión y Negocios ---
  { id: '11.05', nombre: 'Calidad',                                cred: 3, categoria: 'Gestión y Negocios' },
  { id: '11.39', nombre: 'Marketing',                              cred: 3, categoria: 'Gestión y Negocios' },
  { id: '11.46', nombre: 'Planeamiento Estratégico',               cred: 3, categoria: 'Gestión y Negocios' },
  { id: '11.73', nombre: 'Teoría de la Decisión',                  cred: 3, categoria: 'Gestión y Negocios', reqCred: 144 },
  { id: '11.76', nombre: 'Gestión de Calidad',                     cred: 3, categoria: 'Gestión y Negocios', corr: ['93.24'] },
  { id: '11.84', nombre: 'Gestión de Proyectos',                   cred: 3, categoria: 'Gestión y Negocios', reqCred: 160 },
  { id: '11.89', nombre: 'Formulación y Evaluación de Proyectos',  cred: 3, categoria: 'Gestión y Negocios' },
  { id: '46.82', nombre: 'Evaluación de Proyectos',                cred: 3, categoria: 'Gestión y Negocios' },
  { id: '47.87', nombre: 'Desarrollo de Negocios',                 cred: 3, categoria: 'Gestión y Negocios' },
  { id: '61.04', nombre: 'Sistema Monetario y Financiero en Argentina', cred: 3, categoria: 'Gestión y Negocios' },
  { id: '61.09', nombre: 'Economía Empresaria',                    cred: 6, categoria: 'Gestión y Negocios', corr: ['93.24'] },
  { id: '61.16', nombre: 'Introducción a las Finanzas',            cred: 3, categoria: 'Gestión y Negocios', corr: ['11.15', '61.27'] },
  { id: '61.50', nombre: 'Finanzas de la Empresa',                 cred: 3, categoria: 'Gestión y Negocios' },
  { id: '81.59', nombre: 'Gestión de Servicios',                   cred: 3, categoria: 'Gestión y Negocios' },
  { id: '94.40', nombre: 'Estructura de las Organizaciones',       cred: 3, categoria: 'Gestión y Negocios', corr: ['94.44'] },

  // --- Datos e IA ---
  { id: '25.63', nombre: 'Redes Neuronales',                       cred: 3, categoria: 'Datos e IA' },
  { id: '25.64', nombre: 'Deep Learning',                          cred: 3, categoria: 'Datos e IA' },
  { id: '71.22', nombre: 'Sistemas de Inteligencia Artificial',    cred: 3, categoria: 'Datos e IA', corr: ['71.88'] },
  { id: '71.59', nombre: 'Estructura de Datos y Programación',     cred: 6, categoria: 'Datos e IA', corr: ['71.58'] },
  { id: '71.88', nombre: 'Gestión de Datos',                       cred: 6, categoria: 'Datos e IA', corr: ['71.59'] },

  // --- Matemática ---
  { id: '92.04', nombre: 'Análisis Matemático IV',                 cred: 6, categoria: 'Matemática', corr: ['92.02', '92.03'] },
  { id: '92.07', nombre: 'Análisis Matemático V',                  cred: 4, categoria: 'Matemática', corr: ['92.04'] },
  { id: '92.97', nombre: 'Complementos de Matemática V',           cred: 2, categoria: 'Matemática' },
  { id: '93.75', nombre: 'Métodos Numéricos Avanzados',            cred: 6, categoria: 'Matemática', corr: ['93.07'] },

  // --- Ingeniería y Diseño ---
  { id: '10.08', nombre: 'Energías Renovables',                    cred: 3, categoria: 'Ingeniería y Diseño' },
  { id: '10.12', nombre: 'Energías Convencionales',                cred: 3, categoria: 'Ingeniería y Diseño' },
  { id: '11.19', nombre: 'Prototipado e Impresión 3D',             cred: 3, categoria: 'Ingeniería y Diseño' },
  { id: '25.66', nombre: 'Acústica para Ingenieros',               cred: 3, categoria: 'Ingeniería y Diseño' },
  { id: '67.23', nombre: 'Sustentabilidad y Eficiencia Energética en la Construcción', cred: 3, categoria: 'Ingeniería y Diseño', corr: ['93.42'] },
  { id: '68.99', nombre: 'Introducción a la Ciencia de Ciudades',  cred: 1, categoria: 'Ingeniería y Diseño', reqCred: 144 },
  { id: '92.20', nombre: 'Representación Gráfica para Ingeniería Civil', cred: 1, categoria: 'Ingeniería y Diseño', corr: ['31.08'] },

  // --- Humanidades y Desarrollo ---
  { id: '10.07', nombre: 'Creatividad',                            cred: 3, categoria: 'Humanidades y Desarrollo' },
  { id: '10.09', nombre: 'Formación para Emprendedores',           cred: 3, categoria: 'Humanidades y Desarrollo' },
  { id: '16.04', nombre: 'Neurociencias y Desarrollo Productivo',  cred: 3, categoria: 'Humanidades y Desarrollo' },
  { id: '25.69', nombre: 'Introducción a la Investigación',        cred: 3, categoria: 'Humanidades y Desarrollo', reqCred: 183 },
  { id: '94.42', nombre: 'Comunicación Estratégica',               cred: 3, categoria: 'Humanidades y Desarrollo' },
  { id: '94.61', nombre: 'Filosofía',                              cred: 3, categoria: 'Humanidades y Desarrollo' },
  { id: '94.62', nombre: 'Ética en los Negocios',                  cred: 3, categoria: 'Humanidades y Desarrollo', reqCred: 72 },
];

export const categoriasElectivas = [...new Set(electivasCatalogo.map(e => e.categoria))];

export const electivaPorId = Object.fromEntries(electivasCatalogo.map(e => [e.id, e]));

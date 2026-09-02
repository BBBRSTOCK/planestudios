import React, { useState, useCallback, useEffect, useMemo } from 'react';
import ReactFlow, { 
  applyNodeChanges, 
  Background, 
  Controls, 
  MarkerType, 
  ReactFlowProvider,
  Position,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';
import { electivasCatalogo, categoriasElectivas, electivaPorId, CREDITOS_ELECTIVAS_REQ } from './data/electivas.js';

const PASO_X = 400;        // separacion entre cuatrimestres
const ANCHO_CARD = 280;    // ancho de una card de materia
const CUATS = 10;

// Nodos de fondo: no se arrastran, no se seleccionan y no reciben clicks.
function ZonaAno({ data }) {
  return (
    <div className="zona-ano" style={{ width: data.w, height: data.h }}>
      <div className="zona-ano-tag">{data.etiqueta}</div>
      {!data.ultimo && <div className="zona-ano-linea" />}
    </div>
  );
}

function ZonaIntercambio({ data }) {
  return (
    <div className="zona-intercambio" style={{ width: data.w, height: data.h }}>
      <div className="zona-intercambio-tag">
        ✈ INTERCAMBIO · C{data.cuat} · {data.cantidad} materia{data.cantidad === 1 ? '' : 's'}
      </div>
    </div>
  );
}

// Definido afuera del componente: si se recrea en cada render, React Flow avisa.
const nodeTypes = { zonaAno: ZonaAno, zonaIntercambio: ZonaIntercambio };

const cuatrimestreColores = ['#ff4d4d', '#ff944d', '#33cc33', '#00c9c9ff', '#9966ff', '#ff3399', '#00cccc', '#ff0055', '#00ffa2', '#ffffff'];
const TOTAL_CREDITOS_CARRERA = 221;

// --- DEFINICIÓN DE RAMAS ---
const RAMAS = {
  BASICAS: { nombre: 'Ciencias Básicas', color: '#666' },

  GESTION: { nombre: 'Gestor de Proyectos', color: '#9966ff' },
  ESTRUCTURAL: { nombre: 'Estructural', color: '#ff4d4d' },
  VIAS: { nombre: 'Vías y Geotecnia', color: '#ff944d' },

  HIDRAULICO: { nombre: 'Hidráulico', color: '#00d4ff' },
  AMBIENTAL: { nombre: 'Ambiental', color: '#33cc33' },
  ELECTIVA: { nombre: 'Electivas', color: '#d38901' }
};

// --- LISTA DE MATERIAS (Con Rama y Evaluación) ---
const listaMaterias = [
  { id: '12.67', cuat: 1, nombre: 'Química General',                          cred: 6, rama: 'BASICAS', ev: { p: 2, tp: 0, f: true, pro: false } },
  { id: '71.58', cuat: 1, nombre: 'Informática General',                      cred: 3, rama: 'BASICAS', ev: { p: 2, tp: 0, f: true, pro: true } },
  { id: '92.01', cuat: 1, nombre: 'Análisis Matemático I',                    cred: 6, esencial: true, rama: 'BASICAS', ev: { p: 2, tp: 0, f: true, pro: false } },
  { id: '93.18', cuat: 1, nombre: 'Álgebra Lineal',                           cred: 6, esencial: true, rama: 'BASICAS', ev: { p: 2, tp: 0, f: true, pro: false } },
  { id: '94.33', cuat: 1, nombre: 'Tecnología y Sociedad',                    cred: 3, rama: 'BASICAS', ev: { p: 0, tp: 10, f: false, pro: false } },
  { id: '16.55', cuat: 2, nombre: 'Biología',                                 cred: 3, rama: 'BASICAS', ev: { p: 1, tp: 6, f: true, pro: false } },
  { id: '31.08', cuat: 2, nombre: 'Sistemas de Representación',               cred: 3, rama: 'BASICAS', ev: { p: 2, tp: 4, f: true, pro: false } },
  { id: '67.04', cuat: 2, nombre: 'Introducción a la Temática Social',        cred: 3, rama: 'AMBIENTAL', ev: { p: 0, tp: 1, f: true, pro: false } },
  { id: '71.90', cuat: 2, nombre: 'Certificaciones Tecnológicas',             cred: 0, rama: 'BASICAS', ev: { p: 0, tp: 0, f: true, pro: false } },
  { id: '92.02', cuat: 2, nombre: 'Análisis Matemático II',                   cred: 6, esencial: true, rama: 'BASICAS', ev: { p: 2, tp: 0, f: true, pro: false } },
  { id: '93.41', cuat: 2, nombre: 'Física I',                                 cred: 6, esencial: true, rama: 'BASICAS', ev: { p: 1, tp: 4, f: true, pro: false } },
  { id: '67.02', cuat: 3, nombre: 'Estática',                                 cred: 6, esencial: true, rama: 'ESTRUCTURAL', ev: { p: 2, tp: 0, f: true, pro: false } },
  { id: '92.03', cuat: 3, nombre: 'Análisis Matemático III',                  cred: 6, esencial: true, rama: 'BASICAS', ev: { p: 2, tp: 0, f: true, pro: false } },
  { id: '93.24', cuat: 3, nombre: 'Probabilidad y Estadística',               cred: 6, rama: 'BASICAS', ev: { p: 1, tp: 3, f: true, pro: false } },
  { id: '93.42', cuat: 3, nombre: 'Física II',                                cred: 6, rama: 'BASICAS', ev: { p: 1, tp: 4, f: true, pro: false } },
  { id: '94.51', cuat: 3, nombre: 'Inglés I',                                 cred: 0, rama: 'BASICAS', ev: { p: 0, tp: 0, f: true, pro: true } },
  { id: '31.22', cuat: 4, nombre: 'Mecánica de Fluidos',                      cred: 6, esencial: true, rama: 'HIDRAULICO', ev: { p: 2, tp: 3, f: true, pro: false } },
  { id: '67.01', cuat: 4, nombre: 'Tecnología de Materiales',                 cred: 3, rama: 'VIAS', ev: { p: 0, tp: 10, f: true, pro: false } },
  { id: '67.03', cuat: 4, nombre: 'Resistencia de Materiales',                cred: 6, esencial: true, rama: 'ESTRUCTURAL', ev: { p: 2, tp: 2, f: true, pro: false } },
  { id: '93.43', cuat: 4, nombre: 'Física III',                               cred: 6, rama: 'BASICAS', ev: { p: 1, tp: 4, f: true, pro: false } },
  { id: '11.15', cuat: 5, nombre: 'Organización Industrial',                  cred: 3, rama: 'GESTION', ev: { p: 1, tp: 1, f: true, pro: true } },
  { id: '67.05', cuat: 5, nombre: 'Tecnología del Hormigón',                  cred: 3, rama: 'ESTRUCTURAL', ev: { p: 1, tp: 2, f: true, pro: true } },
  { id: '67.06', cuat: 5, nombre: 'Construcciones',                           cred: 6, esencial: true, rama: 'GESTION', ev: { p: 2, tp: 2, f: true, pro: false } },
  { id: '67.08', cuat: 5, nombre: 'Análisis Estructural',                     cred: 4, rama: 'ESTRUCTURAL', ev: { p: 2, tp: 1, f: true, pro: false } },
  { id: '93.07', cuat: 5, nombre: 'Métodos Numéricos',                        cred: 3, rama: 'BASICAS', ev: { p: 2, tp: 1, f: false, pro: true } },
  { id: '94.43', cuat: 5, nombre: 'Metodología del Diseño',                   cred: 3, reqCred: 72, rama: 'GESTION', ev: { p: 0, tp: 2, f: false, pro: true } },
  { id: '46.21', cuat: 6, nombre: 'Geología I',                               cred: 3, rama: 'VIAS', ev: { p: 1, tp: 1, f: true, pro: true } },
  { id: '67.07', cuat: 6, nombre: 'Geotopografía',                            cred: 6, rama: 'VIAS', ev: { p: 2, tp: 2, f: true, pro: false } },
  { id: '67.09', cuat: 6, nombre: 'Instalaciones',                            cred: 6, rama: 'GESTION', ev: { p: 2, tp: 3, f: true, pro: false } },
  { id: '67.10', cuat: 6, nombre: 'Hormigón I',                               cred: 4, esencial: true, rama: 'ESTRUCTURAL', ev: { p: 2, tp: 4, f: true, pro: false } },
  { id: '94.44', cuat: 6, nombre: 'Proyecto Interdisciplinario',              cred: 3, rama: 'GESTION', ev: { p: 0, tp: 1, f: false, pro: true } },
  { id: '94.52', cuat: 6, nombre: 'Inglés II',                                cred: 0, rama: 'BASICAS', ev: { p: 1, tp: 0, f: false, pro: true } },
  { id: '61.27', cuat: 7, nombre: 'Análisis de Coyuntura Economica',          cred: 3, rama: 'GESTION', ev: { p: 1, tp: 1, f: true, pro: true } },
  { id: '61.31', cuat: 7, nombre: 'Derecho para Ingenieros',                  cred: 3, rama: 'GESTION', ev: { p: 2, tp: 0, f: true, pro: true } },
  { id: '67.11', cuat: 7, nombre: 'Evaluacion de Impacto Ambiental y Social', cred: 2, rama: 'AMBIENTAL', ev: { p: 0, tp: 2, f: false, pro: true } },
  { id: '67.12', cuat: 7, nombre: 'Geotecnia',                                cred: 6, esencial: true, rama: 'VIAS', ev: { p: 2, tp: 2, f: true, pro: false } },
  { id: '67.13', cuat: 7, nombre: 'Hidrología y Obras Hidraulicas',           cred: 4, rama: 'HIDRAULICO', ev: { p: 1, tp: 2, f: true, pro: true } },
  { id: '67.14', cuat: 8, nombre: 'Hormigón II',                              cred: 4, rama: 'ESTRUCTURAL', ev: { p: 2, tp: 2, f: true, pro: false } },
  { id: '67.15', cuat: 8, nombre: 'Planeamiento Territorial',                 cred: 3, rama: 'VIAS', ev: { p: 1, tp: 1, f: true, pro: true } },
  { id: '67.16', cuat: 8, nombre: 'Vías de Comunicación',                     cred: 6, rama: 'VIAS', ev: { p: 2, tp: 2, f: true, pro: false } },
  { id: '67.17', cuat: 8, nombre: 'Higiene y Seguridad en Obras',             cred: 3, rama: 'GESTION', ev: { p: 1, tp: 1, f: true, pro: true } },
  { id: '17.20', cuat: 9, nombre: 'Agua y Efluentes Líquidos',                cred: 3, rama: 'HIDRAULICO', ev: { p: 1, tp: 2, f: true, pro: true } },
  { id: '67.18', cuat: 9, nombre: 'Proyecto Final',                           cred: 6, esencial: true, reqCred: 144, rama: 'GESTION', ev: { p: 0, tp: 1, f: false, pro: false } },
  { id: '67.19', cuat: 9, nombre: 'Cimentaciones',                            cred: 4, rama: 'VIAS', ev: { p: 2, tp: 1, f: true, pro: false } },
  { id: '67.20', cuat: 9, nombre: 'Estructuras Metálicas',                    cred: 4, rama: 'ESTRUCTURAL', ev: { p: 1, tp: 2, f: true, pro: false } },
  { id: '67.21', cuat: 9, nombre: 'Organización y Conducción de Obras',       cred: 3, rama: 'GESTION', ev: { p: 1, tp: 1, f: true, pro: false } },
  { id: '67.22', cuat: 9, nombre: 'Auditorías Ambientales',                   cred: 3, rama: 'AMBIENTAL', ev: { p: 1, tp: 1, f: true, pro: true } },
  { id: '94.65', cuat: 10, nombre: 'PPS',                                     cred: 0, reqCred: 144, rama: 'GESTION', ev: { p: 0, tp: 1, f: false, pro: false } },
  { id: 'ELEC', cuat: 10, nombre: 'Electivas',                                cred: 0, rama: 'ELECTIVA', esHub: true }
];

const correlativasBase = [
  { source: '92.01', target: '92.02' }, { source: '93.18', target: '92.02' },
  { source: '92.01', target: '93.41' },
  { source: '93.18', target: '67.02' }, { source: '93.41', target: '67.02' },
  { source: '92.01', target: '92.03' }, { source: '93.18', target: '92.03' },
  { source: '92.02', target: '93.24' },
  { source: '92.02', target: '93.42' },
  { source: '92.03', target: '31.22' }, { source: '93.41', target: '31.22' },
  { source: '93.41', target: '67.01' }, { source: '12.67', target: '67.01' },
  { source: '67.02', target: '67.03' },
  { source: '92.03', target: '93.43' }, { source: '93.41', target: '93.43' },
  { source: '67.01', target: '67.05' }, { source: '93.24', target: '67.05' },
  { source: '67.01', target: '67.06' },
  { source: '67.03', target: '67.08' },
  { source: '71.58', target: '93.07' }, { source: '92.03', target: '93.07' },
  { source: '93.42', target: '46.21' },
  { source: '93.18', target: '67.07' }, { source: '93.42', target: '67.07' }, { source: '93.24', target: '67.07' },
  { source: '67.06', target: '67.09' },
  { source: '67.03', target: '67.10' }, { source: '67.06', target: '67.10' }, { source: '67.05', target: '67.10' },
  { source: '94.43', target: '94.44' },
  { source: '94.51', target: '94.52' },
  { source: '93.24', target: '61.27' },
  { source: '94.33', target: '61.31' },
  { source: '16.55', target: '67.11' }, { source: '12.67', target: '67.11' }, { source: '67.06', target: '67.11' },
  { source: '31.22', target: '67.12' }, { source: '67.03', target: '67.12' }, { source: '67.07', target: '67.12' },
  { source: '31.22', target: '67.13' }, { source: '67.03', target: '67.13' }, { source: '67.07', target: '67.13' },
  { source: '67.10', target: '67.14' }, { source: '93.07', target: '67.14' }, { source: '67.08', target: '67.14' },
  { source: '67.11', target: '67.15' }, { source: '61.31', target: '67.15' }, { source: '67.07', target: '67.15' },
  { source: '67.12', target: '67.16' }, { source: '67.13', target: '67.16' }, { source: '67.05', target: '67.16' }, { source: '67.06', target: '67.16' },
  { source: '67.06', target: '67.17' },
  { source: '67.12', target: '17.20' }, { source: '67.13', target: '17.20' }, { source: '67.09', target: '17.20' },
  { source: '67.10', target: '67.19' }, { source: '67.08', target: '67.19' }, { source: '67.12', target: '67.19' }, { source: '67.13', target: '67.19' },
  { source: '67.10', target: '67.20' }, { source: '67.08', target: '67.20' },
  { source: '67.06', target: '67.21' }, { source: '67.12', target: '67.21' }, { source: '67.09', target: '67.21' }, { source: '67.10', target: '67.21' }, { source: '11.15', target: '67.21' },
  { source: '67.11', target: '67.22' },
].map(c => ({ ...c, id: `e-${c.source}-${c.target}` }));

const findRecursiveAncestors = (nodeId, edges, results = new Set()) => {
  edges.forEach(edge => {
    if (edge.target === nodeId && !results.has(edge.source)) {
      results.add(edge.source);
      findRecursiveAncestors(edge.source, edges, results);
    }
  });
  return results;
};

const requisitosTexto = (el) => {
  const partes = [];
  if (el.corr?.length) partes.push('correlativas ' + el.corr.join(' + '));
  if (el.reqCred) partes.push(el.reqCred + ' créditos');
  return partes.length ? ' · requiere ' + partes.join(' y ') : '';
};

const normalizar = (t) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const getDynamicColor = (sNode, tNode) => {
  const cuatSource = Math.round(sNode.position.x / 400);
  const cuatTarget = Math.round(tNode.position.x / 400);
  if (cuatSource === cuatTarget) return '#0072ff'; 
  const dx = tNode.position.x - sNode.position.x;
  if (dx < 450) return '#FF4444'; 
  if (dx < 850) return '#FF944D'; 
  return '#FFD600'; 
};

function MapaCivil() {
  const [nodes, setNodes] = useState([]);
  const [aprobadas, setAprobadas] = useState({});
  const [hoverNode, setHoverNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null); // Nuevo: Materia seleccionada
  const [ramaFiltro, setRamaFiltro] = useState(null); // Nuevo: Filtro de rama
  const [isOpen, setIsOpen] = useState(false);
  const [showElectivas, setShowElectivas] = useState(false); // Nuevo: panel de electivas
  const [electivas, setElectivas] = useState({});            // Nuevo: { id: { cuat, cred } }
  const [busqueda, setBusqueda] = useState('');
  const [intercambio, setIntercambio] = useState(null); // cuatrimestre marcado como intercambio
  const { fitView } = useReactFlow();

  const onNodeDoubleClick = useCallback((event, node) => {
    if (String(node.id).startsWith('__')) return;
    if (node.data?.esHub) { setShowElectivas(true); return; }
    setAprobadas(prev => {
      const nuevoEstado = { ...prev, [node.id]: !prev[node.id] };
      // Guardamos inmediatamente en el storage para no perder cambios
      localStorage.setItem('prog-v21', JSON.stringify(nuevoEstado));
      return nuevoEstado;
    });
  }, []);

  // --- ELECTIVAS: agregar / quitar / editar ---
  const guardarElectivas = useCallback((next) => {
    localStorage.setItem('elec-v1', JSON.stringify(next));
    return next;
  }, []);

  const toggleElectiva = useCallback((el) => {
    setElectivas(prev => {
      const next = { ...prev };
      if (next[el.id]) {
        delete next[el.id];
        const pos = JSON.parse(localStorage.getItem('pos-v21') || '{}');
        delete pos[el.id];
        localStorage.setItem('pos-v21', JSON.stringify(pos));
        // si la sacamos del mapa, tambien limpiamos su estado de aprobada
        setAprobadas(ap => {
          if (!ap[el.id]) return ap;
          const { [el.id]: _, ...resto } = ap;
          localStorage.setItem('prog-v21', JSON.stringify(resto));
          return resto;
        });
      } else {
        next[el.id] = { cuat: 10 };
      }
      return guardarElectivas(next);
    });
  }, [guardarElectivas]);

  const cambiarCuatrimestre = useCallback((id, cuat) => {
    // Se mueve de columna: olvidamos la posicion vieja y sacamos el nodo
    // para que el efecto de sincronizacion lo vuelva a colocar donde va.
    const pos = JSON.parse(localStorage.getItem('pos-v21') || '{}');
    delete pos[id];
    localStorage.setItem('pos-v21', JSON.stringify(pos));
    setNodes(nds => nds.filter(nd => nd.id !== id));
    setElectivas(prev => {
      if (!prev[id]) return prev;
      return guardarElectivas({ ...prev, [id]: { ...prev[id], cuat } });
    });
  }, [guardarElectivas]);

  // Materias del plan + las electivas que el usuario eligio poner en el mapa
  const materiasActivas = useMemo(() => {
    const elegidas = Object.entries(electivas).map(([id, cfg]) => {
      const base = electivaPorId[id];
      if (!base) return null; // el catalogo cambio y esta electiva ya no existe
      return { ...base, cuat: cfg.cuat, rama: 'ELECTIVA', esElectiva: true };
    }).filter(Boolean);

    return [...listaMaterias, ...elegidas].sort((a, b) =>
      a.cuat !== b.cuat
        ? a.cuat - b.cuat
        : (a.esencial === b.esencial ? b.cred - a.cred : a.esencial ? -1 : 1)
    );
  }, [electivas]);

  // Correlativas del plan + las que aportan las electivas elegidas.
  // "todas" manda para calcular disponibilidad; "visibles" son las que se
  // pueden dibujar porque los dos extremos estan en el mapa.
  const correlativas = useMemo(() => {
    const deElectivas = Object.keys(electivas).flatMap(id => {
      const base = electivaPorId[id];
      return (base?.corr || []).map(source => ({ id: `e-${source}-${id}`, source, target: id }));
    });
    return [...correlativasBase, ...deElectivas];
  }, [electivas]);

  const idsEnMapa = useMemo(() => new Set(materiasActivas.map(m => m.id)), [materiasActivas]);

  const correlativasVisibles = useMemo(
    () => correlativas.filter(e => idsEnMapa.has(e.source) && idsEnMapa.has(e.target)),
    [correlativas, idsEnMapa]
  );

  // Carga inicial del storage
  useEffect(() => {
    setAprobadas(JSON.parse(localStorage.getItem('prog-v21') || '{}'));
    setElectivas(JSON.parse(localStorage.getItem('elec-v1') || '{}'));
    setIntercambio(JSON.parse(localStorage.getItem('intercambio-v1') || 'null'));
    setTimeout(() => fitView({ padding: 0.15 }), 400);
  }, [fitView]);

  // Sincroniza los nodos cuando cambian las materias activas, respetando posiciones
  useEffect(() => {
    const savedPos = JSON.parse(localStorage.getItem('pos-v21') || '{}');
    setNodes(prev => {
      const posPrevias = Object.fromEntries(prev.map(nd => [nd.id, nd.position]));
      const usadosPorCuat = {};
      return materiasActivas.map(m => {
        const index = usadosPorCuat[m.cuat] = (usadosPorCuat[m.cuat] ?? -1) + 1;
        return {
          id: m.id,
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
          data: { ...m },
          position: posPrevias[m.id] || savedPos[m.id] || { x: m.cuat * 400, y: index * 180 },
          className: 'materia-card',
        };
      });
    });
  }, [materiasActivas]);

  const onNodeDragStop = useCallback((event, node) => {
    const currentPos = JSON.parse(localStorage.getItem('pos-v21') || '{}');
    currentPos[node.id] = node.position;
    localStorage.setItem('pos-v21', JSON.stringify(currentPos));
  }, []);

  // Alto que tiene que cubrir el fondo: hasta la card mas baja de todo el mapa
  const altoMapa = useMemo(() => {
    const max = nodes.reduce((m, nd) => Math.max(m, nd.position.y + (nd.height || 150)), 0);
    return Math.max(max + 90, 720);
  }, [nodes]);

  const rangoIntercambio = intercambio
    ? { x0: intercambio * PASO_X - 30, x1: intercambio * PASO_X - 30 + ANCHO_CARD + 60 }
    : null;

  // Una materia esta "adentro" si su centro cae dentro del recuadro
  const materiasEnIntercambio = useMemo(() => {
    if (!rangoIntercambio) return [];
    return nodes.filter(nd => {
      if (nd.data?.esHub) return false;
      const centro = nd.position.x + ANCHO_CARD / 2;
      return centro >= rangoIntercambio.x0 && centro <= rangoIntercambio.x1;
    });
  }, [nodes, rangoIntercambio?.x0, rangoIntercambio?.x1]); // eslint-disable-line react-hooks/exhaustive-deps

  const nodosFondo = useMemo(() => {
    const fondo = [];

    // Una banda por año, cada una cubre dos cuatrimestres
    for (let ano = 1; ano <= CUATS / 2; ano++) {
      const cuatIzq = ano * 2 - 1;
      fondo.push({
        id: `__ano-${ano}`,
        type: 'zonaAno',
        draggable: false, selectable: false, zIndex: 1,
        // React Flow deja el nodo en visibility:hidden hasta que lo mide;
        // como no pasamos sus cambios de dimension, le damos el tamano ya hecho.
        width: PASO_X + ANCHO_CARD + 90, height: altoMapa + 115,
        style: { pointerEvents: 'none' },
        position: { x: cuatIzq * PASO_X - 45, y: -115 },
        data: {
          w: PASO_X + ANCHO_CARD + 90,
          h: altoMapa + 115,
          etiqueta: `${ano}° AÑO`,
          ultimo: ano === CUATS / 2,
        },
      });
    }

    if (rangoIntercambio) {
      fondo.push({
        id: '__intercambio',
        type: 'zonaIntercambio',
        draggable: false, selectable: false, zIndex: 2,
        width: ANCHO_CARD + 60, height: altoMapa + 65,
        style: { pointerEvents: 'none' },
        position: { x: rangoIntercambio.x0, y: -65 },
        data: {
          w: ANCHO_CARD + 60,
          h: altoMapa + 65,
          cuat: intercambio,
          cantidad: materiasEnIntercambio.length,
        },
      });
    }

    return fondo;
  }, [altoMapa, intercambio, rangoIntercambio?.x0, materiasEnIntercambio.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const cambiarIntercambio = useCallback((cuat) => {
    setIntercambio(cuat);
    localStorage.setItem('intercambio-v1', JSON.stringify(cuat));
  }, []);

  const stats = useMemo(() => {
    const credsPlan = listaMaterias.reduce((acc, m) => aprobadas[m.id] ? acc + m.cred : acc, 0);
    const entradas = Object.entries(electivas);
    const credDe = (id) => electivaPorId[id]?.cred || 0;
    const elegidos = entradas.reduce((acc, [id]) => acc + credDe(id), 0);
    const aprobadosElec = entradas.reduce((acc, [id]) => aprobadas[id] ? acc + credDe(id) : acc, 0);
    // El plan pide 30 creditos de electivas: lo que sobre no suma al total de la carrera
    const creds = credsPlan + Math.min(aprobadosElec, CREDITOS_ELECTIVAS_REQ);
    return {
      creds,
      elegidos,
      aprobadosElec,
      cantidad: entradas.length,
      porc: ((creds / TOTAL_CREDITOS_CARRERA) * 100).toFixed(1),
    };
  }, [aprobadas, electivas]);

  const materiasDisponibles = useMemo(() => {
    return materiasActivas.filter(m => {
      if (m.esHub || aprobadas[m.id]) return false;
      const requeridas = correlativas.filter(e => e.target === m.id);
      const correlativasOK = requeridas.every(e => aprobadas[e.source]);
      const creditosOK = m.reqCred ? stats.creds >= m.reqCred : true;
      return correlativasOK && creditosOK;
    });
  }, [aprobadas, stats.creds, materiasActivas, correlativas]);

  const ancestors = useMemo(() => {
    if (!hoverNode) return new Set();
    return findRecursiveAncestors(hoverNode, correlativasVisibles);
  }, [hoverNode, correlativasVisibles]);

  const selectedM = useMemo(() => materiasActivas.find(m => m.id === selectedNode), [selectedNode, materiasActivas]);

  const edges = useMemo(() => {
    return correlativasVisibles.map(e => {
      const isUnlock = hoverNode === e.source;
      if (!isUnlock) return { ...e, style: { opacity: 0 } };
      const sNode = nodes.find(n => n.id === e.source);
      const tNode = nodes.find(n => n.id === e.target);
      const color = sNode && tNode ? getDynamicColor(sNode, tNode) : '#444';
      return {
        ...e, animated: true,
        style: { stroke: color, strokeWidth: 5, opacity: 1 },
        markerEnd: { type: MarkerType.ArrowClosed, color, width: 25, height: 25 }
      };
    }).filter(e => e.style.opacity > 0);
  }, [hoverNode, nodes, correlativasVisibles]);

  return (
    <div className="main-container">
      <style>{`
        .main-container { position: fixed; inset: 0; background: #000; overflow: hidden; font-family: 'Inter', sans-serif; }
        .materia-card { 
          background: #0d0d0d; color: #fff; padding: 25px 10px; border-radius: 12px; 
          width: 280px; text-align: center; border: 4px solid #333; cursor: grab;
          transition: all 0.3s ease;
        }
        .materia-card.electiva { border-style: dashed !important; background: #14100a; }
        .materia-card.aprobada { opacity: 0.5; background: #064e3b; border-color: #10b981 !important; }
        .materia-card.hub { border-style: dashed !important; background: #14100a; cursor: pointer; }
        .materia-card.hub:hover { background: #1f1809; }
        .materia-card.fade { opacity: 0.08; filter: blur(1px); }
        .materia-card.highlight { border-width: 5px; box-shadow: 0 0 30px; }
        
        .materia-nombre { font-size: 21px; font-weight: 900; line-height: 1.1; margin-bottom: 8px; color: #fff; }
        .cr-tag { position: absolute; top: -16px; right: 12px; background: #111; padding: 4px 10px; border-radius: 8px; font-size: 11px; border: 1px solid #444; color: #fff; }
        
        .side-panel { 
          position: absolute; top: 0; left: 0; height: 100%; z-index: 1000;
          background: rgba(10,10,10,0.98); border-right: 1px solid #333;
          transform: translateX(${isOpen ? '0' : '-100%'});
          transition: transform 0.4s ease-out; width: 320px; max-width: 90vw; padding: 30px; color: #fff; overflow-y: auto;
          box-sizing: border-box; overscroll-behavior: contain;
        }

        .detail-panel {
          position: absolute; top: 0; right: 0; height: 100%; z-index: 1000;
          background: #0d0d0d; border-left: 1px solid #333;
          transform: translateX(${selectedNode ? '0' : '100%'});
          transition: transform 0.3s ease; width: 340px; max-width: 90vw; padding: 30px; color: #fff;
          box-sizing: border-box; overflow-y: auto; overscroll-behavior: contain;
        }

        .filtros-top { 
          position: absolute; top: 20px; left: 50%; transform: translateX(-50%); z-index: 50; 
          display: flex; gap: 8px; background: rgba(20,20,20,0.9); padding: 10px; border-radius: 50px; border: 1px solid #333; 
        }
        .filter-btn { border: none; padding: 6px 14px; border-radius: 20px; color: #fff; cursor: pointer; font-size: 11px; font-weight: 800; opacity: 0.4; transition: 0.2s; text-transform: uppercase; }
        .filter-btn.active { opacity: 1; transform: scale(1.05); }

        .btn-panel-open { background: #222; color: #fff; border: 1px solid #444; padding: 10px 20px; border-radius: 8px; cursor: pointer; position: absolute; top: 20px; left: 20px; z-index: 10; font-weight: 700; }
        .disp-item { background: #1a1a1a; padding: 12px; border-radius: 8px; margin-bottom: 8px; border-left: 4px solid #d38901; font-size: 14px; }
        
        /* --- FONDO: bandas de año y zona de intercambio --- */
        .zona-ano { position: relative; pointer-events: none; }
        .zona-ano-tag {
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          color: #2e2e2e; font-size: 40px; font-weight: 900; letter-spacing: 10px; white-space: nowrap;
        }
        .zona-ano-linea {
          position: absolute; top: 0; right: 0; height: 100%;
          border-right: 2px dashed #232323;
        }
        .zona-intercambio {
          position: relative; pointer-events: none;
          border: 3px dashed #38bdf8; border-radius: 26px;
          background: rgba(56, 189, 248, 0.07);
          box-shadow: inset 0 0 90px rgba(56, 189, 248, 0.13);
        }
        .zona-intercambio-tag {
          position: absolute; top: -15px; left: 50%; transform: translateX(-50%);
          background: #38bdf8; color: #00141f; white-space: nowrap;
          font-size: 12px; font-weight: 900; letter-spacing: 1px;
          padding: 5px 15px; border-radius: 20px;
        }

        .sp-select {
          width: 100%; background: #151515; border: 1px solid #2a2a2a; border-radius: 8px;
          padding: 10px 12px; color: #fff; font-size: 13px; outline: none; margin-top: 10px;
        }
        .sp-select:focus { border-color: #38bdf8; }

        .ev-row { display: flex; justify-content: space-between; border-bottom: 1px solid #222; padding: 10px 0; font-size: 15px; }

        /* La atribucion de React Flow queda a la vista ahora que el canvas
           encuadra exacto: la integramos al tema oscuro en vez de ocultarla. */
        .react-flow__attribution { background: rgba(0,0,0,0.55); padding: 2px 5px; }
        .react-flow__attribution a { color: #3a3a3a; font-size: 9px; }

        /* --- PANEL DE ELECTIVAS --- */
        .elec-panel {
          position: absolute; top: 0; right: 0; height: 100%; z-index: 1100;
          background: #0a0a0a; border-left: 1px solid #333; width: 440px; max-width: 92vw;
          transform: translateX(${showElectivas ? '0' : '100%'});
          transition: transform 0.35s cubic-bezier(.4,0,.2,1);
          padding: 26px 24px 60px; color: #fff; overflow-y: auto;
          box-sizing: border-box; overscroll-behavior: contain;
          box-shadow: -20px 0 60px rgba(0,0,0,0.8);
        }
        /* Los hijos tambien miden con el padding incluido: si no, un input
           al 100% se pasa del ancho util y aparece scroll horizontal. */
        .side-panel, .side-panel *, .detail-panel, .detail-panel *, .elec-panel, .elec-panel * { box-sizing: border-box; }
        .side-panel, .detail-panel, .elec-panel { overflow-x: hidden; }

        .elec-head { display: flex; justify-content: space-between; align-items: flex-start; }
        .elec-x { background: none; border: none; color: #666; font-size: 22px; cursor: pointer; line-height: 1; }
        .elec-x:hover { color: #fff; }
        .elec-bar { background: #222; height: 8px; border-radius: 4px; overflow: hidden; margin: 18px 0 6px; }
        .elec-nota { font-size: 11px; color: #555; line-height: 1.5; margin: 10px 0 18px; }
        .elec-search {
          width: 100%; background: #151515; border: 1px solid #2a2a2a; border-radius: 8px;
          padding: 11px 14px; color: #fff; font-size: 14px; outline: none; margin-bottom: 6px;
        }
        .elec-search:focus { border-color: #d38901; }
        .elec-cat { font-size: 11px; color: #d38901; text-transform: uppercase; letter-spacing: 1.5px; margin: 26px 0 10px; }
        .elec-item { background: #131313; border: 1px solid #222; border-radius: 10px; margin-bottom: 7px; overflow: hidden; transition: border-color .2s; }
        .elec-item.on { border-color: #d38901; background: #1a1508; }
        .elec-row { display: flex; align-items: center; gap: 12px; padding: 13px 14px; cursor: pointer; }
        .elec-row:hover { background: rgba(255,255,255,0.04); }
        .elec-check {
          flex: none; width: 24px; height: 24px; border-radius: 6px; border: 1px solid #3a3a3a;
          display: grid; place-items: center; font-size: 14px; font-weight: 900; color: #666;
        }
        .elec-item.on .elec-check { background: #d38901; border-color: #d38901; color: #000; }
        .elec-nom { font-size: 14px; font-weight: 600; line-height: 1.25; display: block; }
        .elec-meta { font-size: 10.5px; color: #6b6b6b; margin-top: 4px; display: block; letter-spacing: .2px; }
        .elec-item.on .elec-meta { color: #9a8352; }
        .elec-cfg { display: flex; align-items: flex-end; gap: 10px; padding: 12px 14px 13px; border-top: 1px solid #241d0c; }
        .elec-cfg label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: .5px; display: flex; flex-direction: column; gap: 5px; }
        .elec-cfg input, .elec-cfg select {
          background: #0a0a0a; border: 1px solid #333; border-radius: 6px; color: #fff;
          padding: 7px 9px; font-size: 13px; width: 78px; outline: none;
        }
        .elec-cfg input:focus, .elec-cfg select:focus { border-color: #d38901; }
        .elec-del { margin-left: auto; background: none; border: 1px solid #442; color: #a67; border-radius: 6px; padding: 8px 12px; font-size: 11px; cursor: pointer; font-weight: 700; }
        .elec-del:hover { background: #2a1010; color: #ff6b6b; border-color: #833; }
        .elec-vacio { color: #444; font-size: 13px; text-align: center; padding: 30px 0; }

        .btn-elec-open {
          background: #d38901; color: #000; border: none; padding: 10px 20px; border-radius: 8px;
          cursor: pointer; position: absolute; top: 20px; left: ${isOpen ? '20px' : '175px'}; z-index: 60; font-weight: 800;
          transition: left .35s ease-out;
        }
      `}</style>

      {/* FILTROS POR RAMA */}
      <div className="filtros-top">
        <button className={`filter-btn ${!ramaFiltro ? 'active' : ''}`} onClick={() => setRamaFiltro(null)} style={{background: '#444'}}>Todas</button>
        {Object.entries(RAMAS).map(([key, rama]) => (
          <button key={key} className={`filter-btn ${ramaFiltro === key ? 'active' : ''}`} onClick={() => setRamaFiltro(key)} style={{background: rama.color}}>{rama.nombre}</button>
        ))}
      </div>

      {/* PANEL IZQUIERDO (PROGRESO) */}
      <div className="side-panel">
        <button onClick={() => setIsOpen(false)} style={{background:'none', border:'none', color:'#666', fontSize:'24px', cursor:'pointer', position:'absolute', top:'20px', right:'20px'}}>✕</button>
        <h2 style={{ fontWeight: 900 }}>ING CIVIL ITBA</h2>
        <div style={{ marginTop: '50px' }}>
          <span>Progreso</span><span style={{ float: 'right', color: '#d38901' }}>{stats.porc}%</span>
          <div style={{background:'#333', height:'10px', borderRadius:'5px', margin:'15px 0', overflow:'hidden'}}>
            <div style={{height:'100%', background:'#d38901', width:`${stats.porc}%`}}></div>
          </div>
          <p style={{ fontSize: '13px', color: '#888' }}>{stats.creds} / {TOTAL_CREDITOS_CARRERA} Créditos</p>
        </div>
        <div style={{ marginTop: '35px' }}>
          <h3 style={{ fontSize: '14px', color: '#38bdf8', textTransform: 'uppercase', margin: 0 }}>Intercambio</h3>
          <select
            className="sp-select"
            value={intercambio ?? ''}
            onChange={e => cambiarIntercambio(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Sin intercambio</option>
            {Array.from({ length: CUATS }, (_, i) => i + 1).map(c => (
              <option key={c} value={c}>Cuatrimestre {c}</option>
            ))}
          </select>
          <p style={{ fontSize: '12px', color: '#666', lineHeight: 1.5, marginTop: '10px' }}>
            {intercambio
              ? `${materiasEnIntercambio.length} materia${materiasEnIntercambio.length === 1 ? '' : 's'} dentro del recuadro. Arrastrá las que quieras cursar afuera.`
              : 'Marcá un cuatrimestre para encuadrarlo y armar ahí las materias del intercambio.'}
          </p>
        </div>

        <div style={{ marginTop: '35px' }}>
          <h3 style={{ fontSize: '14px', color: '#d38901', textTransform: 'uppercase' }}>Disponibles</h3>
          {materiasDisponibles.map(m => (
            <div key={m.id} className="disp-item">
              <div style={{fontWeight: 700}}>{m.nombre}</div>
              <div style={{fontSize: '11px', color: '#888'}}>C{m.cuat} • {m.cred} Créditos</div>
            </div>
          ))}
        </div>
      </div>

      {/* PANEL DERECHO (DETALLES DE EVALUACIÓN) */}
      <div className="detail-panel">
        <button onClick={() => setSelectedNode(null)} style={{float:'right', background:'none', border:'none', color:'#666', fontSize:'20px', cursor:'pointer'}}>✕</button>
        {selectedM ? (
          <div>
            <div style={{background: RAMAS[selectedM.rama].color, padding: '4px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: 900, display: 'inline-block'}}>{RAMAS[selectedM.rama].nombre}</div>
            <h2 style={{fontSize: '24px', margin: '15px 0', lineHeight: 1.1}}>{selectedM.nombre}</h2>
            <div style={{color: '#555', marginBottom: '30px'}}>
              {selectedM.id} • {selectedM.cred} Créditos
              {selectedM.esElectiva && <> • {selectedM.categoria}</>}
            </div>
            
            <h4 style={{color: '#888', fontSize: '12px', letterSpacing: '1px', marginBottom: '10px'}}>REQUISITOS DE APROBACIÓN</h4>
            {selectedM.ev ? (
              <div style={{background: '#151515', padding: '15px', borderRadius: '10px'}}>
                <div className="ev-row"><span>📝 Parciales</span> <span>{selectedM.ev.p}</span></div>
                <div className="ev-row"><span>📂 Trabajos Prácticos</span> <span>{selectedM.ev.tp}</span></div>
                <div className="ev-row"><span>🎓 Examen Final</span> <span>{selectedM.ev.f ? 'Sí' : 'No'}</span></div>
                <div className="ev-row" style={{color: selectedM.ev.pro ? '#10b981' : '#ff4d4d', border: 'none'}}>
                  <span>✨ Promocionable</span> <span>{selectedM.ev.pro ? 'SÍ' : 'NO'}</span>
                </div>
              </div>
            ) : (
              <p style={{color: '#444', fontSize: '13px', lineHeight: 1.6}}>
                {selectedM.esElectiva
                  ? 'El plan publicado no detalla la evaluación de las electivas. Consultalo en el SGA.'
                  : 'Información no disponible'}
              </p>
            )}

            <button 
              onClick={() => {
                setAprobadas(p => {
                  const next = { ...p, [selectedM.id]: !p[selectedM.id] };
                  localStorage.setItem('prog-v21', JSON.stringify(next));
                  return next;
                });
              }}
              style={{width: '100%', marginTop: '40px', padding: '15px', borderRadius: '8px', background: aprobadas[selectedM.id] ? '#064e3b' : '#333', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer'}}
            >
              {aprobadas[selectedM.id] ? 'MATERIA APROBADA ✓' : 'MARCAR COMO APROBADA'}
            </button>

            {selectedM.esElectiva && (
              <button
                onClick={() => { toggleElectiva(selectedM); setSelectedNode(null); }}
                style={{width: '100%', marginTop: '10px', padding: '13px', borderRadius: '8px', background: 'none', color: '#a67', border: '1px solid #442', fontWeight: 700, cursor: 'pointer'}}
              >
                QUITAR DEL MAPA
              </button>
            )}
          </div>
        ) : <p style={{marginTop: '100px', textAlign: 'center', color: '#333'}}>Selecciona una materia para ver detalles</p>}
      </div>

      {/* PANEL DE ELECTIVAS */}
      <div className="elec-panel">
        <div className="elec-head">
          <div>
            <h2 style={{ fontSize: '22px', margin: 0, fontWeight: 900 }}>ELECTIVAS</h2>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '6px' }}>
              {stats.cantidad} elegida{stats.cantidad === 1 ? '' : 's'} • {stats.elegidos} de {CREDITOS_ELECTIVAS_REQ} créditos
            </div>
          </div>
          <button className="elec-x" onClick={() => setShowElectivas(false)}>✕</button>
        </div>

        <div className="elec-bar">
          <div style={{
            height: '100%',
            width: `${Math.min(100, (stats.elegidos / CREDITOS_ELECTIVAS_REQ) * 100)}%`,
            background: stats.elegidos >= CREDITOS_ELECTIVAS_REQ ? '#10b981' : '#d38901',
            transition: 'width .3s ease',
          }} />
        </div>
        <p className="elec-nota">
          Tocá una electiva para sumarla al mapa. Se agrega con sus créditos y correlativas reales; sólo elegís en qué cuatrimestre la ponés.
        </p>

        <input
          className="elec-search"
          placeholder="Buscar electiva..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />

        {categoriasElectivas.map(categoria => {
          const items = electivasCatalogo.filter(el =>
            el.categoria === categoria && normalizar(el.nombre).includes(normalizar(busqueda))
          );
          if (!items.length) return null;
          return (
            <div key={categoria}>
              <h4 className="elec-cat">{categoria}</h4>
              {items.map(el => {
                const sel = electivas[el.id];
                return (
                  <div key={el.id} className={`elec-item ${sel ? 'on' : ''}`}>
                    <div className="elec-row" onClick={() => toggleElectiva(el)}>
                      <span className="elec-check">{sel ? '✓' : '+'}</span>
                      <span>
                        <span className="elec-nom">{el.nombre}</span>
                        <span className="elec-meta">
                          {el.id} · {el.cred} crédito{el.cred === 1 ? '' : 's'}{requisitosTexto(el)}
                        </span>
                      </span>
                    </div>
                    {sel && (
                      <div className="elec-cfg">
                        <label>
                          Cuatrimestre
                          <select value={sel.cuat} onChange={e => cambiarCuatrimestre(el.id, Number(e.target.value))}>
                            {Array.from({ length: 10 }, (_, i) => i + 1).map(c => (
                              <option key={c} value={c}>C{c}</option>
                            ))}
                          </select>
                        </label>
                        <button className="elec-del" onClick={() => toggleElectiva(el)}>Quitar del mapa</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}

        {!electivasCatalogo.some(el => normalizar(el.nombre).includes(normalizar(busqueda))) && (
          <div className="elec-vacio">Ninguna electiva coincide con la búsqueda</div>
        )}
      </div>

      {!isOpen && <button className="btn-panel-open" onClick={() => setIsOpen(true)}>☰ PROGRESO</button>}
      {!showElectivas && (
        <button className="btn-elec-open" onClick={() => { setShowElectivas(true); setSelectedNode(null); }}>
          ★ ELECTIVAS {stats.cantidad > 0 && `(${stats.cantidad})`}
        </button>
      )}

      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={[...nodosFondo, ...nodes.map(n => {
          const isTarget = hoverNode && correlativasVisibles.some(e => e.source === hoverNode && e.target === n.id);
          const isSource = ancestors.has(n.id);
          const isFaded = (ramaFiltro && ramaFiltro !== n.data.rama);
          
          let borderColor = isFaded
            ? '#111'
            : (ramaFiltro === n.data.rama || n.data.rama === 'ELECTIVA')
              ? RAMAS[n.data.rama].color
              : cuatrimestreColores[n.data.cuat - 1];
          let boxShadow = (ramaFiltro === n.data.rama) ? `0 0 40px ${RAMAS[n.data.rama].color}` : "none";
          let hClass = "";

          if (hoverNode) {
            if (n.id === hoverNode) hClass = "active";
            else if (isTarget || isSource) {
              const hNode = nodes.find(x => x.id === hoverNode);
              const color = getDynamicColor(isTarget ? hNode : n, isTarget ? n : hNode);
              borderColor = color;
              boxShadow = `0 0 35px ${color}`;
            } else hClass = "fade";
          }

          return {
            ...n,
            zIndex: 10,
            className: `materia-card ${n.data.esHub ? 'hub' : ''} ${n.data.esElectiva ? 'electiva' : ''} ${aprobadas[n.id] ? 'aprobada' : ''} ${hClass} ${isFaded ? 'fade' : ''} ${ramaFiltro === n.data.rama ? 'highlight' : ''}`,
            style: {
              ...n.style, boxShadow,
              borderTopColor: borderColor,
              borderRightColor: borderColor,
              borderBottomColor: borderColor,
              borderLeftColor: RAMAS[n.data.rama].color,
              borderLeftWidth: '8px',
              borderLeftStyle: 'solid',
            },
            data: { ...n.data, label: n.data.esHub ? (
              <>
                <span className="cr-tag">{stats.elegidos} / {CREDITOS_ELECTIVAS_REQ}</span>
                <div className="materia-nombre">★ Electivas</div>
                <div style={{fontSize: '11px', opacity: 0.6}}>
                  {stats.cantidad === 0 ? 'Click para elegir' : `${stats.cantidad} elegida${stats.cantidad === 1 ? '' : 's'} • click para editar`}
                </div>
              </>
            ) : (
              <>
                <span className="cr-tag">{n.data.cred} Créditos</span>
                <div className="materia-nombre">{n.data.nombre}</div>
                <div style={{fontSize: '11px', opacity: 0.5}}>C{n.data.cuat} • {n.data.esElectiva ? 'Electiva' : n.id}</div>
              </>
            )}
          };
        })]}
        edges={edges}
        onNodesChange={(c) => setNodes(nds => applyNodeChanges(c.filter(ch => !String(ch.id).startsWith('__')), nds))}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={(e, n) => {
          if (String(n.id).startsWith('__')) return;
          if (n.data?.esHub) { setShowElectivas(true); setSelectedNode(null); return; }
          setSelectedNode(n.id);
        }}
        onNodeDoubleClick={onNodeDoubleClick}        
        onNodeMouseEnter={(_, n) => { if (!String(n.id).startsWith('__')) setHoverNode(n.id); }}
        onNodeMouseLeave={() => setHoverNode(null)}
        fitView
      >
        <Background color="#111" variant="dots" />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default function App() { return <ReactFlowProvider><MapaCivil /></ReactFlowProvider>; }
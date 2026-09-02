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

const cuatrimestreColores = ['#ff4d4d', '#ff944d', '#33cc33', '#00c9c9ff', '#9966ff', '#ff3399', '#00cccc', '#ff0055', '#00ffa2', '#ffffff'];
const TOTAL_CREDITOS_CARRERA = 221;

// --- DEFINICIÓN DE RAMAS ---
const RAMAS = {
  BASICAS: { nombre: 'Ciencias Básicas', color: '#666' },

  GESTION: { nombre: 'Gestor de Proyectos', color: '#9966ff' },
  ESTRUCTURAL: { nombre: 'Estructural', color: '#ff4d4d' },
  VIAS: { nombre: 'Vías y Geotecnia', color: '#ff944d' },

  HIDRAULICO: { nombre: 'Hidráulico', color: '#00d4ff' },
  AMBIENTAL: { nombre: 'Ambiental', color: '#33cc33' }
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
  { id: 'ELEC', cuat: 10, nombre: 'Electivas',                                cred: 30, rama: 'BASICAS', ev: { p: 0, tp: 0, f: false, pro: false } }
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
  const { fitView } = useReactFlow();
  const onNodeDoubleClick = useCallback((event, node) => {
  setAprobadas(prev => {
    const nuevoEstado = { ...prev, [node.id]: !prev[node.id] };
    // Guardamos inmediatamente en el storage para no perder cambios
    localStorage.setItem('prog-v21', JSON.stringify(nuevoEstado));
    return nuevoEstado;
  });
}, []);

  useEffect(() => {
    const savedPos = JSON.parse(localStorage.getItem('pos-v21') || '{}');
    const savedProg = JSON.parse(localStorage.getItem('prog-v21') || '{}');
    setAprobadas(savedProg);

    const initialNodes = [];
    for (let c = 1; c <= 10; c++) {
      const matsCuat = listaMaterias
        .filter(m => m.cuat === c)
        .sort((a, b) => (a.esencial === b.esencial ? b.cred - a.cred : a.esencial ? -1 : 1));

      matsCuat.forEach((m, index) => {
        initialNodes.push({
          id: m.id,
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
          data: { ...m },
          position: savedPos[m.id] || { x: c * 400, y: index * 180 },
          className: 'materia-card',
        });
      });
    }
    setNodes(initialNodes);
    setTimeout(() => fitView({ padding: 0.15 }), 400);
  }, [fitView]);

  const onNodeDragStop = useCallback((event, node) => {
    const currentPos = JSON.parse(localStorage.getItem('pos-v21') || '{}');
    currentPos[node.id] = node.position;
    localStorage.setItem('pos-v21', JSON.stringify(currentPos));
  }, []);

  const stats = useMemo(() => {
    const creds = listaMaterias.reduce((acc, m) => aprobadas[m.id] ? acc + m.cred : acc, 0);
    return { creds, porc: ((creds / TOTAL_CREDITOS_CARRERA) * 100).toFixed(1) };
  }, [aprobadas]);

  const materiasDisponibles = useMemo(() => {
    return listaMaterias.filter(m => {
      if (aprobadas[m.id]) return false;
      const correlativas = correlativasBase.filter(e => e.target === m.id);
      const correlativasOK = correlativas.every(e => aprobadas[e.source]);
      const creditosOK = m.reqCred ? stats.creds >= m.reqCred : true;
      return correlativasOK && creditosOK;
    });
  }, [aprobadas, stats.creds]);

  const ancestors = useMemo(() => {
    if (!hoverNode) return new Set();
    return findRecursiveAncestors(hoverNode, correlativasBase);
  }, [hoverNode]);

  const selectedM = useMemo(() => listaMaterias.find(m => m.id === selectedNode), [selectedNode]);

  const edges = useMemo(() => {
    return correlativasBase.map(e => {
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
  }, [hoverNode, nodes]);

  return (
    <div className="main-container">
      <style>{`
        .main-container { width: 100vw; height: 100vh; background: #000; overflow: hidden; font-family: 'Inter', sans-serif; }
        .materia-card { 
          background: #0d0d0d; color: #fff; padding: 25px 10px; border-radius: 12px; 
          width: 280px; text-align: center; border: 4px solid #333; cursor: grab;
          transition: all 0.3s ease;
        }
        .materia-card.aprobada { opacity: 0.5; background: #064e3b; border-color: #10b981 !important; }
        .materia-card.fade { opacity: 0.08; filter: blur(1px); }
        .materia-card.highlight { border-width: 5px; box-shadow: 0 0 30px; }
        
        .materia-nombre { font-size: 21px; font-weight: 900; line-height: 1.1; margin-bottom: 8px; color: #fff; }
        .cr-tag { position: absolute; top: -16px; right: 12px; background: #111; padding: 4px 10px; border-radius: 8px; font-size: 11px; border: 1px solid #444; color: #fff; }
        
        .side-panel { 
          position: absolute; top: 0; left: 0; height: 100%; z-index: 1000;
          background: rgba(10,10,10,0.98); border-right: 1px solid #333;
          transform: translateX(${isOpen ? '0' : '-100%'});
          transition: transform 0.4s ease-out; width: 320px; padding: 30px; color: #fff; overflow-y: auto;
        }

        .detail-panel {
          position: absolute; top: 0; right: 0; height: 100%; z-index: 1000;
          background: #0d0d0d; border-left: 1px solid #333;
          transform: translateX(${selectedNode ? '0' : '100%'});
          transition: transform 0.3s ease; width: 340px; padding: 30px; color: #fff;
        }

        .filtros-top { 
          position: absolute; top: 20px; left: 50%; transform: translateX(-50%); z-index: 50; 
          display: flex; gap: 8px; background: rgba(20,20,20,0.9); padding: 10px; border-radius: 50px; border: 1px solid #333; 
        }
        .filter-btn { border: none; padding: 6px 14px; border-radius: 20px; color: #fff; cursor: pointer; font-size: 11px; font-weight: 800; opacity: 0.4; transition: 0.2s; text-transform: uppercase; }
        .filter-btn.active { opacity: 1; transform: scale(1.05); }

        .btn-panel-open { background: #222; color: #fff; border: 1px solid #444; padding: 10px 20px; border-radius: 8px; cursor: pointer; position: absolute; top: 20px; left: 20px; z-index: 10; font-weight: 700; }
        .disp-item { background: #1a1a1a; padding: 12px; border-radius: 8px; margin-bottom: 8px; border-left: 4px solid #d38901; font-size: 14px; }
        
        .ev-row { display: flex; justify-content: space-between; border-bottom: 1px solid #222; padding: 10px 0; font-size: 15px; }
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
        <div style={{ marginTop: '40px' }}>
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
            <div style={{color: '#555', marginBottom: '30px'}}>{selectedM.id} • {selectedM.cred} Créditos</div>
            
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
            ) : <p style={{color: '#444'}}>Información no disponible</p>}

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
          </div>
        ) : <p style={{marginTop: '100px', textAlign: 'center', color: '#333'}}>Selecciona una materia para ver detalles</p>}
      </div>

      {!isOpen && <button className="btn-panel-open" onClick={() => setIsOpen(true)}>☰ PROGRESO</button>}

      <ReactFlow
        nodes={nodes.map(n => {
          const isTarget = hoverNode && correlativasBase.some(e => e.source === hoverNode && e.target === n.id);
          const isSource = ancestors.has(n.id);
          const isFaded = (ramaFiltro && ramaFiltro !== n.data.rama);
          
          let borderColor = isFaded ? '#111' : (ramaFiltro === n.data.rama ? RAMAS[n.data.rama].color : cuatrimestreColores[n.data.cuat - 1]);
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
            className: `materia-card ${aprobadas[n.id] ? 'aprobada' : ''} ${hClass} ${isFaded ? 'fade' : ''} ${ramaFiltro === n.data.rama ? 'highlight' : ''}`,
            style: { ...n.style, borderColor, boxShadow, borderLeft: `8px solid ${RAMAS[n.data.rama].color}` },
            data: { label: (
              <>
                <span className="cr-tag">{n.data.cred} Créditos</span>
                <div className="materia-nombre">{n.data.nombre}</div>
                <div style={{fontSize: '11px', opacity: 0.5}}>C{n.data.cuat} • {n.id}</div>
              </>
            )}
          };
        })}
        edges={edges}
        onNodesChange={(c) => setNodes(nds => applyNodeChanges(c, nds))}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={(e, n) => setSelectedNode(n.id)}
        onNodeDoubleClick={onNodeDoubleClick}        
        onNodeMouseEnter={(_, n) => setHoverNode(n.id)}
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
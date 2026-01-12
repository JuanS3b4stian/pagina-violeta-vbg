
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { CaseRecord, CaseStatus, UrgencyLevel, ManagementNote } from '../types';
import { DESPACHOS_LIST, ICONS } from '../constants';

const DashboardAdmin1: React.FC = () => {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [notes, setNotes] = useState<ManagementNote[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'reclassification' | 'notes' | 'closures'>('all');
  const [adminAnalysis, setAdminAnalysis] = useState('');
  const [closureJustification, setClosureJustification] = useState('');
  const [loading, setLoading] = useState(false);
  const [assignment, setAssignment] = useState({ 
    despacho: '', 
    urgencia: UrgencyLevel.MEDIA,
    estado: CaseStatus.ASIGNADO
  });

  useEffect(() => {
    refresh();
  }, []);

  // Sincronizar el formulario lateral cuando se selecciona un caso
  useEffect(() => {
    if (selectedCase) {
      setAssignment({
        despacho: selectedCase.despachoAsignado || '',
        urgencia: selectedCase.urgencia || UrgencyLevel.MEDIA,
        estado: selectedCase.estado === CaseStatus.PENDIENTE ? CaseStatus.ASIGNADO : selectedCase.estado
      });
      setClosureJustification('');
      setAdminAnalysis('');
    }
  }, [selectedCase]);

  const reclassificationCases = cases.filter(c => c.estado === CaseStatus.RECLASIFICACION_SOLICITADA);
  const closureRequests = cases.filter(c => c.estado === CaseStatus.CIERRE_SOLICITADO);

  const handleEscalateToAdmin2 = async () => {
    if (!selectedCase || !adminAnalysis) return;
    setLoading(true);
    const response: any = await storage.escalateToAdmin2(selectedCase, adminAnalysis);
    
    const updated: CaseRecord = {
      ...selectedCase,
      estado: CaseStatus.RECLASIFICACION_PENDIENTE_ADMIN2,
      analisisAdmin1Url: response?.pdfUrl || selectedCase.analisisAdmin1Url,
      historial: [...selectedCase.historial, {
        id: `h-${Date.now()}`,
        date: new Date().toISOString(),
        user: 'Coord. Equidad',
        description: `Análisis técnico realizado y escalado a Secretaría de Gobierno.`
      }]
    };
    storage.updateCase(updated);
    setLoading(false);
    setSelectedCase(null);
    setAdminAnalysis('');
    refresh();
  };

  const handleAcceptClosure = async () => {
    if (!selectedCase) return;
    setLoading(true);
    await storage.acceptClosure(selectedCase, selectedCase.despachoAsignado);
    
    const updated: CaseRecord = {
      ...selectedCase,
      estado: CaseStatus.CERRADO,
      historial: [...selectedCase.historial, {
        id: `h-${Date.now()}`,
        date: new Date().toISOString(),
        user: 'Coord. Equidad',
        description: `Solicitud de cierre ACEPTADA por Coordinación de Equidad de Género.`
      }]
    };
    storage.updateCase(updated);
    setLoading(false);
    setSelectedCase(null);
    refresh();
  };

  const handleDenyClosure = async () => {
    if (!selectedCase || !closureJustification) return;
    setLoading(true);
    const response: any = await storage.denyClosure(selectedCase, closureJustification, selectedCase.despachoAsignado);
    
    const updated: CaseRecord = {
      ...selectedCase,
      estado: CaseStatus.EN_GESTION,
      historial: [...selectedCase.historial, {
        id: `h-${Date.now()}`,
        date: new Date().toISOString(),
        user: 'Coord. Equidad',
        description: `Solicitud de cierre NEGADA. Justificación: ${closureJustification}`
      }]
    };
    storage.updateCase(updated);
    setLoading(false);
    setSelectedCase(null);
    setClosureJustification('');
    refresh();
  };

  const handleAssign = () => {
    if (!selectedCase) return;
    
    let nuevoEstado = assignment.estado;
    if (assignment.despacho && selectedCase.estado === CaseStatus.PENDIENTE) {
      nuevoEstado = CaseStatus.ASIGNADO;
    }

    const updated: CaseRecord = {
      ...selectedCase,
      despachoAsignado: assignment.despacho,
      urgencia: assignment.urgencia,
      estado: nuevoEstado,
      historial: [...selectedCase.historial, {
        id: `h-${Date.now()}`,
        date: new Date().toISOString(),
        user: 'Coord. Equidad',
        description: `Gestión de Coordinación: ${nuevoEstado} - Despacho: ${assignment.despacho || 'Sin Asignar'}`
      }]
    };

    storage.updateCase(updated);
    setSelectedCase(null);
    refresh();
  };

  const handleDeleteNote = (id: string) => {
    const confirmar = window.confirm("¿Está seguro de que desea eliminar esta nota de gestión? Esta acción no se puede deshacer.");
    if (confirmar) {
      storage.deleteNote(id);
      setNotes(prevNotes => prevNotes.filter(n => n.id !== id));
    }
  };

  const refresh = () => {
    setCases(storage.getCases());
    setNotes(storage.getNotes());
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 border-b border-violet-100">
        <button 
          onClick={() => setActiveTab('all')}
          className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'all' ? 'text-violet-700 border-b-2 border-violet-700' : 'text-gray-400 hover:text-violet-400'}`}
        >
          Bandeja General
        </button>
        <button 
          onClick={() => setActiveTab('reclassification')}
          className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'reclassification' ? 'text-pink-700 border-b-2 border-pink-700' : 'text-gray-400 hover:text-pink-400'}`}
        >
          Solicitudes Reclasificación
          {reclassificationCases.length > 0 && <span className="bg-pink-600 text-white text-[10px] px-2 py-0.5 rounded-full">{reclassificationCases.length}</span>}
        </button>
        <button 
          onClick={() => setActiveTab('closures')}
          className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'closures' ? 'text-orange-700 border-b-2 border-orange-700' : 'text-gray-400 hover:text-orange-400'}`}
        >
          Solicitudes Cierre
          {closureRequests.length > 0 && <span className="bg-orange-600 text-white text-[10px] px-2 py-0.5 rounded-full">{closureRequests.length}</span>}
        </button>
        <button 
          onClick={() => setActiveTab('notes')}
          className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'notes' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-400 hover:text-blue-400'}`}
        >
          Notas de Gestión
          {notes.length > 0 && <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full">{notes.length}</span>}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2rem] shadow-sm border border-violet-100 overflow-hidden">
            <table className="w-full text-left">
              {activeTab === 'all' && (
                <>
                  <thead className="bg-violet-50/50 text-violet-800 text-[10px] font-black uppercase tracking-tighter">
                    <tr>
                      <th className="px-6 py-5">ID / Fecha</th>
                      <th className="px-6 py-5">Víctima</th>
                      <th className="px-6 py-5">Estado / Despacho</th>
                      <th className="px-6 py-5">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-violet-50">
                    {cases.map(c => (
                      <tr key={c.id} className="hover:bg-violet-50/20 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-mono text-xs font-black text-violet-600">#{c.id}</p>
                          <p className="text-[10px] text-gray-400">{c.fecha}</p>
                        </td>
                        <td className="px-6 py-4"><p className="text-sm font-bold text-gray-800">{c.usuariaNombre}</p></td>
                        <td className="px-6 py-4">
                          <span className={`text-[9px] uppercase font-black px-2 py-1 rounded-full ${
                            c.estado === CaseStatus.PENDIENTE ? 'bg-yellow-100 text-yellow-700' : 
                            c.estado === CaseStatus.CERRADO ? 'bg-gray-100 text-gray-500' :
                            'bg-violet-100 text-violet-700'
                          }`}>
                            {c.estado} {c.despachoAsignado ? `a ${c.despachoAsignado}` : ''}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button onClick={() => setSelectedCase(c)} className="bg-violet-600 text-white px-4 py-2 rounded-xl text-[10px] uppercase font-black hover:bg-violet-700 transition-all">Gestionar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {activeTab === 'reclassification' && (
                <>
                  <thead className="bg-pink-50/50 text-pink-800 text-[10px] font-black uppercase tracking-tighter">
                    <tr>
                      <th className="px-6 py-5">ID / Fecha</th>
                      <th className="px-6 py-5">Despacho Solicitante</th>
                      <th className="px-6 py-5">PDF del Caso</th>
                      <th className="px-6 py-5">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pink-50">
                    {reclassificationCases.map(c => (
                      <tr key={c.id} className="hover:bg-pink-50/20 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-mono text-xs font-black text-pink-600">#{c.id}</p>
                          <p className="text-[10px] text-gray-400">{c.fecha}</p>
                        </td>
                        <td className="px-6 py-4"><p className="text-xs font-black text-gray-700 uppercase">{c.despachoAsignado}</p></td>
                        <td className="px-6 py-4">
                          {c.expedientePdfUrl ? (
                            <a href={c.expedientePdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-pink-200">
                              <ICONS.PdfIcon /> VER PDF CASO
                            </a>
                          ) : <span className="text-[9px] text-gray-300 font-bold uppercase">Sin PDF</span>}
                        </td>
                        <td className="px-6 py-4">
                          <button onClick={() => setSelectedCase(c)} className="bg-pink-600 text-white px-4 py-2 rounded-xl text-[10px] uppercase font-black hover:bg-pink-700">Analizar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {activeTab === 'closures' && (
                <>
                  <thead className="bg-orange-50/50 text-orange-800 text-[10px] font-black uppercase tracking-tighter">
                    <tr>
                      <th className="px-6 py-5">ID / Fecha</th>
                      <th className="px-6 py-5">Despacho Solicitante</th>
                      <th className="px-6 py-5">Expediente</th>
                      <th className="px-6 py-5">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-50">
                    {closureRequests.map(c => (
                      <tr key={c.id} className="hover:bg-orange-50/20 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-mono text-xs font-black text-orange-600">#{c.id}</p>
                          <p className="text-[10px] text-gray-400">{c.fecha}</p>
                        </td>
                        <td className="px-6 py-4"><p className="text-xs font-black text-gray-700 uppercase">{c.despachoAsignado}</p></td>
                        <td className="px-6 py-4">
                          {c.expedientePdfUrl ? (
                            <a href={c.expedientePdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-orange-200">
                              <ICONS.PdfIcon /> VER EXPEDIENTE
                            </a>
                          ) : <span className="text-[9px] text-gray-300 font-bold uppercase">Sin PDF</span>}
                        </td>
                        <td className="px-6 py-4">
                          <button onClick={() => setSelectedCase(c)} className="bg-orange-600 text-white px-4 py-2 rounded-xl text-[10px] uppercase font-black hover:bg-orange-700 transition-all">Gestionar Cierre</button>
                        </td>
                      </tr>
                    ))}
                    {closureRequests.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-20 text-center text-gray-400 font-black uppercase text-xs tracking-widest italic">No hay solicitudes de cierre pendientes</td>
                      </tr>
                    )}
                  </tbody>
                </>
              )}

              {activeTab === 'notes' && (
                <>
                  <thead className="bg-blue-50/50 text-blue-800 text-[10px] font-black uppercase tracking-tighter">
                    <tr>
                      <th className="px-6 py-5">Despacho / Fecha</th>
                      <th className="px-6 py-5">Reporte de Gestión</th>
                      <th className="px-6 py-5 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-50">
                    {notes.map(n => (
                      <tr key={n.id} className="hover:bg-blue-50/20 transition-colors">
                        <td className="px-6 py-6 align-top whitespace-nowrap">
                          <p className="text-xs font-black text-blue-700 uppercase tracking-tight">{n.officeName}</p>
                          <p className="text-[10px] text-gray-400 font-bold">{new Date(n.date).toLocaleString()}</p>
                        </td>
                        <td className="px-6 py-6">
                          <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100">
                            <p className="text-sm text-gray-700 leading-relaxed italic">"{n.content}"</p>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-right align-top">
                          <button 
                            onClick={() => handleDeleteNote(n.id)}
                            className="text-red-400 hover:text-red-600 transition-all p-2 bg-red-50 rounded-xl hover:shadow-md"
                            title="Eliminar Nota"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {notes.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-20 text-center text-gray-400 font-black uppercase text-xs tracking-widest italic">No hay notas quincenales registradas</td>
                      </tr>
                    )}
                  </tbody>
                </>
              )}
            </table>
          </div>
        </div>

        <div className="space-y-6">
          {selectedCase && activeTab !== 'notes' ? (
            <div className="bg-white rounded-[2rem] shadow-2xl border border-violet-100 p-8 space-y-6 animate-in slide-in-from-right-8 sticky top-24">
              <div className="flex justify-between items-start border-b border-violet-50 pb-4">
                <h3 className="text-xl font-black text-gray-900 leading-tight uppercase tracking-tighter">
                  {selectedCase.estado === CaseStatus.RECLASIFICACION_SOLICITADA ? 'Analizar Reclasificación' : 
                   selectedCase.estado === CaseStatus.CIERRE_SOLICITADO ? 'Gestión de Cierre' : 'Gestión de Caso'}
                </h3>
                <button onClick={() => setSelectedCase(null)} className="text-gray-300 hover:text-gray-500 text-xl font-bold">✕</button>
              </div>
              
              {selectedCase.estado === CaseStatus.RECLASIFICACION_SOLICITADA ? (
                <div className="space-y-5">
                  <div className="bg-pink-50/50 p-5 rounded-2xl border border-pink-100">
                    <p className="text-[10px] font-black text-pink-700 uppercase mb-2 tracking-widest">Motivo del Despacho:</p>
                    <p className="text-xs text-gray-600 leading-relaxed italic">
                      "{selectedCase.historial.slice().reverse().find(h => h.description.includes('Solicitud de reclasificación'))?.description.split(': ')[1] || "Sin descripción."}"
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Análisis Técnico para Sec. Gobierno</label>
                    <textarea 
                      className="w-full p-4 bg-violet-50 rounded-2xl border-none text-sm font-medium text-violet-900 focus:ring-2 focus:ring-violet-500 placeholder:text-violet-300"
                      rows={5}
                      placeholder="Redacte los fundamentos técnicos del cambio de competencia..."
                      value={adminAnalysis}
                      onChange={e => setAdminAnalysis(e.target.value)}
                    />
                  </div>
                  <button 
                    disabled={loading || !adminAnalysis}
                    onClick={handleEscalateToAdmin2}
                    className="w-full bg-violet-700 text-white font-black py-5 rounded-2xl shadow-xl uppercase text-xs tracking-widest hover:bg-violet-800 transition-all active:scale-95"
                  >
                    {loading ? 'GENERANDO AUTO...' : 'ESCALAR A SECRETARÍA DE GOBIERNO'}
                  </button>
                </div>
              ) : selectedCase.estado === CaseStatus.CIERRE_SOLICITADO ? (
                <div className="space-y-6">
                  <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100">
                    <p className="text-[10px] font-black text-orange-700 uppercase mb-2 tracking-widest">Justificación del Cierre (Despacho):</p>
                    <p className="text-xs text-gray-600 leading-relaxed italic">
                      "{selectedCase.historial.slice().reverse().find(h => h.description.includes('Solicitud de cierre de caso'))?.description.split(': ')[1] || "Sin descripción."}"
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <button 
                      disabled={loading}
                      onClick={handleAcceptClosure}
                      className="w-full bg-green-600 text-white font-black py-4 rounded-2xl shadow-lg uppercase text-xs tracking-widest hover:bg-green-700 transition-all"
                    >
                      ACEPTAR CIERRE DEFINITIVO
                    </button>
                    
                    <div className="space-y-2 pt-4 border-t border-gray-100">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Motivación de la Negativa</label>
                      <textarea 
                        className="w-full p-4 bg-gray-50 rounded-2xl border-none text-sm font-medium text-gray-900 focus:ring-2 focus:ring-violet-500 placeholder:text-gray-300"
                        rows={3}
                        placeholder="Redacte por qué no procede el cierre aún..."
                        value={closureJustification}
                        onChange={e => setClosureJustification(e.target.value)}
                      />
                    </div>
                    
                    <button 
                      disabled={loading || !closureJustification}
                      onClick={handleDenyClosure}
                      className="w-full bg-red-600 text-white font-black py-4 rounded-2xl shadow-lg uppercase text-xs tracking-widest hover:bg-red-700 transition-all"
                    >
                      NEGAR CIERRE (EMITIR AUTO)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Asignar a Despacho</label>
                    <select 
                      className="w-full p-4 bg-violet-50 rounded-2xl border-none text-sm font-bold text-violet-900 focus:ring-2 focus:ring-violet-500 appearance-none" 
                      value={assignment.despacho} 
                      onChange={e => setAssignment({...assignment, despacho: e.target.value})}
                    >
                      <option value="">-- Sin despacho --</option>
                      {DESPACHOS_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Nivel de Urgencia</label>
                    <select 
                      className="w-full p-4 bg-violet-50 rounded-2xl border-none text-sm font-bold text-violet-900 focus:ring-2 focus:ring-violet-500 appearance-none" 
                      value={assignment.urgencia} 
                      onChange={e => setAssignment({...assignment, urgencia: e.target.value as UrgencyLevel})}
                    >
                      {Object.values(UrgencyLevel).map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Estado del Proceso</label>
                    <select 
                      className="w-full p-4 bg-violet-50 rounded-2xl border-none text-sm font-bold text-violet-900 focus:ring-2 focus:ring-violet-500 appearance-none" 
                      value={assignment.estado} 
                      onChange={e => setAssignment({...assignment, estado: e.target.value as CaseStatus})}
                    >
                      {Object.values(CaseStatus).filter(s => s !== CaseStatus.RECLASIFICACION_SOLICITADA && s !== CaseStatus.CIERRE_SOLICITADO).map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>

                  <button 
                    onClick={handleAssign} 
                    className="w-full bg-violet-700 text-white font-black py-5 rounded-2xl uppercase text-xs tracking-widest shadow-xl hover:bg-violet-800 transition-all active:scale-95 mt-4"
                  >
                    GUARDAR CAMBIOS Y NOTIFICAR
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="h-64 border-4 border-dotted border-violet-50 rounded-[2rem] flex flex-col items-center justify-center text-center p-8 text-violet-200">
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Seleccione un registro para gestionar acciones</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin1;

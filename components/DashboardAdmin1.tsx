
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { CaseRecord, CaseStatus, UrgencyLevel } from '../types';
import { DESPACHOS_LIST, ICONS } from '../constants';

const DashboardAdmin1: React.FC = () => {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'reclassification'>('all');
  const [adminAnalysis, setAdminAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [assignment, setAssignment] = useState({ 
    despacho: '', 
    urgencia: UrgencyLevel.MEDIA,
    estado: CaseStatus.ASIGNADO
  });

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (selectedCase) {
      setAssignment({
        despacho: selectedCase.despachoAsignado || '',
        urgencia: selectedCase.urgencia || UrgencyLevel.MEDIA,
        estado: selectedCase.estado
      });
    }
  }, [selectedCase]);

  const reclassificationCases = cases.filter(c => c.estado === CaseStatus.RECLASIFICACION_SOLICITADA);

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
    await storage.updateCase(updated);
    setLoading(false);
    setSelectedCase(null);
    setAdminAnalysis('');
    refresh();
  };

  const handleAssign = async () => {
    if (!selectedCase) return;
    const updated: CaseRecord = {
      ...selectedCase,
      despachoAsignado: assignment.despacho,
      urgencia: assignment.urgencia,
      estado: assignment.estado,
      historial: [...selectedCase.historial, {
        id: `h-${Date.now()}`,
        date: new Date().toISOString(),
        user: 'Coord. Equidad',
        description: `Gestión actualizada: ${assignment.estado} - ${assignment.despacho}`
      }]
    };
    await storage.updateCase(updated);
    setSelectedCase(null);
    refresh();
  };

  const refresh = () => setCases(storage.getCases());

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-violet-100">
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
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2rem] shadow-sm border border-violet-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-violet-50/50 text-violet-800 text-[10px] font-black uppercase tracking-tighter">
                {activeTab === 'all' ? (
                  <tr>
                    <th className="px-6 py-5">ID / Fecha</th>
                    <th className="px-6 py-5">Víctima</th>
                    <th className="px-6 py-5">Estado</th>
                    <th className="px-6 py-5">Acción</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-6 py-5">ID / Fecha</th>
                    <th className="px-6 py-5">Despacho Solicitante</th>
                    <th className="px-6 py-5">PDF del Caso</th>
                    <th className="px-6 py-5">Acción</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-violet-50">
                {activeTab === 'all' ? (
                  cases.map(c => (
                    <tr key={c.id} className="hover:bg-violet-50/20 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-mono text-xs font-black text-violet-600">#{c.id}</p>
                        <p className="text-[10px] text-gray-400">{c.fecha}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-800">{c.usuariaNombre}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[9px] uppercase font-black bg-violet-100 text-violet-700 px-2 py-1 rounded-full">{c.estado}</span>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => setSelectedCase(c)} className="bg-violet-600 text-white px-4 py-2 rounded-xl text-[10px] uppercase font-black hover:bg-violet-700 transition-all">Gestionar</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  reclassificationCases.map(c => (
                    <tr key={c.id} className="hover:bg-pink-50/20 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-mono text-xs font-black text-pink-600">#{c.id}</p>
                        <p className="text-[10px] text-gray-400">{c.fecha}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-black text-gray-700 uppercase">{c.despachoAsignado}</p>
                      </td>
                      <td className="px-6 py-4">
                        {c.expedientePdfUrl ? (
                          <a 
                            href={c.expedientePdfUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-pink-200 transition-all"
                          >
                            <ICONS.PdfIcon /> VER PDF CASO
                          </a>
                        ) : (
                          <span className="text-[9px] text-gray-300 font-bold uppercase">PDF no generado</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => setSelectedCase(c)} className="bg-pink-600 text-white px-4 py-2 rounded-xl text-[10px] uppercase font-black shadow-md hover:bg-pink-700 transition-all">Analizar</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          {selectedCase ? (
            <div className="bg-white rounded-[2rem] shadow-2xl border border-violet-100 p-8 space-y-6 animate-in slide-in-from-right-8 sticky top-24">
              <div className="flex justify-between items-start border-b border-violet-50 pb-4">
                <h3 className="text-xl font-black text-gray-900 leading-tight">
                  {selectedCase.estado === CaseStatus.RECLASIFICACION_SOLICITADA ? 'Analizar Reclasificación' : 'Gestión de Caso'}
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
                    className="w-full bg-violet-700 text-white font-black py-5 rounded-2xl shadow-xl uppercase text-xs tracking-widest hover:bg-violet-800 disabled:opacity-50 transition-all active:scale-95"
                  >
                    {loading ? 'GENERANDO AUTO...' : 'ESCALAR A SECRETARÍA DE GOBIERNO'}
                  </button>
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
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Urgencia</label>
                    <select 
                      className="w-full p-4 bg-violet-50 rounded-2xl border-none text-sm font-bold text-violet-900 focus:ring-2 focus:ring-violet-500 appearance-none" 
                      value={assignment.urgencia} 
                      onChange={e => setAssignment({...assignment, urgencia: e.target.value as UrgencyLevel})}
                    >
                      {Object.values(UrgencyLevel).map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Estado</label>
                    <select 
                      className="w-full p-4 bg-violet-50 rounded-2xl border-none text-sm font-bold text-violet-900 focus:ring-2 focus:ring-violet-500 appearance-none" 
                      value={assignment.estado} 
                      onChange={e => setAssignment({...assignment, estado: e.target.value as CaseStatus})}
                    >
                      {Object.values(CaseStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <button 
                    onClick={handleAssign} 
                    className="w-full bg-violet-700 text-white font-black py-5 rounded-2xl uppercase text-xs tracking-widest shadow-xl hover:bg-violet-800 transition-all active:scale-95"
                  >
                    GUARDAR CAMBIOS
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="h-64 border-4 border-dotted border-violet-50 rounded-[2rem] flex flex-col items-center justify-center text-center p-8">
              <p className="text-violet-200 text-xs font-black uppercase tracking-[0.2em]">Seleccione un registro para gestionar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin1;

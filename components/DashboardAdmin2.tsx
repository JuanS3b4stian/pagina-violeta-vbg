
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { CaseRecord, CaseStatus } from '../types';
import { DESPACHOS_LIST, ICONS } from '../constants';

const DashboardAdmin2: React.FC = () => {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null);
  const [decision, setDecision] = useState<'Aceptada' | 'Negada'>('Aceptada');
  const [justification, setJustification] = useState('');
  const [newOffice, setNewOffice] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

  const handleResolve = async () => {
    if (!selectedCase || !justification || (decision === 'Aceptada' && !newOffice)) return;
    setLoading(true);
    const response: any = await storage.resolveReclassification(selectedCase, decision, justification, newOffice);
    
    const updated: CaseRecord = {
      ...selectedCase,
      estado: decision === 'Aceptada' ? CaseStatus.ASIGNADO : CaseStatus.EN_GESTION,
      despachoAsignado: decision === 'Aceptada' ? newOffice : selectedCase.despachoAsignado,
      decisionFinalUrl: response?.pdfUrl || selectedCase.decisionFinalUrl,
      historial: [...selectedCase.historial, {
        id: `h-${Date.now()}`,
        date: new Date().toISOString(),
        user: 'Sec. Gobierno',
        description: `Resolución definitiva: ${decision.toUpperCase()}. ${justification}`
      }]
    };
    await storage.updateCase(updated);
    setLoading(false);
    setSelectedCase(null);
    refresh();
  };

  const refresh = () => setCases(storage.getCases().filter(c => c.estado === CaseStatus.RECLASIFICACION_PENDIENTE_ADMIN2));

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-900 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-xl"></div>
          <h2 className="text-xl font-black uppercase tracking-[0.2em]">Resolución Jurídica</h2>
          <p className="text-gray-400 text-[10px] font-bold uppercase mt-1">Secretaría de Gobierno • San Pedro de los Milagros</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase text-gray-400">
              <tr>
                <th className="px-6 py-4 text-left">Caso / Fecha</th>
                <th className="px-6 py-4 text-left">Solicitante</th>
                <th className="px-6 py-4 text-left">Documentación</th>
                <th className="px-6 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cases.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-6">
                    <p className="font-black text-gray-900 text-sm">#{c.id}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">{c.fecha}</p>
                  </td>
                  <td className="px-6 py-6">
                    <p className="text-xs font-black text-gray-700 uppercase tracking-tight">{c.despachoAsignado}</p>
                  </td>
                  <td className="px-6 py-6 space-y-2">
                    {c.analisisAdmin1Url ? (
                      <a href={c.analisisAdmin1Url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-violet-600 hover:text-violet-800 text-[9px] font-black uppercase bg-violet-50 px-2 py-1 rounded-md transition-all">
                        <ICONS.PdfIcon /> ANÁLISIS COORD.
                      </a>
                    ) : <span className="text-[8px] text-gray-300 font-bold">Sin Análisis PDF</span>}
                    
                    {c.expedientePdfUrl ? (
                      <a href={c.expedientePdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-pink-600 hover:text-pink-800 text-[9px] font-black uppercase bg-pink-50 px-2 py-1 rounded-md transition-all">
                        <ICONS.PdfIcon /> EXPEDIENTE CASO
                      </a>
                    ) : <span className="text-[8px] text-gray-300 font-bold">Sin Expediente PDF</span>}
                  </td>
                  <td className="px-6 py-6 text-right">
                    <button onClick={() => setSelectedCase(c)} className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-black active:scale-95 transition-all">Emitir Fallo</button>
                  </td>
                </tr>
              ))}
              {cases.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-20 text-center text-gray-300 font-black uppercase text-xs tracking-[0.2em] italic">Bandeja de conflictos vacía</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCase ? (
        <div className="bg-white rounded-[2rem] shadow-2xl p-10 border border-gray-200 animate-in slide-in-from-right-8 sticky top-24">
          <div className="flex justify-between items-start mb-8 border-b pb-6">
            <div>
              <h3 className="text-2xl font-black text-gray-900 uppercase">Fallo de Competencia #{selectedCase.id}</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Víctima: {selectedCase.usuariaNombre}</p>
            </div>
            <button onClick={() => setSelectedCase(null)} className="text-gray-300 hover:text-gray-500 text-xl font-bold">✕</button>
          </div>
          
          <div className="space-y-8">
            <div className="flex gap-4 p-1 bg-gray-100 rounded-2xl">
              <button 
                onClick={() => setDecision('Aceptada')}
                className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${decision === 'Aceptada' ? 'bg-white shadow-md text-green-600 ring-2 ring-green-100' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Aceptar Cambio
              </button>
              <button 
                onClick={() => setDecision('Negada')}
                className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${decision === 'Negada' ? 'bg-white shadow-md text-red-600 ring-2 ring-red-100' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Negar Cambio
              </button>
            </div>

            {decision === 'Aceptada' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.1em] ml-1">Nuevo Despacho Competente</label>
                <select 
                  className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-gray-100 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-gray-900 appearance-none"
                  value={newOffice}
                  onChange={e => setNewOffice(e.target.value)}
                >
                  <option value="">-- Seleccionar Nuevo Destino --</option>
                  {DESPACHOS_LIST.filter(d => d !== selectedCase.despachoAsignado).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.1em] ml-1">Justificación del Fallo</label>
              <textarea 
                className="w-full p-5 bg-gray-50 rounded-[2rem] border-2 border-gray-100 text-sm focus:ring-2 focus:ring-gray-900 leading-relaxed font-medium"
                rows={5}
                placeholder="Redacte la motivación legal del fallo administrativo..."
                value={justification}
                onChange={e => setJustification(e.target.value)}
              />
            </div>

            <button 
              disabled={loading || !justification || (decision === 'Aceptada' && !newOffice)}
              onClick={handleResolve}
              className="w-full bg-gray-900 text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all hover:bg-black disabled:opacity-50"
            >
              {loading ? 'GENERANDO RESOLUCIÓN...' : 'NOTIFICAR FALLO DEFINITIVO'}
            </button>
          </div>
        </div>
      ) : (
        <div className="h-full border-4 border-dashed border-gray-100 rounded-[2rem] flex flex-col items-center justify-center p-12 text-center">
          <p className="text-gray-300 text-[10px] font-black uppercase tracking-[0.3em]">Seleccione un registro para emitir fallo oficial</p>
        </div>
      )}
    </div>
  );
};

export default DashboardAdmin2;

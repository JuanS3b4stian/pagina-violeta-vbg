
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { CaseRecord, CaseStatus, User, ManagementNote } from '../types';
import { ICONS } from '../constants';

interface Props {
  user: User;
}

const DashboardDespachos: React.FC<Props> = ({ user }) => {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null);
  const [activity, setActivity] = useState({ text: '', file: '' });
  const [reclassifyReason, setReclassifyReason] = useState('');
  const [closureReason, setClosureReason] = useState('');
  const [reportContent, setReportContent] = useState('');
  const [managementNoteText, setManagementNoteText] = useState('');
  const [showReclassifyForm, setShowReclassifyForm] = useState(false);
  const [showClosureForm, setShowClosureForm] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [noteLoading, setNoteLoading] = useState(false);

  useEffect(() => {
    refresh();
  }, [user.officeName]);

  const handleAddActivity = () => {
    if (!selectedCase) return;
    const updated: CaseRecord = {
      ...selectedCase,
      estado: CaseStatus.EN_GESTION,
      historial: [...selectedCase.historial, {
        id: `h-${Date.now()}`,
        date: new Date().toISOString(),
        user: user.officeName || 'Despacho',
        description: activity.text,
        attachmentUrl: activity.file
      }]
    };
    storage.updateCase(updated);
    setActivity({ text: '', file: '' });
    refresh();
  };

  const handleSendReport = async () => {
    if (!selectedCase || !reportContent) return;
    
    const reportNum = !selectedCase.informe1Url ? 1 : !selectedCase.informe2Url ? 2 : 0;
    if (reportNum === 0) {
      alert("Este caso ya cuenta con el límite máximo de 2 informes cargados.");
      return;
    }

    setLoading(true);
    const response: any = await storage.saveReport(selectedCase, reportNum, reportContent, user.officeName || 'Despacho');
    
    if (response?.success) {
      const updated: CaseRecord = {
        ...selectedCase,
        [reportNum === 1 ? 'informe1Url' : 'informe2Url']: response.pdfUrl,
        historial: [...selectedCase.historial, {
          id: `h-${Date.now()}`,
          date: new Date().toISOString(),
          user: user.officeName || 'Despacho',
          description: `Se ha cargado el Informe #${reportNum} de seguimiento al expediente.`
        }]
      };
      await storage.updateCase(updated);
      alert(`Informe #${reportNum} enviado exitosamente.`);
    }

    setLoading(false);
    setReportContent('');
    setShowReportForm(false);
    refresh();
  };

  const handleSendManagementNote = async () => {
    if (!managementNoteText) return;
    setNoteLoading(true);
    const newNote: ManagementNote = {
      id: `note-${Date.now()}`,
      officeName: user.officeName || 'Despacho',
      date: new Date().toISOString(),
      content: managementNoteText
    };
    await storage.saveNote(newNote);
    setNoteLoading(false);
    setManagementNoteText('');
    alert("Reporte quincenal enviado exitosamente al Coordinador.");
  };

  const handleRequestReclassification = async () => {
    if (!selectedCase || !reclassifyReason) return;
    setLoading(true);
    await storage.requestReclassification(selectedCase, reclassifyReason, user.officeName || '');
    
    const updated: CaseRecord = {
      ...selectedCase,
      estado: CaseStatus.RECLASIFICACION_SOLICITADA,
      historial: [...selectedCase.historial, {
        id: `h-${Date.now()}`,
        date: new Date().toISOString(),
        user: user.officeName || 'Despacho',
        description: `Solicitud de reclasificación: ${reclassifyReason}`
      }]
    };
    await storage.updateCase(updated);
    setLoading(false);
    setShowReclassifyForm(false);
    setReclassifyReason('');
    setSelectedCase(null);
    refresh();
  };

  const handleRequestClosure = async () => {
    if (!selectedCase || !closureReason) return;
    setLoading(true);
    await storage.requestClosure(selectedCase, closureReason, user.officeName || '');
    
    const updated: CaseRecord = {
      ...selectedCase,
      estado: CaseStatus.CIERRE_SOLICITADO,
      historial: [...selectedCase.historial, {
        id: `h-${Date.now()}`,
        date: new Date().toISOString(),
        user: user.officeName || 'Despacho',
        description: `Solicitud de cierre de caso: ${closureReason}`
      }]
    };
    await storage.updateCase(updated);
    setLoading(false);
    setShowClosureForm(false);
    setClosureReason('');
    setSelectedCase(null);
    refresh();
  };

  const refresh = () => {
    const allCases = storage.getCases();
    const filtered = allCases.filter(c => c.despachoAsignado === user.officeName);
    setCases(filtered);
    if (selectedCase) {
      const current = filtered.find(f => f.id === selectedCase.id);
      if (current) setSelectedCase(current);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-violet-600 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
          <h2 className="text-xl font-bold uppercase tracking-tight">{user.officeName}</h2>
          <p className="text-violet-100 text-[10px] font-black uppercase tracking-widest mt-1">Gestión Operativa de Casos</p>
        </div>

        {/* REPORTE QUINCENAL */}
        <div className="bg-blue-50/50 p-6 rounded-[2rem] border-2 border-blue-100 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
            <h3 className="text-xs font-black text-blue-700 uppercase tracking-widest">Reporte Quincenal</h3>
          </div>
          <p className="text-[10px] text-blue-400 font-bold leading-tight">Gestiones generales del despacho.</p>
          <textarea className="w-full p-4 bg-white rounded-2xl border-none focus:ring-2 focus:ring-blue-400 text-sm font-medium" rows={3} placeholder="Avances generales..." value={managementNoteText} onChange={e => setManagementNoteText(e.target.value)} />
          <button disabled={noteLoading || !managementNoteText} onClick={handleSendManagementNote} className="w-full bg-blue-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-700">Enviar Nota</button>
        </div>

        <div className="space-y-3">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-2 mb-4">Casos Asignados</h3>
          {cases.map(c => (
            <button key={c.id} onClick={() => { setSelectedCase(c); setShowClosureForm(false); setShowReclassifyForm(false); setShowReportForm(false); }} className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${selectedCase?.id === c.id ? 'bg-violet-50 border-violet-400 shadow-xl ring-4 ring-violet-50' : 'bg-white border-gray-100 hover:border-violet-200'}`}>
              <div className="flex justify-between items-start mb-2">
                <span className="font-mono font-black text-violet-600 text-xs">#{c.id}</span>
                <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full ${c.estado === CaseStatus.CERRADO ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 text-gray-700'}`}>{c.estado}</span>
              </div>
              <p className="text-sm font-black text-gray-800 uppercase tracking-tighter">{c.usuariaNombre}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2">
        {selectedCase ? (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-violet-50 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-violet-50 flex flex-wrap gap-4 justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tighter">Expediente: #{selectedCase.id}</h3>
                <p className="text-violet-600 text-[10px] font-black uppercase tracking-widest mt-1">Estado: {selectedCase.estado}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedCase.expedientePdfUrl && (
                  <a href={selectedCase.expedientePdfUrl} target="_blank" rel="noopener noreferrer" className="bg-violet-100 text-violet-700 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-violet-200 transition-all shadow-sm flex items-center gap-2 border border-violet-200"><ICONS.PdfIcon /> Ver PDF Caso</a>
                )}
                {selectedCase.estado !== CaseStatus.CERRADO && (
                  <>
                    <button onClick={() => { setShowReportForm(!showReportForm); setShowReclassifyForm(false); setShowClosureForm(false); }} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-sm">Redactar Informe</button>
                    <button onClick={() => { setShowReclassifyForm(!showReclassifyForm); setShowClosureForm(false); setShowReportForm(false); }} className="bg-pink-100 text-pink-700 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-pink-200 transition-all shadow-sm">Reclasificación</button>
                    <button onClick={() => { setShowClosureForm(!showClosureForm); setShowReclassifyForm(false); setShowReportForm(false); }} className="bg-orange-100 text-orange-700 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-200 transition-all shadow-sm">Solicitar Cierre</button>
                  </>
                )}
              </div>
            </div>

            {/* FORMULARIO DE INFORME */}
            {showReportForm && (
              <div className="p-8 bg-blue-50 border-b border-blue-100 animate-in slide-in-from-top-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-black text-blue-700 uppercase tracking-widest">Nuevo Informe de Caso</h4>
                  <span className="text-[10px] font-black text-blue-400 uppercase">Límite: {!selectedCase.informe1Url ? '1/2' : !selectedCase.informe2Url ? '2/2' : 'Máximo alcanzado'}</span>
                </div>
                <textarea className="w-full p-5 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 mb-4 text-sm font-medium" placeholder="Redacte los avances específicos de este caso, entrevistas, visitas o decisiones jurídicas..." rows={5} value={reportContent} onChange={e => setReportContent(e.target.value)} />
                <div className="flex justify-end gap-3">
                  <button onClick={() => setShowReportForm(false)} className="text-[10px] font-black text-gray-400 uppercase px-4">Cancelar</button>
                  <button disabled={loading || !reportContent || (selectedCase.informe1Url && selectedCase.informe2Url)} onClick={handleSendReport} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">
                    {loading ? 'Generando PDF...' : 'Enviar Informe al Coordinador'}
                  </button>
                </div>
              </div>
            )}

            {/* ... RECLASIFICACIÓN Y CIERRE (igual que antes) ... */}
            {showReclassifyForm && (
              <div className="p-8 bg-pink-50 border-b border-pink-100 animate-in slide-in-from-top-4">
                <h4 className="text-xs font-black text-pink-700 uppercase mb-4 tracking-widest">Motivación de Reclasificación</h4>
                <textarea className="w-full p-5 rounded-2xl border-none focus:ring-2 focus:ring-pink-500 mb-4 text-sm font-medium" placeholder="Explique por qué este caso no es competencia..." rows={3} value={reclassifyReason} onChange={e => setReclassifyReason(e.target.value)} />
                <div className="flex justify-end gap-3">
                  <button onClick={() => setShowReclassifyForm(false)} className="text-[10px] font-black text-gray-400 uppercase px-4">Cancelar</button>
                  <button disabled={loading || !reclassifyReason} onClick={handleRequestReclassification} className="bg-pink-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">Enviar</button>
                </div>
              </div>
            )}
            {showClosureForm && (
              <div className="p-8 bg-orange-50 border-b border-orange-100 animate-in slide-in-from-top-4">
                <h4 className="text-xs font-black text-orange-700 uppercase mb-4 tracking-widest">Motivación del Cierre</h4>
                <textarea className="w-full p-5 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 mb-4 text-sm font-medium" placeholder="Describa el cumplimiento de la ruta..." rows={3} value={closureReason} onChange={e => setClosureReason(e.target.value)} />
                <div className="flex justify-end gap-3">
                  <button onClick={() => setShowClosureForm(false)} className="text-[10px] font-black text-gray-400 uppercase px-4">Cancelar</button>
                  <button disabled={loading || !closureReason} onClick={handleRequestClosure} className="bg-orange-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">Enviar</button>
                </div>
              </div>
            )}

            <div className="p-10 space-y-10">
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] ml-1">Historial del Folio</h4>
                <div className="relative pl-8 border-l-4 border-violet-100 space-y-10">
                  {selectedCase.historial.map((h, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[42px] top-1 w-6 h-6 rounded-full bg-violet-600 border-4 border-white shadow-md"></div>
                      <div className="bg-violet-50/50 p-6 rounded-2xl border border-violet-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-black text-violet-700 text-xs uppercase tracking-tight">{h.user}</span>
                          <span className="text-[10px] text-gray-400 font-bold">{new Date(h.date).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed font-medium">{h.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedCase.estado !== CaseStatus.CERRADO && (
                <div className="bg-gray-900 p-8 rounded-[2.5rem] border border-gray-800 space-y-4 shadow-2xl">
                  <h4 className="text-[10px] font-black text-violet-400 uppercase tracking-[0.4em] ml-1">Registrar Nueva Actuación</h4>
                  <textarea rows={3} className="w-full p-6 bg-gray-800 rounded-3xl border-none text-white text-sm focus:ring-2 focus:ring-violet-500 font-medium" placeholder="Describa la actuación..." value={activity.text} onChange={e => setActivity({...activity, text: e.target.value})} />
                  <button onClick={handleAddActivity} disabled={!activity.text} className="w-full bg-violet-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-violet-700 transition-all">Guardar Actuación</button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full bg-white rounded-[3rem] flex flex-col items-center justify-center text-center p-20 border-4 border-dotted border-violet-50 text-gray-300">
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Seleccione un folio para gestionar</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardDespachos;

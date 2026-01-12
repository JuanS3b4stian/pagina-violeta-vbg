
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { CaseRecord, CaseStatus, User, ManagementNote } from '../types';

interface Props {
  user: User;
}

const DashboardDespachos: React.FC<Props> = ({ user }) => {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null);
  const [activity, setActivity] = useState({ text: '', file: '' });
  const [reclassifyReason, setReclassifyReason] = useState('');
  const [closureReason, setClosureReason] = useState('');
  const [managementNoteText, setManagementNoteText] = useState('');
  const [showReclassifyForm, setShowReclassifyForm] = useState(false);
  const [showClosureForm, setShowClosureForm] = useState(false);
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
    // Filtrar casos que corresponden a este despacho y no están cerrados
    const allCases = storage.getCases();
    setCases(allCases.filter(c => c.despachoAsignado === user.officeName));
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-violet-600 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
          <h2 className="text-xl font-bold uppercase tracking-tight">{user.officeName}</h2>
          <p className="text-violet-100 text-[10px] font-black uppercase tracking-widest mt-1">Gestión Operativa de Casos</p>
        </div>

        {/* REPORTE QUINCENAL FORM */}
        <div className="bg-blue-50/50 p-6 rounded-[2rem] border-2 border-blue-100 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
            <h3 className="text-xs font-black text-blue-700 uppercase tracking-widest">Reporte Quincenal</h3>
          </div>
          <p className="text-[10px] text-blue-400 font-bold leading-tight">Envíe un resumen de las gestiones generales realizadas durante la quincena.</p>
          <textarea 
            className="w-full p-4 bg-white rounded-2xl border-none focus:ring-2 focus:ring-blue-400 text-sm font-medium placeholder:text-blue-200"
            rows={4}
            placeholder="Describa avances generales, conciliaciones o talleres realizados..."
            value={managementNoteText}
            onChange={e => setManagementNoteText(e.target.value)}
          />
          <button 
            disabled={noteLoading || !managementNoteText}
            onClick={handleSendManagementNote}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95"
          >
            {noteLoading ? 'Enviando...' : 'Enviar Nota de Gestión'}
          </button>
        </div>

        <div className="space-y-3">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-2 mb-4">Casos Asignados</h3>
          {cases.map(c => (
            <button 
              key={c.id}
              onClick={() => { setSelectedCase(c); setShowClosureForm(false); setShowReclassifyForm(false); }}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                selectedCase?.id === c.id ? 'bg-violet-50 border-violet-400 shadow-xl ring-4 ring-violet-50' : 'bg-white border-gray-100 hover:border-violet-200'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-mono font-black text-violet-600 text-xs">#{c.id}</span>
                <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                  c.estado === CaseStatus.RECLASIFICACION_SOLICITADA ? 'bg-pink-100 text-pink-700' : 
                  c.estado === CaseStatus.CIERRE_SOLICITADO ? 'bg-orange-100 text-orange-700' :
                  c.estado === CaseStatus.CERRADO ? 'bg-gray-100 text-gray-400' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {c.estado}
                </span>
              </div>
              <p className="text-sm font-black text-gray-800 uppercase tracking-tighter">{c.usuariaNombre}</p>
            </button>
          ))}
          {cases.length === 0 && (
            <div className="p-10 text-center border-2 border-dashed border-gray-100 rounded-[2rem] text-gray-300 text-[10px] font-black uppercase italic">
              Sin casos pendientes
            </div>
          )}
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
              <div className="flex gap-2">
                {selectedCase.estado !== CaseStatus.CERRADO && (
                  <>
                    <button 
                      onClick={() => { setShowReclassifyForm(!showReclassifyForm); setShowClosureForm(false); }}
                      className="bg-pink-100 text-pink-700 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-pink-200 transition-all shadow-sm"
                    >
                      Reclasificación
                    </button>
                    <button 
                      onClick={() => { setShowClosureForm(!showClosureForm); setShowReclassifyForm(false); }}
                      className="bg-orange-100 text-orange-700 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-200 transition-all shadow-sm"
                    >
                      Solicitar Cierre
                    </button>
                  </>
                )}
              </div>
            </div>

            {showReclassifyForm && (
              <div className="p-8 bg-pink-50 border-b border-pink-100 animate-in slide-in-from-top-4">
                <h4 className="text-xs font-black text-pink-700 uppercase mb-4 tracking-widest">Motivación de Reclasificación</h4>
                <textarea 
                  className="w-full p-5 rounded-2xl border-none focus:ring-2 focus:ring-pink-500 mb-4 text-sm font-medium"
                  placeholder="Explique por qué este caso no es competencia de su despacho..."
                  rows={3}
                  value={reclassifyReason}
                  onChange={e => setReclassifyReason(e.target.value)}
                />
                <div className="flex justify-end gap-3">
                  <button onClick={() => setShowReclassifyForm(false)} className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Cancelar</button>
                  <button 
                    disabled={loading || !reclassifyReason}
                    onClick={handleRequestReclassification}
                    className="bg-pink-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg disabled:opacity-50 active:scale-95 transition-all"
                  >
                    {loading ? 'Enviando...' : 'Enviar al Coordinador'}
                  </button>
                </div>
              </div>
            )}

            {showClosureForm && (
              <div className="p-8 bg-orange-50 border-b border-orange-100 animate-in slide-in-from-top-4">
                <h4 className="text-xs font-black text-orange-700 uppercase mb-4 tracking-widest">Motivación del Cierre</h4>
                <textarea 
                  className="w-full p-5 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 mb-4 text-sm font-medium"
                  placeholder="Describa el cumplimiento de la ruta o los motivos por los cuales se solicita el cierre del folio..."
                  rows={3}
                  value={closureReason}
                  onChange={e => setClosureReason(e.target.value)}
                />
                <div className="flex justify-end gap-3">
                  <button onClick={() => setShowClosureForm(false)} className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Cancelar</button>
                  <button 
                    disabled={loading || !closureReason}
                    onClick={handleRequestClosure}
                    className="bg-orange-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg disabled:opacity-50 active:scale-95 transition-all"
                  >
                    {loading ? 'Solicitando...' : 'Enviar Solicitud de Cierre'}
                  </button>
                </div>
              </div>
            )}

            <div className="p-10 space-y-10">
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] ml-1">Actuaciones Realizadas</h4>
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
                  <textarea 
                    rows={3}
                    className="w-full p-6 bg-gray-800 rounded-3xl border-none text-white text-sm focus:ring-2 focus:ring-violet-500 font-medium placeholder:text-gray-600"
                    placeholder="Describa la actuación jurídica o psicosocial realizada..."
                    value={activity.text}
                    onChange={e => setActivity({...activity, text: e.target.value})}
                  />
                  <button 
                    onClick={handleAddActivity}
                    disabled={!activity.text}
                    className="w-full bg-violet-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl text-[10px] uppercase tracking-[0.3em] hover:bg-violet-700 transition-all active:scale-95 disabled:opacity-50"
                  >
                    Guardar Actuación en Expediente
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full bg-white rounded-[3rem] flex flex-col items-center justify-center text-center p-20 border-4 border-dotted border-violet-50 text-gray-300">
            <div className="w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-violet-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Seleccione un folio para iniciar la gestión</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardDespachos;

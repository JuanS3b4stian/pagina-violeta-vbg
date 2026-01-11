
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { CaseRecord, CaseStatus, User } from '../types';

interface Props {
  user: User;
}

const DashboardDespachos: React.FC<Props> = ({ user }) => {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null);
  const [activity, setActivity] = useState({ text: '', file: '' });
  const [reclassifyReason, setReclassifyReason] = useState('');
  const [showReclassifyForm, setShowReclassifyForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCases(storage.getCases().filter(c => c.despachoAsignado === user.officeName));
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

  const refresh = () => setCases(storage.getCases().filter(c => c.despachoAsignado === user.officeName));

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-violet-600 text-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold">{user.officeName}</h2>
          <p className="text-violet-100 text-sm mt-1">Gestión operativa de casos</p>
        </div>

        <div className="space-y-3">
          {cases.map(c => (
            <button 
              key={c.id}
              onClick={() => setSelectedCase(c)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selectedCase?.id === c.id ? 'bg-violet-50 border-violet-400 shadow-md ring-2 ring-violet-200' : 'bg-white border-gray-100'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-mono font-bold text-violet-600">#{c.id}</span>
                <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                  c.estado === CaseStatus.RECLASIFICACION_SOLICITADA ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {c.estado}
                </span>
              </div>
              <p className="text-sm font-bold text-gray-800">{c.usuariaNombre}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2">
        {selectedCase ? (
          <div className="bg-white rounded-3xl shadow-sm border border-violet-50 overflow-hidden">
            <div className="p-8 border-b border-violet-50 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Expediente: #{selectedCase.id}</h3>
                <p className="text-gray-500 text-sm">Estado Actual: {selectedCase.estado}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowReclassifyForm(!showReclassifyForm)}
                  className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-all"
                >
                  Solicitar Reclasificación
                </button>
              </div>
            </div>

            {showReclassifyForm && (
              <div className="p-8 bg-pink-50 border-b border-pink-100 animate-in slide-in-from-top-4">
                <h4 className="text-sm font-black text-pink-700 uppercase mb-4">Motivación de Reclasificación</h4>
                <textarea 
                  className="w-full p-4 rounded-xl border-2 border-pink-200 focus:ring-pink-500 mb-4 text-sm"
                  placeholder="Explique por qué este caso no es competencia de su despacho..."
                  rows={3}
                  value={reclassifyReason}
                  onChange={e => setReclassifyReason(e.target.value)}
                />
                <div className="flex justify-end gap-3">
                  <button onClick={() => setShowReclassifyForm(false)} className="text-xs font-bold text-gray-500 uppercase">Cancelar</button>
                  <button 
                    disabled={loading || !reclassifyReason}
                    onClick={handleRequestReclassification}
                    className="bg-pink-600 text-white px-6 py-2 rounded-lg font-black text-xs uppercase shadow-lg disabled:opacity-50"
                  >
                    {loading ? 'Enviando...' : 'Enviar Solicitud al Coordinador'}
                  </button>
                </div>
              </div>
            )}

            <div className="p-8 space-y-8">
              <div className="space-y-6">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Actuaciones Realizadas</h4>
                <div className="relative pl-6 border-l-2 border-violet-100 space-y-8">
                  {selectedCase.historial.map((h, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-violet-400 border-4 border-white"></div>
                      <div className="text-xs">
                        <span className="font-bold text-violet-700">{h.user}</span> • {new Date(h.date).toLocaleString()}
                        <p className="mt-1 text-sm text-gray-700">{h.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-violet-50/50 p-6 rounded-2xl border border-violet-100 space-y-4">
                <h4 className="text-sm font-bold text-violet-800">Registrar Gestión</h4>
                <textarea 
                  rows={3}
                  className="w-full p-4 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-violet-400"
                  placeholder="Describa la actuación..."
                  value={activity.text}
                  onChange={e => setActivity({...activity, text: e.target.value})}
                />
                <button 
                  onClick={handleAddActivity}
                  className="bg-violet-600 text-white px-8 py-3 rounded-xl font-bold shadow-md text-sm"
                >
                  Guardar Actuación
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full bg-white rounded-3xl flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-violet-100 text-gray-400">
            <p>Seleccione un caso para ver detalles y gestionar.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardDespachos;

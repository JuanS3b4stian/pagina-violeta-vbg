
import React, { useState } from 'react';
import { storage } from '../services/storage';
import { CaseRecord, CaseStatus, UrgencyLevel } from '../types';
import { VIOLENCE_TYPES } from '../constants';

const ComplaintForm: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assignedId, setAssignedId] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{name: string, data: string, type: string} | null>(null);
  
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    municipio: 'San Pedro de los Milagros',
    profesionalAtendio: '',
    remitenteNombre: '',
    remitenteCargo: '',
    remitenteCorreo: '',
    remitenteTelefono: '',
    atencionJuridica: false,
    atencionPsicosocial: false,
    usuariaNombre: '',
    usuariaCedula: '',
    usuariaNacionalidad: '',
    usuariaEdad: '',
    usuariaTelefono: '',
    usuariaMunicipio: 'San Pedro de los Milagros',
    usuariaPrograma: '',
    derechoInvolucrado: '',
    tipoViolencia: VIOLENCE_TYPES[0],
    descripcionBreve: '',
    informacionBrindada: '',
    accionesEmprendidas: '',
    observaciones: ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("El archivo es muy pesado. Máximo 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileInfo({
          name: file.name,
          data: reader.result as string,
          type: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const caseId = `VIO-${Date.now().toString().slice(-6)}`;
    const newCase: any = {
      ...formData,
      id: caseId,
      urgencia: UrgencyLevel.MEDIA,
      estado: CaseStatus.PENDIENTE,
      despachoAsignado: '',
      seguimiento: '',
      cierreProceso: '',
      historial: [{
        id: 'h1',
        date: new Date().toISOString(),
        user: 'Sistema Violeta',
        description: 'Registro inicial de caso - Ruta 2026.'
      }],
      fileData: fileInfo?.data,
      fileName: fileInfo?.name,
      fileType: fileInfo?.type
    };

    try {
      await storage.saveCase(newCase);
      setAssignedId(caseId);
      setSubmitted(true);
    } catch (err) {
      alert("Error al guardar. Verifique su conexión.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-3xl font-black text-violet-900 mb-4">¡Caso Registrado!</h2>
        <p className="text-gray-600 text-lg mb-8 leading-relaxed">
          El folio asignado es <span className="font-mono font-bold text-violet-700 bg-violet-50 px-2 py-1 rounded">#{assignedId}</span>.<br/>
          Se ha generado un expediente en PDF y se ha notificado al Coordinador de Equidad de Género.
        </p>
        <button onClick={() => window.location.hash = '#'} className="bg-violet-600 hover:bg-violet-700 text-white px-10 py-4 rounded-2xl font-black shadow-lg transition-all active:scale-95 uppercase tracking-widest text-sm">Volver al Inicio</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-violet-100">
        <div className="bg-violet-700 px-8 py-16 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-400/20 rounded-full -ml-12 -mb-12 blur-xl"></div>
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Registro Institucional</h2>
          <p className="text-violet-200 font-bold uppercase tracking-widest text-xs opacity-80">San Pedro de los Milagros • Sistema Violeta 2026</p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-12">
          {/* Secciones del Formulario */}
          <section className="space-y-6">
            <h3 className="text-[10px] font-black text-violet-500 uppercase tracking-[0.2em] flex items-center gap-4">
              <span className="flex-grow h-px bg-violet-100"></span>
              01. Identificación del Registro
              <span className="flex-grow h-px bg-violet-100"></span>
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fecha de Atención</label>
                <input type="date" required className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-violet-500 font-bold text-gray-700" value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})} />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Profesional que Atiende</label>
                <input type="text" required placeholder="Nombre y Apellido" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-violet-500 font-bold text-gray-700 uppercase placeholder:font-normal" value={formData.profesionalAtendio} onChange={e => setFormData({...formData, profesionalAtendio: e.target.value})} />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-[10px] font-black text-violet-500 uppercase tracking-[0.2em] flex items-center gap-4">
              <span className="flex-grow h-px bg-violet-100"></span>
              02. Datos de la Usuaria
              <span className="flex-grow h-px bg-violet-100"></span>
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                <input type="text" required className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-violet-500 font-bold" value={formData.usuariaNombre} onChange={e => setFormData({...formData, usuariaNombre: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Documento (CC/TI)</label>
                <input type="text" required className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-violet-500 font-bold" value={formData.usuariaCedula} onChange={e => setFormData({...formData, usuariaCedula: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Teléfono Contacto</label>
                <input type="tel" required className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-violet-500 font-bold" value={formData.usuariaTelefono} onChange={e => setFormData({...formData, usuariaTelefono: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Edad</label>
                <input type="number" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-violet-500 font-bold" value={formData.usuariaEdad} onChange={e => setFormData({...formData, usuariaEdad: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nacionalidad</label>
                <input type="text" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-violet-500 font-bold" value={formData.usuariaNacionalidad} onChange={e => setFormData({...formData, usuariaNacionalidad: e.target.value})} />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-[10px] font-black text-violet-500 uppercase tracking-[0.2em] flex items-center gap-4">
              <span className="flex-grow h-px bg-violet-100"></span>
              03. Análisis del Caso y Soporte
              <span className="flex-grow h-px bg-violet-100"></span>
            </h3>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Derecho Involucrado / Tipo</label>
                  <input type="text" placeholder="Ej: Violencia Física Intra-familiar" className="w-full p-4 bg-violet-50/50 rounded-2xl border-2 border-violet-100 focus:ring-2 focus:ring-violet-500 font-bold text-violet-900" value={formData.derechoInvolucrado} onChange={e => setFormData({...formData, derechoInvolucrado: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Categoría General</label>
                  <div className="bg-gray-50 rounded-2xl p-1">
                    <select className="w-full p-3 bg-transparent border-none focus:ring-0 text-gray-700 font-bold text-xs uppercase" value={formData.tipoViolencia} onChange={e => setFormData({...formData, tipoViolencia: e.target.value})}>
                      {VIOLENCE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Relato Detallado de los Hechos (Aparecerá completo en el PDF)</label>
                <textarea rows={5} placeholder="Describa la situación con el mayor detalle posible..." className="w-full p-5 bg-gray-50 rounded-3xl border-none focus:ring-2 focus:ring-violet-500 leading-relaxed font-medium" value={formData.descripcionBreve} onChange={e => setFormData({...formData, descripcionBreve: e.target.value})} />
              </div>

              {/* CARGA DE ARCHIVOS ESTILIZADA */}
              <div className="bg-pink-50/30 p-8 rounded-[2rem] border-2 border-dashed border-pink-100 space-y-4">
                <div className="text-center space-y-2">
                  <p className="text-xs font-black text-pink-600 uppercase tracking-[0.1em]">Soporte Documental o Fotográfico</p>
                  <p className="text-[10px] text-pink-400 font-medium">Adjunte PDF, fotos o capturas de pantalla (Máx 5MB)</p>
                </div>
                <div className="relative group max-w-sm mx-auto">
                  <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept=".pdf,image/*" />
                  <div className="w-full py-4 px-6 bg-white border-2 border-pink-200 rounded-2xl flex items-center justify-center gap-3 group-hover:bg-pink-50 transition-all shadow-sm">
                    <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                    <span className="text-xs font-black text-pink-700 truncate max-w-[200px]">
                      {fileInfo ? fileInfo.name : "SELECCIONAR ARCHIVO"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <button type="submit" disabled={loading} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-black py-6 rounded-[2rem] shadow-2xl transition-all flex items-center justify-center gap-4 text-xl transform active:scale-[0.98]">
            {loading ? (
              <>
                <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                GENERANDO EXPEDIENTE...
              </>
            ) : "FINALIZAR REGISTRO INSTITUCIONAL"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ComplaintForm;

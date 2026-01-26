
import { CaseRecord, User, UserRole, CaseStatus, UrgencyLevel, ManagementNote } from '../types';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxhvs2EVfLyh69jgXgEfsrRvYW4Iyk3VnahO6egZMwwAso_4ufiRz16-2jMPQ2YJtwcIA/exec'; 

const USERS_KEY = 'violeta_users';
const CASES_KEY = 'violeta_cases';
const NOTES_KEY = 'violeta_notes';

const INITIAL_USERS: User[] = [
  { id: 'u1', username: 'CoordinadorEquidad', password: '928574', name: 'Coordinador de Equidad de Género', role: UserRole.ADMIN1, email: 'genero@sanpedrodelosmilagros-antioquia.gov.co' },
  { id: 'u2', username: 'SecretaríaGobierno', password: '276043', name: 'Secretaría de Gobierno', role: UserRole.ADMIN2, email: 'secgobierno@sanpedrodelosmilagros-antioquia.gov.co' },
  { id: 'u3', username: 'InspeccionPolicía', password: '358256', name: 'Inspección de Policía', role: UserRole.DESPACHO, officeName: 'Inspección de Policía', email: 'inspeccion@sanpedrodelosmilagros-antioquia.gov.co' },
  { id: 'u4', username: 'ComisaríaFamilia', password: '658272', name: 'Comisaría de Familia', role: UserRole.DESPACHO, officeName: 'Comisaría de Familia', email: 'comisaria@sanpedrodelosmilagros-antioquia.gov.co' },
  { id: 'u5', username: 'HospitalSI', password: '764821', name: 'Hospital Santa Isabel', role: UserRole.DESPACHO, officeName: 'Hospital Santa Isabel', email: 'hospital@esesantaisabel.gov.co' },
  { id: 'u6', username: 'SecretaríaSalud', password: '762727', name: 'Secretaría de Salud', role: UserRole.DESPACHO, officeName: 'Secretaría de Salud', email: 'direccionlocalsaludspm@gmail.com' },
];

export const storage = {
  init: () => {
    // Si ya existe algo en localStorage, lo limpiamos para forzar la actualización de contraseñas y usuarios
    // (Opcional: solo para propósitos de esta actualización específica)
    localStorage.removeItem(USERS_KEY); 
    
    if (!localStorage.getItem(USERS_KEY)) {
      localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(CASES_KEY)) {
      localStorage.setItem(CASES_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(NOTES_KEY)) {
      localStorage.setItem(NOTES_KEY, JSON.stringify([]));
    }
  },

  getUsers: (): User[] => JSON.parse(localStorage.getItem(USERS_KEY) || '[]'),
  getCases: (): CaseRecord[] => JSON.parse(localStorage.getItem(CASES_KEY) || '[]'),
  
  getNotes: (): ManagementNote[] => JSON.parse(localStorage.getItem(NOTES_KEY) || '[]'),

  saveCase: async (newCase: any) => {
    const cases = storage.getCases();
    cases.push(newCase);
    localStorage.setItem(CASES_KEY, JSON.stringify(cases));
    try {
      const resp = await fetch(APPS_SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'saveCase', payload: newCase }) });
      const data = await resp.json();
      if (data.success) {
        newCase.expedientePdfUrl = data.pdfUrl;
        storage.updateCase(newCase);
      }
      return data;
    } catch (e) {
      return fetch(APPS_SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ action: 'saveCase', payload: newCase }) });
    }
  },

  updateCase: (updatedCase: CaseRecord) => {
    const cases = storage.getCases();
    const idx = cases.findIndex(c => c.id === updatedCase.id);
    if (idx !== -1) { 
      cases[idx] = updatedCase; 
      localStorage.setItem(CASES_KEY, JSON.stringify(cases)); 
    }
    fetch(APPS_SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ action: 'updateCase', payload: updatedCase }) });
  },

  saveNote: async (note: ManagementNote) => {
    const notes = storage.getNotes();
    notes.push(note);
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  },

  deleteNote: (id: string) => {
    const notes = storage.getNotes();
    const filtered = notes.filter(n => n.id !== id);
    localStorage.setItem(NOTES_KEY, JSON.stringify(filtered));
  },

  requestReclassification: async (caseRecord: CaseRecord, reason: string, office: string) => {
    try {
      const resp = await fetch(APPS_SCRIPT_URL, { 
        method: 'POST', 
        body: JSON.stringify({ action: 'requestReclassification', payload: { caseRecord, reason, office } }) 
      });
      return await resp.json();
    } catch (e) {
      console.warn("Error solicitando reclasificación:", e);
      return null;
    }
  },

  escalateToAdmin2: async (caseRecord: CaseRecord, analysis: string) => {
    try {
      const resp = await fetch(APPS_SCRIPT_URL, { 
        method: 'POST', 
        body: JSON.stringify({ action: 'escalateToAdmin2', payload: { caseRecord, analysis } }) 
      });
      return await resp.json();
    } catch (e) {
      console.warn("Error escalando a Admin2:", e);
      return null;
    }
  },

  resolveReclassification: async (caseRecord: CaseRecord, decision: string, justification: string, newOffice: string) => {
    try {
      const resp = await fetch(APPS_SCRIPT_URL, { 
        method: 'POST', 
        body: JSON.stringify({ action: 'resolveReclassification', payload: { caseRecord, decision, justification, newOffice } }) 
      });
      return await resp.json();
    } catch (e) {
      console.warn("Error resolviendo reclasificación:", e);
      return null;
    }
  },

  requestClosure: async (caseRecord: CaseRecord, reason: string, office: string) => {
    try {
      const resp = await fetch(APPS_SCRIPT_URL, { 
        method: 'POST', 
        body: JSON.stringify({ action: 'requestClosure', payload: { caseRecord, reason, office } }) 
      });
      return await resp.json();
    } catch (e) {
      console.warn("Error solicitando cierre:", e);
      return null;
    }
  },

  acceptClosure: async (caseRecord: CaseRecord, office: string) => {
    try {
      const resp = await fetch(APPS_SCRIPT_URL, { 
        method: 'POST', 
        body: JSON.stringify({ action: 'acceptClosure', payload: { caseRecord, office } }) 
      });
      return await resp.json();
    } catch (e) {
      console.warn("Error aceptando cierre:", e);
      return null;
    }
  },

  denyClosure: async (caseRecord: CaseRecord, justification: string, office: string) => {
    try {
      const resp = await fetch(APPS_SCRIPT_URL, { 
        method: 'POST', 
        body: JSON.stringify({ action: 'denyClosure', payload: { caseRecord, justification, office } }) 
      });
      return await resp.json();
    } catch (e) {
      console.warn("Error negando cierre:", e);
      return null;
    }
  },

  saveReport: async (caseRecord: CaseRecord, reportNumber: number, content: string, office: string) => {
    try {
      const resp = await fetch(APPS_SCRIPT_URL, { 
        method: 'POST', 
        body: JSON.stringify({ action: 'saveReport', payload: { caseRecord, reportNumber, content, office } }) 
      });
      return await resp.json();
    } catch (e) {
      console.warn("Error guardando informe:", e);
      return null;
    }
  }
};

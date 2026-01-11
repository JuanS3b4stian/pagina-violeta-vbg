
import { CaseRecord, User, UserRole, CaseStatus, UrgencyLevel } from '../types';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx0Homl4XH6wK1apCqHxBEH6Tk5UqH8MYD9HMwwYbn7GjpQS7PqZ4Uig-zey2GO2OgIrQ/exec'; 

const USERS_KEY = 'violeta_users';
const CASES_KEY = 'violeta_cases';

const INITIAL_USERS: User[] = [
  { id: 'u1', username: 'admin1', password: '1100', name: 'Coordinador de Equidad de Género', role: UserRole.ADMIN1, email: 'genero@sanpedrodelosmilagros-antioquia.gov.co' },
  { id: 'u2', username: 'admin2', password: '4321', name: 'Secretaría de Gobierno', role: UserRole.ADMIN2, email: 'secgobierno@sanpedrodelosmilagros-antioquia.gov.co' },
  { id: 'u3', username: 'dinspeccion', password: '1122', name: 'Inspección de Policía', role: UserRole.DESPACHO, officeName: 'Inspección de Policía', email: 'inspeccion@sanpedrodelosmilagros-antioquia.gov.co' },
  { id: 'u4', username: 'dcomisaria', password: '1092', name: 'Comisaría de Familia', role: UserRole.DESPACHO, officeName: 'Comisaría de Familia', email: 'comisaria@sanpedrodelosmilagros-antioquia.gov.co' },
  { id: 'u5', username: 'dhospital', password: '2345', name: 'Hospital Santa Isabel', role: UserRole.DESPACHO, officeName: 'Hospital Santa Isabel', email: 'hospital@esesantaisabel.gov.co' },
  { id: 'u6', username: 'dsecretaria', password: '9287', name: 'Secretaría de Salud', role: UserRole.DESPACHO, officeName: 'Secretaría de Salud', email: 'direccionlocalsaludspm@gmail.com' },
];

export const storage = {
  init: () => {
    if (!localStorage.getItem(USERS_KEY)) {
      localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(CASES_KEY)) {
      localStorage.setItem(CASES_KEY, JSON.stringify([]));
    }
  },

  getUsers: (): User[] => JSON.parse(localStorage.getItem(USERS_KEY) || '[]'),
  getCases: (): CaseRecord[] => JSON.parse(localStorage.getItem(CASES_KEY) || '[]'),

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

  // Fix: Added missing requestReclassification method for operational desks to request case reassignment
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
  }
};

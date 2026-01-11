
import React from 'react';

export const COLORS = {
  violet: '#7c3aed',
  violetLight: '#ede9fe',
  pink: '#f472b6',
  gray: '#f9fafb'
};

export const VIOLENCE_TYPES = [
  'Física',
  'Psicológica',
  'Sexual',
  'Económica',
  'Patrimonial',
  'Discriminación LGBTIQ+',
  'Violencia Institucional'
];

export const DESPACHOS_LIST = [
  'Hospital Santa Isabel',
  'Comisaría de Familia',
  'Inspección de Policía',
  'Secretaría de Salud'
];

export const ICONS = {
  VioletLogo: () => (
    <svg className="w-8 h-8 text-violet-600" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
    </svg>
  ),
  PdfIcon: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  )
};

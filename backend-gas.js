
/**
 * BACKEND PÁGINA VIOLETA - VERSION 2.2 (2026)
 * Municipio San Pedro de los Milagros
 * Columnas: A:ID, B:Fecha, C:Usuaria, D:Cedula, E:Tel, F:Tipo, G:Desc, H:Estado, I:Despacho, J:Urgencia, K:Prof, L:Adjunto, M:PDF_Expediente, N:PDF_Analisis, O:PDF_Decision
 */

const SPREADSHEET_ID = 'ID_DE_TU_HOJA_AQUI'; 
const FOLDER_ID = 'ID_DE_CARPETA_DRIVE'; 
const TEST_EMAIL = "juan.mun3ra@gmail.com"; 

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('Casos');
    
    if (data.action === 'saveCase') {
      const c = data.payload;
      let adjuntoUrl = "Sin adjunto";
      if (c.fileData && c.fileName) {
        adjuntoUrl = saveFile(c.fileData, c.fileName, c.fileType);
      }
      const pdfBlob = createCasePdf(c);
      const pdfUrl = saveBlob(pdfBlob, "Expediente_" + c.id + ".pdf");

      const row = [c.id, c.fecha, c.usuariaNombre, c.usuariaCedula, c.usuariaTelefono, c.tipoViolencia, c.descripcionBreve.substring(0, 150), c.estado, c.despachoAsignado || "Pendiente", c.urgencia, c.profesionalAtendio, adjuntoUrl, pdfUrl];
      sheet.appendRow(row);
      
      sendVioletEmail(TEST_EMAIL, `NUEVO CASO: #${c.id}`, `Se ha registrado el caso de ${c.usuariaNombre}.`, [pdfBlob]);
      return response({ success: true, id: c.id, pdfUrl: pdfUrl });
    }

    // Fix: Added requestReclassification action to handle requests from operational desks
    if (data.action === 'requestReclassification') {
      const { caseRecord, reason, office } = data.payload;
      updateColumn(sheet, caseRecord.id, 8, "Reclasificación Solicitada");
      sendVioletEmail(TEST_EMAIL, `SOLICITUD RECLASIFICACIÓN: #${caseRecord.id}`, `El despacho ${office} ha solicitado la reclasificación del caso de ${caseRecord.usuariaNombre}. Motivo: ${reason}`);
      return response({ success: true });
    }

    if (data.action === 'escalateToAdmin2') {
      const { caseRecord, analysis } = data.payload;
      const blob = createAnalysisPdf(caseRecord, analysis);
      const pdfUrl = saveBlob(blob, "Analisis_Coordinacion_" + caseRecord.id + ".pdf");
      
      updateColumn(sheet, caseRecord.id, 8, "Pendiente Decisión Sec. Gobierno"); 
      updateColumn(sheet, caseRecord.id, 14, pdfUrl); // Col N: PDF Análisis Admin1
      
      return response({ success: true, pdfUrl: pdfUrl });
    }

    if (data.action === 'resolveReclassification') {
      const { caseRecord, decision, justification, newOffice } = data.payload;
      const blob = createDecisionPdf(caseRecord, decision, justification, newOffice);
      const pdfUrl = saveBlob(blob, "Decision_Final_" + caseRecord.id + ".pdf");
      
      const nuevoEstado = decision === 'Aceptada' ? "Asignado" : "En Gestión";
      const despacho = decision === 'Aceptada' ? newOffice : caseRecord.despachoAsignado;
      
      updateColumn(sheet, caseRecord.id, 8, nuevoEstado);
      updateColumn(sheet, caseRecord.id, 9, despacho);
      updateColumn(sheet, caseRecord.id, 15, pdfUrl); // Col O: PDF Decisión Final
      
      return response({ success: true, pdfUrl: pdfUrl });
    }
    
    if (data.action === 'updateCase') {
      const c = data.payload;
      updateColumn(sheet, c.id, 8, c.estado);
      updateColumn(sheet, c.id, 9, c.despachoAsignado);
      updateColumn(sheet, c.id, 10, c.urgencia);
      return response({ success: true });
    }
  } catch (err) {
    return response({ success: false, error: err.toString() });
  }
}

function saveFile(data, name, type) {
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const file = folder.createFile(Utilities.newBlob(Utilities.base64Decode(data.split(",")[1]), type, name));
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}

function saveBlob(blob, name) {
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const file = folder.createFile(blob.setName(name));
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}

function updateColumn(sheet, id, colIndex, value) {
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === id) {
      sheet.getRange(i + 1, colIndex).setValue(value);
      break;
    }
  }
}

function sendVioletEmail(to, subject, body, attachments) {
  MailApp.sendEmail({ to: to, subject: subject, body: body, attachments: attachments });
}

function createCasePdf(c) {
  const html = `<div style="font-family:Sans-serif;padding:30px;color:#333;">
    <h1 style="color:#6d28d9;border-bottom:2px solid #6d28d9;padding-bottom:10px;">EXPEDIENTE VIOLETA #${c.id}</h1>
    <div style="margin-top:20px;line-height:1.6;">
      <p><b>Fecha:</b> ${c.fecha}</p>
      <p><b>Usuaria:</b> ${c.usuariaNombre}</p>
      <p><b>Identificación:</b> ${c.usuariaCedula}</p>
      <p><b>Tipo de Violencia:</b> ${c.tipoViolencia}</p>
      <h3 style="color:#6d28d9;">Relato de los Hechos:</h3>
      <div style="background:#f5f3ff;padding:15px;border-radius:10px;">${c.descripcionBreve}</div>
    </div>
  </div>`;
  return Utilities.newBlob(html, 'text/html').getAs('application/pdf');
}

function createAnalysisPdf(c, analysis) {
  const html = `<div style="font-family:Sans-serif;padding:30px;">
    <h2 style="color:#6d28d9;border-bottom:2px solid #6d28d9;">AUTO DE ANÁLISIS TÉCNICO - COORDINACIÓN EQUIDAD</h2>
    <p><b>Caso:</b> #${c.id}</p>
    <p><b>Fecha de Análisis:</b> ${new Date().toLocaleDateString()}</p>
    <h3 style="color:#6d28d9;">Consideraciones Técnicas:</h3>
    <div style="background:#f5f3ff;padding:15px;border-radius:10px;">${analysis}</div>
  </div>`;
  return Utilities.newBlob(html, 'text/html').getAs('application/pdf');
}

function createDecisionPdf(c, decision, justification, newOffice) {
  const html = `<div style="font-family:Sans-serif;padding:30px;">
    <h2 style="color:#111827;border-bottom:2px solid #111827;">RESOLUCIÓN ADMINISTRATIVA DE COMPETENCIA</h2>
    <p><b>Caso:</b> #${c.id}</p>
    <p><b>Sentido del Fallo:</b> ${decision.toUpperCase()}</p>
    <p><b>Justificación:</b> ${justification}</p>
    ${decision === 'Aceptada' ? `<p><b>Nuevo Despacho:</b> ${newOffice}</p>` : ''}
  </div>`;
  return Utilities.newBlob(html, 'text/html').getAs('application/pdf');
}

function response(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

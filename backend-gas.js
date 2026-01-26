
/**
 * BACKEND PÁGINA VIOLETA - VERSION 2.8 (2026)
 * Municipio San Pedro de los Milagros
 * Gestión de Informes por Caso (Celdas P y Q) - Ajuste de Formato
 */

const SPREADSHEET_ID = '1EPE2BlGls0jVpOkRQKXCok_-98LmF1AWH5VenzsG990'; 
const FOLDER_EXPEDIENTES = '1akRMfj6hBUHbo2NQ8zeOeZsB8yJucdEU'; 
const FOLDER_ANALISIS_DECISION = '10iqL_Kc_iHIdQYLix94FLfETybTo1_e5'; 
const FOLDER_INFORMES = '1NXT1FrLL-ybPBiTX2JRsT83yqWUMVBiW'; // Nueva Carpeta Informes Violeta
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
        adjuntoUrl = saveFile(c.fileData, c.fileName, c.fileType, FOLDER_EXPEDIENTES);
      }
      const pdfBlob = createCasePdf(c);
      const pdfUrl = saveBlob(pdfBlob, "Expediente_" + c.id + ".pdf", FOLDER_EXPEDIENTES);

      // A-L: Datos, M: Expediente, N: Analisis, O: Resolucion, P: Informe1, Q: Informe2
      const row = [c.id, c.fecha, c.usuariaNombre, c.usuariaCedula, c.usuariaTelefono, c.tipoViolencia, c.descripcionBreve.substring(0, 150), c.estado, c.despachoAsignado || "Pendiente", c.urgencia, c.profesionalAtendio, adjuntoUrl, pdfUrl];
      sheet.appendRow(row);
      
      sendVioletEmail(TEST_EMAIL, `NUEVO CASO: #${c.id}`, `Se ha registrado el caso de ${c.usuariaNombre} en el sistema.`, [pdfBlob]);
      return response({ success: true, id: c.id, pdfUrl: pdfUrl });
    }

    if (data.action === 'saveReport') {
      const { caseRecord, reportNumber, content, office } = data.payload;
      const reportBlob = createCaseReportPdf(caseRecord, reportNumber, content, office);
      const pdfUrl = saveBlob(reportBlob, `Informe${reportNumber}_${caseRecord.id}.pdf`, FOLDER_INFORMES);
      
      // P = Col 16, Q = Col 17
      const colToUpdate = reportNumber === 1 ? 16 : 17;
      updateColumn(sheet, caseRecord.id, colToUpdate, pdfUrl);

      // Notificación al Admin1
      const emailBody = `NUEVO INFORME DE CASO - PÁGINA VIOLETA\n\n` +
                        `El despacho ${office} ha cargado el INFORME #${reportNumber} para el caso de ${caseRecord.usuariaNombre}.\n\n` +
                        `ID DEL CASO: #${caseRecord.id}\n\n` +
                        `Por favor, ingrese a la plataforma institucional para revisar el documento adjunto.`;
      
      sendVioletEmail(TEST_EMAIL, `NUEVO INFORME: Caso #${caseRecord.id}`, emailBody, [reportBlob]);
      
      return response({ success: true, pdfUrl: pdfUrl });
    }

    if (data.action === 'requestReclassification') {
      const { caseRecord, reason, office } = data.payload;
      updateColumn(sheet, caseRecord.id, 8, "Reclasificación Solicitada");
      sendVioletEmail(TEST_EMAIL, `SOLICITUD RECLASIFICACIÓN: #${caseRecord.id}`, `El despacho ${office} ha solicitado la reclasificación del caso de ${caseRecord.usuariaNombre}.\n\nMotivo informado: ${reason}`);
      return response({ success: true });
    }

    if (data.action === 'escalateToAdmin2') {
      const { caseRecord, analysis } = data.payload;
      const blob = createAnalysisPdf(caseRecord, analysis);
      const pdfUrl = saveBlob(blob, "Analisis_Coordinacion_" + caseRecord.id + ".pdf", FOLDER_ANALISIS_DECISION);
      
      updateColumn(sheet, caseRecord.id, 8, "Pendiente Decisión Sec. Gobierno"); 
      updateColumn(sheet, caseRecord.id, 14, pdfUrl); // Col N
      
      const escalationBody = `AVISO DE ESCALAMIENTO - PÁGINA VIOLETA\n\n` +
                             `Se le informa a la Secretaría de Gobierno que se ha cargado un nuevo análisis técnico para una solicitud de reclasificación.\n\n` +
                             `CASO: #${caseRecord.id}\n` +
                             `USUARIA: ${caseRecord.usuariaNombre}\n` +
                             `DESPACHO QUE SOLICITA: ${caseRecord.despachoAsignado}\n\n` +
                             `Por favor, ingrese a la plataforma para emitir el fallo definitivo.`;
      
      sendVioletEmail(TEST_EMAIL, `RECLASIFICACIÓN PENDIENTE: Caso #${caseRecord.id}`, escalationBody, [blob]);
      
      return response({ success: true, pdfUrl: pdfUrl });
    }

    if (data.action === 'resolveReclassification') {
      const { caseRecord, decision, justification, newOffice } = data.payload;
      const blob = createDecisionPdf(caseRecord, decision, justification, newOffice);
      const pdfUrl = saveBlob(blob, "Resolucion_Final_" + caseRecord.id + ".pdf", FOLDER_ANALISIS_DECISION);
      
      const nuevoEstado = decision === 'Aceptada' ? "Asignado" : "En Gestión";
      const despachoFinal = decision === 'Aceptada' ? newOffice : caseRecord.despachoAsignado;
      
      updateColumn(sheet, caseRecord.id, 8, nuevoEstado);
      updateColumn(sheet, caseRecord.id, 9, despachoFinal);
      updateColumn(sheet, caseRecord.id, 15, pdfUrl); // Col O

      const targetOffice = decision === 'Aceptada' ? newOffice : caseRecord.despachoAsignado;
      const emailBody = `RESOLUCIÓN DE COMPETENCIA - CASO #${caseRecord.id}\n\n` +
                        `Estimados ${targetOffice},\n\n` +
                        `Se ha emitido un fallo respecto a la solicitud de reclasificación de la usuaria ${caseRecord.usuariaNombre}.\n\n` +
                        `DECISIÓN: ${decision.toUpperCase()}\n` +
                        `DESPACHO ENCARGADO DEFINITIVO: ${despachoFinal}\n\n` +
                        `Se adjunta el documento oficial en PDF.`;
      
      sendVioletEmail(TEST_EMAIL, `NOTIFICACIÓN DE FALLO: Caso #${caseRecord.id} - ${decision.toUpperCase()}`, emailBody, [blob]);
      
      return response({ success: true, pdfUrl: pdfUrl });
    }

    if (data.action === 'requestClosure') {
      const { caseRecord, reason, office } = data.payload;
      updateColumn(sheet, caseRecord.id, 8, "Cierre Solicitado");
      sendVioletEmail(TEST_EMAIL, `SOLICITUD DE CIERRE: #${caseRecord.id}`, `El despacho ${office} solicita formalmente el cierre del folio de ${caseRecord.usuariaNombre}.\n\nJustificación: ${reason}`);
      return response({ success: true });
    }

    if (data.action === 'acceptClosure') {
      const { caseRecord, office } = data.payload;
      updateColumn(sheet, caseRecord.id, 8, "Cerrado");
      sendVioletEmail(TEST_EMAIL, `CIERRE ACEPTADO: Caso #${caseRecord.id}`, `Estimados ${office}, se les informa que el cierre del caso de ${caseRecord.usuariaNombre} ha sido aceptado.`);
      return response({ success: true });
    }

    if (data.action === 'denyClosure') {
      const { caseRecord, justification, office } = data.payload;
      const blob = createDenialClosurePdf(caseRecord, justification);
      const pdfUrl = saveBlob(blob, "Negativa_Cierre_" + caseRecord.id + ".pdf", FOLDER_ANALISIS_DECISION);
      updateColumn(sheet, caseRecord.id, 8, "En Gestión");
      sendVioletEmail(TEST_EMAIL, `NOTIFICACIÓN NEGATIVA CIERRE: Caso #${caseRecord.id}`, `Su solicitud de cierre ha sido negada. Revise el auto adjunto.`, [blob]);
      return response({ success: true, pdfUrl: pdfUrl });
    }
    
    if (data.action === 'updateCase') {
      const c = data.payload;
      updateColumn(sheet, c.id, 8, c.estado);
      updateColumn(sheet, c.id, 9, c.despachoAsignado);
      updateColumn(sheet, c.id, 10, c.urgencia);

      if (c.estado === "Asignado" && c.despachoAsignado) {
        sendVioletEmail(TEST_EMAIL, `NUEVO CASO ASIGNADO: #${c.id}`, `Se le ha asignado el caso de ${c.usuariaNombre}. Por favor, revise la plataforma.`);
      }
      return response({ success: true });
    }
  } catch (err) {
    return response({ success: false, error: err.toString() });
  }
}

function saveFile(data, name, type, folderId) {
  const folder = DriveApp.getFolderById(folderId);
  const file = folder.createFile(Utilities.newBlob(Utilities.base64Decode(data.split(",")[1]), type, name));
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}

function saveBlob(blob, name, folderId) {
  const folder = DriveApp.getFolderById(folderId);
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
    <h1 style="color:#6d28d9;border-bottom:2px solid #6d28d9;">EXPEDIENTE VIOLETA #${c.id}</h1>
    <p><b>Fecha:</b> ${c.fecha}</p>
    <p><b>Usuaria:</b> ${c.usuariaNombre}</p>
    <p><b>Tipo de Violencia:</b> ${c.tipoViolencia}</p>
    <div style="background:#f5f3ff;padding:15px;border-radius:10px;margin-top:20px;">${c.descripcionBreve}</div>
  </div>`;
  return Utilities.newBlob(html, 'text/html').getAs('application/pdf');
}

function createCaseReportPdf(c, reportNumber, content, office) {
  const html = `<div style="font-family:Sans-serif;padding:30px;">
    <h1 style="color:#2563eb;border-bottom:2px solid #2563eb;padding-bottom:10px;">INFORME DE CASO #${reportNumber}</h1>
    <p><b>Expediente:</b> #${c.id}</p>
    <p><b>Usuaria:</b> ${c.usuariaNombre}</p>
    <p><b>Despacho Remitente:</b> ${office}</p>
    <p><b>Fecha de Carga:</b> ${new Date().toLocaleDateString()}</p>
    <hr/>
    <h3 style="color:#1e3a8a;">CONTENIDO DEL INFORME:</h3>
    <div style="line-height:1.6; text-align:justify; background:#eff6ff; padding:20px; border-radius:10px;">
      ${content}
    </div>
    <br/><br/>
    <p style="text-align: center; color: #666; font-size: 10px;">Documento generado automáticamente por el Sistema Institucional Página Violeta</p>
  </div>`;
  return Utilities.newBlob(html, 'text/html').getAs('application/pdf');
}

function createAnalysisPdf(c, analysis) {
  const html = `<div style="font-family:Sans-serif;padding:30px;">
    <h2 style="color:#6d28d9;border-bottom:2px solid #6d28d9;">AUTO DE ANÁLISIS TÉCNICO</h2>
    <p><b>Caso:</b> #${c.id}</p>
    <div style="line-height:1.6;margin-top:20px;">${analysis}</div>
  </div>`;
  return Utilities.newBlob(html, 'text/html').getAs('application/pdf');
}

function createDecisionPdf(c, decision, justification, newOffice) {
  const html = `<div style="font-family:Sans-serif;padding:30px; border: 2px solid #111827;">
    <h2 style="color:#111827;border-bottom:2px solid #111827; text-align:center;">RESOLUCIÓN DE COMPETENCIA</h2>
    <p><b>Caso:</b> #${c.id}</p>
    <p><b>Sentido:</b> ${decision.toUpperCase()}</p>
    <p><b>Justificación Jurídica:</b> ${justification}</p>
  </div>`;
  return Utilities.newBlob(html, 'text/html').getAs('application/pdf');
}

function createDenialClosurePdf(c, justification) {
  const html = `<div style="font-family:Sans-serif;padding:30px;">
    <h2 style="color:#dc2626;border-bottom:2px solid #dc2626;">AUTO DE NEGATIVA DE CIERRE</h2>
    <p><b>Caso:</b> #${c.id}</p>
    <p><b>Motivos:</b> ${justification}</p>
  </div>`;
  return Utilities.newBlob(html, 'text/html').getAs('application/pdf');
}

function response(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

const nodemailer = require('nodemailer');

async function enviarCorreoCorte({ desde, password, hasta, asunto, cuerpo, html, csvContent, csvFilename }) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user: desde, pass: password }
  });

  // El adjunto puede ser un .xls real (tabla HTML que Excel abre como hoja de
  // cálculo) o un .csv de respaldo (p. ej. el correo de prueba) — el BOM solo
  // es necesario para que Excel detecte UTF-8 en un CSV plano.
  const esXls = /\.xlsx?$/i.test(csvFilename || '');

  await transporter.sendMail({
    from: '"Kaan Luum POS" <' + desde + '>',
    to: hasta,
    subject: asunto,
    text: cuerpo,
    ...(html ? { html } : {}),
    attachments: [
      {
        filename: csvFilename,
        content: esXls ? Buffer.from(csvContent, 'utf8') : Buffer.from('﻿' + csvContent, 'utf8'),
        contentType: esXls ? 'application/vnd.ms-excel' : 'text/csv; charset=utf-8'
      }
    ]
  });
}

module.exports = { enviarCorreoCorte };

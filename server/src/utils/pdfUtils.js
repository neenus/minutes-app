// const { jsPDF } = require('jspdf');
import fs from 'fs';
import path from 'path';

export const addTitle = (doc, title) => {
  doc.setFont('helvetica', 'bold');
  doc.text(title, 105, 20, { align: 'center' });
  doc.setLineWidth(0.5);
  doc.line(60, 22, 150, 22); // Underline the title
}

export const addTableHeaders = (doc, headers, positions) => {
  doc.setFontSize(12);
  headers.forEach((header, index) => {
    doc.text(header, positions[index], 40);
  });
  console.log("add table headers done", { headers, positions });
}

export const addTableRows = (doc, rows, positions) => {
  try {
    doc.setFontSize(10);
    rows.forEach((row, rowIndex) => {
      console.log({ row, rowIndex });
      Object.keys(row).forEach((key, colIndex) => {
        doc.text(row[key], positions[colIndex], 50 + rowIndex * 10);
      });
    });
    console.log("add table rows done", { rows });
  } catch (error) {
    console.error("Error in addTableRows:", error);
  }
}

export const drawVerticalLines = (doc, positions) => {
  doc.setLineWidth(0);
  try {
    positions.forEach(position => {
      doc.line(position, 42, position, 282);
    });
    console.log("draw vertical lines done", { positions });
  } catch (error) {
    console.error("Error in drawVerticalLines:", error);
  }
}

export const convertToBuffer = (doc) => {
  return Buffer.from(doc.output('arraybuffer'));
}

export const sendPdfResponse = (res, pdfBuffer, filename) => {
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${filename}"`,
  });
  res.send(pdfBuffer);
}

export const addFrameImage = (doc, imagePath) => {
  const frameImage = fs.readFileSync(path.resolve(__dirname, imagePath), { encoding: 'base64' });
  doc.addImage(frameImage, "png", 10, 10, 190, 275);
}
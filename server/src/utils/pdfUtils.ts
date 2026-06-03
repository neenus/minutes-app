import type { jsPDF } from 'jspdf';

export const addTitle = (doc: jsPDF, title: string): void => {
  doc.setFont('helvetica', 'bold');
  doc.text(title, 105, 20, { align: 'center' });
  doc.setLineWidth(0.5);
  doc.line(60, 22, 150, 22);
};

export const addTableHeaders = (doc: jsPDF, headers: string[], positions: number[]): void => {
  doc.setFontSize(12);
  headers.forEach((header, index) => {
    doc.text(header, positions[index], 40);
  });
};

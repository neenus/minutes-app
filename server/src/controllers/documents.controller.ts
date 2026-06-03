// server/src/controllers/documents.controller.ts
import { jsPDF } from 'jspdf';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import path from 'path';
import fs from 'fs';
import archiver from 'archiver';
import { fileURLToPath } from 'url';
import type { Request, Response } from 'express';
import { addTitle, addTableHeaders } from '../utils/pdfUtils.js';
import { numberToWords } from '../utils/numberToWords.js';
import { getLegalDate } from '../utils/legalDate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Director { name: string; dateElected: string; dateResigned: string; }
interface Officer { name: string; officeHeld: string; dateAppointed: string; dateResigned: string; }
interface Shareholder { date: string; name: string; sharesHeldNumber: string; sharesHeldClass: string; }
interface LedgerEntry {
  date: string; certificateNo: string; transactionNo: string;
  toFrom: string; transfered: string; acquired: string; sharesBalance: string;
}
interface LedgerPayload {
  ledgerEntries?: LedgerEntry[]; name?: string; streetAddress?: string;
  cityAddress?: string; provinceAddress?: string; postalCode?: string; classOfShares?: string;
}
interface ShareCertPayload {
  certificateNumber?: string; shareholderName?: string;
  numberOfShares?: number | string; classOfShares?: string;
  companyName?: string; issueDate?: string;
}
interface Signatory { name: string; title?: string; }
interface BankingPayload {
  companyName?: string; bankName?: string; resolutionDate?: string;
  signatories?: Signatory[]; signingInstructions?: string;
}

// ─── Helper ──────────────────────────────────────────────────────────────────

const sendPdf = (res: Response, buffer: Buffer, filename: string): void => {
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${filename}"`,
  });
  res.send(buffer);
};

// ─── Request Handlers ────────────────────────────────────────────────────────

export const generateDirectorsRegister = (req: Request, res: Response): void => {
  try {
    sendPdf(res, buildDirectorsRegisterPdf(req.body.directors ?? []), 'directors_register.pdf');
  } catch { res.status(500).json({ error: "Failed to generate Director's Register PDF" }); }
};

export const generateOfficersRegister = (req: Request, res: Response): void => {
  try {
    sendPdf(res, buildOfficersRegisterPdf(req.body.officers ?? []), 'officers_register.pdf');
  } catch { res.status(500).json({ error: "Failed to generate Officer's Register PDF" }); }
};

export const generateShareholdersRegister = (req: Request, res: Response): void => {
  try {
    sendPdf(res, buildShareholdersRegisterPdf(req.body.shareholders ?? []), 'shareholders_register.pdf');
  } catch { res.status(500).json({ error: "Failed to generate Shareholder's Register PDF" }); }
};

export const generateShareholdersLedger = (req: Request, res: Response): void => {
  try {
    sendPdf(res, buildShareholdersLedgerPdf(req.body), 'shareholders_ledger.pdf');
  } catch { res.status(500).json({ error: "Failed to generate Shareholder's Ledger PDF" }); }
};

export const generateShareCertificate = (req: Request, res: Response): void => {
  try {
    sendPdf(res, buildShareCertificatePdf(req.body), 'share_certificate.pdf');
  } catch { res.status(500).json({ error: 'Failed to generate Share Certificate PDF' }); }
};

export const generateBankResolution = (req: Request, res: Response): void => {
  try {
    sendPdf(res, buildBankingResolutionPdf(req.body), 'banking_resolution.pdf');
  } catch { res.status(500).json({ error: 'Failed to generate Banking Resolution PDF' }); }
};

export const generateByLaws = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyName, directorName, date } = req.body;
    sendPdf(res, Buffer.from(await buildByLaw1Pdf(companyName, directorName, date)), 'bylaw_1.pdf');
  } catch { res.status(500).json({ error: 'Failed to generate By-Law PDF' }); }
};

export const generateByLaws2 = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyName, directorName, date } = req.body;
    sendPdf(res, Buffer.from(await buildByLaw2Pdf(companyName, directorName, date)), 'bylaw_2.pdf');
  } catch { res.status(500).json({ error: 'Failed to generate By-Law PDF' }); }
};

export const generateAllDocuments = async (req: Request, res: Response): Promise<void> => {
  const {
    companyName: c = '', directorName: d = '', date: dt = '',
    bankName: bn = '', resolutionDate: rd = '',
    signatories: sig, signingInstructions: si,
    bylaw1 = {}, bylaw2 = {}, bankingResolution = {},
    officersRegister = {}, directorsRegister = {},
    shareholdersRegister = {}, shareholdersLedger = {},
    shareCertificates = [],
  } = req.body ?? {};

  try {
    const defaultDate = dt || rd;
    const archive = archiver('zip', { zlib: { level: 9 } });
    res.set({ 'Content-Type': 'application/zip', 'Content-Disposition': 'attachment; filename="corporate_documents.zip"' });
    archive.on('error', (err: Error) => console.error('Archive error', err));
    archive.pipe(res);

    archive.append(Buffer.from(await buildByLaw1Pdf(bylaw1.companyName ?? c, bylaw1.directorName ?? d, bylaw1.date ?? defaultDate)), { name: '01_Bylaw_1.pdf' });
    archive.append(Buffer.from(await buildByLaw2Pdf(bylaw2.companyName ?? c, bylaw2.directorName ?? d, bylaw2.date ?? defaultDate)), { name: '02_Bylaw_2.pdf' });
    archive.append(buildBankingResolutionPdf({ ...bankingResolution, companyName: bankingResolution.companyName ?? c, bankName: bankingResolution.bankName ?? bn, resolutionDate: bankingResolution.resolutionDate ?? defaultDate, signatories: bankingResolution.signatories ?? (Array.isArray(sig) ? sig : undefined), signingInstructions: bankingResolution.signingInstructions ?? si }), { name: '03_Banking_Resolution.pdf' });
    archive.append(buildOfficersRegisterPdf(officersRegister.officers ?? []), { name: '04_Officers_Register.pdf' });
    archive.append(buildDirectorsRegisterPdf(directorsRegister.directors ?? []), { name: '05_Directors_Register.pdf' });
    archive.append(buildShareholdersRegisterPdf(shareholdersRegister.shareholders ?? []), { name: '06_Shareholders_Register.pdf' });
    archive.append(buildShareholdersLedgerPdf(shareholdersLedger), { name: '07_Shareholders_Ledger.pdf' });

    const certs: ShareCertPayload[] = Array.isArray(shareCertificates) ? shareCertificates : [];
    if (certs.length) {
      certs.forEach((cert, idx) => archive.append(buildShareCertificatePdf({ ...cert, companyName: cert.companyName ?? c }), { name: certs.length > 1 ? `08_Share_Certificate_${idx + 1}.pdf` : '08_Share_Certificates.pdf' }));
    } else {
      archive.append(buildShareCertificatePdf({}), { name: '08_Share_Certificates.pdf' });
    }

    await archive.finalize();
  } catch (err) {
    console.error('Bundled generation error', err);
    res.status(500).json({ error: 'Failed to generate bundled documents' });
  }
};

// ─── PDF Builders ────────────────────────────────────────────────────────────

const buildDirectorsRegisterPdf = (directors: Director[] = []): Buffer => {
  const doc = new jsPDF();
  addTitle(doc, "DIRECTOR'S REGISTER");
  addTableHeaders(doc, ['Name', 'Date Elected', 'Date Resigned'], [30, 90, 150]);
  doc.setLineWidth(0);
  doc.line(20, 42, 190, 42); doc.line(20, 42, 20, 282);
  doc.line(80, 42, 80, 282); doc.line(140, 42, 140, 282); doc.line(190, 42, 190, 282);
  let y = 50;
  for (let i = 0; i < 24; i++) {
    const dir = directors[i] ?? { name: '', dateElected: '', dateResigned: '' };
    doc.setFont('helvetica', 'normal');
    doc.text(dir.name ?? '', 30, y);
    doc.text(dir.dateElected ?? '', 90, y);
    doc.text(dir.dateResigned ?? '', 150, y);
    doc.line(20, y + 2, 190, y + 2);
    y += 10;
  }
  return Buffer.from(doc.output('arraybuffer'));
};

const buildOfficersRegisterPdf = (officers: Officer[] = []): Buffer => {
  const doc = new jsPDF();
  addTitle(doc, "OFFICER'S REGISTER");
  addTableHeaders(doc, ['Name', 'Office Held', 'Date Appointed', 'Date Resigned'], [20, 70, 120, 165]);
  doc.setLineWidth(0);
  doc.line(15, 42, 195, 42); doc.line(15, 42, 15, 282);
  doc.line(65, 42, 65, 282); doc.line(115, 42, 115, 282);
  doc.line(160, 42, 160, 282); doc.line(195, 42, 195, 282);
  let y = 50;
  for (let i = 0; i < 24; i++) {
    const o = officers[i] ?? { name: '', officeHeld: '', dateAppointed: '', dateResigned: '' };
    doc.setFont('helvetica', 'normal');
    doc.text(o.name ?? '', 20, y); doc.text(o.officeHeld ?? '', 70, y);
    doc.text(o.dateAppointed ?? '', 120, y); doc.text(o.dateResigned ?? '', 170, y);
    doc.line(15, y + 2, 195, y + 2); y += 10;
  }
  return Buffer.from(doc.output('arraybuffer'));
};

const buildShareholdersRegisterPdf = (shareholders: Shareholder[] = []): Buffer => {
  const doc = new jsPDF();
  doc.setFont('helvetica', 'bold');
  doc.text("SHAREHOLDER'S REGISTER", 105, 20, { align: 'center' });
  doc.setLineWidth(0.5); doc.line(60, 22, 150, 22);
  doc.setFontSize(12);
  doc.text('Date', 30, 40); doc.text('Name', 75, 40);
  doc.text('Shares Held', 140, 35); doc.text('Number', 125, 40); doc.text('Class', 165, 40);
  doc.setLineWidth(0);
  doc.line(15, 42, 195, 42); doc.line(15, 42, 15, 282); doc.line(55, 42, 55, 282);
  doc.line(110, 42, 110, 282); doc.line(150, 42, 150, 282); doc.line(195, 42, 195, 282);
  let y = 50;
  for (let i = 0; i < 24; i++) {
    const s = shareholders[i] ?? { date: '', name: '', sharesHeldNumber: '', sharesHeldClass: '' };
    doc.setFont('helvetica', 'normal');
    doc.text(s.date ?? '', 20, y); doc.text(s.name ?? '', 60, y);
    doc.text(s.sharesHeldNumber ?? '', 130, y); doc.text(s.sharesHeldClass ?? '', 160, y);
    doc.line(15, y + 2, 195, y + 2); y += 10;
  }
  return Buffer.from(doc.output('arraybuffer'));
};

const buildShareholdersLedgerPdf = (payload: LedgerPayload = {}): Buffer => {
  const { ledgerEntries = [], name = '', streetAddress = '', cityAddress = '', provinceAddress = '', postalCode = '', classOfShares = '' } = payload;
  const doc = new jsPDF();
  doc.setFont('helvetica', 'bold');
  doc.text("SHAREHOLDER'S LEDGER", 105, 20, { align: 'center' });
  doc.setLineWidth(0.5); doc.line(60, 22, 150, 22);
  doc.setFontSize(12);
  doc.text('Name: ', 20, 30); doc.text('Address: ', 20, 35); doc.text('Class of Shares:', 120, 30);
  doc.setFont('helvetica', 'normal');
  doc.text(name, 40, 30); doc.text(streetAddress, 40, 35);
  doc.text(`${cityAddress},`, 40, 40);
  doc.text(provinceAddress, doc.getTextWidth(cityAddress) + 43, 40);
  doc.text(postalCode, doc.getTextWidth(cityAddress) + 10 + doc.getTextWidth(provinceAddress) + 35, 40);
  doc.text(classOfShares, doc.getTextWidth('Class of Shares:') + 125, 30);
  doc.setFontSize(11); doc.setFont('helvetica', 'bold');
  doc.text('Date', 15, 55); doc.text('Cert. No.', 40, 55); doc.text('Trans. No.', 60, 55);
  doc.text('To/From', 90, 55); doc.text('Transferred', 130, 55); doc.text('Acquired', 160, 55); doc.text('Balance', 180, 55);
  doc.setLineWidth(0);
  [10,40,60,90,130,160,180,200].forEach(x => doc.line(x, 60, x, 275));
  doc.line(10, 60, 200, 60); doc.line(10, 275, 200, 275);
  const rowHeight = 10;
  const totalRows = Math.max(ledgerEntries.length, 18);
  let y = 80;
  for (let i = 0; i < totalRows; i++) {
    const e = ledgerEntries[i] ?? { date:'',certificateNo:'',transactionNo:'',toFrom:'',transfered:'',acquired:'',sharesBalance:'' };
    doc.setFont('helvetica', 'normal');
    doc.text(e.date ?? '', 15, y - 12); doc.text(e.certificateNo ?? '', 45, y - 12);
    doc.text(e.transactionNo ?? '', 65, y - 12); doc.text(e.toFrom ?? '', 95, y - 12);
    doc.text(e.transfered ?? '', 135, y - 12); doc.text(e.acquired ?? '', 165, y - 12);
    doc.text(e.sharesBalance ?? '', 185, y - 12);
    doc.line(10, y - rowHeight, 200, y - rowHeight);
    y += rowHeight;
  }
  while (y < 275) { doc.line(10, y - rowHeight, 200, y - rowHeight); y += rowHeight; }
  return Buffer.from(doc.output('arraybuffer'));
};

const buildShareCertificatePdf = (payload: ShareCertPayload = {}): Buffer => {
  const { certificateNumber, shareholderName, numberOfShares, classOfShares, companyName, issueDate } = payload;
  const numWords = numberToWords(Number(numberOfShares ?? 0));
  const frameImage = fs.readFileSync(path.resolve(__dirname, '../templates/frame.png'), { encoding: 'base64' });
  const doc = new jsPDF();
  doc.addImage(frameImage, 'png', 10, 10, 190, 275);
  doc.setFontSize(10); doc.setFont('helvetica', 'normal');
  doc.text(`Certificate No.: ${certificateNumber ?? ''}`, 20, 25);
  doc.text(`${numWords} (${numberOfShares ?? 0}) ${classOfShares ?? ''} shares`, 185, 25, { align: 'right' });
  doc.setFont('helvetica', 'bold'); doc.setFontSize(18);
  doc.text(companyName ?? '', 105, 40, { align: 'center' });
  doc.setFontSize(14);
  doc.text('(Incorporated under the laws of the province of Ontario)', 105, 50, { align: 'center' });
  doc.setFontSize(12); doc.setFont('helvetica', 'normal');
  doc.text('THIS CERTIFIES THAT', 20, 60);
  doc.setFont('helvetica', 'bold'); doc.text(shareholderName ?? '', 80, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(`is the registered holder of ${numWords} (${numberOfShares ?? 0}) ${classOfShares ?? ''} Shares fully paid and non-assessable without nominal or par value in the capital of`, 20, 70, { maxWidth: 170 });
  doc.setFont('helvetica', 'bold'); doc.setFontSize(18);
  doc.text(companyName ?? '', 105, 85, { align: 'center' });
  doc.text("(the 'Corporation')", 105, 95, { align: 'center' });
  doc.setFontSize(12); doc.setFont('helvetica', 'normal');
  doc.text('The class or series of shares represented by this Certificate has rights, privileges, restrictions or conditions attached thereto and the Corporation will furnish to the holder, on demand and without charge, a full copy of the text of:', 20, 105, { maxWidth: 170 });
  doc.text('(i). the rights, privileges, restrictions, and conditions attached to the said shares and to each class authorized to be issued and to each series insofar as the same have been fixed by the directors; and', 25, 120, { maxWidth: 170 });
  doc.text('(ii). the authority of the directors to fix the rights, privileges, restrictions, and conditions of subsequent series, if applicable.', 25, 135, { maxWidth: 170 });
  doc.text('The transfer of the shares represented by this certificate is subject to the restrictions contained in the articles of the Corporation.', 20, 150, { maxWidth: 170 });
  doc.text('The Corporation has a lien on any shares registered in the name of the above shareholder or the legal representative of such shareholder to the extent of the debt (if any) of that shareholder to the Corporation.', 20, 170, { maxWidth: 170 });
  doc.text('IN WITNESS WHEREOF the Corporation has caused this certificate to be signed by its duly authorized officers.', 20, 190, { maxWidth: 170 });
  doc.setFont('helvetica', 'bold');
  const formattedDate = issueDate ? new Date(issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
  doc.text(`DATED: ${formattedDate}`, 20, 210);
  doc.text('______________________________', 20, 230); doc.text('President', 20, 235);
  doc.text('______________________________', 110, 230); doc.text('Secretary', 110, 235);
  doc.addPage();
  doc.setFontSize(14);
  doc.text('CERTIFICATE FOR', 105, 20, { align: 'center' });
  doc.text(`${numWords} (${numberOfShares ?? 0})`, 105, 40, { align: 'center' });
  doc.text(`${classOfShares ?? ''} Shares of:`, 105, 50, { align: 'center' });
  doc.text(companyName ?? '', 105, 70, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Issued to:                  ${shareholderName ?? ''}`, 65, 85);
  doc.text(`Date:                         ${issueDate ?? ''}`, 65, 90);
  doc.text(`Certificate No.:         ${certificateNumber ?? ''}`, 66, 95);
  doc.setFontSize(12);
  doc.text('******************************************************************************************************', 20, 110, { maxWidth: 170 });
  doc.text('FOR VALUE RECEIVED, the undersigned hereby sells, endorses and transfers unto', 20, 130, { maxWidth: 170 });
  doc.text(`.........................................................................................  ${classOfShares ?? ''} Shares of`, 20, 140, { maxWidth: 170 });
  doc.setFont('helvetica', 'bold'); doc.text(companyName ?? '', 20, 150, { maxWidth: 170 });
  doc.setFont('helvetica', 'normal');
  doc.text('represented by the within certificate.', (doc.getTextWidth(companyName ?? '') + 25), 150, { maxWidth: 170 });
  doc.text('DATED this', 40, 170); doc.text('day of', 100, 170); doc.text(', 20', 140, 170);
  doc.text('IN THE PRESENCE OF:', 20, 190);
  doc.text('________________________', 20, 210); doc.text('(Signature of Witness)', 20, 215);
  doc.text('________________________', 120, 210); doc.text('(Signature of Shareholder)', 120, 215);
  doc.setFont('helvetica', 'bold');
  doc.text('NOTICE: The signature of this endorsement must correspond with the name as written upon the face of the certificate, in every particular, without alteration or enlargement, or any change whatever, and the Corporation reserves the right to require reasonable assurance that the endorsement is genuine and effective.', 20, 240, { maxWidth: 170 });
  return Buffer.from(doc.output('arraybuffer'));
};

const buildBankingResolutionPdf = (payload: BankingPayload = {}): Buffer => {
  const {
    companyName, bankName = 'the bank designated by the directors',
    resolutionDate, signatories = [],
    signingInstructions = 'Any one (1) director or officer of the Corporation is authorized to sign, draw, accept, endorse, or otherwise execute cheques, bills of exchange, and other instruments on behalf of the Corporation.',
  } = payload;
  const resolvedCompany = companyName ? String(companyName).trim() : 'Corporation';
  const sigList = Array.isArray(signatories)
    ? signatories.map(s => ({ name: String(s?.name ?? '').trim(), title: String(s?.title ?? 'Director/Officer').trim() })).filter(s => s.name)
    : [];
  const effectiveSigs = sigList.length ? sigList : [{ name: 'Authorized Signatory', title: 'Director/Officer' }];
  const doc = new jsPDF();
  const parsed = resolutionDate ? new Date(resolutionDate) : new Date();
  const validDate = isNaN(parsed.getTime()) ? new Date() : parsed;
  const { day, month, year } = getLegalDate(validDate);
  doc.setFont('times', 'bold'); doc.setFontSize(16);
  doc.text(resolvedCompany, 20, 25);
  doc.text('Banking Resolution', 20, 40);
  doc.setFontSize(14); doc.text('BE IT RESOLVED THAT:', 20, 60);
  doc.setFont('times', 'normal'); doc.setFontSize(12);
  const clauses = [
    `1. A banking account in the name of ${resolvedCompany} shall be opened and maintained with ${bankName ?? 'the bank designated by the directors'}.`,
    `2. ${signingInstructions}`,
    `3. The said bank is authorized to honour and pay all such instruments when signed as authorized, even if they cause the account to be overdrawn.`,
  ];
  let y = 75;
  clauses.forEach(text => {
    const split = doc.splitTextToSize(text, 175);
    doc.text(split, 20, y);
    y += split.length * 7 + 8;
  });
  doc.text('DATED this', 20, y + 5);
  const dayX = 45;
  doc.text(day, dayX, y + 5); doc.line(dayX - 1, y + 6, dayX + doc.getTextWidth(day), y + 6);
  doc.text('day of', 75, y + 5);
  const monthX = 95;
  doc.text(month, monthX, y + 5); doc.line(monthX - 1, y + 6, monthX + doc.getTextWidth(month), y + 6);
  doc.text(',', monthX + doc.getTextWidth(month) + 2, y + 5);
  const yearX = monthX + doc.getTextWidth(month) + 8;
  doc.text(String(year), yearX, y + 5);
  let sigY = y + 25;
  effectiveSigs.forEach(({ name, title }) => {
    doc.line(20, sigY, 90, sigY);
    doc.text(name, 20, sigY + 6); doc.text(title, 20, sigY + 12);
    sigY += 25;
  });
  return Buffer.from(doc.output('arraybuffer'));
};

const buildByLaw1Pdf = async (companyName: string, directorName: string, date: string): Promise<Uint8Array> => {
  const templateBytes = fs.readFileSync(path.resolve(__dirname, '../templates/bylaw_1.pdf'));
  const pdfDoc = await PDFDocument.load(templateBytes);
  const form = pdfDoc.getForm();
  const font = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const corpField = form.getTextField('corporation_name');
  corpField.setText(companyName); corpField.setFontSize(14);
  corpField.updateAppearances(font); corpField.enableReadOnly();
  const { day, month, year } = getLegalDate(new Date(date));
  form.getFields().forEach(field => {
    const n = field.getName();
    if (n.includes('director_name')) {
      (field as any).setFontSize(12);
      (field as any).setText(directorName);
      (field as any).updateAppearances(font);
      (field as any).enableReadOnly();
    }
    if (n.includes('day')) { (field as any).setText(day); (field as any).updateAppearances(font); (field as any).enableReadOnly(); }
    if (n.includes('month')) { (field as any).setText(month); (field as any).updateAppearances(font); (field as any).enableReadOnly(); }
    if (n.includes('year')) { (field as any).setText(String(year)); (field as any).updateAppearances(font); (field as any).enableReadOnly(); }
  });
  return pdfDoc.save();
};

const buildByLaw2Pdf = async (companyName: string, directorName: string, date: string): Promise<Uint8Array> => {
  const templateBytes = fs.readFileSync(path.resolve(__dirname, '../templates/bylaw_2.pdf'));
  const pdfDoc = await PDFDocument.load(templateBytes);
  const form = pdfDoc.getForm();
  const font = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const corpField = form.getTextField('corporation_name');
  corpField.setText(companyName); corpField.setFontSize(14);
  corpField.updateAppearances(font); corpField.enableReadOnly();
  const { day, month, year } = getLegalDate(new Date(date));
  form.getFields().forEach(field => {
    const n = field.getName();
    if (n.includes('director_name')) {
      (field as any).setFontSize(12);
      (field as any).setText(directorName);
      (field as any).updateAppearances(font);
      (field as any).enableReadOnly();
    }
    if (n.includes('day')) { (field as any).setText(day); (field as any).updateAppearances(font); (field as any).enableReadOnly(); }
    if (n.includes('month')) { (field as any).setText(month); (field as any).updateAppearances(font); (field as any).enableReadOnly(); }
    if (n.includes('year')) { (field as any).setText(String(year)); (field as any).updateAppearances(font); (field as any).enableReadOnly(); }
  });
  return pdfDoc.save();
};

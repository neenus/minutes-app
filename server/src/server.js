import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import { jsPDF } from 'jspdf';
import path from 'path';
import fs from 'fs';
import archiver from 'archiver';
import { addTitle, addTableHeaders } from "./utils/pdfUtils.js";
import { PDFDocument, StandardFonts } from 'pdf-lib';
import dotenv from 'dotenv';

dotenv.config({ path: './config/.env' });

const app = express();

// Middleware
app.use(cors());
// Accept standard JSON bodies and common fallbacks; helps when clients miss Content-Type
app.use(express.json({ limit: '1mb', type: ['application/json', 'text/json', 'application/*+json', 'text/plain', '*/*'] }));
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {});

const db = mongoose.connection;
db.once('open', () => {
  console.log('Connected to MongoDB');
});

db.on('error', (error) => console.error('MongoDB connection error:', error));

// Mongoose Models
const PersonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String },
});

const Person = mongoose.model('Person', PersonSchema);

// Test API Endpoints
app.get('/api/people', async (req, res) => {
  console.log('GET /api/people');
  try {
    const people = await Person.find();
    console.log('GET /api/people response:', people);
    res.json(people);
  } catch (error) {
    console.log('GET /api/people error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/people', async (req, res) => {
  try {
    const person = new Person(req.body);
    await person.save();
    res.status(201).json(person);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/generate-directors-register', (req, res) => {
  const { directors } = req.body; // Array of directors, each with name, dateElected, dateResigned

  try {
    const pdfBuffer = generateDirectorsRegisterPdf(directors);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="directors_register.pdf"',
    });

    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate Director’s Register PDF' });
  }
});

app.post('/api/generate-officers-register', (req, res) => {
  const { officers } = req.body; // Array of officers, each with name, officeHeld, dateAppointed, dateResigned

  try {
    const pdfBuffer = generateOfficersRegisterPdf(officers);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="officers_register.pdf"',
    });

    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate Officer’s Register PDF' });
  }
});

app.post('/api/generate-shareholders-register', (req, res) => {
  const { shareholders } = req.body; // Array of shareholders, each with name, date, sharesHeldNumber, sharesHeldClass

  try {
    const pdfBuffer = generateShareholdersRegisterPdf(shareholders);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="shareholders_register.pdf"',
    });

    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate Shareholder’s Register PDF' });
  }
});

app.post('/api/generate-share-certificate', (req, res) => {
  try {
    const pdfBuffer = generateShareCertificatePdf(req.body);

    // Send PDF as response
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="share_certificate.pdf"',
    });

    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate Share Certificate PDF' });
  }
});

app.post('/api/generate-shareholders-ledger', (req, res) => {
  const { ledgerEntries, name, streetAddress, cityAddress, provinceAddress, postalCode, classOfShares } = req.body; // Array of entries, each with Date, Transaction Type, Certificate No., Shares Issued, Shares Transferred, Shares Balance

  try {
    const pdfBuffer = generateShareholdersLedgerPdf({
      ledgerEntries,
      name,
      streetAddress,
      cityAddress,
      provinceAddress,
      postalCode,
      classOfShares
    });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="shareholders_ledger.pdf"',
    });

    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({
      error: "Failed to generate Shareholder's Ledger PDF"
    });
  }
});

app.post('/api/generate-bank-resolution', (req, res) => {
  try {
    const pdfBuffer = generateBankingResolutionPdf(req.body);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="banking_resolution.pdf"',
    });
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate Banking Resolution PDF' });
  }
});

app.post('/api/generate-by-laws', async (req, res) => {
  const { companyName, directorName, date } = req.body;

  try {
    const pdfDocBuffer = await generateByLaw1(companyName, directorName, date);
    const pdfDoc = Buffer.from(pdfDocBuffer);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="bylaw_1.pdf"',
    });

    res.send(pdfDoc);
  }
  catch (error) {
    res.status(500).json({ error: 'Failed to generate By-Law PDF' });
  }
});

app.post('/api/generate-by-laws-2', async (req, res) => {
  const { companyName, directorName, date } = req.body;

  try {
    const pdfDocBuffer = await generateByLaw2(companyName, directorName, date);
    const pdfDoc = Buffer.from(pdfDocBuffer);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="bylaw_2.pdf"',
    });

    res.send(pdfDoc);
  }
  catch (error) {
    res.status(500).json({ error: 'Failed to generate By-Law PDF' });
  }
});

app.post('/api/generate-all-documents', async (req, res) => {
  const {
    companyName: topCompanyName,
    directorName: topDirectorName,
    date: topDate,
    bankName: topBankName,
    resolutionDate: topResolutionDate,
    signatories: topSignatories,
    signingInstructions: topSigningInstructions,
    bylaw1 = {},
    bylaw2 = {},
    bankingResolution = {},
    officersRegister = {},
    directorsRegister = {},
    shareholdersRegister = {},
    shareholdersLedger = {},
    shareCertificates = []
  } = req.body || {};

  try {
    // Shared defaults so callers don't need to repeat common fields
    const defaultCompany = topCompanyName || '';
    const defaultDirector = topDirectorName || '';
    const defaultDate = topDate || topResolutionDate || '';
    const defaultBankName = topBankName || '';
    const defaultSignatories = Array.isArray(topSignatories) ? topSignatories : undefined;
    const defaultSigningInstructions = topSigningInstructions || undefined;

    const archive = archiver('zip', { zlib: { level: 9 } });
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="corporate_documents.zip"',
    });

    archive.on('error', (err) => {
      console.error('Archive error', err);
      res.status(500).json({ error: 'Failed to generate bundled documents' });
    });

    archive.pipe(res);

    const bylaw1Payload = {
      companyName: bylaw1.companyName || defaultCompany,
      directorName: bylaw1.directorName || defaultDirector,
      date: bylaw1.date || defaultDate,
    };
    const bylaw1Buffer = await generateByLaw1(bylaw1Payload.companyName, bylaw1Payload.directorName, bylaw1Payload.date);
    archive.append(Buffer.from(bylaw1Buffer), { name: '01_Bylaw_1.pdf' });

    const bylaw2Payload = {
      companyName: bylaw2.companyName || defaultCompany,
      directorName: bylaw2.directorName || defaultDirector,
      date: bylaw2.date || defaultDate,
    };
    const bylaw2Buffer = await generateByLaw2(bylaw2Payload.companyName, bylaw2Payload.directorName, bylaw2Payload.date);
    archive.append(Buffer.from(bylaw2Buffer), { name: '02_Bylaw_2.pdf' });

    const bankingPayload = {
      ...bankingResolution,
      companyName: bankingResolution.companyName || defaultCompany,
      bankName: bankingResolution.bankName || defaultBankName,
      resolutionDate: bankingResolution.resolutionDate || defaultDate,
      signatories: bankingResolution.signatories || defaultSignatories,
      signingInstructions: bankingResolution.signingInstructions || defaultSigningInstructions,
    };
    const bankingBuffer = generateBankingResolutionPdf(bankingPayload);
    archive.append(bankingBuffer, { name: '03_Banking_Resolution.pdf' });

    const officersBuffer = generateOfficersRegisterPdf(officersRegister.officers || []);
    archive.append(officersBuffer, { name: '04_Officers_Register.pdf' });

    const directorsBuffer = generateDirectorsRegisterPdf(directorsRegister.directors || []);
    archive.append(directorsBuffer, { name: '05_Directors_Register.pdf' });

    const shareholdersRegisterBuffer = generateShareholdersRegisterPdf(shareholdersRegister.shareholders || []);
    archive.append(shareholdersRegisterBuffer, { name: '06_Shareholders_Register.pdf' });

    const shareholdersLedgerBuffer = generateShareholdersLedgerPdf(shareholdersLedger);
    archive.append(shareholdersLedgerBuffer, { name: '07_Shareholders_Ledger.pdf' });

    const certificates = Array.isArray(shareCertificates) ? shareCertificates : [];
    if (certificates.length) {
      certificates.forEach((cert, idx) => {
        const certBuffer = generateShareCertificatePdf({
          ...cert,
          companyName: cert.companyName || defaultCompany,
        });
        const name = certificates.length > 1
          ? `08_Share_Certificate_${idx + 1}.pdf`
          : '08_Share_Certificates.pdf';
        archive.append(certBuffer, { name });
      });
    } else {
      const placeholderCert = generateShareCertificatePdf({});
      archive.append(placeholderCert, { name: '08_Share_Certificates.pdf' });
    }

    await archive.finalize();
  } catch (error) {
    console.error('Bundled generation error', error);
    res.status(500).json({ error: 'Failed to generate bundled documents' });
  }
});


// HELPER FUNCTIONS
const numberToWords = num => {
  const ones = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const thousands = ['', 'Thousand', 'Million', 'Billion'];

  if (num === 0) return 'Zero';

  let word = '';
  let i = 0;

  while (num > 0) {
    if (num % 1000 !== 0) {
      word = convertChunk(num % 1000) + thousands[i] + ' ' + word;
    }
    num = Math.floor(num / 1000);
    i++;
  }

  return word.trim();

  function convertChunk(chunk) {
    if (chunk === 0) return '';
    if (chunk < 20) return ones[chunk] + ' ';
    if (chunk < 100) {
      const onesValue = chunk % 10;
      const onesText = onesValue ? ` ${ones[onesValue]}` : '';
      return `${tens[Math.floor(chunk / 10)]}${onesText} `;
    }
    return ones[Math.floor(chunk / 100)] + ' Hundred ' + convertChunk(chunk % 100);
  }
}

// PDF generator helpers (return Buffers so they can be reused by endpoints and bundler)
const generateDirectorsRegisterPdf = (directors = []) => {
  const doc = new jsPDF();
  addTitle(doc, "DIRECTOR'S REGISTER");
  const headers = ['Name', 'Date Elected', 'Date Resigned'];
  const positions = [30, 90, 150];
  addTableHeaders(doc, headers, positions);

  doc.setLineWidth(0);
  doc.line(20, 42, 190, 42);
  doc.line(20, 42, 20, 282);
  doc.line(80, 42, 80, 282);
  doc.line(140, 42, 140, 282);
  doc.line(190, 42, 190, 282);

  let y = 50;
  const maxRowsPerPage = 24;
  for (let i = 0; i < maxRowsPerPage; i++) {
    const director = directors[i] || { name: '', dateElected: '', dateResigned: '' };
    doc.setFont('helvetica', 'normal');
    doc.text(director.name || '', 30, y);
    doc.text(director.dateElected || '', 90, y);
    doc.text(director.dateResigned || '', 150, y);
    doc.line(20, y + 2, 190, y + 2);
    y += 10;
  }

  return Buffer.from(doc.output('arraybuffer'));
}

const generateOfficersRegisterPdf = (officers = []) => {
  const doc = new jsPDF();
  addTitle(doc, "OFFICER'S REGISTER");

  const headers = ['Name', 'Office Held', 'Date Appointed', 'Date Resigned'];
  const positions = [20, 70, 120, 165];
  addTableHeaders(doc, headers, positions);

  doc.setLineWidth(0);
  doc.line(15, 42, 195, 42);
  doc.line(15, 42, 15, 282);
  doc.line(65, 42, 65, 282);
  doc.line(115, 42, 115, 282);
  doc.line(160, 42, 160, 282);
  doc.line(195, 42, 195, 282);

  let y = 50;
  const maxRowsPerPage = 24;
  for (let i = 0; i < maxRowsPerPage; i++) {
    const officer = officers[i] || { name: '', officeHeld: '', dateAppointed: '', dateResigned: '' };
    doc.setFont('helvetica', 'normal');
    doc.text(officer.name || '', 20, y);
    doc.text(officer.officeHeld || '', 70, y);
    doc.text(officer.dateAppointed || '', 120, y);
    doc.text(officer.dateResigned || '', 170, y);
    doc.line(15, y + 2, 195, y + 2);
    y += 10;
  }

  return Buffer.from(doc.output('arraybuffer'));
}

const generateShareholdersRegisterPdf = (shareholders = []) => {
  const doc = new jsPDF();

  doc.setFont('helvetica', 'bold');
  doc.text("SHAREHOLDER'S REGISTER", 105, 20, { align: 'center' });
  doc.setLineWidth(0.5);
  doc.line(60, 22, 150, 22);

  doc.setFontSize(12);
  doc.text('Date', 30, 40);
  doc.text('Name', 75, 40);
  doc.text('Shares Held', 140, 35);
  doc.text('Number', 125, 40);
  doc.text('Class', 165, 40);

  doc.setLineWidth(0);
  doc.line(15, 42, 195, 42);
  doc.line(15, 42, 15, 282);
  doc.line(55, 42, 55, 282);
  doc.line(110, 42, 110, 282);
  doc.line(150, 42, 150, 282);
  doc.line(195, 42, 195, 282);

  let y = 50;
  const maxRowsPerPage = 24;
  for (let i = 0; i < maxRowsPerPage; i++) {
    const shareholder = shareholders[i] || { date: '', name: '', sharesHeldNumber: '', sharesHeldClass: '' };
    doc.setFont('helvetica', 'normal');
    doc.text(shareholder.date || '', 20, y);
    doc.text(shareholder.name || '', 60, y);
    doc.text(shareholder.sharesHeldNumber || '', 130, y);
    doc.text(shareholder.sharesHeldClass || '', 160, y);
    doc.line(15, y + 2, 195, y + 2);
    y += 10;
  }

  return Buffer.from(doc.output('arraybuffer'));
}

const generateShareholdersLedgerPdf = (payload = {}) => {
  const { ledgerEntries = [], name = '', streetAddress = '', cityAddress = '', provinceAddress = '', postalCode = '', classOfShares = '' } = payload;
  const doc = new jsPDF();

  doc.setFont('helvetica', 'bold');
  doc.text("SHAREHOLDER'S LEDGER", 105, 20, { align: 'center' });
  doc.setLineWidth(0.5);
  doc.line(60, 22, 150, 22);
  doc.setFontSize(12);
  doc.text("Name: ", 20, 30);
  doc.text("Address: ", 20, 35);
  doc.text("Class of Shares:", 120, 30);
  doc.setFont('helvetica', 'normal');
  doc.text(name, 40, 30);
  doc.text(streetAddress, 40, 35);
  doc.text(`${cityAddress},`, 40, 40);
  doc.text(provinceAddress, doc.getTextWidth(cityAddress) + 43, 40);
  doc.text(postalCode, doc.getTextWidth(cityAddress) + 10 + doc.getTextWidth(provinceAddress) + 35, 40);
  doc.text(classOfShares, doc.getTextWidth("Class of Shares:") + 125, 30);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Date', 15, 55);
  doc.text('Cert. No.', 40, 55);
  doc.text('Trans. No.', 60, 55);
  doc.text('To/From', 90, 55);
  doc.text('Transferred', 130, 55);
  doc.text('Acquired', 160, 55);
  doc.text('Balance', 180, 55);

  doc.setLineWidth(0);
  doc.line(10, 60, 200, 60);
  doc.line(10, 60, 10, 275);
  doc.line(40, 60, 40, 275);
  doc.line(60, 60, 60, 275);
  doc.line(90, 60, 90, 275);
  doc.line(130, 60, 130, 275);
  doc.line(160, 60, 160, 275);
  doc.line(180, 60, 180, 275);
  doc.line(200, 60, 200, 275);
  doc.line(10, 275, 200, 275);

  let y = 80;
  const rowHeight = 10;
  const maxRowsPerPage = 18;
  const totalRows = Math.max(ledgerEntries.length, maxRowsPerPage);

  for (let i = 0; i < totalRows; i++) {
    const entry = ledgerEntries[i] || {
      date: '',
      transactionType: '',
      certificateNo: '',
      sharesIssued: '',
      sharesTransferred: '',
      sharesBalance: '',
      transactionNo: '',
      toFrom: '',
      transfered: '',
      acquired: '',
    };

    doc.setFont('helvetica', 'normal');
    doc.text(entry.date || '', 15, y - 12);
    doc.text(entry.certificateNo || '', 45, y - 12);
    doc.text(entry.transactionNo || '', 65, y - 12);
    doc.text(entry.toFrom || '', 95, y - 12);
    doc.text(entry.transfered || '', 135, y - 12);
    doc.text(entry.acquired || '', 165, y - 12);
    doc.text(entry.sharesBalance || '', 185, y - 12);

    doc.setLineWidth(0)
    doc.line(10, y - rowHeight, 200, y - rowHeight);

    y += rowHeight;
  }

  while (y < 275) {
    doc.line(10, y - rowHeight, 200, y - rowHeight);
    y += rowHeight;
  }

  return Buffer.from(doc.output('arraybuffer'));
}

const generateShareCertificatePdf = (payload = {}) => {
  const { certificateNumber, shareholderName, numberOfShares, classOfShares, companyName, issueDate } = payload;
  const numberInWords = numberToWords(Number(numberOfShares || 0));
  const __dirname = path.dirname(new URL(import.meta.url).pathname);
  const frameImage = fs.readFileSync(path.resolve(__dirname, './templates/frame.png'), { encoding: 'base64' });

  const doc = new jsPDF();
  doc.addImage(frameImage, "png", 10, 10, 190, 275);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Certificate No.: ${certificateNumber || ''}`, 20, 25);
  doc.text(`${numberInWords} (${numberOfShares || 0}) ${classOfShares || ''} shares`, 185, 25, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(`${companyName || ''}`, 105, 40, { align: 'center' });
  doc.setFontSize(14);
  doc.text("(Incorporated under the laws of the province of Ontario)", 105, 50, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text("THIS CERTIFIES THAT", 20, 60);
  doc.setFont('helvetica', 'bold');
  doc.text(shareholderName || '', 80, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `is the registered holder of ${numberInWords} (${numberOfShares || 0}) ${classOfShares || ''} Shares fully paid and non-assessable without nominal or par value in the capital of`,
    20,
    70,
    { maxWidth: 170 }
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(companyName || '', 105, 85, { align: 'center' });
  doc.text("(the 'Corporation')", 105, 95, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(
    "The class or series of shares represented by this Certificate has rights, privileges, restrictions or conditions attached thereto and the Corporation will furnish to the holder, on demand and without charge, a full copy of the text of:",
    20,
    105,
    { maxWidth: 170 }
  );

  doc.text(
    "(i). the rights, privileges, restrictions, and conditions attached to the said shares and to each class authorized to be issued and to each series insofar as the same have been fixed by the directors; and",
    25,
    120,
    { maxWidth: 170 }
  );

  doc.text(
    "(ii). the authority of the directors to fix the rights, privileges, restrictions, and conditions of subsequent series, if applicable.",
    25,
    135,
    { maxWidth: 170 }
  );

  doc.text("The transfer of the shares represented by this certificate is subject to the restrictions contained in the articles of the Corporation.", 20, 150, { maxWidth: 170 });

  doc.text("The Corporation has a lien on any shares registered n the name of the above shareholder or the legal representative of such shareholder to the extent of the debt (if any) of that shareholder to the Corporation.", 20, 170, { maxWidth: 170 });

  doc.text("IN WITNESS WHEREOF the Corporation has caused this certificate to be signed by its duly authorized officers.", 20, 190, { maxWidth: 170 });

  doc.setFont('helvetica', 'bold');
  const formattedIssueDate = issueDate ? new Date(issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
  doc.text(`DATED: ${formattedIssueDate}`, 20, 210);

  doc.text("______________________________", 20, 230);
  doc.text("President", 20, 235);
  doc.text("______________________________", 110, 230);
  doc.text("Secretary", 110, 235);

  doc.addPage();
  doc.setFontSize(14);
  doc.text("CERTIFICATE FOR", 105, 20, { align: 'center' });
  doc.text(`${numberInWords} (${numberOfShares || 0})`, 105, 40, { align: 'center' });
  doc.text(`${classOfShares || ''} Shares of:`, 105, 50, { align: 'center' });
  doc.text(`${companyName || ''}`, 105, 70, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.text(`Issued to:                  ${shareholderName || ''}`, 65, 85);
  doc.text(`Date:                         ${issueDate || ''}`, 65, 90);
  doc.text(`Certificate No.:         ${certificateNumber || ''}`, 66, 95);
  doc.setFontSize(12);
  doc.text("******************************************************************************************************", 20, 110, { maxWidth: 170 });
  doc.text("FOR VALUE RECEIVED, the undersigned hereby sells, endorses and transfers unto", 20, 130, { maxWidth: 170 });
  doc.text(`.........................................................................................  ${classOfShares || ''} Shares of`, 20, 140, { maxWidth: 170 });
  doc.setFont('helvetica', 'bold');
  doc.text(`${companyName || ''}`, 20, 150, { maxWidth: 170 });
  doc.setFont('helvetica', 'normal');
  doc.text("represented by the within certificate.", (doc.getTextWidth(companyName || '') + 25), 150, { maxWidth: 170 });

  doc.text("DATED this", 40, 170);
  doc.text("day of", 100, 170);
  doc.text(", 20", 140, 170);

  doc.text("IN THE PRESENCE OF:", 20, 190);
  doc.text("________________________", 20, 210);
  doc.text("(Signature of Witness)", 20, 215);
  doc.text("________________________", 120, 210);
  doc.text("(Signature of Shareholder)", 120, 215);

  doc.setFont('helvetica', 'bold');
  doc.text("NOTICE: The signature of this endorsement must correspond with the name as written upon the face of the certificate, in every particular, without alteration or enlargement, or any change whatever, and the Corporation reserves the right to require reasonable assurance that the endorsement is genuine and effective.", 20, 240, { maxWidth: 170 });

  return Buffer.from(doc.output('arraybuffer'));
}

const generateBankingResolutionPdf = (payload = {}) => {
  const {
    companyName,
    bankName = 'the bank designated by the directors',
    resolutionDate,
    signatories = [],
    signingInstructions = 'Any one (1) director or officer of the Corporation is authorized to sign, draw, accept, endorse, or otherwise execute cheques, bills of exchange, and other instruments on behalf of the Corporation.'
  } = payload;

  const resolvedCompanyName = companyName !== undefined && companyName !== null
    ? String(companyName).trim()
    : 'Corporation';

  const signatoryList = Array.isArray(signatories)
    ? signatories
        .map(s => ({
          name: s?.name !== undefined && s?.name !== null ? String(s.name).trim() : '',
          title: s?.title !== undefined && s?.title !== null ? String(s.title).trim() : 'Director/Officer'
        }))
        .filter(s => s.name)
    : [];

  const effectiveSignatories = signatoryList.length
    ? signatoryList
    : [{ name: 'Authorized Signatory', title: 'Director/Officer' }];

  const doc = new jsPDF();
  const parsedDate = resolutionDate ? new Date(resolutionDate) : new Date();
  const validDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
  const { day, month, year } = getLegalDate(validDate);
  const resolvedBankName = bankName || 'the bank designated by the directors';

  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  doc.text(resolvedCompanyName, 20, 25);

  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  doc.text('Banking Resolution', 20, 40);

  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.text('BE IT RESOLVED THAT:', 20, 60);

  doc.setFont('times', 'normal');
  doc.setFontSize(12);
  const clauses = [
    `1. A banking account in the name of ${resolvedCompanyName} shall be opened and maintained with ${resolvedBankName}.`,
    `2. ${signingInstructions}`,
    `3. The said bank is authorized to honour and pay all such instruments when signed as authorized, even if they cause the account to be overdrawn.`
  ];
  let y = 75;
  clauses.forEach(text => {
    const split = doc.splitTextToSize(text, 175);
    doc.text(split, 20, y);
    y += split.length * 7 + 8;
  });

  doc.text('DATED this', 20, y + 5);
  const dayX = 45;
  doc.text(day, dayX, y + 5);
  doc.line(dayX - 1, y + 6, dayX + doc.getTextWidth(day), y + 6);

  doc.text('day of', 75, y + 5);
  const monthX = 95;
  doc.text(month, monthX, y + 5);
  doc.line(monthX - 1, y + 6, monthX + doc.getTextWidth(month), y + 6);

  doc.text(',', monthX + doc.getTextWidth(month) + 2, y + 5);
  const yearX = monthX + doc.getTextWidth(month) + 8;
  doc.text(String(year), yearX, y + 5);

  let sigY = y + 25;
  effectiveSignatories.forEach(({ name = '', title = 'Director/Officer' }) => {
    doc.line(20, sigY, 90, sigY);
    doc.text(name, 20, sigY + 6);
    doc.text(title, 20, sigY + 12);
    sigY += 25;
  });

  return Buffer.from(doc.output('arraybuffer'));
}

// const generateByLaw1 = (companyName, directorName, date) => {
//   const doc = new jsPDF();

//   // Add Title
//   doc.setFont('helvetica', 'bold');
//   doc.text("BY-LAW NO. 1", 105, 20, { align: 'center' });
//   doc.setLineWidth(0.5);
//   doc.line(60, 22, 150, 22); // Underline the title

//   // Add Company Name
//   doc.setFontSize(12);
//   doc.text(`A by-law relating generally to the conduct of the affairs of`, 105, 30, { align: 'center' });
//   doc.setFont('helvetica', 'bold');
//   doc.text(companyName, 105, 40, { align: 'center' });
//   doc.setFont('helvetica', 'normal');
//   doc.setFontSize(10);
//   doc.text(`(herein called the "Corporation")`, 105, 45, { align: 'center' });

//   // Add Directors
//   doc.setFontSize(12);
//   doc.setFont('helvetica', 'bold');
//   doc.text(`DIRECTORS`, 105, 60, { align: 'center' });

//   // Add By-Law Content
//   doc.setFont('helvetica', 'normal');
//   doc.text(`1.      Calling and Notice of Meetings`, 20, 70);
//   doc.setLineWidth(0.5);
//   doc.line(30, 71, 90, 71); // Underline the "DIRECTORS" title

//   const byLawText = `Meetings of the board will be held on such day and at such time and place as the President or Secretary of the Corporation or any two directors may determine. Notice of meetings of the board will be given to each director not less than 48 hours before the time when the meeting is to be held. Each newly elected board may without notice hold its first meeting for the purposes of organization and the appointment of officers immediately following the meeting of shareholders at which such board was elected.`;

//   const splitText = doc.splitTextToSize(byLawText, 170);
//   doc.text(splitText, 30, 80);


//   // Convert to Buffer
//   const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

//   return pdfBuffer;
// };

// Start the server

const getLegalDate = (dateObj) => {
  // Get the day and day suffix
  const day = dateObj.getDate();
  let daySuffix = 'th';
  if (day === 1 || day === 21 || day === 31) daySuffix = 'st';
  else if (day === 2 || day === 22) daySuffix = 'nd';
  else if (day === 3 || day === 23) daySuffix = 'rd';

  const month = dateObj.toLocaleString('default', { month: 'long' });
  const year = dateObj.getFullYear();


  return {
    day: `${day}${daySuffix}`,
    month,
    year
  }
}

const generateByLaw1 = async (companyName, directorName, date) => {
  // Load PDF Template
  const __dirname = path.dirname(new URL(import.meta.url).pathname);
  const bylaw1TemplateBytes = fs.readFileSync(path.resolve(__dirname, './templates/bylaw_1.pdf'));

  // Load the PDFDocument from the existing PDF bytes
  const pdfDoc = await PDFDocument.load(bylaw1TemplateBytes);

  // Update the corporation name
  const form = pdfDoc.getForm();
  const corpNameField = form.getTextField('corporation_name');
  corpNameField.setText(companyName);
  corpNameField.setFontSize(14);
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  corpNameField.updateAppearances(timesRomanFont);
  // lock the field after setting the value
  corpNameField.enableReadOnly();

  // Update the director name (there are more than one director name fields)
  const formFields = form.getFields();
  formFields.forEach((field) => {
    if (field.getName().includes('director_name')) {
      field.setFontSize(12);
      field.setText(directorName);
      field.updateAppearances(timesRomanFont);
      field.enableReadOnly();
    }
  });

  // Construct the date to fill out the fields in the PDF
  // the date fields are as follows this {{dayField}}, of {{monthField}}, {{yearField}}
  // For example this 1st day of January, 2022
  formFields.forEach(async field => {
    const { day, month, year } = await getLegalDate(new Date(date));
    if (field.getName().includes('day')) {
      field.setText(day);
      field.updateAppearances(timesRomanFont);
      field.enableReadOnly();
    }
    if (field.getName().includes('month')) {
      field.setText(month);
      field.updateAppearances(timesRomanFont);
      field.enableReadOnly();
    }
    if (field.getName().includes('year')) {
      field.setText(year.toString());
      field.updateAppearances(timesRomanFont);
      field.enableReadOnly();
    }
  });

  // Save the pdf and return the buffer
  const pdfBuffer = await pdfDoc.save();

  return pdfBuffer;
}

const generateByLaw2 = async (companyName, directorName, date) => {
  // Load PDF Template
  const __dirname = path.dirname(new URL(import.meta.url).pathname);
  const bylaw2TemplateBytes = fs.readFileSync(path.resolve(__dirname, './templates/bylaw_2.pdf'));

  // Load the PDFDocument from the existing PDF bytes
  const pdfDoc = await PDFDocument.load(bylaw2TemplateBytes);

  // Update the corporation name
  const form = pdfDoc.getForm();
  const corpNameField = form.getTextField('corporation_name');
  corpNameField.setText(companyName);
  corpNameField.setFontSize(14);
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  corpNameField.updateAppearances(timesRomanFont);
  // lock the field after setting the value
  corpNameField.enableReadOnly();

  // Update the director name (there are more than one director name fields)
  const formFields = form.getFields();
  formFields.forEach((field) => {
    if (field.getName().includes('director_name')) {
      field.setFontSize(12);
      field.setText(directorName);
      field.updateAppearances(timesRomanFont);
      field.enableReadOnly();
    }
  });

  // Construct the date to fill out the fields in the PDF
  // the date fields are as follows this {{dayField}}, of {{monthField}}, {{yearField}}
  // For example this 1st day of January, 2022
  formFields.forEach(async field => {
    const { day, month, year } = await getLegalDate(new Date(date));
    if (field.getName().includes('day')) {
      field.setText(day);
      field.updateAppearances(timesRomanFont);
      field.enableReadOnly();
    }
    if (field.getName().includes('month')) {
      field.setText(month);
      field.updateAppearances(timesRomanFont);
      field.enableReadOnly();
    }
    if (field.getName().includes('year')) {
      field.setText(year.toString());
      field.updateAppearances(timesRomanFont);
      field.enableReadOnly();
    }
  });

  // Save the pdf and return the buffer
  const pdfBuffer = await pdfDoc.save();

  return pdfBuffer;
}


app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});

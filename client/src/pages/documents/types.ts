export type Director = {
  name: string;
  dateElected: string;
  dateResigned: string;
};

export type Officer = {
  name: string;
  officeHeld: string;
  dateAppointed: string;
  dateResigned: string;
};

export type Shareholder = {
  date: string;
  name: string;
  sharesHeldNumber: string;
  sharesHeldClass: string;
};

export type LedgerEntry = {
  date: string;
  certificateNo: string;
  transactionNo: string;
  toFrom: string;
  transferred: string;
  acquired: string;
  sharesBalance: string;
};

export type LedgerHolder = {
  name: string;
  streetAddress: string;
  cityAddress: string;
  provinceAddress: string;
  postalCode: string;
  classOfShares: string;
};

export type Signatory = {
  name: string;
  title: string;
};

export type ShareCertificate = {
  certificateNumber: string;
  shareholderName: string;
  numberOfShares: string;
  classOfShares: string;
  issueDate: string;
};

export type FormData = {
  // Step 1 — Company basics
  companyName: string;
  directorName: string;
  date: string;

  // Step 2 — Banking resolution
  bankName: string;
  resolutionDate: string;
  signatories: Signatory[];
  signingInstructions: string;

  // Step 3 — Registers
  directors: Director[];
  officers: Officer[];
  shareholders: Shareholder[];

  // Step 4 — Shareholders ledger
  ledgerHolder: LedgerHolder;
  ledgerEntries: LedgerEntry[];

  // Step 5 — Share certificates
  shareCertificates: ShareCertificate[];
};

export const emptyFormData = (): FormData => ({
  companyName: '',
  directorName: '',
  date: '',
  bankName: '',
  resolutionDate: '',
  signatories: [{ name: '', title: 'Director/Officer' }],
  signingInstructions:
    'Any one (1) director or officer of the Corporation is authorized to sign, draw, accept, endorse, or otherwise execute cheques, bills of exchange, and other instruments on behalf of the Corporation.',
  directors: [{ name: '', dateElected: '', dateResigned: '' }],
  officers: [{ name: '', officeHeld: '', dateAppointed: '', dateResigned: '' }],
  shareholders: [{ date: '', name: '', sharesHeldNumber: '', sharesHeldClass: '' }],
  ledgerHolder: { name: '', streetAddress: '', cityAddress: '', provinceAddress: '', postalCode: '', classOfShares: '' },
  ledgerEntries: [{ date: '', certificateNo: '', transactionNo: '', toFrom: '', transferred: '', acquired: '', sharesBalance: '' }],
  shareCertificates: [{ certificateNumber: '001', shareholderName: '', numberOfShares: '', classOfShares: '', issueDate: '' }],
});

// Shape sent to /api/v1/documents/all
export type AllDocumentsPayload = {
  companyName: string;
  directorName: string;
  date: string;
  bankName: string;
  resolutionDate: string;
  signatories: Signatory[];
  signingInstructions: string;
  directorsRegister: { directors: Director[] };
  officersRegister: { officers: Officer[] };
  shareholdersRegister: { shareholders: Shareholder[] };
  shareholdersLedger: LedgerHolder & { ledgerEntries: LedgerEntry[] };
  shareCertificates: (ShareCertificate & { companyName: string })[];
};

export function buildPayload(data: FormData): AllDocumentsPayload {
  return {
    companyName: data.companyName,
    directorName: data.directorName,
    date: data.date,
    bankName: data.bankName,
    resolutionDate: data.resolutionDate || data.date,
    signatories: data.signatories.filter((s) => s.name.trim()),
    signingInstructions: data.signingInstructions,
    directorsRegister: { directors: data.directors.filter((d) => d.name.trim()) },
    officersRegister: { officers: data.officers.filter((o) => o.name.trim()) },
    shareholdersRegister: { shareholders: data.shareholders.filter((s) => s.name.trim()) },
    shareholdersLedger: { ...data.ledgerHolder, ledgerEntries: data.ledgerEntries.filter((e) => e.toFrom.trim()) },
    shareCertificates: data.shareCertificates
      .filter((c) => c.shareholderName.trim())
      .map((c) => ({ ...c, companyName: data.companyName })),
  };
}

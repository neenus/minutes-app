// ─── Core person from global pool ────────────────────────────────────────────

export type Person = {
  _id: string;
  name: string;
  streetAddress: string;
  city: string;
  province: string;
  postalCode: string;
};

// ─── Company sub-types ────────────────────────────────────────────────────────

// NOTE: No _id on Shareholder/Director/Officer — use personId as the stable key throughout
// the frontend. The backend auto-generates Mongoose ObjectIds for sub-documents.
// ledger.shareholderId stores personId (String) so it survives before/after first DB save.

export type Shareholder = {
  personId: string;  // stable key — use this as React key and ledger reference
  person: Person;
  date: string;
  numberOfShares: string;
  classOfShares: string;
};

export type Director = {
  personId: string;
  person: Person;
  dateElected: string;
  dateResigned: string;
};

export type Officer = {
  personId: string;
  person: Person;
  officeHeld: string;
  dateAppointed: string;
  dateResigned: string;
};

export type Signatory = {
  personId: string;
  person: Person;
  title: string;
};

export type Banking = {
  bankName: string;
  resolutionDate: string;
  signingInstructions: string;
  signatories: Signatory[];
};

export type LedgerEntry = {
  _id: string;
  date: string;
  certNo: string;
  transactionNo: string;
  type: 'acquired' | 'transferred';
  toFrom: string;
  classOfShares: string;
  shares: string;
  balance: string;
};

export type ShareholderLedger = {
  shareholderId: string;  // equals the shareholder's personId (String, not ObjectId)
  entries: LedgerEntry[];
};

// ─── Full Company document ────────────────────────────────────────────────────

export type Company = {
  _id: string;
  name: string;
  streetAddress: string;
  city: string;
  province: string;
  postalCode: string;
  incorporationDate: string;
  certPrefix: string;
  status: 'active' | 'dissolved';
  dissolvedAt: string;
  people: Person[];
  shareholders: Shareholder[];
  directors: Director[];
  officers: Officer[];
  banking: Banking;
  ledger: ShareholderLedger[];
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
};

// ─── Empty factory ────────────────────────────────────────────────────────────

export const emptyCompany = (): Omit<Company, '_id' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt'> => ({
  name: '',
  streetAddress: '',
  city: '',
  province: '',
  postalCode: '',
  incorporationDate: '',
  certPrefix: 'ON',
  status: 'active',
  dissolvedAt: '',
  people: [],
  shareholders: [],
  directors: [],
  officers: [],
  banking: {
    bankName: '',
    resolutionDate: '',
    signingInstructions:
      'Any one (1) director or officer of the Corporation is authorized to sign, draw, accept, endorse, or otherwise execute cheques, bills of exchange, and other instruments on behalf of the Corporation.',
    signatories: [],
  },
  ledger: [],
});

// ─── ID generation (crypto.randomUUID requires HTTPS; this works on HTTP too) ─

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

// ─── Ledger helpers ───────────────────────────────────────────────────────────

export function getNextCertNo(company: Pick<Company, 'ledger' | 'certPrefix'>): string {
  let max = 0;
  for (const shLedger of company.ledger) {
    for (const entry of shLedger.entries) {
      const match = entry.certNo.match(/(\d+)$/);
      if (match) max = Math.max(max, parseInt(match[1], 10));
    }
  }
  return `${company.certPrefix}-${max + 1}`;
}

export function getNextTransactionNo(company: Pick<Company, 'ledger'>): string {
  let max = 0;
  for (const shLedger of company.ledger) {
    for (const entry of shLedger.entries) {
      const n = parseInt(entry.transactionNo, 10);
      if (!isNaN(n)) max = Math.max(max, n);
    }
  }
  return String(max + 1);
}

export function recalculateBalances(entries: LedgerEntry[]): LedgerEntry[] {
  let balance = 0;
  return entries.map((entry) => {
    const shares = parseInt(entry.shares, 10) || 0;
    balance = entry.type === 'acquired' ? balance + shares : balance - shares;
    return { ...entry, balance: String(balance) };
  });
}

export function hasNegativeBalance(entries: LedgerEntry[]): boolean {
  return recalculateBalances(entries).some((e) => parseInt(e.balance, 10) < 0);
}

// ─── Certificate derivation ───────────────────────────────────────────────────

export type DerivedCertificate = {
  certNo: string;
  shareholderName: string;
  numberOfShares: string;
  classOfShares: string;
  issueDate: string;
  companyName: string;
};

export function deriveCertificates(company: Company): DerivedCertificate[] {
  const certs: DerivedCertificate[] = [];
  for (const shLedger of company.ledger) {
    // shareholderId stores the personId (String)
    const shareholder = company.shareholders.find((s) => s.personId === shLedger.shareholderId);
    const person = shareholder?.person ?? company.people.find((p) => p._id === shLedger.shareholderId);
    for (const entry of shLedger.entries) {
      if (entry.type === 'acquired') {
        certs.push({
          certNo: entry.certNo,
          shareholderName: person?.name ?? '',
          numberOfShares: entry.shares,
          classOfShares: entry.classOfShares,
          issueDate: entry.date,
          companyName: company.name,
        });
      }
    }
  }
  return certs.sort((a, b) => {
    const na = parseInt(a.certNo.match(/(\d+)$/)?.[1] ?? '0', 10);
    const nb = parseInt(b.certNo.match(/(\d+)$/)?.[1] ?? '0', 10);
    return na - nb;
  });
}

// ─── Step completion indicators ───────────────────────────────────────────────

export type StepStatus = 'complete' | 'partial' | 'empty';

export function stepStatus(company: Partial<Company>): StepStatus[] {
  return [
    // Step 1 — Company Info
    company.name && company.incorporationDate ? 'complete' : company.name ? 'partial' : 'empty',
    // Step 2 — Shareholders
    (company.shareholders?.length ?? 0) > 0 && company.shareholders!.every((s) => s.date)
      ? 'complete'
      : (company.shareholders?.length ?? 0) > 0
      ? 'partial'
      : 'empty',
    // Step 3 — Directors
    (company.directors?.length ?? 0) > 0 && company.directors!.every((d) => d.dateElected)
      ? 'complete'
      : (company.directors?.length ?? 0) > 0
      ? 'partial'
      : 'empty',
    // Step 4 — Officers
    (company.officers?.length ?? 0) > 0 && company.officers!.every((o) => o.officeHeld)
      ? 'complete'
      : (company.officers?.length ?? 0) > 0
      ? 'partial'
      : 'empty',
    // Step 5 — Banking (bank name is optional; any data present = complete)
    company.banking?.bankName || company.banking?.signatories?.length ? 'complete' : 'empty',
    // Step 6 — Ledger
    (company.ledger?.length ?? 0) > 0 && (company.ledger?.every((l) => l.entries.length > 0) ?? false)
      ? 'complete'
      : (company.ledger?.length ?? 0) > 0
      ? 'partial'
      : 'empty',
    // Step 7 — Certificates (always derived)
    'complete',
    // Step 8 — Review
    'complete',
  ] as StepStatus[];
}

// ─── Payload builder for document generation endpoints ────────────────────────

export type AllDocumentsPayload = {
  companyName: string;
  directorName: string;
  date: string;
  bankName: string;
  resolutionDate: string;
  signatories: { name: string; title: string }[];
  signingInstructions: string;
  directorsRegister: { directors: { name: string; dateElected: string; dateResigned: string }[] };
  officersRegister: { officers: { name: string; officeHeld: string; dateAppointed: string; dateResigned: string }[] };
  shareholdersRegister: { shareholders: { date: string; name: string; sharesHeldNumber: string; sharesHeldClass: string }[] };
  shareholdersLedger: {
    name: string; streetAddress: string; city: string; province: string; postalCode: string; classOfShares: string;
    ledgerEntries: { date: string; certificateNo: string; transactionNo: string; toFrom: string; transferred: string; acquired: string; sharesBalance: string }[];
  };
  shareCertificates: { certificateNumber: string; shareholderName: string; numberOfShares: string; classOfShares: string; issueDate: string; companyName: string }[];
};

export function buildPayload(company: Company): AllDocumentsPayload {
  const primaryShareholder = company.shareholders[0];
  const primaryPerson = primaryShareholder?.person;
  const primaryLedger = company.ledger.find((l) => l.shareholderId === primaryShareholder?.personId);

  return {
    companyName: company.name,
    directorName: company.directors[0]?.person?.name ?? '',
    date: company.incorporationDate,
    bankName: company.banking?.bankName ?? '',
    resolutionDate: company.banking?.resolutionDate || company.incorporationDate,
    signatories: (company.banking?.signatories ?? []).map((s) => ({ name: s.person?.name ?? '', title: s.title })),
    signingInstructions: company.banking?.signingInstructions ?? '',
    directorsRegister: {
      directors: company.directors.map((d) => ({ name: d.person?.name ?? '', dateElected: d.dateElected, dateResigned: d.dateResigned })),
    },
    officersRegister: {
      officers: company.officers.map((o) => ({ name: o.person?.name ?? '', officeHeld: o.officeHeld, dateAppointed: o.dateAppointed, dateResigned: o.dateResigned })),
    },
    shareholdersRegister: {
      shareholders: company.shareholders.map((s) => {
        const shLedger = company.ledger.find((l) => l.shareholderId === s.personId);
        const acquired = (shLedger?.entries ?? []).filter((e) => e.type === 'acquired');
        const totalShares = acquired.reduce((sum, e) => sum + (parseInt(e.shares, 10) || 0), 0);
        return {
          date: s.date,
          name: s.person?.name ?? '',
          sharesHeldNumber: totalShares > 0 ? String(totalShares) : '',
          sharesHeldClass: acquired[0]?.classOfShares ?? '',
        };
      }),
    },
    shareholdersLedger: {
      name: primaryPerson?.name ?? '',
      streetAddress: primaryPerson?.streetAddress ?? '',
      city: primaryPerson?.city ?? '',
      province: primaryPerson?.province ?? '',
      postalCode: primaryPerson?.postalCode ?? '',
      classOfShares: (primaryLedger?.entries.find((e) => e.type === 'acquired'))?.classOfShares ?? '',
      ledgerEntries: (primaryLedger?.entries ?? []).map((e) => ({
        date: e.date, certificateNo: e.certNo, transactionNo: e.transactionNo,
        toFrom: e.toFrom,
        transferred: e.type === 'transferred' ? e.shares : '',
        acquired: e.type === 'acquired' ? e.shares : '',
        sharesBalance: e.balance,
      })),
    },
    shareCertificates: deriveCertificates(company).map((c) => ({
      certificateNumber: c.certNo, shareholderName: c.shareholderName,
      numberOfShares: c.numberOfShares, classOfShares: c.classOfShares,
      issueDate: c.issueDate, companyName: c.companyName,
    })),
  };
}

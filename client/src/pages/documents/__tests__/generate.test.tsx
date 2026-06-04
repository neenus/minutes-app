import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router';
import { fireEvent, render, screen } from '@testing-library/react';

import { GenerateDocumentsPage } from '../generate';

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-testid={icon} />,
}));

vi.mock('src/lib/axios', () => ({
  default: { post: vi.fn() },
  endpoints: {
    documents: {
      all: '/api/v1/documents/all',
      byLaws: '/api/v1/documents/by-laws',
      byLaws2: '/api/v1/documents/by-laws-2',
      bankResolution: '/api/v1/documents/bank-resolution',
      officersRegister: '/api/v1/documents/officers-register',
      directorsRegister: '/api/v1/documents/directors-register',
      shareholdersRegister: '/api/v1/documents/shareholders-register',
      shareholdersLedger: '/api/v1/documents/shareholders-ledger',
      shareCertificate: '/api/v1/documents/share-certificate',
    },
  },
}));

vi.mock('src/lib/companiesApi', () => ({
  companiesApi: {
    create: vi.fn().mockResolvedValue({
      data: {
        _id: 'c1', name: '', shareholders: [], directors: [], officers: [],
        people: [], ledger: [], banking: { bankName: '', resolutionDate: '', signingInstructions: '', signatories: [] },
        certPrefix: 'ON', status: 'active', dissolvedAt: '',
        streetAddress: '', city: '', province: '', postalCode: '',
        incorporationDate: '', createdBy: '', updatedBy: '', createdAt: '', updatedAt: '',
      },
    }),
    get: vi.fn().mockResolvedValue({
      data: {
        _id: 'c1', name: 'Test Corp', shareholders: [], directors: [], officers: [],
        people: [], ledger: [], banking: { bankName: '', resolutionDate: '', signingInstructions: '', signatories: [] },
        certPrefix: 'ON', status: 'active', dissolvedAt: '',
        streetAddress: '', city: '', province: '', postalCode: '',
        incorporationDate: '', createdBy: '', updatedBy: '', createdAt: '', updatedAt: '',
      },
    }),
    update: vi.fn().mockResolvedValue({
      data: {
        _id: 'c1', name: '', shareholders: [], directors: [], officers: [],
        people: [], ledger: [], banking: { bankName: '', resolutionDate: '', signingInstructions: '', signatories: [] },
        certPrefix: 'ON', status: 'active', dissolvedAt: '',
        streetAddress: '', city: '', province: '', postalCode: '',
        incorporationDate: '', createdBy: '', updatedBy: '', createdAt: '', updatedAt: '',
      },
    }),
  },
}));

vi.mock('src/routes/paths', () => ({
  paths: {
    dashboard: {
      companies: {
        edit: (id: string) => `/dashboard/companies/${id}`,
        root: '/dashboard/companies',
        new: '/dashboard/companies/new',
      },
    },
  },
}));

vi.mock('../steps/step-review', () => ({
  StepReview: () => <div data-testid="step-review">Review</div>,
}));

vi.mock('../steps/step-certificates', () => ({
  StepCertificates: () => <div data-testid="step-certificates">Certificates</div>,
}));

vi.mock('../steps/step-ledger', () => ({
  StepLedger: () => <div data-testid="step-ledger">Ledger</div>,
}));

function renderPage(id?: string) {
  return render(
    <MemoryRouter initialEntries={[id ? `/dashboard/companies/${id}` : '/dashboard/companies/new']}>
      <Routes>
        <Route path="/dashboard/companies/new" element={<GenerateDocumentsPage />} />
        <Route path="/dashboard/companies/:id" element={<GenerateDocumentsPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('GenerateDocumentsPage', () => {
  it('renders all 8 step labels', () => {
    renderPage();
    expect(screen.getAllByText('Company Info').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Shareholders').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Directors').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Officers').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Banking').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ledger').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Certificates').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Review').length).toBeGreaterThan(0);
  });

  it('shows Corporation Name field on step 0', () => {
    renderPage();
    expect(screen.getByLabelText(/Corporation Name/i)).toBeTruthy();
  });

  it('Back button is disabled on first step', () => {
    renderPage();
    const backBtn = screen.getByText('Back').closest('button');
    expect(backBtn?.disabled).toBe(true);
  });

  it('advances to Shareholders step on Next click', async () => {
    renderPage();
    fireEvent.click(screen.getByText('Next'));
    await screen.findByText('Add Shareholder');
  });

  it('goes back from step 1 to step 0', async () => {
    renderPage();
    fireEvent.click(screen.getByText('Next'));
    await screen.findByText('Add Shareholder');
    fireEvent.click(screen.getByText('Back'));
    expect(screen.getByLabelText(/Corporation Name/i)).toBeTruthy();
  });
});

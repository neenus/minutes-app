import { describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

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

vi.mock('../steps/step-review', () => ({
  StepReview: () => <div data-testid="step-review">Review</div>,
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <GenerateDocumentsPage />
    </MemoryRouter>
  );
}

describe('GenerateDocumentsPage', () => {
  it('renders the first step label', () => {
    renderPage();
    expect(screen.getAllByText('Company Basics').length).toBeGreaterThan(0);
  });

  it('shows Corporation Name field on step 0', () => {
    renderPage();
    expect(screen.getByLabelText(/Corporation Name/i)).toBeTruthy();
  });

  it('advances to Banking Resolution on Next click', () => {
    renderPage();
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByLabelText(/Bank Name/i)).toBeTruthy();
  });

  it('goes back to step 0 from step 1', () => {
    renderPage();
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Back'));
    expect(screen.getByLabelText(/Corporation Name/i)).toBeTruthy();
  });

  it('Back button is disabled on first step', () => {
    renderPage();
    const backBtn = screen.getByText('Back').closest('button');
    expect(backBtn?.disabled).toBe(true);
  });
});

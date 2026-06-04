import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('framer-motion', () => ({
  m: {
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('src/components/animate', () => ({
  varBounce: () => ({}),
  MotionContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('src/assets/illustrations', () => ({
  ForbiddenIllustration: () => <div data-testid="forbidden-illustration" />,
}));

import { RoleBasedGuard } from '../role-based-guard';

describe('RoleBasedGuard', () => {
  it('renders children when currentRole matches acceptRoles', () => {
    render(
      <RoleBasedGuard currentRole="admin" acceptRoles={['admin']}>
        <div>Admin Content</div>
      </RoleBasedGuard>
    );
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('renders null (not children, no denied message) when role does not match and hasContent is false', () => {
    const { container } = render(
      <RoleBasedGuard currentRole="staff" acceptRoles={['admin']}>
        <div>Admin Content</div>
      </RoleBasedGuard>
    );
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    expect(container.firstChild).toBeNull();
  });

  it('renders permission denied when role does not match and hasContent is true', () => {
    render(
      <RoleBasedGuard currentRole="staff" acceptRoles={['admin']} hasContent>
        <div>Admin Content</div>
      </RoleBasedGuard>
    );
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    expect(screen.getByText(/permission denied/i)).toBeInTheDocument();
  });

  it('renders children when staff is in acceptRoles', () => {
    render(
      <RoleBasedGuard currentRole="staff" acceptRoles={['admin', 'staff']}>
        <div>Shared Content</div>
      </RoleBasedGuard>
    );
    expect(screen.getByText('Shared Content')).toBeInTheDocument();
  });
});

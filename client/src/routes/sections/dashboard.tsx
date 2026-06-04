import type { RouteObject } from 'react-router';

import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { CONFIG } from 'src/global-config';
import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import { useAuthContext } from 'src/auth/hooks';
import { AuthGuard, RoleBasedGuard } from 'src/auth/guard';

import { usePathname } from '../hooks';

// ----------------------------------------------------------------------

const IndexPage = lazy(() => import('src/pages/dashboard/one'));

const LazyUserList = lazy(() => import('src/pages/users/list').then((m) => ({ default: m.UserListPage })));
const LazyUserNew = lazy(() => import('src/pages/users/new').then((m) => ({ default: m.UserNewPage })));
const LazyUserEdit = lazy(() => import('src/pages/users/edit').then((m) => ({ default: m.UserEditPage })));
const LazyProfile = lazy(() => import('src/pages/profile/index').then((m) => ({ default: m.ProfilePage })));
const LazyCompanies = lazy(() =>
  import('src/pages/companies').then((m) => ({ default: m.CompaniesPage }))
);
const LazyGenerateDocs = lazy(() =>
  import('src/pages/documents/generate').then((m) => ({ default: m.GenerateDocumentsPage }))
);

// ----------------------------------------------------------------------

function AdminGuarded({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext();
  return (
    <RoleBasedGuard currentRole={user?.role ?? ''} acceptRoles={['admin']} hasContent>
      {children}
    </RoleBasedGuard>
  );
}

function SuspenseOutlet() {
  const pathname = usePathname();
  return (
    <Suspense key={pathname} fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  );
}

const dashboardLayout = () => (
  <DashboardLayout>
    <SuspenseOutlet />
  </DashboardLayout>
);

export const dashboardRoutes: RouteObject[] = [
  {
    path: 'dashboard',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      { element: <IndexPage />, index: true },
      {
        path: 'users',
        children: [
          { index: true, element: <AdminGuarded><LazyUserList /></AdminGuarded> },
          { path: 'new', element: <AdminGuarded><LazyUserNew /></AdminGuarded> },
          { path: ':id/edit', element: <AdminGuarded><LazyUserEdit /></AdminGuarded> },
        ],
      },
      { path: 'profile', element: <LazyProfile /> },
      {
        path: 'companies',
        children: [
          { index: true, element: <LazyCompanies /> },
          { path: 'new', element: <LazyGenerateDocs /> },
          { path: ':id', element: <LazyGenerateDocs /> },
        ],
      },
    ],
  },
];

import type { NavSectionProps } from 'src/components/nav-section';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />
);

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
  parameter: icon('ic-parameter'),
};

// ----------------------------------------------------------------------

const overviewSection: NavSectionProps['data'][number] = {
  subheader: 'Overview',
  items: [
    {
      title: 'Dashboard',
      path: paths.dashboard.root,
      icon: ICONS.dashboard,
      info: <Label>v{CONFIG.appVersion}</Label>,
    },
    { title: 'My Profile', path: paths.dashboard.profile, icon: ICONS.lock },
  ],
};

const documentsSection: NavSectionProps['data'][number] = {
  subheader: 'Documents',
  items: [
    { title: 'Generate Documents', path: paths.dashboard.documents.generate, icon: ICONS.file },
  ],
};

const adminSection: NavSectionProps['data'][number] = {
  subheader: 'Management',
  items: [
    { title: 'Users', path: paths.dashboard.users.root, icon: ICONS.user },
  ],
};

export const navData: NavSectionProps['data'] = [overviewSection, documentsSection, adminSection];

export const getNavData = (role: string): NavSectionProps['data'] =>
  role === 'admin'
    ? [overviewSection, documentsSection, adminSection]
    : [overviewSection, documentsSection];

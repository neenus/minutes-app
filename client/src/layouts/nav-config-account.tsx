import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';

import type { AccountDrawerProps } from './components/account-drawer';

// ----------------------------------------------------------------------

export const _account: AccountDrawerProps['data'] = [
  {
    label: 'My Profile',
    href: paths.dashboard.profile,
    icon: <Iconify icon="solar:user-id-bold-duotone" />,
  },
  {
    label: 'Security',
    href: '#',
    icon: <Iconify icon="solar:shield-keyhole-bold-duotone" />,
  },
];

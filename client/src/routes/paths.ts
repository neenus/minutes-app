// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  // AUTH
  auth: {
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
      signUp: `${ROOTS.AUTH}/jwt/sign-up`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    users: {
      root: `${ROOTS.DASHBOARD}/users`,
      new: `${ROOTS.DASHBOARD}/users/new`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/users/${id}/edit`,
    },
    profile: `${ROOTS.DASHBOARD}/profile`,
    companies: {
      root: `${ROOTS.DASHBOARD}/companies`,
      new: `${ROOTS.DASHBOARD}/companies/new`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/companies/${id}`,
    },
  },
};

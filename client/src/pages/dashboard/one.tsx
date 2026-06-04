import { Navigate } from 'react-router';

import { paths } from 'src/routes/paths';

export default function Page() {
  return <Navigate to={paths.dashboard.documents.generate} replace />;
}

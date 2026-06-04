import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { deriveCertificates } from '../types';

import type { Company } from '../types';

type Props = {
  data: Partial<Company>;
  onChange: (patch: Partial<Company>) => void;
};

export function StepCertificates({ data }: Props) {
  const company = data as Company;
  const certs = deriveCertificates(company);

  if (certs.length === 0) {
    return (
      <Stack spacing={2}>
        <Typography variant="h6">Share Certificates</Typography>
        <Typography color="text.secondary">
          No certificates yet. Add ledger entries with type &quot;Acquired&quot; in Step 6 to generate certificates.
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h6">Share Certificates</Typography>
      <Typography variant="body2" color="text.secondary">
        Auto-generated from the ledger. To make changes, go back to Step 6 — Ledger.
      </Typography>

      <Grid container spacing={2}>
        {certs.map((cert) => (
          <Grid item xs={12} sm={6} md={4} key={cert.certNo}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Typography variant="subtitle1" fontWeight="bold">{cert.companyName}</Typography>
                  <Chip label={cert.certNo} size="small" color="primary" />
                </Stack>
                <Divider sx={{ mb: 1.5 }} />
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Shareholder</Typography>
                    <Typography variant="body2" fontWeight="medium">{cert.shareholderName}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Shares</Typography>
                    <Typography variant="body2" fontWeight="medium">{cert.numberOfShares}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Class</Typography>
                    <Typography variant="body2" fontWeight="medium">{cert.classOfShares || '—'}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Issue Date</Typography>
                    <Typography variant="body2" fontWeight="medium">{cert.issueDate || '—'}</Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}

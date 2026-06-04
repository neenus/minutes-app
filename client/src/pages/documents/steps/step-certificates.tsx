import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { deriveCertificates } from '../types';

import type { Company, DerivedCertificate } from '../types';

type Props = {
  data: Partial<Company>;
  onChange: (patch: Partial<Company>) => void;
};

export function StepCertificates({ data }: Props) {
  const company = data as Company;
  const [overrides, setOverrides] = useState<Record<string, Partial<DerivedCertificate>>>({});

  const certs = deriveCertificates(company).map((c) => ({
    ...c,
    ...(overrides[c.certNo] ?? {}),
  }));

  const updateCert = (certNo: string, patch: Partial<DerivedCertificate>) =>
    setOverrides((prev) => ({ ...prev, [certNo]: { ...(prev[certNo] ?? {}), ...patch } }));

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
        Auto-generated from acquired ledger entries. All fields are editable for corrections.
      </Typography>

      <Grid container spacing={2}>
        {certs.map((cert) => (
          <Grid item xs={12} sm={6} md={4} key={cert.certNo}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" gutterBottom color="primary">
                  Certificate {cert.certNo}
                </Typography>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Company Name</Typography>
                    <TextField
                      size="small"
                      fullWidth
                      value={cert.companyName}
                      onChange={(e) => updateCert(cert.certNo, { companyName: e.target.value })}
                    />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Shareholder Name</Typography>
                    <TextField
                      size="small"
                      fullWidth
                      value={cert.shareholderName}
                      onChange={(e) => updateCert(cert.certNo, { shareholderName: e.target.value })}
                    />
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary"># of Shares</Typography>
                      <TextField
                        size="small"
                        fullWidth
                        value={cert.numberOfShares}
                        onChange={(e) => updateCert(cert.certNo, { numberOfShares: e.target.value })}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary">Class</Typography>
                      <TextField
                        size="small"
                        fullWidth
                        value={cert.classOfShares}
                        onChange={(e) => updateCert(cert.certNo, { classOfShares: e.target.value })}
                      />
                    </Box>
                  </Stack>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Issue Date</Typography>
                    <TextField
                      size="small"
                      fullWidth
                      type="date"
                      value={cert.issueDate}
                      onChange={(e) => updateCert(cert.certNo, { issueDate: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}

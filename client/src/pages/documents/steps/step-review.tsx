import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';

import axios, { endpoints } from 'src/lib/axios';

import { Iconify } from 'src/components/iconify';

import { buildPayload, hasNegativeBalance } from '../types';

import type { Company } from '../types';

type Props = { data: Partial<Company> };

async function downloadBlob(url: string, payload: object, filename: string) {
  const res = await axios.post(url, payload, { responseType: 'blob' });
  const objectUrl = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = objectUrl;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
}

type CheckItem = { label: string; ok: boolean };

function useValidation(company: Partial<Company>): CheckItem[] {
  const allLedgerEntries = (company.ledger ?? []).flatMap((l) => l.entries);
  return [
    { label: 'Company name and incorporation date entered', ok: !!(company.name && company.incorporationDate) },
    { label: 'At least one director with Date Elected', ok: (company.directors ?? []).some((d) => d.dateElected) },
    { label: 'At least one officer with Office Held', ok: (company.officers ?? []).some((o) => o.officeHeld) },
    { label: 'At least one shareholder with shares > 0', ok: (company.shareholders ?? []).some((s) => parseInt(s.numberOfShares, 10) > 0) },
    { label: 'No negative share balances in ledger', ok: !hasNegativeBalance(allLedgerEntries) },
    { label: 'Bank name entered', ok: !!(company.banking?.bankName) },
  ];
}

export function StepReview({ data }: Props) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const company = data as Company;
  const checks = useValidation(data);
  const warnings = checks.filter((c) => !c.ok);

  let payload: ReturnType<typeof buildPayload> | null = null;
  try { payload = buildPayload(company); } catch { /* company incomplete */ }

  const download = async (key: string, url: string, body: object, filename: string) => {
    setError('');
    setDownloading(key);
    try {
      await downloadBlob(url, body, filename);
    } catch {
      setError(`Failed to download ${filename}. Ensure all required fields are filled in.`);
    } finally {
      setDownloading(null);
    }
  };

  const downloadAll = () => payload && download('all', endpoints.documents.all, payload, 'corporate_documents.zip');

  const individualDocs = payload ? [
    { key: 'bylaws1', label: 'By-Law 1', url: endpoints.documents.byLaws, body: { companyName: payload.companyName, directorName: payload.directorName, date: payload.date }, filename: 'bylaw_1.pdf' },
    { key: 'bylaws2', label: 'By-Law 2', url: endpoints.documents.byLaws2, body: { companyName: payload.companyName, directorName: payload.directorName, date: payload.date }, filename: 'bylaw_2.pdf' },
    { key: 'banking', label: 'Banking Resolution', url: endpoints.documents.bankResolution, body: { companyName: payload.companyName, bankName: payload.bankName, resolutionDate: payload.resolutionDate, signatories: payload.signatories, signingInstructions: payload.signingInstructions }, filename: 'banking_resolution.pdf' },
    { key: 'directors', label: 'Directors Register', url: endpoints.documents.directorsRegister, body: { directors: payload.directorsRegister.directors }, filename: 'directors_register.pdf' },
    { key: 'officers', label: 'Officers Register', url: endpoints.documents.officersRegister, body: { officers: payload.officersRegister.officers }, filename: 'officers_register.pdf' },
    { key: 'shareholders', label: 'Shareholders Register', url: endpoints.documents.shareholdersRegister, body: { shareholders: payload.shareholdersRegister.shareholders }, filename: 'shareholders_register.pdf' },
    { key: 'ledger', label: 'Shareholders Ledger', url: endpoints.documents.shareholdersLedger, body: payload.shareholdersLedger, filename: 'shareholders_ledger.pdf' },
    { key: 'cert', label: 'Share Certificate(s)', url: endpoints.documents.shareCertificate, body: payload.shareCertificates[0] ?? {}, filename: 'share_certificate.pdf' },
  ] : [];

  return (
    <Stack spacing={3}>
      <Typography variant="h6">Review &amp; Download</Typography>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>Pre-download Checklist</Typography>
          <List dense>
            {checks.map((check) => (
              <ListItem key={check.label} disablePadding>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  {check.ok
                    ? <Iconify icon="solar:check-circle-bold" sx={{ color: 'success.main' }} />
                    : <Iconify icon="solar:danger-bold" sx={{ color: 'warning.main' }} />
                  }
                </ListItemIcon>
                <ListItemText
                  primary={check.label}
                  primaryTypographyProps={{ variant: 'body2', color: check.ok ? 'text.primary' : 'warning.dark' }}
                />
              </ListItem>
            ))}
          </List>
          {warnings.length > 0 && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              {warnings.length} item(s) incomplete — documents may contain blank fields. You can still download.
            </Alert>
          )}
        </CardContent>
      </Card>

      {error && <Alert severity="error">{error}</Alert>}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>Company</Typography>
              <Typography>{data.name || '—'}</Typography>
              <Typography variant="body2" color="text.secondary">Incorporated: {data.incorporationDate || '—'}</Typography>
              <Typography variant="body2" color="text.secondary">Status: {data.status ?? 'active'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>People</Typography>
              <Typography variant="body2">{data.shareholders?.length ?? 0} shareholder(s)</Typography>
              <Typography variant="body2">{data.directors?.length ?? 0} director(s)</Typography>
              <Typography variant="body2">{data.officers?.length ?? 0} officer(s)</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider />

      <Box>
        <Button
          variant="contained"
          size="large"
          startIcon={downloading === 'all' ? <CircularProgress size={16} color="inherit" /> : <Iconify icon="solar:download-bold" />}
          onClick={downloadAll}
          disabled={!!downloading || !payload}
        >
          {downloading === 'all' ? 'Downloading...' : 'Download All Documents (ZIP)'}
        </Button>
      </Box>

      <Divider />

      <Typography variant="subtitle2">Download Individual Documents</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {individualDocs.map(({ key, label, url, body, filename }) => (
          <Button
            key={key}
            variant="outlined"
            size="small"
            startIcon={downloading === key ? <CircularProgress size={12} color="inherit" /> : <Iconify icon="solar:file-download-bold" />}
            onClick={() => download(key, url, body, filename)}
            disabled={!!downloading}
          >
            {label}
          </Button>
        ))}
      </Box>
    </Stack>
  );
}

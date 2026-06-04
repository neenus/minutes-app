import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';

import axios, { endpoints } from 'src/lib/axios';

import { Iconify } from 'src/components/iconify';

import { buildPayload } from '../types';

import type { FormData } from '../types';

// ----------------------------------------------------------------------

type Props = {
  data: FormData;
};

async function downloadBlob(url: string, payload: object, filename: string): Promise<void> {
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

export function StepReview({ data }: Props) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const payload = buildPayload(data);

  const download = async (key: string, url: string, body: object, filename: string) => {
    setError('');
    setDownloading(key);
    try {
      await downloadBlob(url, body, filename);
    } catch {
      setError(`Failed to download ${filename}. Check that all required fields are filled in.`);
    } finally {
      setDownloading(null);
    }
  };

  const downloadAll = () =>
    download('all', endpoints.documents.all, payload, 'corporate_documents.zip');

  const individualDocs = [
    {
      key: 'bylaws1',
      label: 'By-Law 1',
      url: endpoints.documents.byLaws,
      body: { companyName: payload.companyName, directorName: payload.directorName, date: payload.date },
      filename: 'bylaw_1.pdf',
    },
    {
      key: 'bylaws2',
      label: 'By-Law 2',
      url: endpoints.documents.byLaws2,
      body: { companyName: payload.companyName, directorName: payload.directorName, date: payload.date },
      filename: 'bylaw_2.pdf',
    },
    {
      key: 'banking',
      label: 'Banking Resolution',
      url: endpoints.documents.bankResolution,
      body: {
        companyName: payload.companyName,
        bankName: payload.bankName,
        resolutionDate: payload.resolutionDate,
        signatories: payload.signatories,
        signingInstructions: payload.signingInstructions,
      },
      filename: 'banking_resolution.pdf',
    },
    {
      key: 'officers',
      label: 'Officers Register',
      url: endpoints.documents.officersRegister,
      body: { officers: payload.officersRegister.officers },
      filename: 'officers_register.pdf',
    },
    {
      key: 'directors',
      label: 'Directors Register',
      url: endpoints.documents.directorsRegister,
      body: { directors: payload.directorsRegister.directors },
      filename: 'directors_register.pdf',
    },
    {
      key: 'shareholders',
      label: 'Shareholders Register',
      url: endpoints.documents.shareholdersRegister,
      body: { shareholders: payload.shareholdersRegister.shareholders },
      filename: 'shareholders_register.pdf',
    },
    {
      key: 'ledger',
      label: 'Shareholders Ledger',
      url: endpoints.documents.shareholdersLedger,
      body: payload.shareholdersLedger,
      filename: 'shareholders_ledger.pdf',
    },
    {
      key: 'cert',
      label: 'Share Certificate(s)',
      url: endpoints.documents.shareCertificate,
      body: payload.shareCertificates[0] ?? {},
      filename: 'share_certificate.pdf',
    },
  ];

  return (
    <Stack spacing={3}>
      <Typography variant="h6">Review & Download</Typography>

      {error && <Alert severity="error">{error}</Alert>}

      {/* Summary */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Company
              </Typography>
              <Typography>{data.companyName || '—'}</Typography>
              <Typography variant="body2" color="text.secondary">
                Director: {data.directorName || '—'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Date: {data.date || '—'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Banking
              </Typography>
              <Typography>{data.bankName || 'No bank specified'}</Typography>
              <Typography variant="body2" color="text.secondary">
                {data.signatories.filter((s) => s.name).length} signator
                {data.signatories.filter((s) => s.name).length === 1 ? 'y' : 'ies'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Registers
              </Typography>
              <Typography variant="body2">
                {data.directors.filter((d) => d.name).length} director(s)
              </Typography>
              <Typography variant="body2">
                {data.officers.filter((o) => o.name).length} officer(s)
              </Typography>
              <Typography variant="body2">
                {data.shareholders.filter((s) => s.name).length} shareholder(s)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Certificates
              </Typography>
              <Typography variant="body2">
                {data.shareCertificates.filter((c) => c.shareholderName).length} certificate(s)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider />

      {/* Download All */}
      <Box>
        <Button
          variant="contained"
          size="large"
          startIcon={
            downloading === 'all' ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <Iconify icon="solar:download-bold" />
            )
          }
          onClick={downloadAll}
          disabled={!!downloading}
        >
          {downloading === 'all' ? 'Downloading...' : 'Download All Documents (ZIP)'}
        </Button>
      </Box>

      <Divider />

      {/* Individual Downloads */}
      <Typography variant="subtitle2">Download Individual Documents</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {individualDocs.map(({ key, label, url, body, filename }) => (
          <Button
            key={key}
            variant="outlined"
            size="small"
            startIcon={
              downloading === key ? (
                <CircularProgress size={12} color="inherit" />
              ) : (
                <Iconify icon="solar:file-download-bold" />
              )
            }
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

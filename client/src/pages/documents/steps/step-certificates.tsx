import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { Iconify } from 'src/components/iconify';

import type { FormData, ShareCertificate } from '../types';

// ----------------------------------------------------------------------

type Props = {
  data: Pick<FormData, 'shareCertificates'>;
  onChange: (patch: Partial<FormData>) => void;
};

const emptyCert = (index: number): ShareCertificate => ({
  certificateNumber: String(index + 1).padStart(3, '0'),
  shareholderName: '',
  numberOfShares: '',
  classOfShares: 'Common',
  issueDate: '',
});

export function StepCertificates({ data, onChange }: Props) {
  const updateCert = (i: number, patch: Partial<ShareCertificate>) =>
    onChange({
      shareCertificates: data.shareCertificates.map((c, idx) => (idx === i ? { ...c, ...patch } : c)),
    });

  const addCert = () =>
    onChange({
      shareCertificates: [...data.shareCertificates, emptyCert(data.shareCertificates.length)],
    });

  const removeCert = (i: number) =>
    onChange({ shareCertificates: data.shareCertificates.filter((_, idx) => idx !== i) });

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Share Certificates</Typography>
      <Typography variant="body2" color="text.secondary">
        The company name is inherited from Step 1.
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Cert #</TableCell>
              <TableCell>Shareholder Name</TableCell>
              <TableCell># of Shares</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Issue Date</TableCell>
              <TableCell width={48} />
            </TableRow>
          </TableHead>
          <TableBody>
            {data.shareCertificates.map((cert, i) => (
              <TableRow key={i}>
                <TableCell>
                  <TextField
                    size="small"
                    value={cert.certificateNumber}
                    onChange={(e) => updateCert(i, { certificateNumber: e.target.value })}
                    sx={{ width: 70 }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    value={cert.shareholderName}
                    onChange={(e) => updateCert(i, { shareholderName: e.target.value })}
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    value={cert.numberOfShares}
                    onChange={(e) => updateCert(i, { numberOfShares: e.target.value })}
                    placeholder="100"
                    sx={{ width: 90 }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    value={cert.classOfShares}
                    onChange={(e) => updateCert(i, { classOfShares: e.target.value })}
                    placeholder="Common"
                    sx={{ width: 100 }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="date"
                    value={cert.issueDate}
                    onChange={(e) => updateCert(i, { issueDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    sx={{ width: 140 }}
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => removeCert(i)}
                    size="small"
                    disabled={data.shareCertificates.length === 1}
                  >
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Button
        startIcon={<Iconify icon="mingcute:add-line" />}
        onClick={addCert}
        sx={{ alignSelf: 'flex-start' }}
      >
        Add Certificate
      </Button>
    </Stack>
  );
}

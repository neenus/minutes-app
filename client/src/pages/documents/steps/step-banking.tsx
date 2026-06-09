
import Box from '@mui/material/Box';
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

import { PersonAutocomplete } from '../components/PersonAutocomplete';

import type { Company, Signatory } from '../types';

type Props = {
  data: Partial<Company>;
  onChange: (patch: Partial<Company>) => void;
};

export function StepBanking({ data, onChange }: Props) {
  const banking = data.banking ?? {
    bankName: '', resolutionDate: '', signingInstructions: '', signatories: [],
  };
  const people = data.people ?? [];

  const setBanking = (patch: Partial<typeof banking>) =>
    onChange({ banking: { ...banking, ...patch } });

  const addSignatory = () =>
    setBanking({ signatories: [...banking.signatories, { personId: '', person: null as any, title: 'Director/Officer' }] });

  const updateSignatory = (i: number, patch: Partial<Signatory>) =>
    setBanking({ signatories: banking.signatories.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) });

  const removeSignatory = (i: number) =>
    setBanking({ signatories: banking.signatories.filter((_, idx) => idx !== i) });

  return (
    <Stack spacing={3}>
      <Typography variant="h6">Banking Resolution</Typography>

      <TextField
        label="Bank Name"
        value={banking.bankName}
        onChange={(e) => setBanking({ bankName: e.target.value })}
        placeholder="e.g. Royal Bank of Canada"
        fullWidth
      />

      <TextField
        label="Resolution Date"
        type="date"
        value={banking.resolutionDate}
        onChange={(e) => setBanking({ resolutionDate: e.target.value })}
        InputLabelProps={{ shrink: true }}
        helperText="Defaults to incorporation date if left blank"
        sx={{ maxWidth: 220 }}
      />

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Authorized Signatories</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Title</TableCell>
                <TableCell width={48} />
              </TableRow>
            </TableHead>
            <TableBody>
              {banking.signatories.map((sig, i) => (
                <TableRow key={i}>
                  <TableCell sx={{ minWidth: 220 }}>
                    <PersonAutocomplete
                      label="Person"
                      value={sig.person ?? null}
                      onChange={(p) => p && updateSignatory(i, { personId: p._id, person: p })}
                      options={people}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      value={sig.title}
                      onChange={(e) => updateSignatory(i, { title: e.target.value })}
                      placeholder="Director/Officer"
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => removeSignatory(i)} size="small">
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Button startIcon={<Iconify icon="mingcute:add-line" />} onClick={addSignatory} sx={{ mt: 1 }}>
          Add Signatory
        </Button>
      </Box>

      <TextField
        label="Signing Instructions"
        value={banking.signingInstructions}
        onChange={(e) => setBanking({ signingInstructions: e.target.value })}
        multiline
        minRows={3}
        fullWidth
      />
    </Stack>
  );
}

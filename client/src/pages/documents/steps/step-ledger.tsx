import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { Iconify } from 'src/components/iconify';

import type { FormData, LedgerEntry } from '../types';

// ----------------------------------------------------------------------

type Props = {
  data: Pick<FormData, 'ledgerHolder' | 'ledgerEntries'>;
  onChange: (patch: Partial<FormData>) => void;
};

const emptyEntry = (): LedgerEntry => ({
  date: '',
  certificateNo: '',
  transactionNo: '',
  toFrom: '',
  transferred: '',
  acquired: '',
  sharesBalance: '',
});

export function StepLedger({ data, onChange }: Props) {
  const setHolder =
    (field: keyof FormData['ledgerHolder']) => (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ ledgerHolder: { ...data.ledgerHolder, [field]: e.target.value } });

  const updateEntry = (i: number, patch: Partial<LedgerEntry>) =>
    onChange({
      ledgerEntries: data.ledgerEntries.map((e, idx) => (idx === i ? { ...e, ...patch } : e)),
    });

  const addEntry = () => onChange({ ledgerEntries: [...data.ledgerEntries, emptyEntry()] });

  const removeEntry = (i: number) =>
    onChange({ ledgerEntries: data.ledgerEntries.filter((_, idx) => idx !== i) });

  return (
    <Stack spacing={3}>
      <Typography variant="h6">Shareholders Ledger</Typography>

      <Typography variant="subtitle2">Ledger Holder Information</Typography>
      <Stack direction="row" spacing={2} flexWrap="wrap">
        <TextField
          label="Name"
          value={data.ledgerHolder.name}
          onChange={setHolder('name')}
          sx={{ flex: '1 1 200px' }}
        />
        <TextField
          label="Street Address"
          value={data.ledgerHolder.streetAddress}
          onChange={setHolder('streetAddress')}
          sx={{ flex: '1 1 200px' }}
        />
        <TextField
          label="City"
          value={data.ledgerHolder.cityAddress}
          onChange={setHolder('cityAddress')}
          sx={{ flex: '1 1 150px' }}
        />
        <TextField
          label="Province"
          value={data.ledgerHolder.provinceAddress}
          onChange={setHolder('provinceAddress')}
          sx={{ flex: '1 1 100px' }}
        />
        <TextField
          label="Postal Code"
          value={data.ledgerHolder.postalCode}
          onChange={setHolder('postalCode')}
          sx={{ flex: '1 1 120px' }}
        />
        <TextField
          label="Class of Shares"
          value={data.ledgerHolder.classOfShares}
          onChange={setHolder('classOfShares')}
          placeholder="Common"
          sx={{ flex: '1 1 140px' }}
        />
      </Stack>

      <Divider />

      <Typography variant="subtitle2">Ledger Entries</Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Cert #</TableCell>
              <TableCell>Trans #</TableCell>
              <TableCell>To/From</TableCell>
              <TableCell>Transferred</TableCell>
              <TableCell>Acquired</TableCell>
              <TableCell>Balance</TableCell>
              <TableCell width={48} />
            </TableRow>
          </TableHead>
          <TableBody>
            {data.ledgerEntries.map((entry, i) => (
              <TableRow key={i}>
                <TableCell>
                  <TextField
                    size="small"
                    type="date"
                    value={entry.date}
                    onChange={(e) => updateEntry(i, { date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    sx={{ width: 130 }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    value={entry.certificateNo}
                    onChange={(e) => updateEntry(i, { certificateNo: e.target.value })}
                    sx={{ width: 70 }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    value={entry.transactionNo}
                    onChange={(e) => updateEntry(i, { transactionNo: e.target.value })}
                    sx={{ width: 70 }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    value={entry.toFrom}
                    onChange={(e) => updateEntry(i, { toFrom: e.target.value })}
                    sx={{ width: 120 }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    value={entry.transferred}
                    onChange={(e) => updateEntry(i, { transferred: e.target.value })}
                    sx={{ width: 80 }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    value={entry.acquired}
                    onChange={(e) => updateEntry(i, { acquired: e.target.value })}
                    sx={{ width: 80 }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    value={entry.sharesBalance}
                    onChange={(e) => updateEntry(i, { sharesBalance: e.target.value })}
                    sx={{ width: 80 }}
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => removeEntry(i)}
                    size="small"
                    disabled={data.ledgerEntries.length === 1}
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
        onClick={addEntry}
        sx={{ alignSelf: 'flex-start' }}
      >
        Add Entry
      </Button>
    </Stack>
  );
}

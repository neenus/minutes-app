import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Alert from '@mui/material/Alert';
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
import Autocomplete from '@mui/material/Autocomplete';
import TableContainer from '@mui/material/TableContainer';

import { Iconify } from 'src/components/iconify';

import {
  generateId,
  getNextCertNo,
  getNextTransactionNo,
  hasNegativeBalance,
  recalculateBalances,
} from '../types';

import type { Company, LedgerEntry, ShareholderLedger } from '../types';

type Props = {
  data: Partial<Company>;
  onChange: (patch: Partial<Company>) => void;
};

const TYPE_OPTIONS = [
  { value: 'acquired', label: 'Acquired' },
  { value: 'transferred', label: 'Transferred' },
];

export function StepLedger({ data, onChange }: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const shareholders = data.shareholders ?? [];
  const ledger = data.ledger ?? [];
  const certPrefix = data.certPrefix ?? 'ON';

  useEffect(() => {
    if (shareholders.length === 0) return;
    let changed = false;
    let currentLedger = [...ledger];
    const currentCompany = { ...data, ledger: currentLedger } as Company;

    for (const sh of shareholders) {
      const existing = currentLedger.find((l) => l.shareholderId === sh.personId);
      if (!existing) {
        const certNo = getNextCertNo(currentCompany);
        const transactionNo = getNextTransactionNo(currentCompany);
        const firstEntry: LedgerEntry = {
          _id: generateId(),
          date: sh.date,
          certNo,
          transactionNo,
          type: 'acquired',
          toFrom: '',
          classOfShares: '',
          shares: '',
          balance: '0',
        };
        const newLedgerEntry: ShareholderLedger = {
          shareholderId: sh.personId,
          entries: recalculateBalances([firstEntry]),
        };
        currentLedger = [...currentLedger, newLedgerEntry];
        currentCompany.ledger = currentLedger;
        changed = true;
      }
    }
    if (changed) onChange({ ledger: currentLedger });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shareholders.length]);

  const activeShareholder = shareholders[activeTab];
  const activeLedger = ledger.find((l) => l.shareholderId === activeShareholder?.personId);

  const updateEntries = (entries: LedgerEntry[]) => {
    const recalculated = recalculateBalances(entries);
    onChange({
      ledger: ledger.map((l) =>
        l.shareholderId === activeShareholder?.personId ? { ...l, entries: recalculated } : l
      ),
    });
  };

  const addEntry = () => {
    const currentCompany = data as Company;
    const newEntry: LedgerEntry = {
      _id: generateId(),
      date: '',
      certNo: getNextCertNo(currentCompany),
      transactionNo: getNextTransactionNo(currentCompany),
      type: 'acquired',
      toFrom: '',
      classOfShares: activeShareholder?.classOfShares ?? '',
      shares: '',
      balance: '',
    };
    updateEntries([...(activeLedger?.entries ?? []), newEntry]);
  };

  const updateEntry = (i: number, patch: Partial<LedgerEntry>) => {
    const entries = (activeLedger?.entries ?? []).map((e, idx) => (idx === i ? { ...e, ...patch } : e));
    updateEntries(entries);
  };

  const removeEntry = (i: number) => {
    updateEntries((activeLedger?.entries ?? []).filter((_, idx) => idx !== i));
  };

  const hasNeg = activeLedger ? hasNegativeBalance(activeLedger.entries) : false;

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Shareholders Ledger</Typography>
        <TextField
          label="Certificate Prefix"
          value={certPrefix}
          onChange={(e) => onChange({ certPrefix: e.target.value })}
          size="small"
          sx={{ width: 150 }}
          helperText="e.g. ON"
        />
      </Stack>

      {shareholders.length === 0 && (
        <Typography color="text.secondary">No shareholders found. Complete Step 2 first.</Typography>
      )}

      {shareholders.length > 0 && (
        <>
          <Tabs value={Math.min(activeTab, shareholders.length - 1)} onChange={(_, v) => setActiveTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            {shareholders.map((s) => (
              <Tab key={s.personId} label={s.person?.name ?? 'Shareholder'} />
            ))}
          </Tabs>

          {hasNeg && (
            <Alert severity="error">
              Warning: the balance goes negative for {activeShareholder?.person?.name}. Check your entries.
            </Alert>
          )}

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Cert #</TableCell>
                  <TableCell>Trans #</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>To/From</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell>Shares</TableCell>
                  <TableCell>Balance</TableCell>
                  <TableCell width={48} />
                </TableRow>
              </TableHead>
              <TableBody>
                {(activeLedger?.entries ?? []).map((entry, i) => (
                  <TableRow key={entry._id}>
                    <TableCell>
                      <TextField size="small" type="date" value={entry.date} onChange={(e) => updateEntry(i, { date: e.target.value })} InputLabelProps={{ shrink: true }} sx={{ width: 140 }} />
                    </TableCell>
                    <TableCell>
                      <TextField size="small" value={entry.certNo} onChange={(e) => updateEntry(i, { certNo: e.target.value })} sx={{ width: 80 }} />
                    </TableCell>
                    <TableCell>
                      <TextField size="small" value={entry.transactionNo} onChange={(e) => updateEntry(i, { transactionNo: e.target.value })} sx={{ width: 60 }} />
                    </TableCell>
                    <TableCell>
                      <Autocomplete
                        value={TYPE_OPTIONS.find((o) => o.value === entry.type) ?? TYPE_OPTIONS[0]}
                        onChange={(_, v) => v && updateEntry(i, { type: v.value as 'acquired' | 'transferred' })}
                        options={TYPE_OPTIONS}
                        getOptionLabel={(o) => o.label}
                        disableClearable
                        sx={{ width: 130 }}
                        renderInput={(params) => <TextField {...params} size="small" />}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField size="small" value={entry.toFrom} onChange={(e) => updateEntry(i, { toFrom: e.target.value })} placeholder="Name" sx={{ width: 120 }} />
                    </TableCell>
                    <TableCell>
                      <TextField size="small" value={entry.classOfShares} onChange={(e) => updateEntry(i, { classOfShares: e.target.value })} sx={{ width: 90 }} />
                    </TableCell>
                    <TableCell>
                      <TextField size="small" value={entry.shares} onChange={(e) => updateEntry(i, { shares: e.target.value })} sx={{ width: 80 }} />
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          px: 1, py: 0.5, borderRadius: 1,
                          bgcolor: parseInt(entry.balance, 10) < 0 ? 'error.lighter' : 'transparent',
                          color: parseInt(entry.balance, 10) < 0 ? 'error.main' : 'text.primary',
                          fontWeight: 'bold', minWidth: 60, textAlign: 'right',
                        }}
                      >
                        {entry.balance}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => removeEntry(i)} size="small" disabled={(activeLedger?.entries.length ?? 0) === 1}>
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Button startIcon={<Iconify icon="mingcute:add-line" />} onClick={addEntry} sx={{ alignSelf: 'flex-start' }}>
            Add Entry
          </Button>
        </>
      )}
    </Stack>
  );
}

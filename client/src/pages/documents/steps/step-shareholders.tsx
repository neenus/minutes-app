import { useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

import { PersonModal } from '../components/PersonModal';
import { AddressFields } from '../components/AddressFields';

import type { Person, Company, Shareholder } from '../types';

type Props = {
  data: Partial<Company>;
  onChange: (patch: Partial<Company>) => void;
};

export function StepShareholders({ data, onChange }: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const shareholders = data.shareholders ?? [];
  const people = data.people ?? [];
  const incorporationDate = data.incorporationDate ?? '';

  const addShareholder = (person: Person) => {
    const newShareholder: Shareholder = {
      personId: person._id,
      person,
      date: incorporationDate,
      numberOfShares: '',
      classOfShares: 'Common',
    };
    const updatedPeople = people.some((p) => p._id === person._id) ? people : [...people, person];
    onChange({ shareholders: [...shareholders, newShareholder], people: updatedPeople });
    setActiveTab(shareholders.length);
  };

  const updateShareholder = (index: number, patch: Partial<Shareholder>) => {
    onChange({
      shareholders: shareholders.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    });
  };

  const removeShareholder = (index: number) => {
    const updated = shareholders.filter((_, i) => i !== index);
    onChange({ shareholders: updated });
    setActiveTab(Math.min(activeTab, updated.length - 1));
  };

  const alreadyAddedIds = shareholders.map((s) => s.personId);
  const active = shareholders[activeTab];

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Shareholders</Typography>

      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={Math.min(activeTab, Math.max(0, shareholders.length - 1))} onChange={(_, v) => setActiveTab(v)}>
          {shareholders.map((s, i) => (
            <Tab key={s.personId} label={s.person?.name ?? `Shareholder ${i + 1}`} />
          ))}
        </Tabs>
        <Button
          size="small"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => setModalOpen(true)}
          sx={{ mb: 0.5, ml: 1, whiteSpace: 'nowrap' }}
        >
          Add Shareholder
        </Button>
      </Box>

      {shareholders.length === 0 && (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          No shareholders yet. Click &quot;Add Shareholder&quot; to get started.
        </Typography>
      )}

      {active && (
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight="bold">{active.person?.name}</Typography>
            <Button color="error" size="small" onClick={() => removeShareholder(activeTab)}>Remove</Button>
          </Box>

          <AddressFields
            value={{
              streetAddress: active.person?.streetAddress ?? '',
              city: active.person?.city ?? '',
              province: active.person?.province ?? '',
              postalCode: active.person?.postalCode ?? '',
            }}
            onChange={() => {}}
            disabled
          />

          <TextField
            label="Date"
            type="date"
            value={active.date}
            onChange={(e) => updateShareholder(activeTab, { date: e.target.value })}
            InputLabelProps={{ shrink: true }}
            helperText="Date of share acquisition — defaults to incorporation date"
            sx={{ maxWidth: 220 }}
          />

          <Stack direction="row" spacing={2}>
            <TextField
              label="Number of Shares"
              value={active.numberOfShares}
              onChange={(e) => updateShareholder(activeTab, { numberOfShares: e.target.value })}
              placeholder="100"
              sx={{ flex: 1 }}
            />
            <TextField
              label="Class of Shares"
              value={active.classOfShares}
              onChange={(e) => updateShareholder(activeTab, { classOfShares: e.target.value })}
              placeholder="Common"
              sx={{ flex: 1 }}
            />
          </Stack>
        </Stack>
      )}

      <PersonModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={addShareholder}
        title="Add a Shareholder"
        alreadyAddedIds={alreadyAddedIds}
      />
    </Stack>
  );
}

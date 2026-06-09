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

import type { Person, Company, Officer } from '../types';

type Props = {
  data: Partial<Company>;
  onChange: (patch: Partial<Company>) => void;
};

export function StepOfficers({ data, onChange }: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const officers = data.officers ?? [];
  const people = data.people ?? [];

  const addOfficer = (person: Person) => {
    const newOfficer: Officer = {
      personId: person._id,
      person,
      officeHeld: '',
      dateAppointed: '',
      dateResigned: '',
    };
    const updatedPeople = people.some((p) => p._id === person._id) ? people : [...people, person];
    onChange({ officers: [...officers, newOfficer], people: updatedPeople });
    setActiveTab(officers.length);
  };

  const updateOfficer = (index: number, patch: Partial<Officer>) => {
    onChange({ officers: officers.map((o, i) => (i === index ? { ...o, ...patch } : o)) });
  };

  const removeOfficer = (index: number) => {
    const updated = officers.filter((_, i) => i !== index);
    onChange({ officers: updated });
    setActiveTab(Math.min(activeTab, updated.length - 1));
  };

  const active = officers[activeTab];

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Officers Register</Typography>

      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={Math.min(activeTab, Math.max(0, officers.length - 1))} onChange={(_, v) => setActiveTab(v)}>
          {officers.map((o, i) => (
            <Tab key={i} label={o.person?.name ?? `Officer ${i + 1}`} />
          ))}
        </Tabs>
        <Button size="small" startIcon={<Iconify icon="mingcute:add-line" />} onClick={() => setModalOpen(true)} sx={{ mb: 0.5, ml: 1, whiteSpace: 'nowrap' }}>
          Add Officer
        </Button>
      </Box>

      {officers.length === 0 && (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          No officers yet. Click &quot;Add Officer&quot; to get started.
        </Typography>
      )}

      {active && (
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight="bold">{active.person?.name}</Typography>
            <Button color="error" size="small" onClick={() => removeOfficer(activeTab)}>Remove</Button>
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
            label="Office Held"
            value={active.officeHeld}
            onChange={(e) => updateOfficer(activeTab, { officeHeld: e.target.value })}
            placeholder="e.g. President, Secretary, Treasurer"
            fullWidth
          />

          <Stack direction="row" spacing={2}>
            <TextField
              label="Date Appointed"
              type="date"
              value={active.dateAppointed}
              onChange={(e) => updateOfficer(activeTab, { dateAppointed: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Date Resigned"
              type="date"
              value={active.dateResigned}
              onChange={(e) => updateOfficer(activeTab, { dateResigned: e.target.value })}
              InputLabelProps={{ shrink: true }}
              helperText="Optional"
              sx={{ flex: 1 }}
            />
          </Stack>
        </Stack>
      )}

      <PersonModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={addOfficer}
        title="Add an Officer"
        alreadyAddedIds={[]}
      />
    </Stack>
  );
}

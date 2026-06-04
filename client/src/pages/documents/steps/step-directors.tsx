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

import type { Person, Company, Director } from '../types';

type Props = {
  data: Partial<Company>;
  onChange: (patch: Partial<Company>) => void;
};

export function StepDirectors({ data, onChange }: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const directors = data.directors ?? [];
  const people = data.people ?? [];

  const addDirector = (person: Person) => {
    const newDirector: Director = {
      personId: person._id,
      person,
      dateElected: '',
      dateResigned: '',
    };
    const updatedPeople = people.some((p) => p._id === person._id) ? people : [...people, person];
    onChange({ directors: [...directors, newDirector], people: updatedPeople });
    setActiveTab(directors.length);
  };

  const updateDirector = (index: number, patch: Partial<Director>) => {
    onChange({ directors: directors.map((d, i) => (i === index ? { ...d, ...patch } : d)) });
  };

  const removeDirector = (index: number) => {
    const updated = directors.filter((_, i) => i !== index);
    onChange({ directors: updated });
    setActiveTab(Math.min(activeTab, updated.length - 1));
  };

  const alreadyAddedIds = directors.map((d) => d.personId);
  const active = directors[activeTab];

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Directors Register</Typography>

      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={Math.min(activeTab, Math.max(0, directors.length - 1))} onChange={(_, v) => setActiveTab(v)}>
          {directors.map((d, i) => (
            <Tab key={d.personId} label={d.person?.name ?? `Director ${i + 1}`} />
          ))}
        </Tabs>
        <Button size="small" startIcon={<Iconify icon="mingcute:add-line" />} onClick={() => setModalOpen(true)} sx={{ mb: 0.5, ml: 1, whiteSpace: 'nowrap' }}>
          Add Director
        </Button>
      </Box>

      {directors.length === 0 && (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          No directors yet. Click &quot;Add Director&quot; to get started.
        </Typography>
      )}

      {active && (
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight="bold">{active.person?.name}</Typography>
            <Button color="error" size="small" onClick={() => removeDirector(activeTab)}>Remove</Button>
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

          <Stack direction="row" spacing={2}>
            <TextField
              label="Date Elected"
              type="date"
              value={active.dateElected}
              onChange={(e) => updateDirector(activeTab, { dateElected: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Date Resigned"
              type="date"
              value={active.dateResigned}
              onChange={(e) => updateDirector(activeTab, { dateResigned: e.target.value })}
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
        onAdd={addDirector}
        title="Add a Director"
        alreadyAddedIds={alreadyAddedIds}
      />
    </Stack>
  );
}

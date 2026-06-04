import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { peopleApi } from 'src/lib/peopleApi';

import { AddressFields } from './AddressFields';
import { PersonAutocomplete } from './PersonAutocomplete';

import type { Person } from '../types';

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (person: Person) => void;
  title: string;
  alreadyAddedIds: string[];
};

const emptyNew = () => ({ name: '', streetAddress: '', city: '', province: '', postalCode: '' });

export function PersonModal({ open, onClose, onAdd, title, alreadyAddedIds }: Props) {
  const [selected, setSelected] = useState<Person | null>(null);
  const [searchResults, setSearchResults] = useState<Person[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [newPerson, setNewPerson] = useState(emptyNew());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setSelected(null);
      setNewPerson(emptyNew());
      setSearchResults([]);
    }
  }, [open]);

  const handleSearch = async (q: string) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearchLoading(true);
    try {
      const res = await peopleApi.search(q);
      setSearchResults(res.data);
    } finally {
      setSearchLoading(false);
    }
  };

  const patchNew = (patch: Partial<typeof newPerson>) =>
    setNewPerson((prev) => ({ ...prev, ...patch }));

  const handleAdd = async () => {
    setSaving(true);
    try {
      if (selected) {
        onAdd(selected);
      } else if (newPerson.name.trim()) {
        const res = await peopleApi.create(newPerson);
        onAdd(res.data);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const canAdd = selected !== null || newPerson.name.trim().length > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Select from existing people
            </Typography>
            <PersonAutocomplete
              label="Search by name"
              value={selected}
              onChange={setSelected}
              options={searchResults}
              disabledIds={alreadyAddedIds}
              loading={searchLoading}
              onInputChange={handleSearch}
            />
          </Box>

          <Divider>or add someone new</Divider>

          <Stack spacing={2}>
            <TextField
              label="Full Name"
              value={newPerson.name}
              onChange={(e) => patchNew({ name: e.target.value })}
              fullWidth
              disabled={selected !== null}
            />
            <AddressFields
              value={newPerson}
              onChange={patchNew}
              disabled={selected !== null}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={handleAdd} variant="contained" disabled={!canAdd || saving}>
          {saving ? 'Adding...' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

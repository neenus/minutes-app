import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';

import { AddressFields } from '../components/AddressFields';

import type { Company } from '../types';

type Props = {
  data: Partial<Company>;
  onChange: (patch: Partial<Company>) => void;
};

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'dissolved', label: 'Dissolved' },
];

export function StepCompany({ data, onChange }: Props) {
  const set = (field: keyof Company) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ [field]: e.target.value });

  return (
    <Stack spacing={3}>
      <Typography variant="h6">Company Info</Typography>

      <TextField
        label="Corporation Name"
        value={data.name ?? ''}
        onChange={set('name')}
        placeholder="e.g. ACME Corp Inc."
        fullWidth
        required
      />

      <AddressFields
        value={{
          streetAddress: data.streetAddress ?? '',
          city: data.city ?? '',
          province: data.province ?? '',
          postalCode: data.postalCode ?? '',
        }}
        onChange={(patch) => onChange(patch)}
      />

      <TextField
        label="Date of Incorporation"
        type="date"
        value={data.incorporationDate ?? ''}
        onChange={set('incorporationDate')}
        fullWidth
        required
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        label="Certificate Prefix"
        value={data.certPrefix ?? 'ON'}
        onChange={set('certPrefix')}
        helperText="Used to generate certificate numbers (e.g. ON-1, ON-2)"
        sx={{ maxWidth: 200 }}
      />

      <Autocomplete
        value={STATUS_OPTIONS.find((o) => o.value === (data.status ?? 'active')) ?? STATUS_OPTIONS[0]}
        onChange={(_, newVal) => onChange({ status: newVal?.value as 'active' | 'dissolved' })}
        options={STATUS_OPTIONS}
        getOptionLabel={(o) => o.label}
        disableClearable
        renderInput={(params) => <TextField {...params} label="Status" sx={{ maxWidth: 200 }} />}
      />

      {data.status === 'dissolved' && (
        <TextField
          label="Date of Dissolution"
          type="date"
          value={data.dissolvedAt ?? ''}
          onChange={set('dissolvedAt')}
          sx={{ maxWidth: 220 }}
          InputLabelProps={{ shrink: true }}
        />
      )}
    </Stack>
  );
}

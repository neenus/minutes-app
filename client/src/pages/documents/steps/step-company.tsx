import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import type { FormData } from '../types';

// ----------------------------------------------------------------------

type Props = {
  data: Pick<FormData, 'companyName' | 'directorName' | 'date'>;
  onChange: (patch: Partial<FormData>) => void;
};

export function StepCompany({ data, onChange }: Props) {
  const set = (field: keyof typeof data) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ [field]: e.target.value });

  return (
    <Stack spacing={3}>
      <Typography variant="h6">Company Basics</Typography>
      <TextField
        label="Corporation Name"
        value={data.companyName}
        onChange={set('companyName')}
        placeholder="e.g. ACME Corp Inc."
        fullWidth
        required
      />
      <TextField
        label="First Director Name"
        value={data.directorName}
        onChange={set('directorName')}
        placeholder="e.g. Jane Smith"
        fullWidth
        required
        helperText="Used in bylaws and resolutions"
      />
      <TextField
        label="Incorporation Date"
        type="date"
        value={data.date}
        onChange={set('date')}
        fullWidth
        required
        InputLabelProps={{ shrink: true }}
      />
    </Stack>
  );
}

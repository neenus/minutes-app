import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

type Address = {
  streetAddress: string;
  city: string;
  province: string;
  postalCode: string;
};

type Props = {
  value: Address;
  onChange: (patch: Partial<Address>) => void;
  disabled?: boolean;
};

export function AddressFields({ value, onChange, disabled }: Props) {
  const set = (field: keyof Address) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ [field]: e.target.value });

  return (
    <Stack spacing={2}>
      <TextField
        label="Street Address"
        value={value.streetAddress}
        onChange={set('streetAddress')}
        fullWidth
        disabled={disabled}
      />
      <Stack direction="row" spacing={2}>
        <TextField label="City" value={value.city} onChange={set('city')} sx={{ flex: 2 }} disabled={disabled} />
        <TextField label="Province" value={value.province} onChange={set('province')} sx={{ flex: 1 }} disabled={disabled} />
        <TextField label="Postal Code" value={value.postalCode} onChange={set('postalCode')} sx={{ flex: 1 }} disabled={disabled} />
      </Stack>
    </Stack>
  );
}

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

import type { Person } from '../types';

type Props = {
  label: string;
  value: Person | null;
  onChange: (person: Person | null) => void;
  options: Person[];
  disabledIds?: string[];
  loading?: boolean;
  onInputChange?: (value: string) => void;
};

export function PersonAutocomplete({ label, value, onChange, options, disabledIds = [], loading, onInputChange }: Props) {
  return (
    <Autocomplete
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      onInputChange={(_, newInputValue) => onInputChange?.(newInputValue)}
      options={options}
      getOptionLabel={(o) => o.name}
      getOptionDisabled={(o) => disabledIds.includes(o._id)}
      loading={loading}
      filterOptions={(x) => x}
      renderOption={(props, option) => (
        <li {...props} key={option._id}>
          <span>{option.name}</span>
          {disabledIds.includes(option._id) && (
            <span style={{ marginLeft: 8, fontSize: 11, color: '#9ca3af' }}>already added</span>
          )}
        </li>
      )}
      renderInput={(params) => (
        <TextField {...params} label={label} placeholder="Search by name..." />
      )}
      fullWidth
      isOptionEqualToValue={(o, v) => o._id === v._id}
    />
  );
}

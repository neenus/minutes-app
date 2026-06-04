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
import TableContainer from '@mui/material/TableContainer';

import { Iconify } from 'src/components/iconify';

import type { FormData, Signatory } from '../types';

// ----------------------------------------------------------------------

type Props = {
  data: Pick<FormData, 'bankName' | 'resolutionDate' | 'signatories' | 'signingInstructions'>;
  onChange: (patch: Partial<FormData>) => void;
};

export function StepBanking({ data, onChange }: Props) {
  const updateSignatory = (index: number, patch: Partial<Signatory>) => {
    const updated = data.signatories.map((s, i) => (i === index ? { ...s, ...patch } : s));
    onChange({ signatories: updated });
  };

  const addSignatory = () =>
    onChange({ signatories: [...data.signatories, { name: '', title: 'Director/Officer' }] });

  const removeSignatory = (index: number) =>
    onChange({ signatories: data.signatories.filter((_, i) => i !== index) });

  return (
    <Stack spacing={3}>
      <Typography variant="h6">Banking Resolution</Typography>
      <TextField
        label="Bank Name"
        value={data.bankName}
        onChange={(e) => onChange({ bankName: e.target.value })}
        placeholder="e.g. Royal Bank of Canada"
        fullWidth
      />
      <TextField
        label="Resolution Date"
        type="date"
        value={data.resolutionDate}
        onChange={(e) => onChange({ resolutionDate: e.target.value })}
        fullWidth
        InputLabelProps={{ shrink: true }}
        helperText="Defaults to incorporation date if left blank"
      />

      <Typography variant="subtitle2">Authorized Signatories</Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Title</TableCell>
              <TableCell width={48} />
            </TableRow>
          </TableHead>
          <TableBody>
            {data.signatories.map((sig, i) => (
              <TableRow key={i}>
                <TableCell>
                  <TextField
                    size="small"
                    value={sig.name}
                    onChange={(e) => updateSignatory(i, { name: e.target.value })}
                    fullWidth
                    placeholder="Full name"
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    value={sig.title}
                    onChange={(e) => updateSignatory(i, { title: e.target.value })}
                    fullWidth
                    placeholder="Director/Officer"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => removeSignatory(i)}
                    size="small"
                    disabled={data.signatories.length === 1}
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
        onClick={addSignatory}
        sx={{ alignSelf: 'flex-start' }}
      >
        Add Signatory
      </Button>

      <TextField
        label="Signing Instructions"
        value={data.signingInstructions}
        onChange={(e) => onChange({ signingInstructions: e.target.value })}
        multiline
        minRows={3}
        fullWidth
      />
    </Stack>
  );
}

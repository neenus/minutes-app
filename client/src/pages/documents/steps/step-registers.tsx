import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { Iconify } from 'src/components/iconify';

import type { Officer, Director, FormData, Shareholder } from '../types';

// ----------------------------------------------------------------------

type Props = {
  data: Pick<FormData, 'directors' | 'officers' | 'shareholders'>;
  onChange: (patch: Partial<FormData>) => void;
};

const emptyDirector = (): Director => ({ name: '', dateElected: '', dateResigned: '' });
const emptyOfficer = (): Officer => ({ name: '', officeHeld: '', dateAppointed: '', dateResigned: '' });
const emptyShareholder = (): Shareholder => ({ date: '', name: '', sharesHeldNumber: '', sharesHeldClass: '' });

export function StepRegisters({ data, onChange }: Props) {
  const updateDirector = (i: number, patch: Partial<Director>) =>
    onChange({ directors: data.directors.map((d, idx) => (idx === i ? { ...d, ...patch } : d)) });
  const addDirector = () => onChange({ directors: [...data.directors, emptyDirector()] });
  const removeDirector = (i: number) => onChange({ directors: data.directors.filter((_, idx) => idx !== i) });

  const updateOfficer = (i: number, patch: Partial<Officer>) =>
    onChange({ officers: data.officers.map((o, idx) => (idx === i ? { ...o, ...patch } : o)) });
  const addOfficer = () => onChange({ officers: [...data.officers, emptyOfficer()] });
  const removeOfficer = (i: number) => onChange({ officers: data.officers.filter((_, idx) => idx !== i) });

  const updateShareholder = (i: number, patch: Partial<Shareholder>) =>
    onChange({ shareholders: data.shareholders.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) });
  const addShareholder = () => onChange({ shareholders: [...data.shareholders, emptyShareholder()] });
  const removeShareholder = (i: number) =>
    onChange({ shareholders: data.shareholders.filter((_, idx) => idx !== i) });

  return (
    <Stack spacing={4}>
      {/* Directors Register */}
      <Stack spacing={1}>
        <Typography variant="h6">Directors Register</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Date Elected</TableCell>
                <TableCell>Date Resigned</TableCell>
                <TableCell width={48} />
              </TableRow>
            </TableHead>
            <TableBody>
              {data.directors.map((d, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <TextField
                      size="small"
                      value={d.name}
                      onChange={(e) => updateDirector(i, { name: e.target.value })}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="date"
                      value={d.dateElected}
                      onChange={(e) => updateDirector(i, { dateElected: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="date"
                      value={d.dateResigned}
                      onChange={(e) => updateDirector(i, { dateResigned: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => removeDirector(i)}
                      size="small"
                      disabled={data.directors.length === 1}
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
          onClick={addDirector}
          sx={{ alignSelf: 'flex-start' }}
        >
          Add Director
        </Button>
      </Stack>

      <Divider />

      {/* Officers Register */}
      <Stack spacing={1}>
        <Typography variant="h6">Officers Register</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Office Held</TableCell>
                <TableCell>Date Appointed</TableCell>
                <TableCell>Date Resigned</TableCell>
                <TableCell width={48} />
              </TableRow>
            </TableHead>
            <TableBody>
              {data.officers.map((o, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <TextField
                      size="small"
                      value={o.name}
                      onChange={(e) => updateOfficer(i, { name: e.target.value })}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      value={o.officeHeld}
                      onChange={(e) => updateOfficer(i, { officeHeld: e.target.value })}
                      placeholder="President"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="date"
                      value={o.dateAppointed}
                      onChange={(e) => updateOfficer(i, { dateAppointed: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="date"
                      value={o.dateResigned}
                      onChange={(e) => updateOfficer(i, { dateResigned: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => removeOfficer(i)}
                      size="small"
                      disabled={data.officers.length === 1}
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
          onClick={addOfficer}
          sx={{ alignSelf: 'flex-start' }}
        >
          Add Officer
        </Button>
      </Stack>

      <Divider />

      {/* Shareholders Register */}
      <Stack spacing={1}>
        <Typography variant="h6">Shareholders Register</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Shares (Number)</TableCell>
                <TableCell>Shares (Class)</TableCell>
                <TableCell width={48} />
              </TableRow>
            </TableHead>
            <TableBody>
              {data.shareholders.map((s, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <TextField
                      size="small"
                      type="date"
                      value={s.date}
                      onChange={(e) => updateShareholder(i, { date: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      value={s.name}
                      onChange={(e) => updateShareholder(i, { name: e.target.value })}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      value={s.sharesHeldNumber}
                      onChange={(e) => updateShareholder(i, { sharesHeldNumber: e.target.value })}
                      placeholder="100"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      value={s.sharesHeldClass}
                      onChange={(e) => updateShareholder(i, { sharesHeldClass: e.target.value })}
                      placeholder="Common"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => removeShareholder(i)}
                      size="small"
                      disabled={data.shareholders.length === 1}
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
          onClick={addShareholder}
          sx={{ alignSelf: 'flex-start' }}
        >
          Add Shareholder
        </Button>
      </Stack>
    </Stack>
  );
}

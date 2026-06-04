import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Alert from '@mui/material/Alert';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import axios, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

const ROLES = ['admin', 'staff'];

export function UserNewPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', role: 'staff' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post(endpoints.users.create, form);
      router.push(paths.dashboard.users.root);
    } catch (err: any) {
      setError(err?.error ?? err?.message ?? 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 560 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>New User</Typography>
      <Card component="form" onSubmit={handleSubmit}>
        <CardContent>
          <Stack spacing={2.5}>
            {error && <Alert severity="error">{error}</Alert>}
            <Stack direction="row" spacing={2}>
              <TextField
                label="First Name"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                label="Last Name"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
                fullWidth
              />
            </Stack>
            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              label="Role"
              name="role"
              value={form.role}
              onChange={handleChange}
              select
              fullWidth
            >
              {ROLES.map((r) => (
                <MenuItem key={r} value={r} sx={{ textTransform: 'capitalize' }}>{r}</MenuItem>
              ))}
            </TextField>
          </Stack>
        </CardContent>
        <CardActions sx={{ px: 2, pb: 2 }}>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </Button>
          <Button onClick={() => router.push(paths.dashboard.users.root)}>Cancel</Button>
        </CardActions>
      </Card>
    </Box>
  );
}

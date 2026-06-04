import { useState, useEffect } from 'react';
import { useParams } from 'react-router';

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
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import axios, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

const ROLES = ['admin', 'staff'];

type NrUser = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
};

export function UserEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [user, setUser] = useState<NrUser | null>(null);
  const [form, setForm] = useState({ role: 'staff', isActive: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(endpoints.users.list);
        const found = (res.data?.data ?? []).find((u: NrUser) => u._id === id);
        if (found) {
          setUser(found);
          setForm({ role: found.role, isActive: found.isActive });
        } else {
          setError('User not found.');
        }
      } catch {
        setError('Failed to load user.');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await axios.put(endpoints.users.update(id!), form);
      router.push(paths.dashboard.users.root);
    } catch (err: any) {
      setError(err?.error ?? err?.message ?? 'Failed to update user.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CircularProgress sx={{ m: 4 }} />;

  return (
    <Box sx={{ p: 3, maxWidth: 560 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Edit User</Typography>

      {user && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {user.firstName} {user.lastName} — {user.email}
        </Typography>
      )}

      <Card component="form" onSubmit={handleSubmit}>
        <CardContent>
          <Stack spacing={2.5}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Role"
              name="role"
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
              select
              fullWidth
            >
              {ROLES.map((r) => (
                <MenuItem key={r} value={r} sx={{ textTransform: 'capitalize' }}>{r}</MenuItem>
              ))}
            </TextField>
            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                />
              }
              label="Active"
            />
          </Stack>
        </CardContent>
        <CardActions sx={{ px: 2, pb: 2 }}>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button onClick={() => router.push(paths.dashboard.users.root)}>Cancel</Button>
        </CardActions>
      </Card>
    </Box>
  );
}

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';

import axios, { endpoints } from 'src/lib/axios';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function ProfilePage() {
  const { user, checkUserSession } = useAuthContext();

  const [nameForm, setNameForm] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [nameStatus, setNameStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [pwStatus, setPwStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [nameSaving, setNameSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameStatus(null);
    setNameSaving(true);
    try {
      await axios.put(endpoints.nrAuth.profile, {
        firstName: nameForm.firstName,
        lastName: nameForm.lastName,
      });
      setNameStatus({ type: 'success', msg: 'Name updated successfully.' });
      checkUserSession?.();
    } catch (err: any) {
      setNameStatus({ type: 'error', msg: err?.error ?? 'Failed to update name.' });
    } finally {
      setNameSaving(false);
    }
  };

  const handlePwSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwStatus(null);
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwStatus({ type: 'error', msg: 'New passwords do not match.' });
      return;
    }
    setPwSaving(true);
    try {
      await axios.put(endpoints.nrAuth.profile, pwForm);
      setPwStatus({ type: 'success', msg: 'Password changed successfully.' });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setPwStatus({ type: 'error', msg: err?.error ?? 'Failed to change password.' });
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 560 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>My Profile</Typography>

      {/* Name */}
      <Card component="form" onSubmit={handleNameSubmit} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Personal Info</Typography>
          <Stack spacing={2.5}>
            {nameStatus && <Alert severity={nameStatus.type}>{nameStatus.msg}</Alert>}
            <TextField
              label="Email"
              value={user?.email ?? ''}
              disabled
              fullWidth
              helperText="Email cannot be changed"
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="First Name"
                value={nameForm.firstName}
                onChange={(e) => setNameForm((p) => ({ ...p, firstName: e.target.value }))}
                required
                fullWidth
              />
              <TextField
                label="Last Name"
                value={nameForm.lastName}
                onChange={(e) => setNameForm((p) => ({ ...p, lastName: e.target.value }))}
                required
                fullWidth
              />
            </Stack>
          </Stack>
        </CardContent>
        <CardActions sx={{ px: 2, pb: 2 }}>
          <Button type="submit" variant="contained" disabled={nameSaving}>
            {nameSaving ? 'Saving...' : 'Save'}
          </Button>
        </CardActions>
      </Card>

      <Divider sx={{ my: 2 }} />

      {/* Password */}
      <Card component="form" onSubmit={handlePwSubmit}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Change Password</Typography>
          <Stack spacing={2.5}>
            {pwStatus && <Alert severity={pwStatus.type}>{pwStatus.msg}</Alert>}
            <TextField
              label="Current Password"
              type="password"
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="New Password"
              type="password"
              value={pwForm.newPassword}
              onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="Confirm New Password"
              type="password"
              value={pwForm.confirmPassword}
              onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))}
              required
              fullWidth
            />
          </Stack>
        </CardContent>
        <CardActions sx={{ px: 2, pb: 2 }}>
          <Button type="submit" variant="contained" disabled={pwSaving}>
            {pwSaving ? 'Changing...' : 'Change Password'}
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
}

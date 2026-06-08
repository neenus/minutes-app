import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import axios, { endpoints } from 'src/lib/axios';

import { Iconify } from 'src/components/iconify';
import { SplashScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

type NrUser = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  invitationStatus: 'invited' | 'accepted' | 'expired';
};

function getUserStatus(user: NrUser): { label: string; color: 'success' | 'warning' | 'error' | 'default' } {
  if (user.invitationStatus === 'invited') return { label: 'Invited', color: 'warning' };
  if (user.invitationStatus === 'expired') return { label: 'Expired', color: 'error' };
  return user.isActive
    ? { label: 'Active', color: 'success' }
    : { label: 'Inactive', color: 'default' };
}

export function UserListPage() {
  const [users, setUsers] = useState<NrUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(endpoints.users.list);
      setUsers(res.data?.data?.users ?? []);
    } catch {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDeactivate = async (id: string) => {
    if (!window.confirm('Deactivate this user?')) return;
    try {
      await axios.delete(endpoints.users.delete(id));
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isActive: false } : u));
    } catch {
      alert('Failed to deactivate user.');
    }
  };

  const handleResendInvite = async (id: string) => {
    try {
      await axios.post(endpoints.users.resendInvite(id));
      alert('Invitation resent.');
    } catch {
      alert('Failed to resend invite.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Users</Typography>
        <Button
          component={RouterLink}
          href={paths.dashboard.users.new}
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
        >
          New User
        </Button>
      </Box>

      {loading && <SplashScreen slotProps={{ wrapper: { style: { flexDirection: 'row' } } }} />}
      {error && <Typography color="error">{error}</Typography>}

      {!loading && !error && (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.firstName} {user.lastName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>{user.role}</TableCell>
                    <TableCell>
                      {(() => { const s = getUserStatus(user); return <Chip size="small" label={s.label} color={s.color} />; })()}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        component={RouterLink}
                        href={paths.dashboard.users.edit(user._id)}
                        title="Edit"
                      >
                        <Iconify icon="solar:pen-bold" />
                      </IconButton>
                      <IconButton
                        onClick={() => handleResendInvite(user._id)}
                        title="Resend invite"
                      >
                        <Iconify icon="solar:letter-bold" />
                      </IconButton>
                      {user.isActive && (
                        <IconButton
                          onClick={() => handleDeactivate(user._id)}
                          color="error"
                          title="Deactivate"
                        >
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No users found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );
}

import type { Company } from 'src/pages/documents/types';

import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';

import { paths } from 'src/routes/paths';

import { companiesApi } from 'src/lib/companiesApi';

import { Iconify } from 'src/components/iconify';

export function CompaniesPage() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    companiesApi.list().then((res) => setCompanies(res.data)).finally(() => setLoading(false));
  }, []);

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Companies</Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => navigate(paths.dashboard.companies.new)}
        >
          New Company
        </Button>
      </Box>

      <TextField
        placeholder="Search companies..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
        sx={{ mb: 3 }}
        InputProps={{ startAdornment: <Iconify icon="solar:magnifer-bold" sx={{ mr: 1, color: 'text.disabled' }} /> }}
      />

      {loading && <Typography color="text.secondary">Loading...</Typography>}

      {!loading && filtered.length === 0 && (
        <Typography color="text.secondary">
          {search ? 'No companies match your search.' : 'No companies yet. Click "New Company" to get started.'}
        </Typography>
      )}

      <Grid container spacing={2}>
        {filtered.map((company) => (
          <Grid item xs={12} sm={6} md={4} key={company._id}>
            <Card
              variant="outlined"
              sx={{ opacity: company.status === 'dissolved' ? 0.6 : 1 }}
            >
              <CardActionArea onClick={() => navigate(paths.dashboard.companies.edit(company._id))}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold" noWrap sx={{ flex: 1 }}>
                      {company.name}
                    </Typography>
                    {company.status === 'dissolved' && (
                      <Chip label="Dissolved" size="small" color="error" sx={{ ml: 1 }} />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Incorporated: {company.incorporationDate || '—'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Shareholders: {company.shareholders?.length ?? 0}
                  </Typography>
                  {company.updatedAt && (
                    <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
                      Last updated {new Date(company.updatedAt).toLocaleDateString()}
                    </Typography>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

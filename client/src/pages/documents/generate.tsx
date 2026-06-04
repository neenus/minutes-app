import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { companiesApi } from 'src/lib/companiesApi';
import { paths } from 'src/routes/paths';

import { StepBanking } from './steps/step-banking';
import { StepCertificates } from './steps/step-certificates';
import { StepCompany } from './steps/step-company';
import { StepDirectors } from './steps/step-directors';
import { StepLedger } from './steps/step-ledger';
import { StepOfficers } from './steps/step-officers';
import { StepReview } from './steps/step-review';
import { StepShareholders } from './steps/step-shareholders';
import { emptyCompany, stepStatus } from './types';
import type { Company, StepStatus } from './types';

// ----------------------------------------------------------------------

const STEP_LABELS = [
  'Company Info', 'Shareholders', 'Directors', 'Officers',
  'Banking', 'Ledger', 'Certificates', 'Review',
];

function StepIcon({ status }: { status: StepStatus }) {
  if (status === 'complete') return <span style={{ color: '#16a34a' }}>✓</span>;
  if (status === 'partial') return <span style={{ color: '#d97706' }}>⚠</span>;
  return null;
}

export function GenerateDocumentsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id;

  const [company, setCompany] = useState<Partial<Company>>(emptyCompany());
  const [companyId, setCompanyId] = useState<string | null>(id ?? null);
  const [activeStep, setActiveStep] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (id) {
      companiesApi.get(id)
        .then((res) => setCompany(res.data))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const patch = (update: Partial<Company>) =>
    setCompany((prev) => ({ ...prev, ...update }));

  const saveStep = async (auditSummary?: string) => {
    setSaving(true);
    try {
      if (!companyId) {
        const res = await companiesApi.create(company);
        setCompanyId(res.data._id);
        navigate(paths.dashboard.companies.edit(res.data._id), { replace: true });
        setCompany(res.data);
      } else {
        const res = await companiesApi.update(companyId, {
          ...company,
          _auditSummary: auditSummary ?? `Updated step ${activeStep + 1}`,
        });
        setCompany(res.data);
      }
      setLastSaved(new Date());
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    await saveStep();
    setActiveStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
  };

  const handleBack = () => setActiveStep((s) => Math.max(s - 1, 0));

  const statuses = stepStatus(company);

  const renderStep = () => {
    const c = company as Company;
    switch (activeStep) {
      case 0: return <StepCompany data={c} onChange={patch} />;
      case 1: return <StepShareholders data={c} onChange={patch} />;
      case 2: return <StepDirectors data={c} onChange={patch} />;
      case 3: return <StepOfficers data={c} onChange={patch} />;
      case 4: return <StepBanking data={c} onChange={patch} />;
      case 5: return <StepLedger data={c} onChange={patch} />;
      case 6: return <StepCertificates data={c} onChange={patch} />;
      case 7: return <StepReview data={c} />;
      default: return null;
    }
  };

  if (loading) return <Box sx={{ p: 3 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">
          {isNew ? 'New Company' : ((company as Company).name || 'Edit Company')}
        </Typography>
        {lastSaved && (
          <Typography variant="caption" color="text.secondary">
            Last saved {lastSaved.toLocaleTimeString()}
          </Typography>
        )}
      </Stack>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {STEP_LABELS.map((label, i) => (
          <Step key={label}>
            <StepLabel
              icon={<StepIcon status={statuses[i]} />}
              onClick={() => setActiveStep(i)}
              sx={{ cursor: 'pointer' }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ p: 3, mb: 3 }}>{renderStep()}</Paper>

      <Stack direction="row" justifyContent="space-between">
        <Button
          variant="outlined"
          onClick={handleBack}
          disabled={activeStep === 0}
          startIcon={<Iconify icon="solar:arrow-left-bold" />}
        >
          Back
        </Button>
        {activeStep < STEP_LABELS.length - 1 && (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={saving}
            endIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Iconify icon="solar:arrow-right-bold" />}
          >
            {saving ? 'Saving...' : 'Next'}
          </Button>
        )}
      </Stack>
    </Box>
  );
}

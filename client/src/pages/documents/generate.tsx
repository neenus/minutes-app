import { useState } from 'react';

import Box from '@mui/material/Box';
import Step from '@mui/material/Step';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Stepper from '@mui/material/Stepper';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

import { emptyFormData } from './types';
import { StepLedger } from './steps/step-ledger';
import { StepReview } from './steps/step-review';
import { StepBanking } from './steps/step-banking';
import { StepCompany } from './steps/step-company';
import { StepRegisters } from './steps/step-registers';
import { StepCertificates } from './steps/step-certificates';

import type { FormData } from './types';

// ----------------------------------------------------------------------

const STEPS = [
  'Company Basics',
  'Banking Resolution',
  'Registers',
  'Shareholders Ledger',
  'Share Certificates',
  'Review & Download',
];

export function GenerateDocumentsPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(emptyFormData());

  const patch = (update: Partial<FormData>) => setFormData((prev) => ({ ...prev, ...update }));

  const handleNext = () => setActiveStep((s) => Math.min(s + 1, STEPS.length - 1));
  const handleBack = () => setActiveStep((s) => Math.max(s - 1, 0));

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return <StepCompany data={formData} onChange={patch} />;
      case 1:
        return <StepBanking data={formData} onChange={patch} />;
      case 2:
        return <StepRegisters data={formData} onChange={patch} />;
      case 3:
        return <StepLedger data={formData} onChange={patch} />;
      case 4:
        return <StepCertificates data={formData} onChange={patch} />;
      case 5:
        return <StepReview data={formData} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Generate Documents
      </Typography>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
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
        {activeStep < STEPS.length - 1 && (
          <Button
            variant="contained"
            onClick={handleNext}
            endIcon={<Iconify icon="solar:arrow-right-bold" />}
          >
            Next
          </Button>
        )}
      </Stack>
    </Box>
  );
}

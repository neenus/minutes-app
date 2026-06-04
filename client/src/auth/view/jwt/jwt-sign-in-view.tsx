import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { useAuthContext } from '../../hooks';
import { getErrorMessage } from '../../utils';
import { signInWithPassword } from '../../context/jwt';

// ----------------------------------------------------------------------

export type SignInSchemaType = zod.infer<typeof SignInSchema>;

export const SignInSchema = zod.object({
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  password: zod
    .string()
    .min(1, { message: 'Password is required!' })
    .min(6, { message: 'Password must be at least 6 characters!' }),
});

const FEATURES = [
  'Generate minute book documents instantly',
  'Manage shareholders, directors & officers',
  'Track share ledgers with auto-calculated balances',
  'Maintain corporate records for all your clients',
];

// ----------------------------------------------------------------------

export function JwtSignInView() {
  const router = useRouter();
  const showPassword = useBoolean();
  const { checkUserSession } = useAuthContext();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const methods = useForm<SignInSchemaType>({
    resolver: zodResolver(SignInSchema),
    defaultValues: { email: '', password: '' },
  });

  const { handleSubmit, formState: { isSubmitting } } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await signInWithPassword({ email: data.email, password: data.password });
      await checkUserSession?.();
      router.refresh();
    } catch (error) {
      console.error(error);
      setErrorMessage(getErrorMessage(error));
    }
  });

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>

      {/* ── Left branded panel ── */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: '0 0 480px',
          flexDirection: 'column',
          justifyContent: 'center',
          px: 8,
          py: 10,
          background: 'linear-gradient(150deg, #0E2347 0%, #081832 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative rings */}
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: 280 + i * 160,
              height: 280 + i * 160,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.06)',
              top: '50%',
              right: -200 - i * 80,
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* Wordmark */}
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: 44,
            lineHeight: 1,
            letterSpacing: '-0.04em',
            color: '#fff',
            mb: 3,
          }}
        >
          Minute<Box component="span" sx={{ color: 'primary.light' }}>s</Box>
        </Typography>

        <Typography
          sx={{
            color: 'rgba(255,255,255,0.65)',
            fontSize: 17,
            lineHeight: 1.6,
            mb: 5,
            maxWidth: 340,
          }}
        >
          Corporate Minute Book Management<br />for Ontario Accounting Firms
        </Typography>

        {FEATURES.map((feature) => (
          <Box key={feature} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: 'primary.light',
                flexShrink: 0,
              }}
            />
            <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 1.5 }}>
              {feature}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* ── Right form panel ── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 3, sm: 6 },
          py: 8,
          bgcolor: 'background.default',
        }}
      >
        {/* Mobile-only wordmark */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 5, textAlign: 'center' }}>
          <Typography sx={{ fontWeight: 800, fontSize: 32, letterSpacing: '-0.04em', color: 'text.primary' }}>
            Minute<Box component="span" sx={{ color: 'primary.main' }}>s</Box>
          </Typography>
        </Box>

        <Box sx={{ width: '100%', maxWidth: 420 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Welcome back
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            Sign in to your account to continue
          </Typography>

          {!!errorMessage && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errorMessage}
            </Alert>
          )}

          <Form methods={methods} onSubmit={onSubmit}>
            <Box sx={{ gap: 2.5, display: 'flex', flexDirection: 'column' }}>
              <Field.Text
                name="email"
                label="Email address"
                placeholder="you@firm.com"
                slotProps={{ inputLabel: { shrink: true } }}
              />

              <Field.Text
                name="password"
                label="Password"
                placeholder="6+ characters"
                type={showPassword.value ? 'text' : 'password'}
                slotProps={{
                  inputLabel: { shrink: true },
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={showPassword.onToggle} edge="end">
                          <Iconify icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <LoadingButton
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                loading={isSubmitting}
                loadingIndicator="Signing in…"
                sx={{ mt: 0.5 }}
              >
                Sign in
              </LoadingButton>
            </Box>
          </Form>

          <Typography variant="caption" color="text.disabled" sx={{ mt: 4, display: 'block', textAlign: 'center' }}>
            Minutes © {new Date().getFullYear()}
          </Typography>
        </Box>
      </Box>

    </Box>
  );
}

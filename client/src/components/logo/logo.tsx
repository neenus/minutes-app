import type { LinkProps } from '@mui/material/Link';

import { forwardRef } from 'react';
import { mergeClasses } from 'minimal-shared/utils';

import Link from '@mui/material/Link';
import { styled, useTheme } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { logoClasses } from './classes';

// ----------------------------------------------------------------------

export type LogoProps = LinkProps & {
  isSingle?: boolean;
  disabled?: boolean;
};

export const Logo = forwardRef<HTMLAnchorElement, LogoProps>((props, ref) => {
  const { className, href = '/', isSingle = true, disabled, sx, ...other } = props;

  const theme = useTheme();
  const accent = theme.vars?.palette?.primary?.light ?? theme.palette.primary.light;

  return (
    <LogoRoot
      ref={ref}
      component={RouterLink}
      href={href}
      aria-label="Minutes"
      underline="none"
      className={mergeClasses([logoClasses.root, className])}
      sx={[
        {
          display: 'inline-flex',
          alignItems: 'center',
          ...(disabled && { pointerEvents: 'none' }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {isSingle ? (
        <span style={{ fontWeight: 800, fontSize: 22, lineHeight: 1, letterSpacing: '-0.5px', color: 'inherit' }}>
          M<span style={{ color: accent }}>.</span>
        </span>
      ) : (
        <span style={{ fontWeight: 800, fontSize: 18, lineHeight: 1, letterSpacing: '-0.04em', color: 'inherit', whiteSpace: 'nowrap' }}>
          Minute<span style={{ color: accent }}>s</span>
        </span>
      )}
    </LogoRoot>
  );
});

// ----------------------------------------------------------------------

const LogoRoot = styled(Link)(() => ({
  flexShrink: 0,
  display: 'inline-flex',
  verticalAlign: 'middle',
}));

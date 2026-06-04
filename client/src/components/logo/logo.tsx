import type { LinkProps } from '@mui/material/Link';

import { forwardRef } from 'react';
import { mergeClasses } from 'minimal-shared/utils';

import Link from '@mui/material/Link';
import { styled } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { logoClasses } from './classes';

// ----------------------------------------------------------------------

export type LogoProps = LinkProps & {
  isSingle?: boolean;
  disabled?: boolean;
};

export const Logo = forwardRef<HTMLAnchorElement, LogoProps>((props, ref) => {
  const { className, href = '/', isSingle = true, disabled, sx, ...other } = props;

  return (
    <LogoRoot
      ref={ref}
      component={RouterLink}
      href={href}
      aria-label="Minutify"
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
        <span style={{ fontWeight: 800, fontSize: 22, color: 'inherit', lineHeight: 1, letterSpacing: '-0.5px' }}>
          M
        </span>
      ) : (
        <span style={{ fontWeight: 800, fontSize: 18, color: 'inherit', lineHeight: 1, letterSpacing: '-0.5px' }}>
          Minutify
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

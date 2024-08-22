'use client';

import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Alert, TextField } from '@mui/material';
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { LoadingButton } from '@mui/lab';

import { useRouter, useSearchParams } from 'src/routes/hooks';
import axios, { endpoints } from 'src/utils/axios';

import { useState } from 'react';

import { useAuthContext } from 'src/auth/hooks';
import { PATH_AFTER_LOGIN } from 'src/config-global';

// ----------------------------------------------------------------------

export default function JwtCompanyView({ credential }) {
  const { login } = useAuthContext();

  const router = useRouter();

  const searchParams = useSearchParams();

  const returnTo = searchParams.get('returnTo');

  const [errorMsg, setErrorMsg] = useState('');

  const [verifyCode, setVerifyCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      await axios.post(endpoints.auth.verify, {
        email: credential.email,
        confirmCode: verifyCode,
      });

      await login?.(credential.email, credential.password);

      router.push(returnTo || PATH_AFTER_LOGIN);
    } catch (error) {
      console.error(error);
      setVerifyCode('');
      setErrorMsg(typeof error === 'string' ? error : error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeVerificationCode = (e) => {
    if (e.target.value.length <= 6) setVerifyCode(e.target.value);
  };

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 3, position: 'relative' }}>
      <Typography variant="h4">Account verification</Typography>

      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2"> Already have an account? </Typography>

        <Link href={paths.auth.jwt.login} component={RouterLink} variant="subtitle2">
          Sign in
        </Link>
      </Stack>
    </Stack>
  );

  const renderTerms = (
    <Typography
      component="div"
      sx={{
        color: 'text.secondary',
        mt: 2.5,
        typography: 'caption',
        textAlign: 'center',
      }}
    >
      {'By signing up, I agree to '}
      <Link underline="always" color="text.primary">
        Terms of Service
      </Link>
      {' and '}
      <Link underline="always" color="text.primary">
        Privacy Policy
      </Link>
      .
    </Typography>
  );

  const renderForm = (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2.5}>
        {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

        <TextField
          id="verify_code"
          label="Verification code"
          fullWidth
          value={verifyCode}
          onChange={handleChangeVerificationCode}
          type="number"
        />

        <LoadingButton
          variant="contained"
          size="large"
          color="inherit"
          type="submit"
          loading={loading}
          disabled={verifyCode.length !== 6}
        >
          Verify account
        </LoadingButton>
      </Stack>
    </form>
  );

  return (
    <>
      {renderHead}

      {renderForm}

      {renderTerms}
    </>
  );
}

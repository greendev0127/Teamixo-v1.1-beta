'use client';
import { useState } from 'react';
import JwtCompanyView from './jwt-company-view';
import { REGISTER_STEP } from 'src/constant/common';
import JwtRegisterProfile from './jwt-register-profile';
import JwtEmailVerify from './jwt-email-verify';

export default function JwtRegisterView() {
  const [companyData, setCompanyData] = useState(null);
  const [registerStep, setRegisterStep] = useState(REGISTER_STEP.COMPANY);
  const [credential, setCredential] = useState(null);

  if (registerStep === REGISTER_STEP.COMPANY) {
    return <JwtCompanyView setRegisterStep={setRegisterStep} setCompanyData={setCompanyData} />;
  }

  if (registerStep === REGISTER_STEP.PROFILE) {
    return (
      <JwtRegisterProfile
        setRegisterStep={setRegisterStep}
        setCredential={setCredential}
        companyData={companyData}
      />
    );
  }

  return <JwtEmailVerify credential={credential} />;
}

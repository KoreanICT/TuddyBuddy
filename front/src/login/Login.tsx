import React, { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthModal from './AuthModal';
import { getLoginDestination } from './loginRedirect';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const close = useCallback(() => navigate('/'), [navigate]);
  const handleSuccess = () => {
    navigate(getLoginDestination(searchParams.get('redirect')), { replace: true });
  };

  return <AuthModal variant="page" onClose={close} onSuccess={handleSuccess} />;
};

export default Login;

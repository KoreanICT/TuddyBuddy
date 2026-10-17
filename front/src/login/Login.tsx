
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from './reducers/store';
import { login } from './authActions/authActions';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ==========================================
  // 기존 일반 로그인 (수정 없음)
  // ==========================================
  const handleLogin = async () => {
    if (isLoading) return;

    if (!email.trim() || !password) {
      setErrorMessage('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const success = await dispatch(login(email.trim(), password));

      if (success) {
        const redirect = searchParams.get('redirect');

        const destination =
          redirect &&
            redirect.startsWith('/') &&
            !redirect.startsWith('//')
            ? redirect
            : '/';

        navigate(destination, { replace: true });
      } else {
        setErrorMessage(
          '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.'
        );
      }
    } catch {
      setErrorMessage(
        '로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 카카오 로그인 (OAuth state 검증 기능 추가)
  // ==========================================
  const handleKakaoLogin = () => {
    const clientId = process.env.REACT_APP_KAKAO_REST_API_KEY;

    const redirectUri =
      `${window.location.origin}/auth/kakao/callback`;

    if (!clientId) {
      setErrorMessage('카카오 REST API 키가 설정되지 않았습니다.');
      return;
    }

    // 추가: OAuth state 생성
    const randomBytes = new Uint8Array(32);
    window.crypto.getRandomValues(randomBytes);

    const state = Array.from(randomBytes)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');

    // 추가: 카카오 콜백에서 검증할 state 저장
    sessionStorage.setItem('kakao_oauth_state', state);

    const kakaoAuthUrl =
      'https://kauth.kakao.com/oauth/authorize';


    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      state: state
    });


    // 카카오 인증 화면으로 이동
    window.location.href = `${kakaoAuthUrl}?${params.toString()}`;
  };

  return (
    <div className="login-page">
      <div className="login-form">

        {/* 제목 */}
        <div className="login-header">
          <h2>로그인</h2>
          <p>TuuddyBuddy에 오신 것을 환영합니다.</p>
        </div>

        {/* 이메일 */}
        <div className="login-input-group">
          <label htmlFor="email">이메일</label>

          <input
            id="email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일을 입력해주세요"
          />
        </div>

        {/* 비밀번호 */}
        <div className="login-input-group">
          <label htmlFor="password">비밀번호</label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                void handleLogin();
              }
            }}
            placeholder="비밀번호를 입력해주세요"
          />
        </div>

        {/* 기존 로그인 버튼 */}
        <button
          type="button"
          className="login-button"
          onClick={() => void handleLogin()}
          disabled={isLoading}
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </button>

        {/* 카카오 로그인 버튼 */}
        <button
          type="button"
          onClick={handleKakaoLogin}
          disabled={isLoading}
          style={{
            width: '100%',
            marginTop: '12px',
            padding: '13px',
            backgroundColor: '#FEE500',
            color: '#191919',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          카카오로 로그인
        </button>

        {/* 로그인 실패 메시지 */}
        {errorMessage && (
          <p
            role="alert"
            style={{
              color: '#d32f2f',
              marginTop: '12px'
            }}
          >
            {errorMessage}
          </p>
        )}

        {/* 회원가입 */}
        <div className="login-footer">
          <span>아직 회원이 아니신가요?</span>

          <Link to="/auth/signup">
            회원가입하기
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;

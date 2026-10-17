import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';

import { useAppDispatch } from './reducers/store';
import { login } from './authActions/authActions';

import './AuthModal.css';

interface AuthModalProps {
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {

  const dispatch = useAppDispatch();

  // 로그인 입력값
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 로그인 진행 상태
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 화면 단계: 이메일 입력 / 비밀번호 입력
  const [step, setStep] = useState<'email' | 'password'>('email');

  // 팝업 내부 접근성 처리
  const modalRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // ================================
  // 팝업 열림/닫힘 처리
  // ================================
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    emailInputRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }

      if (event.key === 'Tab' && modalRef.current) {
        const focusable = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input:not([disabled])'
          )
        );

        if (focusable.length === 0) {
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === last
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // ================================
  // 이메일 형식 검사
  // ================================
  const isValidEmail = (value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  // ================================
  // 이메일 다음 단계
  // ================================
  const handleContinue = () => {

    if (!email.trim()) {
      setErrorMessage('이메일을 입력해주세요.');
      return;
    }

    if (!isValidEmail(email.trim())) {
      setErrorMessage('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    setErrorMessage('');
    setStep('password');
  };

  // ================================
  // 일반 JWT 로그인
  // ================================
  const handleLogin = async () => {

    if (isLoading) {
      return;
    }

    if (!email.trim() || !password) {
      setErrorMessage('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      // 기존 Redux 로그인 액션 재사용
      const success = await dispatch(
        login(email.trim(), password)
      );

      if (success) {
        // 로그인 상태는 기존 Redux가 변경
        onClose();
      } else {
        setErrorMessage(
          '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.'
        );
      }
    } catch (error) {
      console.error('로그인 오류:', error);

      setErrorMessage(
        '로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ================================
  // 카카오 로그인
  // ================================
  const handleKakaoLogin = () => {

    const clientId =
      process.env.REACT_APP_KAKAO_REST_API_KEY;

    const redirectUri =
      `${window.location.origin}/auth/kakao/callback`;

    if (!clientId) {
      setErrorMessage(
        '카카오 REST API 키가 설정되지 않았습니다.'
      );
      return;
    }

    // OAuth state 생성
    const randomBytes = new Uint8Array(32);
    window.crypto.getRandomValues(randomBytes);

    const state = Array.from(randomBytes)
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');

    sessionStorage.setItem('kakao_oauth_state', state);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      state
    });

    window.location.href =
      `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
  };

  // ================================
  // 팝업 바깥 클릭
  // ================================
  const handleOverlayClick = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="tb-auth-overlay"
      onMouseDown={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="tb-auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tb-auth-title"
      >

        {/* 닫기 버튼 */}
        <button
          type="button"
          className="tb-auth-close"
          onClick={onClose}
          aria-label="로그인 창 닫기"
        >
          ×
        </button>

        {/* 상단 타이틀 */}
        <div className="tb-auth-header">
          <h2 id="tb-auth-title">
            로그인/회원가입
          </h2>

          <p>
            TuddyBuddy에 오신 것을 환영합니다.
          </p>
        </div>

        {/* 이메일 입력 */}
        <div className="tb-auth-field">
          <label htmlFor="tb-auth-email">
            이메일
          </label>

          <input
            ref={emailInputRef}
            id="tb-auth-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setErrorMessage('');
              setPassword('');
              setStep('email');
            }}
            placeholder="이메일 주소"
          />
        </div>

        {/* 비밀번호 입력 */}
        {step === 'password' && (
          <div className="tb-auth-field">
            <label htmlFor="tb-auth-password">
              비밀번호
            </label>

            <input
              id="tb-auth-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setErrorMessage('');
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  void handleLogin();
                }
              }}
              placeholder="비밀번호를 입력해주세요"
            />
          </div>
        )}

        {/* 오류 메시지 */}
        {errorMessage && (
          <p className="tb-auth-error" role="alert">
            {errorMessage}
          </p>
        )}

        {/* 계속하기 / 로그인 */}
        {step === 'email' ? (
          <button
            type="button"
            className="tb-auth-primary"
            onClick={handleContinue}
          >
            계속하기
          </button>
        ) : (
          <button
            type="button"
            className="tb-auth-primary"
            disabled={isLoading}
            onClick={() => void handleLogin()}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        )}

        {/* 회원가입 */}
        <div className="tb-auth-signup">
          <span>처음 방문하셨나요?</span>

          <Link
            to="/auth/signup"
            onClick={onClose}
          >
            회원가입하기
          </Link>
        </div>

        {/* 구분선 */}
        <div className="tb-auth-divider">
          <span>또는 다음으로 계속하기</span>
        </div>

        {/* 카카오 로그인 */}
        <button
          type="button"
          className="tb-auth-kakao"
          onClick={handleKakaoLogin}
          disabled={isLoading}
        >
          <span className="tb-auth-kakao-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2C5.925 2 1 5.76 1 10.4c0 3.02 2.08 5.67 5.2 7.15L5.15 21.4c-.1.36.3.65.61.44l4.53-3.08c.56.08 1.13.12 1.71.12 6.075 0 11-3.76 11-8.48S18.075 2 12 2z" />
            </svg>
          </span>

          <span>카카오로 계속하기</span>
        </button>

        {/* 하단 안내 */}
        <p className="tb-auth-notice">
          신규 회원가입 시 서비스 이용약관 및
          개인정보 수집·이용 동의를 별도로 확인합니다.
        </p>

      </div>
    </div>,
    document.body
  );
};

export default AuthModal;
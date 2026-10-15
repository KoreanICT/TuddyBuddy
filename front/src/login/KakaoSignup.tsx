
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../member/Signup.css';

// ==========================================
// 백엔드 서버 주소
// ==========================================
const API_URL =
  process.env.REACT_APP_BACK_END_URL ||
  'http://192.168.0.20:80/back';

// ==========================================
// 카카오 프로필 타입
// ==========================================
interface KakaoProfile {
  email?: string;
  name?: string;
  nickname?: string;
  phone?: string;
}

interface KakaoSignupLocationState {
  kakaoProfile?: KakaoProfile;
}

const KakaoSignup: React.FC = () => {

  const location = useLocation();

  const routeState =
    location.state as KakaoSignupLocationState | null;

  const kakaoProfile = routeState?.kakaoProfile;

  // ==========================================
  // 1. 회원 추가 정보
  // ==========================================
  const [email, setEmail] = useState(
    kakaoProfile?.email ?? ''
  );

  const [name, setName] = useState(
    kakaoProfile?.name ?? ''
  );

  const [nick, setNick] = useState(
    kakaoProfile?.nickname ?? ''
  );

  const [phone, setPhone] = useState(
    kakaoProfile?.phone ?? ''
  );

  // ==========================================
  // 2. 이메일 인증 상태
  // ==========================================
  const [emailCode, setEmailCode] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  // ==========================================
  // 3. 약관 동의
  // ==========================================
  const [termsAgree, setTermsAgree] = useState(false);
  const [privacyAgree, setPrivacyAgree] = useState(false);
  const [marketingAgree, setMarketingAgree] = useState(false);

  const [modalType, setModalType] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const allAgree =
    termsAgree && privacyAgree && marketingAgree;

  const handleAllAgree = (checked: boolean) => {
    setTermsAgree(checked);
    setPrivacyAgree(checked);
    setMarketingAgree(checked);
  };

  // ==========================================
  // 4. 가입용 임시 토큰 확인
  // ==========================================
  const getSignupToken = (): string | null => {
    return sessionStorage.getItem('kakao_signup_token');
  };

  // ==========================================
  // 5. 이메일 인증번호 발송
  // ==========================================
  const handleEmailSend = async () => {

    if (emailLoading) return;

    const signupToken = getSignupToken();

    if (!signupToken) {
      setMessage(
        '카카오 가입 인증정보가 없습니다. 카카오 로그인을 다시 진행해주세요.'
      );
      return;
    }

    if (!email.trim()) {
      setMessage('이메일을 입력해주세요.');
      return;
    }

    setEmailLoading(true);
    setEmailVerified(false);
    setVerificationToken('');
    setEmailCode('');
    setMessage('');

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/kakao/email/send`,
        {
          signupToken,
          email: email.trim()
        }
      );

      if (response.data.success === true) {
        setMessage('인증번호가 이메일로 발송되었습니다.');
      } else {
        setMessage(
          response.data.message ||
          '인증번호 발송에 실패했습니다.'
        );
      }

    } catch (error) {

      if (axios.isAxiosError(error)) {
        setMessage(
          error.response?.data?.message ||
          '인증번호 발송에 실패했습니다.'
        );
      } else {
        setMessage('인증번호 발송 중 오류가 발생했습니다.');
      }

    } finally {
      setEmailLoading(false);
    }
  };

  // ==========================================
  // 6. 이메일 인증번호 확인
  // ==========================================
  const handleEmailVerify = async () => {

    if (emailLoading || emailVerified) return;

    const signupToken = getSignupToken();

    if (!signupToken) {
      setMessage(
        '카카오 가입 인증정보가 없습니다. 다시 로그인해주세요.'
      );
      return;
    }

    if (!email.trim() || !emailCode.trim()) {
      setMessage('이메일과 인증번호를 모두 입력해주세요.');
      return;
    }

    setEmailLoading(true);
    setMessage('');

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/kakao/email/verify`,
        {
          signupToken,
          email: email.trim(),
          code: emailCode.trim()
        }
      );

      const receivedToken = response.data.verificationToken;

      if (
        response.data.success === true &&
        typeof receivedToken === 'string' &&
        receivedToken.length > 0
      ) {
        setVerificationToken(receivedToken);
        setEmailVerified(true);
        setMessage('이메일 인증이 완료되었습니다.');

      } else {
        setEmailVerified(false);
        setVerificationToken('');
        setMessage(
          response.data.message ||
          '이메일 인증에 실패했습니다.'
        );
      }

    } catch (error) {

      setEmailVerified(false);
      setVerificationToken('');

      if (axios.isAxiosError(error)) {
        setMessage(
          error.response?.data?.message ||
          '이메일 인증에 실패했습니다.'
        );
      } else {
        setMessage('이메일 인증 중 오류가 발생했습니다.');
      }

    } finally {
      setEmailLoading(false);
    }
  };

  // ==========================================
  // 7. 카카오 회원가입 입력값 검사
  // 실제 Oracle 저장 API는 다음 단계에서 연결
  // ==========================================
  const handleKakaoSignup = async (
  e: React.FormEvent
) => {
  e.preventDefault();
  setMessage('');

  const signupToken = getSignupToken();

  if (!signupToken) {
    setMessage('카카오 로그인을 다시 진행해주세요.');
    return;
  }

  if (!emailVerified || !verificationToken) {
    setMessage('이메일 인증을 먼저 완료해주세요.');
    return;
  }

  if (!termsAgree || !privacyAgree) {
    setMessage('필수 약관에 동의해주세요.');
    return;
  }

  try {
    const response = await axios.post(
      `${API_URL}/api/auth/kakao/signup`,
      {
        signupToken,
        verificationToken,
        email,
        name,
        nick,
        phone,
        termsAgree,
        privacyAgree,
        marketingAgree
      }
    );

    if (response.data.success === true) {
      setMessage('카카오 회원가입이 완료되었습니다.');

      // 여기서 JWT 저장 및 Redux 로그인 처리 연결
    } else {
      setMessage(
        response.data.message || '회원가입에 실패했습니다.'
      );
    }

  } catch (error) {
    if (axios.isAxiosError(error)) {
      setMessage(
        error.response?.data?.message ||
        '회원가입 중 오류가 발생했습니다.'
      );
    } else {
      setMessage('회원가입 중 오류가 발생했습니다.');
    }
  }
};

  // ==========================================
  // 8. 약관 모달 내용
  // ==========================================
  const modalContent: Record<
    string,
    { title: string; content: string }
  > = {
    terms: {
      title: '서비스 이용약관',
      content:
        'TuddyBuddy 서비스 이용약관입니다. ' +
        '기존 회원가입 페이지의 약관 내용을 연결할 예정입니다.'
    },

    privacy: {
      title: '개인정보 수집 및 이용 동의 (필수)',
      content:
        '카카오 회원가입에 필요한 이메일, 이름, 닉네임, ' +
        '전화번호 등의 수집 및 이용에 관한 동의입니다. ' +
        '실제 운영 전 수집 목적 및 보유 기간을 명시해야 합니다.'
    },

    marketing: {
      title: '마케팅 정보 수신 동의 (선택)',
      content:
        '서비스 소식 및 이벤트 안내 수신에 관한 선택 동의입니다. ' +
        '동의하지 않아도 회원가입할 수 있습니다.'
    }
  };

  const currentModal =
    modalType ? modalContent[modalType] : null;

  // ==========================================
  // 9. 화면
  // ==========================================
  return (
    <div className="signup-page">
      <div className="signup-container">

        {/* 제목 */}
        <div className="signup-header">
          <h2>카카오 회원가입</h2>

          <p>
            카카오에서 제공된 정보는 자동 입력됩니다.
            <br />
            비어 있는 항목만 입력해주세요.
          </p>
        </div>

        <form
          className="signup-form"
          onSubmit={handleKakaoSignup}
        >

          {/* ==================================
              이메일
          ================================== */}
          <div className="signup-input-group">
            <label htmlFor="kakao-email">
              이메일
            </label>

            <div className="signup-input-button">

              <input
                id="kakao-email"
                type="email"
                placeholder="이메일을 입력해주세요"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailVerified(false);
                  setVerificationToken('');
                  setEmailCode('');
                  setMessage('');
                }}
                disabled={emailLoading}
                required
              />

              <button
                type="button"
                onClick={() => void handleEmailSend()}
                disabled={emailLoading}
              >
                {emailLoading ? '처리 중...' : '인증요청'}
              </button>

            </div>
          </div>

          {/* ==================================
              이메일 인증번호
          ================================== */}
          <div className="signup-input-group">
            <label htmlFor="kakao-email-code">
              이메일 인증번호
            </label>

            <div className="signup-input-button">

              <input
                id="kakao-email-code"
                type="text"
                placeholder="인증번호를 입력해주세요"
                value={emailCode}
                onChange={(e) =>
                  setEmailCode(e.target.value)
                }
                disabled={emailLoading || emailVerified}
              />

              <button
                type="button"
                onClick={() => void handleEmailVerify()}
                disabled={emailLoading || emailVerified}
              >
                확인
              </button>

            </div>

            {emailVerified && (
              <p className="email-verified-text">
                이메일 인증 완료
              </p>
            )}
          </div>

          {/* ==================================
              이름
          ================================== */}
          <div className="signup-input-group">
            <label htmlFor="kakao-name">
              이름
            </label>

            <input
              id="kakao-name"
              type="text"
              placeholder="이름을 입력해주세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* ==================================
              닉네임
          ================================== */}
          <div className="signup-input-group">
            <label htmlFor="kakao-nick">
              닉네임
            </label>

            <input
              id="kakao-nick"
              type="text"
              placeholder="닉네임을 입력해주세요"
              value={nick}
              onChange={(e) => setNick(e.target.value)}
              required
            />
          </div>

          {/* ==================================
              전화번호
          ================================== */}
          <div className="signup-input-group">
            <label htmlFor="kakao-phone">
              전화번호
            </label>

            <input
              id="kakao-phone"
              type="tel"
              placeholder="010-0000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              style={{
                width: '100%',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* ==================================
              약관 동의
          ================================== */}
          <div className="signup-agreement">

            {/* 전체 동의 */}
            <div className="agreement-all">
              <label>
                <input
                  type="checkbox"
                  checked={allAgree}
                  onChange={(e) =>
                    handleAllAgree(e.target.checked)
                  }
                />
                <span>전체 동의하기</span>
              </label>
            </div>

            {/* 이용약관 */}
            <div className="agreement-item">
              <label>
                <input
                  type="checkbox"
                  checked={termsAgree}
                  onChange={(e) =>
                    setTermsAgree(e.target.checked)
                  }
                />

                <span>
                  <em>(필수) </em>
                  서비스 이용약관 동의
                </span>
              </label>

              <button
                type="button"
                className="agreement-view-btn"
                onClick={() => setModalType('terms')}
              >
                [보기]
              </button>
            </div>

            {/* 개인정보 수집 동의 */}
            <div className="agreement-item">
              <label>
                <input
                  type="checkbox"
                  checked={privacyAgree}
                  onChange={(e) =>
                    setPrivacyAgree(e.target.checked)
                  }
                />

                <span>
                  <em>(필수) </em>
                  개인정보 수집 및 이용 동의
                </span>
              </label>

              <button
                type="button"
                className="agreement-view-btn"
                onClick={() => setModalType('privacy')}
              >
                [보기]
              </button>
            </div>

            {/* 마케팅 동의 */}
            <div className="agreement-item">
              <label>
                <input
                  type="checkbox"
                  checked={marketingAgree}
                  onChange={(e) =>
                    setMarketingAgree(e.target.checked)
                  }
                />

                <span>
                  <em className="optional">
                    (선택){' '}
                  </em>
                  마케팅 정보 수신 동의
                </span>
              </label>

              <button
                type="button"
                className="agreement-view-btn"
                onClick={() => setModalType('marketing')}
              >
                [보기]
              </button>
            </div>

          </div>

          {/* ==================================
              안내 메시지
          ================================== */}
          {message && (
            <p
              role="status"
              style={{
                marginTop: '12px',
                color: '#555'
              }}
            >
              {message}
            </p>
          )}

          {/* ==================================
              하단 버튼
          ================================== */}
          <div className="signup-buttons">

            <Link
              to="/auth/member"
              className="signup-back-button"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                boxSizing: 'border-box'
              }}
            >
              로그인으로
            </Link>

            <button
              type="submit"
              className="signup-submit-button"
            >
              추가 정보 확인
            </button>

          </div>
        </form>
      </div>

      {/* ==================================
          약관 모달
      ================================== */}
      {currentModal && (
        <div className="modal-overlay">
          <div className="modal-card">

            <div className="modal-header">
              <h3>{currentModal.title}</h3>
            </div>

            <div className="modal-body">
              <p className="agreement-content">
                {currentModal.content}
              </p>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setModalType(null)}
              >
                확인
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default KakaoSignup;

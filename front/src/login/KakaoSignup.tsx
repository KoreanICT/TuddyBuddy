import React, { useState } from 'react';
import {
  Link,
  useLocation,
  useNavigate
} from 'react-router-dom';
import axios from 'axios';
import { useAppDispatch } from './reducers/store';
import { loginSuccess } from './reducers/authReducer';
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
// ==========================================
// 카카오 회원가입 응답 타입
// ==========================================
interface KakaoSignupResponse {
  success: boolean;
  registered?: boolean;
  access_token?: string;
  member_num?: number;
  authority?: string;
  username?: string;
  message?: string;
}
const KakaoSignup: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
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
  const [emailVerified, setEmailVerified] =
    useState(false);
  const [verificationToken, setVerificationToken] =
    useState('');
  const [emailLoading, setEmailLoading] =
    useState(false);
  // ==========================================
  // 3. 닉네임 중복확인 상태
  // ==========================================
  const [verifiedNick, setVerifiedNick] =
    useState('');
  const [nickStatus, setNickStatus] = useState<
    'idle' | 'available' | 'duplicate' | 'error'
  >('idle');
  const [nickChecking, setNickChecking] =
    useState(false);
  // ==========================================
  // 4. 약관 동의
  // ==========================================
  const [termsAgree, setTermsAgree] =
    useState(false);
  const [privacyAgree, setPrivacyAgree] =
    useState(false);
  const [marketingAgree, setMarketingAgree] =
    useState(false);
  const [modalType, setModalType] =
    useState<string | null>(null);
  const [message, setMessage] = useState('');
  // ==========================================
  // 5. 회원가입 진행 상태
  // ==========================================
  const [signupLoading, setSignupLoading] =
    useState(false);
  const allAgree =
    termsAgree && privacyAgree && marketingAgree;
  const handleAllAgree = (checked: boolean) => {
    setTermsAgree(checked);
    setPrivacyAgree(checked);
    setMarketingAgree(checked);
  };
  // ==========================================
  // 6. 가입용 임시 토큰 확인
  // ==========================================
  const getSignupToken = (): string | null => {
    return sessionStorage.getItem(
      'kakao_signup_token'
    );
  };
  // ==========================================
  // 7. 닉네임 유효성 검사
  // ==========================================
  const validateNickname = (
    nickname: string
  ): string | null => {
    const value = nickname.trim();
    if (!value) {
      return '닉네임을 입력해주세요.';
    }
    if (value.length < 2 || value.length > 12) {
      return '닉네임은 2~12자로 입력해주세요.';
    }
    // 완성형 한글, 영문, 숫자만 허용
    const nickRegex = /^[가-힣a-zA-Z0-9]+$/;
    if (!nickRegex.test(value)) {
      return '완성형 한글, 영문, 숫자만 사용할 수 있습니다.';
    }
    // 숫자로만 이루어진 닉네임 금지
    if (/^[0-9]+$/.test(value)) {
      return '숫자로만 이루어진 닉네임은 사용할 수 없습니다.';
    }
    // 특정 닉네임 사용 금지
    const forbiddenNicks = [
      '관리자',
      '운영자',
      'admin',
      'administrator'
    ];
    if (forbiddenNicks.includes(value.toLowerCase())) {
      return '사용할 수 없는 닉네임입니다.';
    }
    return null;
  };
  // ==========================================
  // 8. 닉네임 중복확인
  // ==========================================
  const handleNickCheck = async () => {
    if (nickChecking || signupLoading) {
      return;
    }
    const nickname = nick.trim();
    // 먼저 형식 검사
    const validationError =
      validateNickname(nickname);
    if (validationError) {
      setMessage(validationError);
      setNickStatus('error');
      setVerifiedNick('');
      return;
    }
    setNickChecking(true);
    setNickStatus('idle');
    setVerifiedNick('');
    setMessage('');
    try {
      const response = await axios.get(
        `${API_URL}/api/member/nickCheck`,
        {
          params: {
            nick: nickname
          },
          withCredentials: true
        }
      );
      const count = Number(response.data);
      // 요청 중 닉네임이 바뀌었는지도 검사
      // 입력창은 nickChecking 동안 비활성화됨
      if (count === 0) {
        setVerifiedNick(nickname);
        setNickStatus('available');
        setMessage(
          '사용 가능한 닉네임입니다.'
        );
      } else if (
        Number.isFinite(count) &&
        count > 0
      ) {
        setVerifiedNick('');
        setNickStatus('duplicate');
        setMessage(
          '이미 사용 중인 닉네임입니다.'
        );
      } else {
        setVerifiedNick('');
        setNickStatus('error');
        setMessage(
          '닉네임 중복확인 결과를 확인할 수 없습니다.'
        );
      }
    } catch (error) {
      console.error(
        '닉네임 중복확인 오류:',
        error
      );
      setVerifiedNick('');
      setNickStatus('error');
      setMessage(
        '닉네임 중복확인 중 오류가 발생했습니다.'
      );
    } finally {
      setNickChecking(false);
    }
  };
  // ==========================================
  // 9. 닉네임 변경
  // ==========================================
  const handleNickChange = (
    value: string
  ) => {
    setNick(value);
    // 닉네임을 변경하면 이전 중복확인 결과 무효화
    setVerifiedNick('');
    setNickStatus('idle');
    setMessage('');
  };
  // ==========================================
  // 10. 이메일 인증번호 발송
  // ==========================================
  const handleEmailSend = async () => {
    if (emailLoading || signupLoading) {
      return;
    }
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
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setMessage(
        '올바른 이메일 형식을 입력해주세요.'
      );
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
        setMessage(
          '인증번호가 이메일로 발송되었습니다.'
        );
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
        setMessage(
          '인증번호 발송 중 오류가 발생했습니다.'
        );
      }
    } finally {
      setEmailLoading(false);
    }
  };
  // ==========================================
  // 11. 이메일 인증번호 확인
  // ==========================================
  const handleEmailVerify = async () => {
    if (
      emailLoading ||
      emailVerified ||
      signupLoading
    ) {
      return;
    }
    const signupToken = getSignupToken();
    if (!signupToken) {
      setMessage(
        '카카오 가입 인증정보가 없습니다. 다시 로그인해주세요.'
      );
      return;
    }
    if (!email.trim() || !emailCode.trim()) {
      setMessage(
        '이메일과 인증번호를 모두 입력해주세요.'
      );
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
      const receivedToken =
        response.data.verificationToken;
      if (
        response.data.success === true &&
        typeof receivedToken === 'string' &&
        receivedToken.length > 0
      ) {
        setVerificationToken(receivedToken);
        setEmailVerified(true);
        setMessage(
          '이메일 인증이 완료되었습니다.'
        );
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
        setMessage(
          '이메일 인증 중 오류가 발생했습니다.'
        );
      }
    } finally {
      setEmailLoading(false);
    }
  };
  // ==========================================
  // 12. 카카오 회원가입 + JWT 자동 로그인
  // ==========================================
  const handleKakaoSignup = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    if (signupLoading) {
      return;
    }
    setMessage('');
    const signupToken = getSignupToken();
    // 가입용 임시 토큰 검사
    if (!signupToken) {
      setMessage(
        '카카오 로그인을 다시 진행해주세요.'
      );
      return;
    }
    // 이메일 인증 검사
    if (!emailVerified || !verificationToken) {
      setMessage(
        '이메일 인증을 먼저 완료해주세요.'
      );
      return;
    }
    // 필수 정보 검사
    if (
      !email.trim() ||
      !name.trim() ||
      !nick.trim() ||
      !phone.trim()
    ) {
      setMessage(
        '필수 정보를 모두 입력해주세요.'
      );
      return;
    }
    // 닉네임 유효성 검사
    const validationError =
      validateNickname(nick);
    if (validationError) {
      setMessage(validationError);
      return;
    }
    // 닉네임 중복확인 완료 여부
    if (
      nickStatus !== 'available' ||
      verifiedNick !== nick.trim()
    ) {
      setMessage(
        '닉네임 중복확인을 완료해주세요.'
      );
      return;
    }
    // 필수 약관 동의
    if (!termsAgree || !privacyAgree) {
      setMessage(
        '필수 약관에 동의해주세요.'
      );
      return;
    }
    setSignupLoading(true);
    try {
      // ==========================================
      // Oracle 회원가입 API 호출
      // ==========================================
      const response =
        await axios.post<KakaoSignupResponse>(
          `${API_URL}/api/auth/kakao/signup`,
          {
            signupToken,
            verificationToken,
            email: email.trim(),
            name: name.trim(),
            nick: nick.trim(),
            phone: phone.trim(),
            termsAgree,
            privacyAgree,
            marketingAgree
          }
        );
      const data = response.data;
      if (data.success !== true) {
        setMessage(
          data.message ||
          '카카오 회원가입에 실패했습니다.'
        );
        return;
      }
      // ==========================================
      // JWT 로그인 정보 확인
      // ==========================================
      const token = data.access_token;
      const username = data.username;
      const member_num = data.member_num;
      const authority = data.authority;
      if (
        typeof token !== 'string' ||
        !token ||
        typeof username !== 'string' ||
        !username ||
        typeof member_num !== 'number' ||
        !Number.isFinite(member_num) ||
        typeof authority !== 'string' ||
        !authority
      ) {
        setMessage(
          '회원가입은 완료되었지만 로그인 정보를 받지 못했습니다. 카카오 로그인을 다시 진행해주세요.'
        );
        return;
      }
      // ==========================================
      // localStorage 로그인 정보 저장
      // ==========================================
      localStorage.setItem(
        'token',
        token
      );
      localStorage.setItem(
        'username',
        username
      );
      localStorage.setItem(
        'member_num',
        String(member_num)
      );
      localStorage.setItem(
        'authority',
        authority
      );
      // ==========================================
      // Redux 로그인 상태 업데이트
      // ==========================================
      dispatch(
        loginSuccess({
          username,
          token,
          member_num,
          authority
        })
      );
      // ==========================================
      // 가입용 임시 토큰 제거
      // ==========================================
      sessionStorage.removeItem(
        'kakao_signup_token'
      );
      // ==========================================
      // 메인 페이지 이동
      // ==========================================
      console.log(
        '===== 카카오 회원가입 및 JWT 로그인 성공 ====='
      );
      navigate('/', {
        replace: true
      });
    } catch (error) {
      console.error(
        '카카오 회원가입 오류:',
        error
      );
      if (axios.isAxiosError(error)) {
        setMessage(
          error.response?.data?.message ||
          '카카오 회원가입 중 오류가 발생했습니다.'
        );
      } else {
        setMessage(
          '카카오 회원가입 중 오류가 발생했습니다.'
        );
      }
    } finally {
      setSignupLoading(false);
    }
  };
  // ==========================================
  // 13. 약관 모달 내용
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
  // 14. 화면
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
                disabled={emailLoading || signupLoading}
                required
              />
              <button
                type="button"
                onClick={() => void handleEmailSend()}
                disabled={emailLoading || signupLoading}
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
                disabled={
                  emailLoading ||
                  emailVerified ||
                  signupLoading
                }
              />
              <button
                type="button"
                onClick={() => void handleEmailVerify()}
                disabled={
                  emailLoading ||
                  emailVerified ||
                  signupLoading
                }
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
              disabled={signupLoading}
              required
            />
          </div>
          {/* ==================================
              닉네임 + 중복확인
          ================================== */}
          <div className="signup-input-group">
            <label htmlFor="kakao-nick">
              닉네임
            </label>
            <div className="signup-input-button">
              <input
                id="kakao-nick"
                type="text"
                placeholder="닉네임을 입력해주세요"
                value={nick}
                maxLength={12}
                onChange={(e) =>
                  handleNickChange(e.target.value)
                }
                disabled={nickChecking || signupLoading}
                required
              />
              <button
                type="button"
                onClick={() => void handleNickCheck()}
                disabled={nickChecking || signupLoading}
              >
                {nickChecking ? '확인 중...' : '중복확인'}
              </button>
            </div>
            {/* 닉네임 검사 결과 */}
            {nickStatus === 'available' && (
              <p
                style={{
                  color: '#16a34a',
                  fontSize: '13px',
                  marginTop: '7px'
                }}
              >
                사용 가능한 닉네임입니다.
              </p>
            )}
            {nickStatus === 'duplicate' && (
              <p
                style={{
                  color: '#dc2626',
                  fontSize: '13px',
                  marginTop: '7px'
                }}
              >
                이미 사용 중인 닉네임입니다.
              </p>
            )}
            <p
              style={{
                color: '#888',
                fontSize: '12px',
                marginTop: '5px'
              }}
            >
              2~12자, 완성형 한글·영문·숫자 사용 가능
            </p>
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
              onChange={(e) =>
                setPhone(e.target.value)
              }
              disabled={signupLoading}
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
                  disabled={signupLoading}
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
                  disabled={signupLoading}
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
                  disabled={signupLoading}
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
                  disabled={signupLoading}
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
                color:
                  message.includes('오류') ||
                  message.includes('실패') ||
                  message.includes('중복') ||
                  message.includes('완료해주세요')
                    ? '#dc2626'
                    : '#555'
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
              disabled={
                signupLoading ||
                emailLoading ||
                nickChecking
              }
            >
              {signupLoading
                ? '회원가입 처리 중...'
                : '카카오 회원가입 완료'}
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
                onClick={() =>
                  setModalType(null)
                }
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
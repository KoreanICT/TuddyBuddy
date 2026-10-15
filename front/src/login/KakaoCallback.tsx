
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

// 백엔드 서버 주소
const API_URL = 'http://192.168.0.20:80/back';

// React StrictMode 개발 환경에서
// 같은 인가 코드로 중복 요청하지 않도록 관리
const pendingCodes = new Set<string>();

const KakaoCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [message, setMessage] = useState(
    '카카오 로그인 처리 중...'
  );

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const returnedState = searchParams.get('state');

    // ==========================================
    // 1. 카카오 로그인 오류 확인
    // ==========================================
    if (error) {
      sessionStorage.removeItem('kakao_oauth_state');
      setMessage('카카오 로그인이 취소되었거나 실패했습니다.');
      return;
    }

    // ==========================================
    // 2. OAuth state 검증
    // ==========================================
    const savedState =
      sessionStorage.getItem('kakao_oauth_state');

    // 이미 처리 중인 인가 코드라면 중복 요청하지 않음
    if (code && pendingCodes.has(code)) {
      return;
    }

    if (
      !savedState ||
      !returnedState ||
      savedState !== returnedState
    ) {
      setMessage('카카오 로그인 요청 검증에 실패했습니다.');
      return;
    }

    if (!code) {
      setMessage('카카오 인가 코드를 받지 못했습니다.');
      return;
    }

    // 인가 코드 재사용 방지
    pendingCodes.add(code);

    // 사용한 state 제거
    sessionStorage.removeItem('kakao_oauth_state');

    // ==========================================
    // 3. Spring Boot 카카오 로그인 처리
    // ==========================================
    const handleCallback = async () => {
      try {
        const response = await axios.post(
          `${API_URL}/api/auth/kakao/callback`,
          { code }
        );

        if (response.data.success !== true) {
          setMessage('카카오 인증 처리에 실패했습니다.');
          return;
        }

        // ==========================================
        // 4. 신규 카카오 회원
        // ==========================================
        if (response.data.registered === false) {
          const signupToken = response.data.signupToken;

          if (
            typeof signupToken !== 'string' ||
            !signupToken
          ) {
            setMessage(
              '카카오 회원가입 인증정보를 받지 못했습니다.'
            );
            return;
          }

          // 현재 브라우저 탭에 가입용 임시 토큰 저장
          sessionStorage.setItem(
            'kakao_signup_token',
            signupToken
          );

          console.log(
            '신규 카카오 회원 확인, 추가 정보 입력 페이지로 이동'
          );


          navigate('/auth/kakao/signup', {
            replace: true,
            state: {
              kakaoProfile: response.data.kakaoProfile
            }
          });


          return;
        }

        // ==========================================
        // 5. 기존 카카오 회원
        // ==========================================
        if (response.data.registered === true) {
          setMessage(
            '기존 카카오 회원 확인 완료! JWT 로그인 연동 대기 중입니다.'
          );
          return;
        }

        setMessage(
          '카카오 회원 확인 결과를 가져오지 못했습니다.'
        );

      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(
            '카카오 인증 API 오류:',
            error.response?.status
          );
        }

        setMessage(
          '카카오 로그인 처리 중 오류가 발생했습니다.'
        );
      }
    };

    void handleCallback();

  }, [searchParams, navigate]);

  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px'
      }}
    >
      <h2>카카오 로그인</h2>

      <p>{message}</p>

      <Link to="/auth/member">
        로그인 페이지로 돌아가기
      </Link>
    </div>
  );
};

export default KakaoCallback;

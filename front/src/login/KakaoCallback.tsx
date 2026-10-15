import React, { useEffect, useState } from 'react';
import {
  Link,
  useNavigate,
  useSearchParams
} from 'react-router-dom';

import axios from 'axios';

import { useAppDispatch } from './reducers/store';
import { loginSuccess } from './reducers/authReducer';

// 백엔드 서버 주소
const API_URL =
  process.env.REACT_APP_BACK_END_URL ||
  'http://192.168.0.20:80/back';

// React StrictMode 개발 환경에서
// 동일한 카카오 인가 코드로 중복 요청하지 않도록 관리
const pendingCodes = new Set<string>();

// ==========================================
// 카카오 로그인 응답 타입
// ==========================================
interface KakaoLoginResponse {
  success: boolean;
  registered: boolean;
  access_token?: string;
  member_num?: number;
  authority?: string;
  username?: string;
  signupToken?: string;
  kakaoProfile?: {
    email?: string;
    name?: string;
    nickname?: string;
    phone?: string;
  };
  message?: string;
}

const KakaoCallback: React.FC = () => {

  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  const [message, setMessage] = useState(
    '카카오 로그인 처리 중...'
  );

  // ==========================================
  // 카카오 로그인 콜백 처리
  // ==========================================
  useEffect(() => {

    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const returnedState = searchParams.get('state');

    // ==========================================
    // 1. 카카오 로그인 오류 확인
    // ==========================================
    if (error) {

      sessionStorage.removeItem(
        'kakao_oauth_state'
      );

      setMessage(
        '카카오 로그인이 취소되었거나 실패했습니다.'
      );

      return;
    }

    // ==========================================
    // 2. OAuth state 검증
    // ==========================================

    const savedState =
      sessionStorage.getItem(
        'kakao_oauth_state'
      );

    // 이미 처리 중인 인가 코드라면
    // 중복 요청하지 않음
    if (code && pendingCodes.has(code)) {
      return;
    }

    if (
      !savedState ||
      !returnedState ||
      savedState !== returnedState
    ) {

      setMessage(
        '카카오 로그인 요청 검증에 실패했습니다.'
      );

      return;
    }

    if (!code) {

      setMessage(
        '카카오 인가 코드를 받지 못했습니다.'
      );

      return;
    }

    // 중복 요청 방지
    pendingCodes.add(code);

    // 사용한 state 삭제
    sessionStorage.removeItem(
      'kakao_oauth_state'
    );

    // ==========================================
    // 3. Spring Boot 카카오 로그인 처리
    // ==========================================
    const handleCallback = async () => {

      try {

        const response = await axios.post<KakaoLoginResponse>(
          `${API_URL}/api/auth/kakao/callback`,
          { code }
        );

        const data = response.data;

        if (data.success !== true) {

          setMessage(
            data.message ||
            '카카오 인증 처리에 실패했습니다.'
          );

          return;
        }

        // ==========================================
        // 4. 신규 카카오 회원
        // ==========================================
        if (data.registered === false) {

          const signupToken = data.signupToken;

          if (
            typeof signupToken !== 'string' ||
            !signupToken
          ) {

            setMessage(
              '카카오 회원가입 인증정보를 받지 못했습니다.'
            );

            return;
          }

          // 현재 브라우저 탭에
          // 신규 회원가입용 임시 토큰 저장
          sessionStorage.setItem(
            'kakao_signup_token',
            signupToken
          );

          console.log(
            '===== 신규 카카오 회원 확인 ====='
          );

          // 추가정보 입력 페이지로 이동
          navigate('/auth/kakao/signup', {

            replace: true,

            state: {
              kakaoProfile: data.kakaoProfile
            }

          });

          return;
        }

        // ==========================================
        // 5. 기존 카카오 회원
        // ==========================================
        if (data.registered === true) {

          setMessage(
            '카카오 회원 확인 완료. 로그인 처리 중...'
          );

          // 백엔드에서 JWT 및 회원정보 받기
          const token = data.access_token;
          const member_num = data.member_num;
          const authority = data.authority;
          const username = data.username;

          // ==========================================
          // 6. JWT 토큰 검사
          // ==========================================
          if (
            typeof token !== 'string' ||
            !token
          ) {

            setMessage(
              '카카오 로그인 JWT 토큰을 받지 못했습니다.'
            );

            return;
          }

          // ==========================================
          // 7. 회원정보 검사
          // ==========================================
          if (
            typeof username !== 'string' ||
            !username.trim() ||
            typeof member_num !== 'number' ||
            !Number.isFinite(member_num) ||
            typeof authority !== 'string' ||
            !authority
          ) {

            setMessage(
              '카카오 회원정보를 확인할 수 없습니다.'
            );

            return;
          }

          // ==========================================
          // 8. localStorage 로그인 정보 저장
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
          // 9. Redux 로그인 상태 업데이트
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
          // 10. 로그인 성공
          // ==========================================
          console.log(
            '===== 카카오 JWT 로그인 성공 ====='
          );

          console.log(
            '회원번호:',
            member_num
          );

          console.log(
            '권한:',
            authority
          );

          console.log(
            'JWT 발급 여부:',
            Boolean(token)
          );

          setMessage(
            '카카오 로그인 성공! 메인 페이지로 이동합니다.'
          );

          // 남아 있는 가입용 임시 토큰 제거
          sessionStorage.removeItem(
            'kakao_signup_token'
          );

          // ==========================================
          // 11. 메인 페이지 이동
          // ==========================================
          navigate('/', {
            replace: true
          });

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

          console.error(
            '서버 오류 메시지:',
            error.response?.data?.message
          );

        } else {

          console.error(
            '카카오 로그인 처리 오류:',
            error
          );

        }

        setMessage(
          '카카오 로그인 처리 중 오류가 발생했습니다.'
        );
      }
    };

    void handleCallback();

  }, [searchParams, navigate, dispatch]);

  // ==========================================
  // 카카오 로그인 처리 화면
  // ==========================================
  return (

    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        padding: '24px',
        textAlign: 'center'
      }}
    >

      <h2>
        카카오 로그인
      </h2>

      <p role="status">
        {message}
      </p>

      <Link to="/">
        메인 페이지로 돌아가기
      </Link>

      <Link to="/auth/member">
        기존 로그인 페이지로 돌아가기
      </Link>

    </div>
  );
};

export default KakaoCallback;
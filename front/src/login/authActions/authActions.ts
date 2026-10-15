
import axios from 'axios';
import {
  loginSuccess,
  loginFailure,
  logout
} from '../reducers/authReducer';

import { AppDispatch } from '../reducers/store';

// 백엔드 서버 주소
const API_URL = 'http://localhost:80/back/api/auth';

// ======================================================
// 로그인
// ======================================================
export const login = (username: string, password: string) =>
  async (dispatch: AppDispatch): Promise<boolean> => {

    try {
      // Spring Boot 로그인 API 호출
      const response = await axios.post(
        `${API_URL}/login`,
        { username, password }
      );

      // 백엔드에서 반환한 로그인 정보
      const token = response.data.accessToken;
      const member_num = response.data.member_num;
      const authority = response.data.authority;

      // JWT 검사
      if (typeof token !== 'string' || !token) {
        dispatch(loginFailure('JWT 토큰이 없습니다.'));
        return false;
      }

      // 회원번호 및 권한 검사
      if (
        typeof member_num !== 'number' ||
        !Number.isFinite(member_num) ||
        typeof authority !== 'string' ||
        !authority
      ) {
        dispatch(loginFailure('회원정보를 확인할 수 없습니다.'));
        return false;
      }

      // Local Storage에 로그인 정보 저장
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);

      // 추가: 회원번호와 권한 저장
      localStorage.setItem('member_num', String(member_num));
      localStorage.setItem('authority', authority);

      // Redux 로그인 상태 업데이트
      dispatch(loginSuccess({
        username,
        token,
        member_num,
        authority
      }));

      // 로그인 성공 콘솔 출력
      console.log('===== 로그인 성공 =====');
      console.log('이메일:', username);
      console.log('회원번호:', member_num);
      console.log('권한:', authority);
      console.log('JWT 발급 여부:', Boolean(token));

      return true;

    } catch (error) {

      if (axios.isAxiosError(error)) {
        dispatch(loginFailure('로그인에 실패했습니다.'));
      } else {
        dispatch(loginFailure('알 수 없는 오류가 발생했습니다.'));
      }

      return false;
    }
  };


// ======================================================
// 로그아웃
// ======================================================

export const logoutAction = () =>
  async (dispatch: AppDispatch) => {

    // Local Storage에서 로그인 정보 제거
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('member_num');
    localStorage.removeItem('authority');

    // Redux 로그인 상태 초기화
    dispatch(logout());

    console.log('===== 로그아웃 완료 =====');
  };


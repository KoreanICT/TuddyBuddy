
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthSession, currentToken } from '../session';

// 어떤 상태를 관리할지 정의하는 인터페이스
interface AuthState extends Omit<AuthSession, 'member_num'> {
  member_num: number | null;
  error: string | null;
}

// 상태의 초기값 설정
const initialState: AuthState = {
  username: localStorage.getItem('username') || '',
  token: currentToken(),

  // 추가: 새로고침 시 회원정보 복원
  member_num: localStorage.getItem('member_num')
    ? Number(localStorage.getItem('member_num'))
    : null,

  authority: localStorage.getItem('authority') || '',

  error: null
};

// 상태 조각을 관리하는 슬라이스 생성
const authSlice = createSlice({
  name: 'auth',

  initialState,

  reducers: {

    // 로그인 성공
    loginSuccess(
      state,
      action: PayloadAction<AuthSession>
    ) {
      state.username = action.payload.username;
      state.token = action.payload.token;

      // 추가
      state.member_num = action.payload.member_num;
      state.authority = action.payload.authority;

      state.error = null;
    },

    // 로그인 실패
    loginFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },

    // 로그아웃
    logout(state) {
      state.username = '';
      state.token = '';

      // 추가
      state.member_num = null;
      state.authority = '';

      state.error = null;
    }
  }
});

// 액션 생성자 내보내기
export const { loginSuccess, loginFailure, logout } = authSlice.actions;

// 리듀서 내보내기
export default authSlice.reducer;

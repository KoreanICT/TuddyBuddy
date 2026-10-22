import axios from 'axios';
import { loginFailure } from '../reducers/authReducer';
import { AppDispatch } from '../reducers/store';
import { authOperation, BACKEND_URL, serverLogout } from '../authHttp';
import { saveSession, sessionFromResponse } from '../session';

export const login = (username: string, password: string) =>
  async (dispatch: AppDispatch): Promise<boolean> => {
    try {
      return await authOperation(async ticket => {
        const response = await axios.post(`${BACKEND_URL}/api/auth/login`,
          { username, password }, { withCredentials: true, timeout: 15000 });
        const session = sessionFromResponse({ ...response.data, username: response.data.username || username });
        return saveSession(session, ticket);
      });
    } catch {
      dispatch(loginFailure('로그인에 실패했습니다.'));
      return false;
    }
  };

// Failure still clears local auth and persists refresh suppression until explicit sign-in.
export const logoutAction = () => async (): Promise<boolean> => serverLogout();

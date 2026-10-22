// 주용현

import { useSelector } from 'react-redux';
import type { RootState } from '../reducers/store';

export const useAuth = () => {
    const { username, token, member_num, authority } = useSelector(
        (state: RootState) => state.auth
    );

    return {
        username,
        token,
        memberNum: member_num,
        authority,
        isLoggedIn: !!token
    };
};
import axios from 'axios';
import store from '../../login/reducers/store';

const api = axios.create({
    baseURL: 'http://localhost:80/back/api',
});

api.interceptors.request.use((config) => {
    // 요청 시점의 Redux 로그인 정보
    const { token, member_num } = store.getState().auth;

    const isLogin = Boolean(token && member_num !== null);

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        delete config.headers.Authorization;
    }
    
    if (isLogin) {
        config.headers.memberNum = String(member_num);
    } else {
        delete config.headers.memberNum;
    }

    return config;
});

export default api;

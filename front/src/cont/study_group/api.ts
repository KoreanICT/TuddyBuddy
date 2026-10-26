import axios from 'axios';
import store from '../../login/reducers/store';

const api = axios.create({
    baseURL: 'http://localhost/back/api',
});

api.interceptors.request.use((config) => {
    // 요청 시점의 Redux 로그인 정보
    const { token } = store.getState().auth;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        delete config.headers.Authorization;
    }

    return config;
});

export default api;

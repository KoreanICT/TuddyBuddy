import axios from 'axios';
import { BACKEND_URL, installAuthInterceptors } from '../../login/authHttp';

const api = axios.create({
    baseURL: `${BACKEND_URL}/api`,
    timeout: 15000,
});

installAuthInterceptors(api);

export default api;

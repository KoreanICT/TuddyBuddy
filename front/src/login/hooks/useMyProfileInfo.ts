import { BACKEND_URL } from '../authHttp';

 // 주용현

import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';

interface MyProfileInfo {
    member_nick: string;
    member_code: string;
}

interface MyProfileResponse {
    MEMBER_NICK?: string;
    MEMBER_CODE?: string;
    member_nick?: string;
    member_code?: string;
}

export const useMyProfileInfo  = () => {
    const { memberNum, token } = useAuth();

    const getAuthHeaders = useCallback(() => ({
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    }), [token]);

    const [profile, setProfile] = useState<MyProfileInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 로그인 회원 정보 조회
    useEffect(() => {
        if (!token || memberNum == null) {
            setProfile(null);
            setLoading(false);
            setError(null);
            return;
        }

        let cancelled = false;

        const fetchProfile = async () => {
            setProfile(null);
            setLoading(true);
            setError(null);

            try {
                const urls = `${BACKEND_URL}/api/member/memberProfile`;

                const response = await axios.get<MyProfileResponse>(urls, {
                    headers: getAuthHeaders(),
                    params: { member_num: memberNum }
                });

                if (cancelled) return;

                setProfile({
                    member_nick: response.data.member_nick ?? response.data.MEMBER_NICK ?? '',
                    member_code: response.data.member_code ?? response.data.MEMBER_CODE ?? ''
                });
            } catch (error) {
                if (cancelled) return;

                console.error('내 회원 정보 조회 실패:', error);
                setProfile(null);
                setError('회원 정보를 불러오지 못했습니다.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchProfile();

        return () => {
            cancelled = true;
        };
    }, [memberNum, token, getAuthHeaders]);

    return { profile, loading, error };
};

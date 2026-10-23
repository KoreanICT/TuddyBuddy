import { BACKEND_URL, memberSessionConfig } from '../login/authHttp';

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { clearSession, currentToken, memberSessionKey, sessionIdentity } from '../login/session';
import MemberSessionBoundary from './MemberSessionBoundary';

import './Member_edit.css';

// 백엔드 서버 주소
const API_URL = BACKEND_URL;

// 회원정보 타입
interface MemberVO {
    member_num: number;
    member_email: string;
    member_name: string;
    member_nick: string;
    member_phone: string;
    authority: string;
    member_login_type?: string;
}

// 회원정보 수정 폼
interface MemberForm {
    email: string;
    name: string;
    nickname: string;
    phone: string;
    loginType: string;
}

// 비밀번호 변경 폼
interface PasswordForm {
    currentPassword: string;
    newPassword: string;
    newPasswordCheck: string;
}

// 비밀번호 변경 응답
interface PasswordChangeResponse {
    success: boolean;
    message: string;
}

const MemberEditContent: React.FC<{ sessionKey: string }> = ({ sessionKey }) => {
    const navigate = useNavigate();
    const operations = useRef(new AbortController());
    useEffect(() => {
        operations.current = new AbortController();
        return () => operations.current.abort();
    }, []);
    const isCurrentSession = () => !operations.current.signal.aborted && memberSessionKey() === sessionKey;

    // 회원정보
    const [formData, setFormData] = useState<MemberForm>({
        email: '',
        name: '',
        nickname: '',
        phone: '',
        loginType: ''
    });

    // 로그인 유형
    const [rawLoginType, setRawLoginType] = useState('');

    const isKakao = rawLoginType.toUpperCase() === 'KAKAO';

    // 기존 닉네임
    const [originalNickname, setOriginalNickname] = useState('');

    // 닉네임 중복확인
    const [checkedNickname, setCheckedNickname] = useState('');
    const [nicknameChecking, setNicknameChecking] = useState(false);
    const [nicknameMessage, setNicknameMessage] = useState('');

    // 비밀번호 변경
    const [passwordData, setPasswordData] = useState<PasswordForm>({
        currentPassword: '',
        newPassword: '',
        newPasswordCheck: ''
    });

    const [passwordChanging, setPasswordChanging] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');

    // 페이지 상태
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // 로그인 유형 표시
    const getLoginTypeText = (loginType?: string) => {
        switch (loginType?.toUpperCase()) {
            case 'KAKAO':
                return '카카오 로그인';
            case 'LOCAL':
                return '일반 회원가입';
            case 'GOOGLE':
                return '구글 로그인';
            default:
                return loginType || '일반 회원가입';
        }
    };

    // 전화번호 표시
    const formatPhone = (phone?: string) => {
        if (!phone) return '';

        const numbers = phone.replace(/\D/g, '');

        if (numbers.length === 11) {
            return numbers.replace(
                /(\d{3})(\d{4})(\d{4})/,
                '$1-$2-$3'
            );
        }

        if (numbers.length === 10) {
            return numbers.replace(
                /(\d{3})(\d{3})(\d{4})/,
                '$1-$2-$3'
            );
        }

        return phone;
    };

    // 로그인 토큰 조회
    const getToken = () => {
        return currentToken();
    };

    // 로그인한 회원정보 조회
    useEffect(() => {
        const controller = new AbortController();

        const fetchMemberInfo = async () => {
            const token = getToken();

            if (!token) {
                setError('로그인이 필요합니다.');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError('');

            try {
                const response = await axios.get<MemberVO>(
                    `${API_URL}/api/member/me`,
                    memberSessionConfig(sessionKey, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        signal: controller.signal
                    })
                );

                if (controller.signal.aborted || !isCurrentSession()) return;
                const member = response.data;

                setFormData({
                    email: member.member_email || '',
                    name: member.member_name || '',
                    nickname: member.member_nick || '',
                    phone: formatPhone(member.member_phone),
                    loginType: getLoginTypeText(member.member_login_type)
                });

                setRawLoginType(member.member_login_type || 'LOCAL');
                setOriginalNickname(member.member_nick || '');
                setCheckedNickname(member.member_nick || '');

            } catch (err) {
                if (axios.isCancel(err) || !isCurrentSession()) return;

                console.error('회원정보 조회 실패:');

                if (axios.isAxiosError(err)) {
                    if (err.response?.status === 401) {
                        setError('로그인이 만료되었습니다. 다시 로그인해주세요.');
                    } else if (err.response?.status === 404) {
                        setError('회원정보를 찾을 수 없습니다.');
                    } else {
                        setError('회원정보를 불러오는 중 오류가 발생했습니다.');
                    }
                } else {
                    setError('회원정보를 불러오는 중 오류가 발생했습니다.');
                }
            } finally {
                if (!controller.signal.aborted && isCurrentSession()) {
                    setLoading(false);
                }
            }
        };

        fetchMemberInfo();

        return () => controller.abort();
    }, [sessionKey]);

    // 회원정보 입력값 변경
    const handleInputChange = (
        field: 'nickname' | 'phone',
        value: string
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value
        }));

        setError('');
        setMessage('');

        if (field === 'nickname') {
            setCheckedNickname(
                value.trim() === originalNickname
                    ? originalNickname
                    : ''
            );
            setNicknameMessage('');
        }
    };

    // 닉네임 유효성 검사
    const validateNickname = (nickname: string): string | null => {
        const value = nickname.trim();

        if (!value) return '닉네임을 입력해주세요.';

        if (value.length < 2 || value.length > 12) {
            return '닉네임은 2~12자로 입력해주세요.';
        }

        if (!/^[가-힣a-zA-Z0-9]+$/.test(value)) {
            return '완성형 한글, 영문, 숫자만 사용할 수 있습니다.';
        }

        if (/^[0-9]+$/.test(value)) {
            return '숫자로만 이루어진 닉네임은 사용할 수 없습니다.';
        }

        const forbiddenNicks = [
            '관리자',
            '운영자',
            'admin',
            'administrator'
        ];

        if (forbiddenNicks.includes(value.toLowerCase())) {
            return '사용할 수 없는 닉네임입니다.';
        }

        return null;
    };

    // 닉네임 중복확인
    const handleNicknameCheck = async () => {
        if (nicknameChecking || saving || passwordChanging || !isCurrentSession()) return;

        const nickname = formData.nickname.trim();
        const validationError = validateNickname(nickname);

        if (validationError) {
            setCheckedNickname('');
            setNicknameMessage(validationError);
            return;
        }

        if (nickname === originalNickname) {
            setCheckedNickname(originalNickname);
            setNicknameMessage('현재 사용 중인 닉네임입니다.');
            return;
        }

        setNicknameChecking(true);
        setCheckedNickname('');
        setNicknameMessage('');

        try {
            const response = await axios.get<number>(
                `${API_URL}/api/member/nickCheck`,
                memberSessionConfig(sessionKey, {
                    params: {
                        nick: nickname
                    },
                    signal: operations.current.signal
                })
            );

            if (!isCurrentSession()) return;
            const count = Number(response.data);

            if (count === 0) {
                setCheckedNickname(nickname);
                setNicknameMessage('사용 가능한 닉네임입니다.');
            } else if (Number.isFinite(count) && count > 0) {
                setNicknameMessage('이미 사용 중인 닉네임입니다.');
            } else {
                setNicknameMessage('닉네임 중복확인 결과를 확인할 수 없습니다.');
            }

        } catch (err) {
            if (!isCurrentSession() || axios.isCancel(err)) return;
            console.error('닉네임 중복확인 오류:');
            setCheckedNickname('');
            setNicknameMessage('닉네임 중복확인 중 오류가 발생했습니다.');
        } finally {
            if (isCurrentSession()) setNicknameChecking(false);
        }
    };

    // 회원정보 수정
    const handleMemberUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (saving || loading || nicknameChecking || passwordChanging || !isCurrentSession()) {
            return;
        }

        setError('');
        setMessage('');

        const token = getToken();

        if (!token) {
            setError('로그인이 필요합니다.');
            return;
        }

        const nickname = formData.nickname.trim();
        const phone = formData.phone.replace(/\D/g, '');

        const validationError = validateNickname(nickname);

        if (validationError) {
            setError(validationError);
            return;
        }

        if (checkedNickname !== nickname) {
            setError('닉네임 중복확인을 먼저 완료해주세요.');
            return;
        }

        if (!/^01[0-9]{8,9}$/.test(phone)) {
            setError('올바른 휴대전화 번호를 입력해주세요.');
            return;
        }

        setSaving(true);

        try {
            const response = await axios.post<number>(
                `${API_URL}/api/member/update`,
                {
                    member_nick: nickname,
                    member_phone: phone
                },
                memberSessionConfig(sessionKey, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    signal: operations.current.signal
                })
            );

            if (!isCurrentSession()) return;
            if (response.data > 0) {
                console.log('===== 회원정보 수정 성공 =====');

                navigate('/auth/mypage', {
                    replace: true
                });
            } else {
                setError('회원정보 수정에 실패했습니다.');
            }

        } catch (err) {
            if (!isCurrentSession() || axios.isCancel(err)) return;
            console.error('회원정보 수정 오류:');

            if (axios.isAxiosError(err)) {
                if (err.response?.status === 401) {
                    setError('로그인이 만료되었습니다. 다시 로그인해주세요.');
                } else if (err.response?.status === 409) {
                    setError(
                        err.response?.data?.message ||
                        '이미 사용 중인 닉네임입니다.'
                    );
                    setCheckedNickname('');
                } else {
                    setError(
                        err.response?.data?.message ||
                        '회원정보 수정 중 오류가 발생했습니다.'
                    );
                }
            } else {
                setError('회원정보 수정 중 오류가 발생했습니다.');
            }
        } finally {
            if (isCurrentSession()) setSaving(false);
        }
    };

    // 비밀번호 입력값 변경
    const handlePasswordChange = (
        field: keyof PasswordForm,
        value: string
    ) => {
        setPasswordData((prev) => ({
            ...prev,
            [field]: value
        }));

        setPasswordError('');
        setPasswordMessage('');
    };

    // 일반 회원 비밀번호 변경
    const handleChangePassword = async () => {
        if (isKakao || loading || saving || passwordChanging || !isCurrentSession()) return;

        setPasswordError('');
        setPasswordMessage('');

        const token = getToken();

        if (!token) {
            setPasswordError('로그인이 필요합니다.');
            return;
        }

        const {
            currentPassword,
            newPassword,
            newPasswordCheck
        } = passwordData;

        if (!currentPassword || !newPassword || !newPasswordCheck) {
            setPasswordError('비밀번호 항목을 모두 입력해주세요.');
            return;
        }

        if (newPassword !== newPasswordCheck) {
            setPasswordError('새 비밀번호가 일치하지 않습니다.');
            return;
        }

        if (
            newPassword.length < 8 ||
            newPassword.length > 72 ||
            !/[a-zA-Z]/.test(newPassword) ||
            !/[0-9]/.test(newPassword)
        ) {
            setPasswordError(
                '새 비밀번호는 8~72자이며 영문과 숫자를 포함해야 합니다.'
            );
            return;
        }

        setPasswordChanging(true);

        try {
            const response = await axios.post<PasswordChangeResponse>(
                `${API_URL}/api/member/password/change`,
                {
                    currentPassword,
                    newPassword,
                    newPasswordCheck
                },
                memberSessionConfig(sessionKey, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    signal: operations.current.signal
                })
            );

            if (!isCurrentSession()) return;
            if (response.data.success === true) {
                clearSession();
                const logoutIdentity = sessionIdentity();
                window.alert('비밀번호가 변경되었습니다. 새 비밀번호로 다시 로그인해주세요.');
                if (sessionIdentity() !== logoutIdentity || currentToken()) return;
                navigate('/auth/member?redirect=%2Fauth%2Fmypage', { replace: true });

                // 비밀번호 입력값 초기화
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    newPasswordCheck: ''
                });

                console.log('===== 비밀번호 변경 성공 =====');
            } else {
                setPasswordError(
                    response.data.message || '비밀번호 변경에 실패했습니다.'
                );
            }

        } catch (err) {
            if (!isCurrentSession() || axios.isCancel(err)) return;
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 401) {
                    setPasswordError('로그인이 만료되었습니다. 다시 로그인해주세요.');
                } else if (err.response?.status === 403) {
                    setPasswordError('이 계정은 비밀번호를 변경할 수 없습니다.');
                } else {
                    setPasswordError(
                        err.response?.data?.message ||
                        '비밀번호 변경 중 오류가 발생했습니다.'
                    );
                }
            } else {
                setPasswordError('비밀번호 변경 중 오류가 발생했습니다.');
            }
        } finally {
            if (isCurrentSession()) setPasswordChanging(false);
        }
    };

    return (
        <div className="member-edit-page">
            <div className="member-edit-container">

                {/* Header */}
                <div className="member-edit-header">
                    <h2>정보 수정</h2>
                    <p>회원님의 정보를 수정할 수 있습니다.</p>
                </div>

                {/* Loading */}
                {loading ? (
                    <div role="status">
                        <p>회원정보를 불러오는 중입니다.</p>
                    </div>
                ) : error && !formData.email ? (
                    <div role="alert">
                        <p>{error}</p>
                        <button
                            type="button"
                            onClick={() => navigate('/auth/mypage')}
                        >
                            마이페이지로 돌아가기
                        </button>
                    </div>
                ) : (
                    <form
                        className="member-edit-form"
                        onSubmit={handleMemberUpdate}
                    >

                        {/* 이메일 */}
                        <div className="member-edit-input-group">
                            <label htmlFor="member-edit-email">
                                이메일
                            </label>

                            <input
                                id="member-edit-email"
                                type="email"
                                value={formData.email}
                                disabled
                                className="input-disabled"
                            />
                        </div>

                        {/* 일반 회원 비밀번호 변경 */}
                        {!isKakao && (
                            <>
                                {/* 현재 비밀번호 */}
                                <div className="member-edit-input-group">
                                    <label htmlFor="member-current-password">
                                        현재 비밀번호
                                    </label>

                                    <input
                                        id="member-current-password"
                                        type="password"
                                        autoComplete="current-password"
                                        value={passwordData.currentPassword}
                                        onChange={(e) =>
                                            handlePasswordChange(
                                                'currentPassword',
                                                e.target.value
                                            )
                                        }
                                        placeholder="현재 비밀번호를 입력해주세요"
                                        disabled={passwordChanging || saving}
                                    />
                                </div>

                                {/* 새 비밀번호 */}
                                <div className="member-edit-input-group">
                                    <label htmlFor="member-new-password">
                                        새 비밀번호
                                    </label>

                                    <input
                                        id="member-new-password"
                                        type="password"
                                        autoComplete="new-password"
                                        value={passwordData.newPassword}
                                        onChange={(e) =>
                                            handlePasswordChange(
                                                'newPassword',
                                                e.target.value
                                            )
                                        }
                                        placeholder="영문·숫자 포함 8~72자"
                                        disabled={passwordChanging || saving}
                                    />
                                </div>

                                {/* 새 비밀번호 확인 */}
                                <div className="member-edit-input-group">
                                    <label htmlFor="member-new-password-check">
                                        새 비밀번호 확인
                                    </label>

                                    <input
                                        id="member-new-password-check"
                                        type="password"
                                        autoComplete="new-password"
                                        value={passwordData.newPasswordCheck}
                                        onChange={(e) =>
                                            handlePasswordChange(
                                                'newPasswordCheck',
                                                e.target.value
                                            )
                                        }
                                        placeholder="새 비밀번호를 다시 입력해주세요"
                                        disabled={passwordChanging || saving}
                                    />
                                </div>

                                {/* 비밀번호 변경 오류 */}
                                {passwordError && (
                                    <p role="alert" style={{ color: '#dc2626' }}>
                                        {passwordError}
                                    </p>
                                )}

                                {/* 비밀번호 변경 성공 */}
                                {passwordMessage && (
                                    <p role="status" style={{ color: '#16a34a' }}>
                                        {passwordMessage}
                                    </p>
                                )}

                                {/* 비밀번호 변경 버튼 */}
                                <div className="member-edit-buttons">
                                    <button
                                        type="button"
                                        className="member-edit-submit-button"
                                        onClick={() => void handleChangePassword()}
                                        disabled={passwordChanging || saving}
                                    >
                                        {passwordChanging
                                            ? '비밀번호 변경 중...'
                                            : '비밀번호 변경'}
                                    </button>
                                </div>
                            </>
                        )}

                        {/* 카카오 회원 비밀번호 안내 */}
                        {isKakao && (
                            <div className="member-edit-input-group">
                                <p>
                                    카카오 계정으로 로그인한 회원입니다.
                                    비밀번호는 카카오에서 관리됩니다.
                                </p>
                            </div>
                        )}

                        {/* 이름 */}
                        <div className="member-edit-input-group">
                            <label htmlFor="member-edit-name">
                                이름
                            </label>

                            <input
                                id="member-edit-name"
                                type="text"
                                value={formData.name}
                                disabled
                                className="input-disabled"
                            />
                        </div>

                        {/* 닉네임 */}
                        <div className="member-edit-input-group">
                            <label htmlFor="member-edit-nickname">
                                닉네임
                            </label>

                            <div className="member-edit-input-button">
                                <input
                                    id="member-edit-nickname"
                                    type="text"
                                    value={formData.nickname}
                                    maxLength={12}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'nickname',
                                            e.target.value
                                        )
                                    }
                                    placeholder="닉네임을 입력해주세요"
                                    disabled={saving || nicknameChecking || passwordChanging}
                                    required
                                />

                                <button
                                    type="button"
                                    className="nickname-check-button"
                                    onClick={() => void handleNicknameCheck()}
                                    disabled={saving || nicknameChecking || passwordChanging}
                                >
                                    {nicknameChecking ? '확인 중...' : '중복확인'}
                                </button>
                            </div>

                            {nicknameMessage && (
                                <p role="status">
                                    {nicknameMessage}
                                </p>
                            )}
                        </div>

                        {/* 전화번호 */}
                        <div className="member-edit-input-group">
                            <label htmlFor="member-edit-phone">
                                전화번호
                            </label>

                            <input
                                id="member-edit-phone"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) =>
                                    handleInputChange(
                                        'phone',
                                        e.target.value
                                    )
                                }
                                placeholder="010-0000-0000"
                                disabled={saving || passwordChanging}
                                required
                            />
                        </div>

                        {/* 가입 유형 */}
                        <div className="member-edit-input-group">
                            <label htmlFor="member-edit-type">
                                가입 유형
                            </label>

                            <input
                                id="member-edit-type"
                                type="text"
                                value={formData.loginType}
                                disabled
                                className="input-disabled"
                            />
                        </div>

                        {/* 회원정보 수정 오류 */}
                        {error && (
                            <p role="alert" style={{ color: '#dc2626' }}>
                                {error}
                            </p>
                        )}

                        {/* 회원정보 수정 안내 */}
                        {message && (
                            <p role="status">
                                {message}
                            </p>
                        )}

                        {/* 하단 버튼 */}
                        <div className="member-edit-buttons">
                            <button
                                type="button"
                                className="member-edit-cancel-button"
                                onClick={() => navigate('/auth/mypage')}
                                disabled={saving || passwordChanging}
                            >
                                취소
                            </button>

                            <button
                                type="submit"
                                className="member-edit-submit-button"
                                disabled={saving || nicknameChecking || passwordChanging}
                            >
                                {saving ? '수정 중...' : '수정 완료'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

const Member_edit: React.FC = () => <MemberSessionBoundary>{key => <MemberEditContent sessionKey={key} />}</MemberSessionBoundary>;

export default Member_edit;

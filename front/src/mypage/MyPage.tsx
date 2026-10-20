import { BACKEND_URL } from '../login/authHttp';

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import './MyPage.css';
import MyReportList from './report/MyReportList';
import MyFriend from './friend/MyFriend';
import MyPosts from './posts/MyPosts';
import PointHistory from './PointHistory';
import { useAppDispatch } from '../login/reducers/store';
import { logoutAction } from '../login/authActions/authActions';

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
    regdate?: string;
    last_login_at?: string | null;
    last_login_lookup_failed?: boolean;
    member_code?: string;
    point: number | null;
    member_login_type?: string;
}

const MyPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [withdrawOpen, setWithdrawOpen] = useState(false);
    const [withdrawConfirmed, setWithdrawConfirmed] = useState(false);
    const [withdrawing, setWithdrawing] = useState(false);
    const [withdrawError, setWithdrawError] = useState('');
    const withdrawLock = useRef(false);
    // 메뉴 상태
    const [activeMenu, setActiveMenu] = useState('info');
    const [showPointHistory, setShowPointHistory] = useState(false);

    // 회원정보
    const [member, setMember] = useState<MemberVO | null>(null);
    // 조회 상태
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // 회원정보 조회
    useEffect(() => {
        const controller = new AbortController();

        const fetchMyInfo = async () => {
            const token = localStorage.getItem('token');

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
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        signal: controller.signal
                    }
                );

                setMember(response.data);
                setError('');

            } catch (error) {
                if (axios.isCancel(error)) return;

                console.error('마이페이지 회원정보 조회 실패:');
                setMember(null);

                if (axios.isAxiosError(error)) {
                    if (error.response?.status === 401) {
                        setError('로그인 정보가 만료되었습니다. 다시 로그인해주세요.');
                    } else if (error.response?.status === 403) {
                        setError('회원정보에 접근할 권한이 없습니다.');
                    } else if (error.response?.status === 404) {
                        setError('회원정보를 찾을 수 없습니다.');
                    } else {
                        setError('회원정보를 불러오는 중 오류가 발생했습니다.');
                    }
                } else {
                    setError('회원정보를 불러오는 중 오류가 발생했습니다.');
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchMyInfo();

        return () => {
            controller.abort();
        };
    }, []);

    // 포인트 표시
    const formatPoint = (point?: number | null) => {
        const value = Number(point ?? 0);

        if (!Number.isFinite(value)) {
            return '0P';
        }

        return `${value.toLocaleString('ko-KR')}P`;
    };

    // 날짜는 그대로, 시간대가 포함된 가입일은 한국 시간으로 표시
    const formatRegdate = (regdate?: string) => {
        if (typeof regdate !== 'string') return '-';
        const match = /^(\d{4})-(\d{2})-(\d{2})(?:T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d))?$/.exec(regdate);
        if (!match) return '-';

        const [, yearText, monthText, dayText] = match;
        const year = Number(yearText);
        const month = Number(monthText);
        const day = Number(dayText);
        const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
        const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        if (year < 1 || month < 1 || month > 12 || day < 1 || day > daysInMonth[month - 1]) {
            return '-';
        }

        if (regdate.length === 10) {
            return `${yearText}년 ${monthText}월 ${dayText}일`;
        }

        const timestamp = new Date(regdate);
        if (!Number.isFinite(timestamp.getTime())) return '-';

        const parts = new Intl.DateTimeFormat('ko-KR', {
            timeZone: 'Asia/Seoul',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).formatToParts(timestamp);
        const formattedYear = parts.find(part => part.type === 'year')?.value;
        const formattedMonth = parts.find(part => part.type === 'month')?.value;
        const formattedDay = parts.find(part => part.type === 'day')?.value;

        if (!formattedYear || !formattedMonth || !formattedDay) return '-';
        return `${formattedYear}년 ${formattedMonth}월 ${formattedDay}일`;
    };

    // DB에 기록된 시각은 시간대 변환 없이 표시
    const formatLastLogin = (lastLogin?: string | null, lookupFailed?: boolean) => {
        if (lookupFailed) return '조회할 수 없습니다';
        if (typeof lastLogin !== 'string') return '-';
        const match = /^(\d{4}-\d{2}-\d{2})T((?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d)$/.exec(lastLogin);
        if (!match) return '-';
        const date = formatRegdate(match[1]);
        return date === '-' ? '-' : `${date} ${match[2]}`;
    };

    // 프로필 대표 문자
    const getProfileInitial = (name?: string) => {
        return name?.trim().charAt(0) || '?';
    };

    // 회원정보 수정 페이지 이동
    const handleMemberEdit = () => {
        navigate('/member_edit');
    };

    const handleWithdraw = async () => {
        if (!withdrawConfirmed || withdrawing || withdrawLock.current) return;

        const token = localStorage.getItem('token');
        if (!token) {
            setWithdrawError('로그인이 필요합니다. 다시 로그인한 후 시도해주세요.');
            return;
        }

        withdrawLock.current = true;
        setWithdrawing(true);
        setWithdrawError('');

        try {
            await axios.delete(`${API_URL}/api/member/withdraw`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            const status = axios.isAxiosError(err) ? err.response?.status : undefined;
            if (status === 401) {
                setWithdrawError('로그인이 만료되었습니다. 다시 로그인한 후 시도해주세요.');
            } else if (status === 403) {
                setWithdrawError('이 계정은 회원탈퇴 권한이 없습니다. 최고 관리자 계정은 탈퇴할 수 없습니다.');
            } else if (status === 409) {
                setWithdrawError('현재 계정 상태에서는 탈퇴할 수 없습니다. 잠시 후 다시 시도해주세요.');
            } else {
                setWithdrawError('회원탈퇴를 완료하지 못했습니다. 잠시 후 다시 시도해주세요.');
            }
            withdrawLock.current = false;
            setWithdrawing(false);
            return;
        }

        await dispatch(logoutAction());
        window.alert('회원탈퇴가 완료되었습니다.');
        navigate('/', { replace: true });
    };

    return (
        <div className="mypage-page">
            <div className="mypage-layout">

                {/* 왼쪽 사이드 메뉴 */}
                <aside className="mypage-sidebar">
                    <h3 className="sidebar-title">마이페이지</h3>

                    <button
                        className={
                            activeMenu === 'info'
                                ? 'sidebar-menu active'
                                : 'sidebar-menu'
                        }
                        onClick={() => setActiveMenu('info')}
                    >
                        회원정보
                    </button>

                    <button
                        className={
                            activeMenu === 'report'
                                ? 'sidebar-menu active'
                                : 'sidebar-menu'
                        }
                        onClick={() => setActiveMenu('report')}
                    >
                        나의 신고내역
                    </button>

                    <button
                        className={
                            activeMenu === 'example1'
                                ? 'sidebar-menu active'
                                : 'sidebar-menu'
                        }
                        onClick={() => setActiveMenu('example1')}
                    >
                        나의 게시글
                    </button>

                    <button
                        className={
                            activeMenu === 'friend'
                                ? 'sidebar-menu active'
                                : 'sidebar-menu'
                        }
                        onClick={() => setActiveMenu('friend')}
                    >
                        친구 목록
                    </button>

                    <button
                        className={
                            activeMenu === 'example3'
                                ? 'sidebar-menu active'
                                : 'sidebar-menu'
                        }
                        onClick={() => setActiveMenu('example3')}
                    >
                        나의 스터디 그룹 - 중령오진석
                    </button>
                </aside>

                {/* 오른쪽 본문 */}
                <main className="mypage-content">

                    {/* 회원정보 */}
                    {activeMenu === 'info' && (
                        <div className="mypage-container">
                            <h2 className="mypage-title">마이페이지</h2>

                            <p className="mypage-subtitle">
                                회원님의 정보를 확인하고 수정할 수 있습니다.
                            </p>

                            {loading ? (
                                <div className="menu-panel" role="status">
                                    <p>회원정보를 불러오는 중입니다.</p>
                                </div>
                            ) : error ? (
                                <div className="menu-panel" role="alert">
                                    <h2>회원정보 조회 실패</h2>
                                    <p>{error}</p>
                                </div>
                            ) : !member ? (
                                <div className="menu-panel">
                                    <p>회원정보를 찾을 수 없습니다.</p>
                                </div>
                            ) : (
                                <>
                                    {/* 프로필 카드 */}
                                    <div className="profile-card">
                                        <div className="profile-avatar">
                                            {getProfileInitial(member.member_name)}
                                        </div>

                                        <div className="profile-info">
                                            <h3>{member.member_nick} 님</h3>

                                            <p>
                                                {member.member_email}
                                            </p>
                                        </div>
                                    </div>

                                    {/* 잔여 포인트 */}
                                    <div className="point-box">
                                        <p>잔여 포인트</p>

                                        <strong>
                                            {formatPoint(member.point)}
                                        </strong>

                                        <button
                                            type="button"
                                            className="point-link"
                                            aria-expanded={showPointHistory}
                                            aria-controls="mypage-point-history"
                                            onClick={() => setShowPointHistory(value => !value)}
                                        >
                                            {showPointHistory ? '포인트 내역 접기' : '포인트 내역 보기'}
                                        </button>
                                    </div>

                                    <div id="mypage-point-history" hidden={!showPointHistory}>
                                        <PointHistory embedded />
                                    </div>

                                    {/* 이메일 */}
                                    <div className="mypage-info-grid">
                                        <div className="form-group">
                                            <label htmlFor="mypage-email">
                                                이메일
                                            </label>

                                            <input
                                                id="mypage-email"
                                                type="text"
                                                value={member.member_email || ''}
                                                readOnly
                                            />
                                        </div>

                                        {/* 이름 */}
                                        <div className="form-group">
                                            <label htmlFor="mypage-name">
                                                이름
                                            </label>

                                            <input
                                                id="mypage-name"
                                                type="text"
                                                value={member.member_name || ''}
                                                readOnly
                                            />
                                        </div>

                                        {/* 닉네임 */}
                                        <div className="form-group">
                                            <label htmlFor="mypage-nick">
                                                닉네임
                                            </label>

                                            <input
                                                id="mypage-nick"
                                                type="text"
                                                value={member.member_nick || ''}
                                                readOnly
                                            />
                                        </div>

                                        {/* 전화번호 */}
                                        <div className="form-group">
                                            <label htmlFor="mypage-phone">
                                                전화번호
                                            </label>

                                            <input
                                                id="mypage-phone"
                                                type="text"
                                                value={member.member_phone || ''}
                                                readOnly
                                            />
                                        </div>

                                        {/* 가입일 */}
                                        <div className="form-group">
                                            <label htmlFor="mypage-regdate">
                                                가입일
                                            </label>

                                            <input
                                                id="mypage-regdate"
                                                type="text"
                                                value={formatRegdate(member.regdate)}
                                                readOnly
                                            />
                                        </div>

                                        {/* 최근 로그인 */}
                                        <div className="form-group">
                                            <label htmlFor="mypage-last-login">
                                                최근 로그인
                                            </label>

                                            <input
                                                id="mypage-last-login"
                                                type="text"
                                                value={formatLastLogin(member.last_login_at, member.last_login_lookup_failed)}
                                                readOnly
                                            />
                                        </div>

                                    </div>

                                    {/* 회원정보 수정 버튼 */}
                                    <div className="mypage-edit-actions">
                                        <button
                                            type="button"
                                            onClick={handleMemberEdit}
                                            disabled={withdrawing}
                                            className="mypage-edit-button"
                                        >
                                            정보 수정
                                        </button>
                                    </div>

                                    <section className="mypage-withdraw" aria-labelledby="mypage-withdraw-title">
                                        <h3 id="mypage-withdraw-title">회원탈퇴</h3>
                                        <p>탈퇴하면 이 계정으로 서비스를 이용할 수 없습니다.</p>
                                        {!withdrawOpen ? (
                                            <button
                                                type="button"
                                                className="mypage-withdraw-open"
                                                onClick={() => {
                                                    setWithdrawOpen(true);
                                                    setWithdrawConfirmed(false);
                                                    setWithdrawError('');
                                                }}
                                            >
                                                회원탈퇴 진행
                                            </button>
                                        ) : (
                                            <div className="mypage-withdraw-confirm" aria-busy={withdrawing}>
                                                <p>계속 진행하려면 아래 항목을 확인해주세요.</p>
                                                <label className="mypage-withdraw-check">
                                                    <input
                                                        type="checkbox"
                                                        checked={withdrawConfirmed}
                                                        disabled={withdrawing}
                                                        onChange={(event) => setWithdrawConfirmed(event.target.checked)}
                                                    />
                                                    <span>안내를 확인했으며 회원탈퇴를 진행하겠습니다.</span>
                                                </label>
                                                {withdrawError && <p className="mypage-withdraw-error" role="alert">{withdrawError}</p>}
                                                {withdrawing && <p role="status">회원탈퇴를 처리하고 있습니다.</p>}
                                                <div className="mypage-withdraw-actions">
                                                    <button
                                                        type="button"
                                                        disabled={withdrawing}
                                                        onClick={() => {
                                                            setWithdrawOpen(false);
                                                            setWithdrawConfirmed(false);
                                                            setWithdrawError('');
                                                        }}
                                                    >
                                                        취소
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="mypage-withdraw-submit"
                                                        disabled={!withdrawConfirmed || withdrawing}
                                                        onClick={() => void handleWithdraw()}
                                                    >
                                                        {withdrawing ? '탈퇴 처리 중...' : '최종 탈퇴'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </section>
                                </>
                            )}
                        </div>
                    )}

                    {/* 나의 신고내역 */}
                    {activeMenu === 'report' && <MyReportList />}

                    {/* 나의 게시글 */}
                    {activeMenu === 'example1' && <MyPosts />}

                    {/* 친구 목록 */}
                    {activeMenu === 'friend' && <MyFriend />}

                    {/* 나의 스터디 그룹 */}
                    {activeMenu === 'example3' && (
                        <div className="menu-panel">
                            <h2>나의 스터디 그룹</h2>

                            <p>
                                내가 참여한 스터디 그룹을 보여주는 영역입니다.
                            </p>
                        </div>
                    )}

                </main>
            </div>
        </div>
    );
};

export default MyPage;

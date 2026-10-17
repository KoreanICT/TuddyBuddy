
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import './MyPage.css';
import MyReportList from './report/MyReportList';
import MyFriend from './friend/MyFriend';

// 백엔드 서버 주소
const API_URL =
    process.env.REACT_APP_BACK_END_URL ||
    'http://localhost:80/back';

// 회원정보 타입
interface MemberVO {
    member_num: number;
    member_email: string;
    member_name: string;
    member_nick: string;
    member_phone: string;
    authority: string;
    regdate?: string;
    member_code?: string;
    point: number | null;
    member_login_type?: string;
}

const MyPage: React.FC = () => {
    const navigate = useNavigate();

    // 메뉴 상태
    const [activeMenu, setActiveMenu] = useState('info');

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

                console.error('마이페이지 회원정보 조회 실패:', error);
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

    // 회원 권한 표시
    const getAuthorityText = (authority?: string) => {
        switch (authority?.toUpperCase()) {
            case 'ADMIN':
                return '관리자';
            case 'MEMBER':
                return '학생';
            default:
                return authority || '-';
        }
    };

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
                return loginType || '-';
        }
    };

    // 포인트 표시
    const formatPoint = (point?: number | null) => {
        const value = Number(point ?? 0);

        if (!Number.isFinite(value)) {
            return '0P';
        }

        return `${value.toLocaleString('ko-KR')}P`;
    };

    // 프로필 대표 문자
    const getProfileInitial = (name?: string) => {
        return name?.trim().charAt(0) || '?';
    };

    // 회원정보 수정 페이지 이동
    const handleMemberEdit = () => {
        navigate('/member_edit');
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
                            activeMenu === 'point'
                                ? 'sidebar-menu active'
                                : 'sidebar-menu'
                        }
                        onClick={() => setActiveMenu('point')}
                    >
                        포인트 내역 - 준위 김진규
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
                        나의 게시글 - 주화님
                    </button>

                    <button
                        className={
                            activeMenu === 'friend'
                                ? 'sidebar-menu active'
                                : 'sidebar-menu'
                        }
                        onClick={() => setActiveMenu('friend')}
                    >
                        친구 목록 - 용센
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
                                                <span className="badge">
                                                    {getAuthorityText(member.authority)}
                                                </span>
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
                                            className="point-link"
                                            onClick={() => setActiveMenu('point')}
                                        >
                                            포인트 내역 &gt;
                                        </button>
                                    </div>

                                    {/* 이메일 */}
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

                                    {/* 가입 유형 */}
                                    <div className="form-group">
                                        <label htmlFor="mypage-login-type">
                                            가입 유형
                                        </label>

                                        <input
                                            id="mypage-login-type"
                                            type="text"
                                            value={getLoginTypeText(member.member_login_type)}
                                            readOnly
                                        />
                                    </div>

                                    {/* 회원정보 수정 버튼 */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'flex-end',
                                            marginTop: '24px'
                                        }}
                                    >
                                        <button
                                            type="button"
                                            onClick={handleMemberEdit}
                                            style={{
                                                padding: '12px 24px',
                                                border: 'none',
                                                borderRadius: '8px',
                                                backgroundColor: '#2563eb',
                                                color: '#ffffff',
                                                fontSize: '14px',
                                                fontWeight: 600,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            정보 수정
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* 포인트 내역 */}
                    {activeMenu === 'point' && (
                        <div className="menu-panel">
                            <h2>포인트 내역</h2>

                            <p>
                                여기에 포인트 내역 내용을 넣으면 됩니다.
                            </p>
                        </div>
                    )}

                    {/* 나의 신고내역 */}
                    {activeMenu === 'report' && <MyReportList />}

                    {/* 나의 게시글 */}
                    {activeMenu === 'example1' && (
                        <div className="menu-panel">
                            <h2>나의 게시글</h2>

                            <p>
                                나의 게시글을 눌렀을 때 보여줄 내용입니다.
                            </p>
                        </div>
                    )}

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

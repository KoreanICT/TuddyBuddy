import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../login/hooks/useAuth';
import { BACKEND_URL } from '../../login/authHttp';
import { MemberRole, ROLE_LABELS } from '../../login/auth/roles';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import styles from './adminHome.module.css';

interface DashboardData {
    summary: {
        totalMembers: number;
        totalPosts: number;
        pendingReports: number;
        todayMembers: number;
        updatedAt: string;
    };
    recentMembers: {
        memberNum: number;
        nickname: string;
        authority: MemberRole;
    }[];
    recentPosts: {
        postNum: number;
        title: string | null;
        content: string;
        category: string;
        nickname: string;
    }[];
    signupTrend: { date: string; count: number }[];
    reportStatusCounts: { status: string; count: number }[];
}

const REPORT_STATUS_LABELS: Record<string, string> = {
    PENDING: '접수', REVIEWING: '처리 중', COMPLETED: '처리 완료', REJECTED: '반려'
};
const REPORT_STATUS_COLORS: Record<string, string> = {
    PENDING: '#f59e0b', REVIEWING: '#3b82f6', COMPLETED: '#10b981', REJECTED: '#94a3b8'
};

const AdminHome: React.FC = () => {
    const { token } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [revision, setRevision] = useState(0);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError('');
        if (!token) {
            setData(null);
            setLoading(false);
            setError('로그인이 필요합니다.');
            return;
        }
        void axios.get<DashboardData>(`${BACKEND_URL}/api/admin/dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(response => {
            if (active) setData(response.data);
        }).catch(requestError => {
            if (!active) return;
            setData(null);
            setError(axios.isAxiosError(requestError) && requestError.response?.status === 403
                ? '대시보드를 조회할 권한이 없습니다.' : '대시보드를 불러오지 못했습니다. 다시 시도해주세요.');
        }).finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [token, revision]);

    const metrics = [
        { label: '전체 회원', value: data?.summary.totalMembers, note: '현재 등록된 회원' },
        { label: '전체 게시글', value: data?.summary.totalPosts, note: '커뮤니티 게시글 기준' },
        { label: '신고 접수', value: data?.summary.pendingReports, note: '접수 상태(PENDING)' },
        { label: '오늘 가입자', value: data?.summary.todayMembers, note: 'DB 서버의 오늘 날짜 기준' }
    ];
    const signupTotal = data?.signupTrend.reduce((sum, day) => sum + day.count, 0) || 0;
    const reportChartData = data ? [
        ...Object.keys(REPORT_STATUS_LABELS).map(status => ({
            status, name: REPORT_STATUS_LABELS[status],
            count: data.reportStatusCounts.find(item => item.status === status)?.count || 0,
            color: REPORT_STATUS_COLORS[status]
        })),
        ...data.reportStatusCounts.filter(item => !REPORT_STATUS_LABELS[item.status]).map(item => ({
            ...item, name: item.status || '기타', color: '#a78bfa'
        }))
    ] : [];
    const reportTotal = reportChartData.reduce((sum, item) => sum + item.count, 0);

    return (
        <div className={styles.adminHome} aria-busy={loading}>
            <div className={styles.header}>
                <div><h1>대시보드</h1><p>회원·커뮤니티·신고 현황을 확인합니다.</p></div>
                <button type="button" className={styles.refreshButton} disabled={loading}
                    onClick={() => setRevision(value => value + 1)}>{loading ? '조회 중...' : '새로고침'}</button>
            </div>
            {error && <p className={styles.error} role="alert">{error}</p>}
            {data && <p className={styles.updatedAt}>조회 시각: {data.summary.updatedAt} (DB 서버 기준)</p>}
            <section className={styles.summary} aria-label="전체 현황">
                {metrics.map(metric => <div className={styles.card} key={metric.label}>
                    <span className={styles.label}>{metric.label}</span>
                    <strong className={styles.value}>{metric.value == null ? '—' : metric.value.toLocaleString('ko-KR')}</strong>
                    <span className={styles.note}>{metric.note}</span>
                </div>)}
            </section>
            {loading && !data && <p role="status">대시보드 데이터를 불러오는 중입니다.</p>}
            {data && <section className={styles.charts} aria-label="회원 가입 및 신고 현황 차트">
                <div className={styles.panel}>
                    <div className={styles.chartHeading}><h2>회원 가입 추이</h2><strong>14일간 {signupTotal.toLocaleString('ko-KR')}명</strong></div>
                    <p className={styles.chartDescription}>오늘 포함 최근 14일 · 현재 남아 있는 회원 기준</p>
                    <div className={styles.chart} role="img" aria-label={`최근 14일 가입 회원 ${signupTotal}명`}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.signupTrend} margin={{ top: 16, right: 12, left: -22, bottom: 4 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="date" tickFormatter={value => String(value).slice(5)} tick={{ fontSize: 11 }} minTickGap={18} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                <Tooltip formatter={value => [`${value}명`, '가입 회원']} />
                                <Area type="linear" dataKey="count" name="가입 회원" stroke="#6366f1" fill="#e0e7ff" strokeWidth={2} isAnimationActive={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <details className={styles.chartValues}><summary>날짜별 수치 보기</summary>
                        <ul>{data.signupTrend.map(day => <li key={day.date}><span>{day.date}</span><strong>{day.count}명</strong></li>)}</ul>
                    </details>
                </div>
                <div className={styles.panel}>
                    <div className={styles.chartHeading}><h2>신고 처리 현황</h2><strong>전체 {reportTotal.toLocaleString('ko-KR')}건</strong></div>
                    <p className={styles.chartDescription}>전체 신고 기준 · 상태별 건수</p>
                    {reportTotal > 0 ? <div className={styles.chart} role="img" aria-label={`전체 신고 ${reportTotal}건의 상태별 분포`}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={reportChartData.filter(item => item.count > 0)} dataKey="count" nameKey="name"
                                    innerRadius="55%" outerRadius="82%" paddingAngle={3} isAnimationActive={false}>
                                    {reportChartData.filter(item => item.count > 0).map(item => <Cell key={item.status} fill={item.color} />)}
                                </Pie>
                                <Tooltip formatter={value => [`${value}건`, '신고']} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div> : <div className={styles.chartEmpty}>등록된 신고가 없습니다.</div>}
                    <ul className={styles.chartLegend}>{reportChartData.map(item => <li key={item.status}>
                        <span><i style={{ backgroundColor: item.color }} aria-hidden="true" />{item.name}</span>
                        <strong>{item.count.toLocaleString('ko-KR')}건</strong>
                    </li>)}</ul>
                    <Link className={styles.chartLink} to="/admin/reportList">신고 관리로 이동</Link>
                </div>
            </section>}
            <section className={styles.content}>
                <div className={styles.panel}>
                    <div className={styles.panelHeading}><h2>최근 가입 회원</h2><Link to="/admin/memberManagement">회원 관리</Link></div>
                    {data ? data.recentMembers.length ? <ul className={styles.list}>
                        {data.recentMembers.map(member => <li key={member.memberNum} className={styles.memberItem}>
                            <span className={styles.memberNickname}>{member.nickname}</span>
                            <span className={styles.memberAuthority}><small>권한:</small><span>{ROLE_LABELS[member.authority] || member.authority}</span></span>
                        </li>)}
                    </ul> : <div className={styles.empty}>최근 가입 회원이 없습니다.</div>
                        : <div className={styles.empty}>{loading ? '조회 중입니다.' : '데이터를 조회할 수 없습니다.'}</div>}
                </div>
                <div className={styles.panel}>
                    <div className={styles.panelHeading}><h2>최근 게시글</h2><Link to="/admin/boardManagement">게시판 관리</Link></div>
                    <p className={`${styles.note} ${styles.postSubtitle}`}>커뮤니티 · 최근 5건</p>
                    {data ? data.recentPosts.length ? <ul className={styles.list}>
                        {data.recentPosts.map(post => <li key={post.postNum} className={styles.postRow}>
                            <p className={styles.postTitle} title={post.title || '제목 없음'}>{post.title || '제목 없음'}</p>
                            <p className={styles.postMeta} title={`${post.category} · ${post.nickname}`}>{post.category} · {post.nickname}</p>
                        </li>)}
                    </ul> : <div className={styles.empty}>최근 게시글이 없습니다.</div>
                        : <div className={styles.empty}>{loading ? '조회 중입니다.' : '데이터를 조회할 수 없습니다.'}</div>}
                </div>
            </section>
        </div>
    );
};

export default AdminHome;

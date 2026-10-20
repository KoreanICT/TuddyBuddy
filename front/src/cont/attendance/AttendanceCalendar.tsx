import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../../login/authHttp';
import { useAuth } from '../../login/hooks/useAuth';
import { sessionIdentity } from '../../login/session';
import styles from './attendanceCalendar.module.css';

interface AttendanceItem {
    attendanceDate: string;
    rewardPoint: 0;
}

interface AttendanceMonth {
    month: string;
    today: string;
    timezone: 'Asia/Seoul';
    checkedToday: boolean;
    rewardPerCheck: 0;
    items: AttendanceItem[];
}

const seoulMonth = () => {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit'
    }).formatToParts(new Date());
    return `${parts.find(part => part.type === 'year')?.value}-${parts.find(part => part.type === 'month')?.value}`;
};

const daysInMonth = (year: number, month: number) => {
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    return [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
};

const validDate = (value: unknown): value is string => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split('-').map(Number);
    return year >= 1900 && year <= 9999 && month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(year, month);
};

const validMonthResponse = (value: AttendanceMonth, month: string) => {
    if (!value || value.month !== month || value.timezone !== 'Asia/Seoul' ||
        !validDate(value.today) || typeof value.checkedToday !== 'boolean' ||
        value.rewardPerCheck !== 0 || !Array.isArray(value.items)) return false;
    const dates = new Set<string>();
    for (const item of value.items) {
        if (!item || !validDate(item.attendanceDate) || !item.attendanceDate.startsWith(month + '-') ||
            item.attendanceDate > value.today || item.rewardPoint !== 0 || dates.has(item.attendanceDate)) return false;
        dates.add(item.attendanceDate);
    }
    return !value.today.startsWith(month + '-') || dates.has(value.today) === value.checkedToday;
};

const AttendanceCalendar: React.FC = () => {
    const { isLoggedIn, memberNum, username } = useAuth();
    const authIdentity = sessionIdentity();
    const scope = `${isLoggedIn}:${memberNum}:${username}:${authIdentity}`;
    const scopeRef = useRef(scope);
    scopeRef.current = scope;
    const [month, setMonth] = useState(seoulMonth);
    const [reload, setReload] = useState(0);
    const [snapshot, setSnapshot] = useState<{ scope: string; data: AttendanceMonth } | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [notice, setNotice] = useState('');
    const [saving, setSaving] = useState(false);
    const saveLock = useRef(false);
    const postController = useRef<AbortController | null>(null);
    const result = snapshot && snapshot.scope === scope && snapshot.data.month === month ? snapshot.data : null;
    const [year, monthNumber] = month.split('-').map(Number);
    const dayCount = daysInMonth(year, monthNumber);
    const firstWeekday = new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay();
    const attended = new Set(result?.items.map(item => item.attendanceDate) || []);

    useEffect(() => {
        const controller = new AbortController();
        const unchanged = () => !controller.signal.aborted && scopeRef.current === scope && sessionIdentity() === authIdentity;
        setSnapshot(null);
        setLoadError('');
        if (!isLoggedIn || memberNum === null) {
            setLoading(false);
            setLoadError('로그인 후 출석 기록을 확인할 수 있습니다.');
            return () => controller.abort();
        }
        setLoading(true);
        const load = async () => {
            try {
                const response = await axios.get<AttendanceMonth>(`${BACKEND_URL}/api/attendance`, {
                    params: { month }, signal: controller.signal, timeout: 15000
                });
                if (!unchanged()) return;
                if (!validMonthResponse(response.data, month)) throw new Error('Invalid attendance response');
                setSnapshot({ scope, data: response.data });
            } catch (error) {
                if (!unchanged() || axios.isCancel(error)) return;
                const status = axios.isAxiosError(error) ? error.response?.status : undefined;
                setLoadError(status === 404 ? '출석 서버 연결이 아직 준비되지 않았습니다.'
                    : status === 401 ? '로그인이 만료되었습니다. 다시 로그인해주세요.'
                    : status === 403 ? '출석 기록에 접근할 권한이 없습니다.'
                        : '출석 기록을 확인하지 못했습니다. 다시 조회해주세요.');
            } finally {
                if (unchanged()) setLoading(false);
            }
        };
        void load();
        return () => controller.abort();
    }, [scope, authIdentity, isLoggedIn, memberNum, month, reload]);

    useEffect(() => {
        setNotice('');
        setSaving(false);
        saveLock.current = false;
        return () => {
            postController.current?.abort();
            postController.current = null;
        };
    }, [scope]);

    useEffect(() => {
        // Server revalidation, rather than client clock assumptions, handles Seoul midnight.
        const refresh = () => {
            if (!document.hidden && !saveLock.current && isLoggedIn) setReload(value => value + 1);
        };
        const interval = window.setInterval(refresh, 30000);
        window.addEventListener('focus', refresh);
        document.addEventListener('visibilitychange', refresh);
        return () => {
            window.clearInterval(interval);
            window.removeEventListener('focus', refresh);
            document.removeEventListener('visibilitychange', refresh);
        };
    }, [isLoggedIn]);

    const serverToday = result?.today;
    useEffect(() => {
        if (!serverToday) return;
        // The clock only schedules a fresh GET; it never decides an attendance date.
        const remaining = Date.parse(`${serverToday}T00:00:00+09:00`) + 86400000 - Date.now() + 250;
        const timer = window.setTimeout(() => {
            if (!saveLock.current) {
                setSnapshot(null);
                setLoading(true);
                setReload(value => value + 1);
            }
        }, remaining > 0 ? Math.min(remaining, 2147483647) : 30000);
        return () => window.clearTimeout(timer);
    }, [serverToday]);

    const checkAttendance = async () => {
        if (!result || result.checkedToday || loading || saveLock.current || !isLoggedIn || sessionIdentity() !== authIdentity) return;
        saveLock.current = true;
        setSaving(true);
        setNotice('출석 요청을 처리하고 있습니다.');
        const controller = new AbortController();
        postController.current = controller;
        const unchanged = () => !controller.signal.aborted && scopeRef.current === scope && sessionIdentity() === authIdentity;
        try {
            // The server determines member, current Seoul date and reward. No body is sent.
            await axios.post(`${BACKEND_URL}/api/attendance/check`, undefined, { signal: controller.signal, timeout: 15000 });
            if (unchanged()) setNotice('요청이 처리되었습니다. 서버에서 출석 기록을 다시 확인합니다.');
        } catch (error) {
            if (!unchanged() || axios.isCancel(error)) return;
            const status = axios.isAxiosError(error) ? error.response?.status : undefined;
            if (status === 409) {
                setNotice('이미 출석한 것으로 응답했습니다. 서버 기록을 다시 확인합니다.');
            } else if (status === 401) {
                setNotice('로그인이 만료되었습니다. 다시 로그인해주세요.');
            } else if (status === 403) {
                setNotice('출석을 기록할 권한이 없습니다.');
            } else {
                setNotice('출석 요청 결과가 불확실합니다. 중복 요청 전에 서버 기록을 다시 확인합니다.');
            }
        } finally {
            if (postController.current === controller) {
                postController.current = null;
                saveLock.current = false;
                if (unchanged()) {
                    setSnapshot(null);
                    setSaving(false);
                    setLoading(true);
                    setReload(value => value + 1);
                }
            }
        }
    };

    const moveMonth = (amount: number) => {
        if (saving) return;
        const next = new Date(Date.UTC(year, monthNumber - 1 + amount, 1));
        if (next.getUTCFullYear() < 1900 || next.getUTCFullYear() > 9998) return;
        setMonth(`${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, '0')}`);
        setNotice('');
    };

    return (
        <section className={styles.page} aria-labelledby="attendance-title">
            <header className={styles.intro}>
                <p className={styles.eyebrow}>하루 한 번, 작은 학습 습관</p>
                <h1 id="attendance-title">출석 캘린더</h1>
                <p>매일 출석하고 300P를 받아보세요! 작은 습관이 큰 보상으로 이어집니다.</p>
            </header>
            <div className={styles.layout}>
                <section className={styles.calendar} aria-labelledby="attendance-month" aria-busy={loading}>
                    <header className={styles.calendarHeader}>
                        <h2 id="attendance-month">{year}년 {monthNumber}월</h2>
                        <div className={styles.controls}>
                            <button type="button" disabled={saving || (year === 1900 && monthNumber === 1)} aria-label="이전 달 보기" onClick={() => moveMonth(-1)}>←</button>
                            <button type="button" disabled={saving} onClick={() => { setMonth(result?.today.slice(0, 7) || seoulMonth()); setReload(value => value + 1); }}>이번 달</button>
                            <button type="button" disabled={saving || (year === 9998 && monthNumber === 12)} aria-label="다음 달 보기" onClick={() => moveMonth(1)}>→</button>
                        </div>
                    </header>
                    {loadError && <div className={styles.error}><p role="alert">{loadError}</p>{isLoggedIn && <button type="button" onClick={() => setReload(value => value + 1)}>다시 조회</button>}</div>}
                    {loading && <p className={styles.loading} role="status">서버 출석 기록을 확인하고 있습니다.</p>}
                    <div className={styles.weekdays} aria-hidden="true">{['일', '월', '화', '수', '목', '금', '토'].map(day => <span key={day}>{day}</span>)}</div>
                    <div className={styles.days} role="group" aria-labelledby="attendance-month">
                        {Array.from({ length: firstWeekday }, (_, index) => <span key={`blank-${index}`} aria-hidden="true" />)}
                        {Array.from({ length: dayCount }, (_, index) => {
                            const day = index + 1;
                            const date = `${month}-${String(day).padStart(2, '0')}`;
                            const isToday = result?.today === date;
                            const checked = attended.has(date);
                            const state = !result ? '서버 기록 확인 필요' : checked ? '출석 완료' : isToday ? (result.checkedToday ? '오늘 출석 완료' : '오늘 출석하기') : date < result.today ? '지난 날짜, 출석 불가' : '미래 날짜, 출석 불가';
                            return (
                                <button key={date} type="button"
                                    className={`${styles.day} ${isToday ? styles.today : ''} ${checked ? styles.checked : ''}`}
                                    aria-label={`${year}년 ${monthNumber}월 ${day}일, ${state}`}
                                    aria-current={isToday ? 'date' : undefined}
                                    disabled={!result || loading || saving || !isToday || result.checkedToday || checked}
                                    onClick={() => void checkAttendance()}>
                                    <span>{day}</span><span className={styles.dayState}>{checked ? '✓' : isToday ? '오늘' : ''}</span>
                                </button>
                            );
                        })}
                    </div>
                    {result && result.items.length === 0 && <p className={styles.empty}>선택한 달에 기록된 출석이 없습니다.</p>}
                    <p className={styles.legend}>✓ 출석 완료 · 테두리 표시: 서버 기준 오늘 · 지난 날짜와 미래 날짜는 체크할 수 없습니다.</p>
                </section>
                <aside className={styles.summary} aria-label="출석 요약">
                    <p className={styles.eyebrow}>TODAY · Asia/Seoul</p>
                    <h2>오늘의 출석</h2>
                    <p className={styles.serverDate}>{result?.today || '서버 날짜 확인 필요'}</p>
                    <p className={styles.checkState}>{result ? result.checkedToday ? '오늘 출석을 완료했습니다.' : '오늘의 출석을 남겨보세요.' : '기록을 확인한 후 출석할 수 있습니다.'}</p>
                    <button type="button" className={styles.checkButton} disabled={!result || loading || saving || result.checkedToday} onClick={() => void checkAttendance()}>{saving ? '처리 중…' : result?.checkedToday ? '오늘 출석 완료 ✓' : '오늘 출석하기'}</button>
                    <div className={styles.monthCount}><span>선택한 달의 출석</span><strong>{result ? `${result.items.length}일` : '—'}</strong></div>
                    <p className={styles.reward}>보상 0P · 포인트 지급 없음</p>
                </aside>
            </div>
            <p className={styles.notice} role="status" aria-live="polite" aria-atomic="true">{notice}</p>
        </section>
    );
};

export default AttendanceCalendar;

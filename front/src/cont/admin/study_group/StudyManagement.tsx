import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { Search, RefreshCw, Trash2, ChevronLeft, ChevronRight, AlertTriangle, Bell, X } from 'lucide-react';
import { BACKEND_URL } from '../../../login/authHttp';
import { useAuth } from '../../../login/hooks/useAuth';
import styles from '../notice/adminNoticeList.module.css';
import local from './studyManagement.module.css';

interface Study {
    groupNum: number; title: string; description: string; leader: string | null;
    isPrivate: number; currentMembers: number; maxMembers: number; createdAt: string | null;
}
interface StudyPage {data: Study[]; totalItems: number; totalPages: number; currentPage: number;}

const StudyManagement: React.FC = () => {
    const {token, memberNum} = useAuth();
    const [page, setPage] = useState(1);
    const [keyword, setKeyword] = useState('');
    const [query, setQuery] = useState('');
    const [revision, setRevision] = useState(0);
    const [result, setResult] = useState<StudyPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState<number | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Study | null>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    const cancelRef = useRef<HTMLButtonElement>(null);
    const busy = useRef(false);
    const identity = useRef('');
    identity.current = `${memberNum}:${token}`;

    useEffect(() => {
        if (!deleteTarget) return;
        const previousFocus = document.activeElement as HTMLElement | null;
        const overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        cancelRef.current?.focus();
        const keyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                if (!busy.current) setDeleteTarget(null);
            }
            if (event.key === 'Tab') {
                const buttons = dialogRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
                if (!buttons?.length) {event.preventDefault(); dialogRef.current?.focus(); return;}
                const first = buttons[0]; const last = buttons[buttons.length - 1];
                if (event.shiftKey && document.activeElement === first) {event.preventDefault(); last.focus();}
                else if (!event.shiftKey && document.activeElement === last) {event.preventDefault(); first.focus();}
            }
        };
        document.addEventListener('keydown', keyDown);
        return () => {
            document.body.style.overflow = overflow;
            document.removeEventListener('keydown', keyDown);
            if (previousFocus?.isConnected) previousFocus.focus();
        };
    }, [deleteTarget]);

    useEffect(() => {
        const controller = new AbortController();
        setResult(null); setError(''); setLoading(true);
        setDeleteTarget(null);
        if (!token) {setLoading(false); return;}
        void axios.get<StudyPage>(`${BACKEND_URL}/api/admin/studies`, {
            params: {page, keyword: query}, headers: {Authorization: `Bearer ${token}`},
            signal: controller.signal, timeout: 15000
        }).then(response => {
            if (controller.signal.aborted) return;
            setResult(response.data);
            if (response.data.currentPage !== page) setPage(response.data.currentPage);
        }).catch(requestError => {
            if (!controller.signal.aborted && !axios.isCancel(requestError)) setError('스터디 목록을 불러오지 못했습니다.');
        }).finally(() => {if (!controller.signal.aborted) setLoading(false);});
        return () => controller.abort();
    }, [token, memberNum, page, query, revision]);

    const remove = async (study: Study) => {
        if (!token || busy.current) return;
        const owner = identity.current;
        busy.current = true; setDeleting(study.groupNum); setError('');
        try {
            await axios.delete(`${BACKEND_URL}/api/admin/studies/${study.groupNum}`, {
                headers: {Authorization: `Bearer ${token}`}, timeout: 30000
            });
            if (identity.current === owner) {
                window.dispatchEvent(new Event('notification-refresh'));
                setDeleteTarget(null);
                setRevision(value => value + 1);
            }
        } catch (requestError) {
            if (identity.current !== owner) return;
            const message = axios.isAxiosError(requestError) ? requestError.response?.data?.message : null;
            setError(typeof message === 'string' ? message : '삭제 결과를 확인하지 못했습니다. 새로고침하여 상태를 확인해주세요.');
        } finally {busy.current = false; setDeleting(null);}
    };

    const pages = result?.totalPages ?? 0;
    const start = Math.floor((page - 1) / 5) * 5 + 1;
    const pageNumbers = Array.from({length: Math.max(0, Math.min(5, pages - start + 1))}, (_, index) => start + index);
    return <div className={styles.page}><div className={styles.container}>
        <div className={styles.header}>
            <div><h1>스터디 관리</h1><p>생성된 스터디를 조회하고 삭제할 수 있습니다. 삭제하면 참여 회원에게 알림이 전송됩니다.</p></div>
            <button type="button" className={styles.addButton} disabled={loading || deleting !== null}
                onClick={() => setRevision(value => value + 1)}><RefreshCw size={18}/> 새로고침</button>
        </div>
        <form className={styles.searchBox} onSubmit={event => {
            event.preventDefault(); if (busy.current) return;
            setPage(1); setQuery(keyword.trim()); setRevision(value => value + 1);
        }}>
            <label className={local.searchLabel} htmlFor="admin-study-search">스터디명·방장 검색</label>
            <input id="admin-study-search" value={keyword} maxLength={100} placeholder="검색어를 입력해주세요."
                onChange={event => setKeyword(event.target.value)}/>
            <button type="submit" disabled={deleting !== null}><Search size={17}/> 검색</button>
        </form>
        {error && <p className={local.error} role="alert">{error}</p>}
        <div className={styles.tableBox}>
            <div className={styles.tableHeader}>{loading ? '조회 중...' : `전체 ${result?.totalItems ?? 0}건`}</div>
            <div className={local.tableScroll}><table className={`${styles.table} ${local.table}`}>
                <thead><tr><th>번호</th><th>스터디명</th><th>방장</th><th>공개 여부</th><th>인원</th><th>생성일</th><th>관리</th></tr></thead>
                <tbody>{loading ? <tr><td colSpan={7} className={styles.empty} role="status">스터디를 불러오는 중입니다.</td></tr>
                    : result?.data.map(study => <tr key={study.groupNum}>
                        <td>{study.groupNum}</td><td className={styles.titleCell} title={study.description}>{study.title}</td>
                        <td>{study.leader || '방장 없음'}</td><td><span className={local.visibility}>{Number(study.isPrivate) === 1 ? '비공개' : '공개'}</span></td>
                        <td>{study.currentMembers} / {study.maxMembers}</td><td>{study.createdAt?.slice(0, 10) || '-'}</td>
                        <td><div className={styles.manageButtons}><button type="button" className={styles.deleteButton}
                            aria-label={`${study.title} 삭제`} title="스터디 삭제" disabled={deleting !== null}
                            onClick={() => {setError(''); setDeleteTarget(study);}}><Trash2 size={16}/></button></div></td>
                    </tr>)}
                    {!loading && result?.data.length === 0 && <tr><td colSpan={7} className={styles.empty}>조회된 스터디가 없습니다.</td></tr>}
                </tbody>
            </table></div>
        </div>
        <nav className={styles.pagination} aria-label="스터디 페이지 이동">
            <button type="button" aria-label="이전 페이지" disabled={loading || page <= 1 || deleting !== null}
                onClick={() => setPage(value => value - 1)}><ChevronLeft size={18}/></button>
            {pageNumbers.map(num => <button type="button" key={num} className={page === num ? styles.activePage : ''}
                aria-current={page === num ? 'page' : undefined} disabled={loading || deleting !== null} onClick={() => setPage(num)}>{num}</button>)}
            <button type="button" aria-label="다음 페이지" disabled={loading || page >= pages || deleting !== null}
                onClick={() => setPage(value => value + 1)}><ChevronRight size={18}/></button>
        </nav>
        {deleteTarget && createPortal(
            <div className={local.overlay} onClick={event => {
                if (event.target === event.currentTarget && !busy.current) setDeleteTarget(null);
            }}>
                <div ref={dialogRef} className={local.confirmDialog} role="alertdialog" aria-modal="true"
                    aria-labelledby="study-delete-title" aria-describedby="study-delete-description" tabIndex={-1}>
                    <button type="button" className={local.closeButton} aria-label="삭제 확인 닫기"
                        disabled={deleting !== null} onClick={() => setDeleteTarget(null)}><X size={20}/></button>
                    <div className={local.warningIcon}><AlertTriangle size={26} aria-hidden="true"/></div>
                    <h2 id="study-delete-title">정말 삭제하겠습니까?</h2>
                    <p id="study-delete-description" className={local.description}>삭제한 스터디와 연결된 데이터는 복구할 수 없습니다.</p>
                    <div className={local.targetCard}>
                        <strong>{deleteTarget.title}</strong>
                        <span>스터디 #{deleteTarget.groupNum} · 참여 회원 {deleteTarget.currentMembers}명</span>
                    </div>
                    <p className={local.deleteScope}>자료·일정·할 일·메모·채팅이 함께 삭제됩니다.</p>
                    <div className={local.notificationNote}><Bell size={17} aria-hidden="true"/><span>방장을 포함한 참여 회원에게 삭제 알림이 전달됩니다.</span></div>
                    {error && <p className={local.error} role="alert">{error}</p>}
                    <div className={local.confirmActions}>
                        <button ref={cancelRef} type="button" className={local.cancelButton} disabled={deleting !== null}
                            onClick={() => setDeleteTarget(null)}>취소</button>
                        <button type="button" className={local.confirmButton} disabled={deleting !== null}
                            onClick={() => void remove(deleteTarget)}><Trash2 size={16}/>{deleting !== null ? '삭제 중...' : '삭제하기'}</button>
                    </div>
                </div>
            </div>, document.body)}
    </div></div>;
};
export default StudyManagement;

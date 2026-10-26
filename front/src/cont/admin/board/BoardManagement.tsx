import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { BACKEND_URL } from '../../../login/authHttp';
import { useAuth } from '../../../login/hooks/useAuth';
import styles from '../notice/adminNoticeList.module.css';
import boardStyles from './boardManagement.module.css';
import { Search, RefreshCw, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

interface Post { postNum: number; title: string; content: string; author: string; category: string; createdAt: string; }
interface PostPage { data: Post[]; totalItems: number; totalPages: number; currentPage: number; }

const BoardManagement: React.FC = () => {
    const { token, memberNum } = useAuth();
    const [page, setPage] = useState(1);
    const [keyword, setKeyword] = useState('');
    const [query, setQuery] = useState('');
    const [revision, setRevision] = useState(0);
    const [result, setResult] = useState<PostPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState<number | null>(null);
    const [detailId, setDetailId] = useState<number | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const mutationRef = useRef(false);
    const identityRef = useRef('');
    identityRef.current = `${memberNum}:${token}`;

    useEffect(() => {
        if (detailId === null) return;
        const previousFocus = document.activeElement as HTMLElement | null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        modalRef.current?.focus();
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') { event.preventDefault(); setDetailId(null); }
            if (event.key === 'Tab') {
                const buttons = modalRef.current?.querySelectorAll<HTMLButtonElement>('button');
                if (!buttons?.length) return;
                const first = buttons[0];
                const last = buttons[buttons.length - 1];
                if (event.shiftKey && (document.activeElement === first || document.activeElement === modalRef.current)) {
                    event.preventDefault(); last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault(); first.focus();
                }
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = previousOverflow;
            if (previousFocus?.isConnected) previousFocus.focus();
        };
    }, [detailId]);

    useEffect(() => {
        const controller = new AbortController();
        setResult(null); setError(''); setLoading(true);
        setDetailId(null);
        if (!token) { setLoading(false); return; }
        void axios.get<PostPage>(`${BACKEND_URL}/api/admin/board`, {
            params: {page, keyword: query}, headers: {Authorization: `Bearer ${token}`},
            signal: controller.signal, timeout: 15000
        }).then(response => {
            if (controller.signal.aborted) return;
            setResult(response.data);
            if (response.data.currentPage !== page) setPage(response.data.currentPage);
        }).catch(requestError => {
            if (!controller.signal.aborted && !axios.isCancel(requestError)) setError('게시글을 불러오지 못했습니다.');
        }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [token, memberNum, page, query, revision]);

    const remove = async (post: Post) => {
        if (!token || mutationRef.current || !window.confirm(`“${post.title}” 게시글과 연결된 댓글을 삭제할까요?`)) return;
        const identity = identityRef.current;
        mutationRef.current = true; setDeleting(post.postNum); setError('');
        try {
            await axios.delete(`${BACKEND_URL}/api/admin/board/${post.postNum}`, {
                headers: {Authorization: `Bearer ${token}`}, timeout: 15000
            });
            if (identity === identityRef.current) setRevision(value => value + 1);
        } catch {
            if (identity === identityRef.current) setError('삭제하지 못했습니다. 목록을 다시 조회해 상태를 확인해주세요.');
        } finally { mutationRef.current = false; setDeleting(null); }
    };

    const totalPages = result?.totalPages ?? 0;
    const selectedPost = result?.data.find(post => post.postNum === detailId);
    const startPage = Math.floor((page - 1) / 5) * 5 + 1;
    const pageNumbers = Array.from({length: Math.max(0, Math.min(5, totalPages - startPage + 1))}, (_, index) => startPage + index);

    return <div className={styles.page}>
        <div className={styles.container}>
            <div className={styles.header}>
                <div><h1>게시판 관리</h1><p>커뮤니티 게시글을 조회하고 부적절한 게시글을 삭제할 수 있습니다.</p></div>
                <button type="button" className={styles.addButton} disabled={loading || deleting !== null}
                    onClick={() => setRevision(value => value + 1)}><RefreshCw size={18} /> 새로고침</button>
            </div>
            <form className={styles.searchBox} onSubmit={event => {
                event.preventDefault(); if (mutationRef.current) return;
                setPage(1); setQuery(keyword.trim()); setRevision(value => value + 1);
            }}>
                <label className={boardStyles.searchLabel} htmlFor="admin-board-search">제목·작성자 검색</label>
                <input id="admin-board-search" value={keyword} maxLength={100}
                    placeholder="검색어를 입력해주세요." onChange={event => setKeyword(event.target.value)} />
                <button type="submit" disabled={deleting !== null}><Search size={17} /> 검색</button>
            </form>
            {error && <p className={boardStyles.error} role="alert">{error}</p>}
            <div className={styles.tableBox}>
                <div className={styles.tableHeader}><span>{loading ? '조회 중...' : `전체 ${result?.totalItems ?? 0}건`}</span></div>
                <div className={boardStyles.tableScroll}>
                    <table className={`${styles.table} ${boardStyles.table}`}>
                        <thead><tr><th>번호</th><th>분류</th><th>제목</th><th>작성자</th><th>작성일</th><th>관리</th></tr></thead>
                        <tbody>{loading ? <tr><td colSpan={6} className={styles.empty} role="status">게시글을 불러오는 중입니다.</td></tr>
                            : result?.data.map(post => <tr key={post.postNum}>
                                <td>{post.postNum}</td><td><span className={boardStyles.category}>{post.category}</span></td>
                                <td className={`${styles.titleCell} ${boardStyles.postTitle}`}>{post.title || '제목 없음'}</td>
                                <td>{post.author || '탈퇴 회원'}</td><td>{post.createdAt?.slice(0, 10) || '-'}</td>
                                <td><div className={styles.manageButtons}>
                                    <button type="button" className={boardStyles.detailButton}
                                        aria-haspopup="dialog" onClick={() => setDetailId(post.postNum)}>
                                        상세보기
                                    </button>
                                    <button type="button" className={styles.deleteButton} aria-label="삭제"
                                        title={`${post.title || '게시글'} 삭제`} disabled={deleting !== null} onClick={() => void remove(post)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div></td>
                            </tr>)}
                            {!loading && result?.data.length === 0 && <tr><td colSpan={6} className={styles.empty}>조회된 게시글이 없습니다.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
            <nav className={styles.pagination} aria-label="게시글 페이지 이동">
                <button type="button" aria-label="이전 페이지" disabled={loading || page <= 1 || deleting !== null}
                    onClick={() => setPage(value => value - 1)}><ChevronLeft size={18} /></button>
                {pageNumbers.map(num => <button type="button" key={num} className={page === num ? styles.activePage : ''}
                    aria-current={page === num ? 'page' : undefined} disabled={loading || deleting !== null}
                    onClick={() => setPage(num)}>{num}</button>)}
                <button type="button" aria-label="다음 페이지" disabled={loading || page >= totalPages || deleting !== null}
                    onClick={() => setPage(value => value + 1)}><ChevronRight size={18} /></button>
            </nav>
            {selectedPost && createPortal(
                <div className={boardStyles.modalOverlay} onClick={event => {
                    if (event.target === event.currentTarget) setDetailId(null);
                }}>
                    <div ref={modalRef} className={boardStyles.modal} role="dialog" aria-modal="true"
                        aria-labelledby="board-detail-title" tabIndex={-1}>
                        <header className={boardStyles.modalHeader}>
                            <h2 id="board-detail-title">게시글 상세</h2>
                            <button type="button" aria-label="상세보기 닫기" onClick={() => setDetailId(null)}>×</button>
                        </header>
                        <div className={boardStyles.modalBody}>
                            <span className={boardStyles.category}>{selectedPost.category}</span>
                            <h3>{selectedPost.title || '제목 없음'}</h3>
                            <p className={boardStyles.metadata}>작성자: {selectedPost.author || '탈퇴 회원'} · 작성일: {selectedPost.createdAt?.slice(0, 10) || '-'} · #{selectedPost.postNum}</p>
                            <p className={boardStyles.content}>{selectedPost.content}</p>
                        </div>
                        <footer className={boardStyles.modalFooter}>
                            <button type="button" onClick={() => setDetailId(null)}>닫기</button>
                        </footer>
                    </div>
                </div>, document.body)}
        </div>
    </div>;
};
export default BoardManagement;

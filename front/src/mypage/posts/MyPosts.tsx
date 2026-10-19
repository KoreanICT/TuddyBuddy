import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../../login/authHttp';
import { useAuth } from '../../login/hooks/useAuth';
import styles from './myPosts.module.css';

interface MyPost {
    postNum: number;
    title: string;
    content: string;
    category: string;
}

interface MyPostsResponse {
    data: MyPost[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    startPage: number;
    endPage: number;
}

const MyPosts: React.FC = () => {
    const { isLoggedIn, memberNum } = useAuth();
    const [page, setPage] = useState(1);
    const [retry, setRetry] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedPost, setExpandedPost] = useState<number | null>(null);
    const [snapshot, setSnapshot] = useState<{ owner: number; response: MyPostsResponse } | null>(null);
    const result = isLoggedIn && snapshot && snapshot.owner === memberNum ? snapshot.response : null;

    useEffect(() => {
        const controller = new AbortController();
        setExpandedPost(null);
        setSnapshot(null);
        setError('');

        if (!isLoggedIn || memberNum === null) {
            setLoading(false);
            setError('로그인 후 나의 게시글을 확인할 수 있습니다.');
            return () => controller.abort();
        }

        const owner = memberNum;
        setLoading(true);
        const fetchPosts = async () => {
            try {
                const response = await axios.get<MyPostsResponse>(`${BACKEND_URL}/api/community/my-posts`, {
                    params: { cPage: page },
                    signal: controller.signal
                });
                if (controller.signal.aborted) return;
                if (!Array.isArray(response.data.data)) throw new Error('잘못된 게시글 목록 응답');
                setSnapshot({ owner, response: response.data });
            } catch (err) {
                if (controller.signal.aborted || axios.isCancel(err)) return;
                const status = axios.isAxiosError(err) ? err.response?.status : undefined;
                setError(status === 401
                    ? '로그인이 만료되었습니다. 다시 로그인해주세요.'
                    : status === 403
                        ? '게시글 목록에 접근할 권한이 없습니다.'
                        : '게시글을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        void fetchPosts();
        return () => controller.abort();
    }, [isLoggedIn, memberNum, page, retry]);

    const changePage = (nextPage: number) => {
        setPage(nextPage);
        setExpandedPost(null);
    };

    return (
        <section className={styles.container} aria-labelledby="mypage-posts-title" aria-busy={loading}>
            <header className={styles.header}>
                <h2 id="mypage-posts-title">나의 게시글</h2>
                <p>작성한 게시글을 확인할 수 있습니다. 제목을 누르면 본문이 펼쳐집니다.</p>
            </header>

            {loading ? (
                <p className={styles.state} role="status">게시글을 불러오는 중입니다.</p>
            ) : error ? (
                <div className={styles.state}>
                    <p role="alert">{error}</p>
                    {isLoggedIn && <button type="button" onClick={() => setRetry(value => value + 1)}>다시 시도</button>}
                </div>
            ) : result && result.data.length > 0 ? (
                <>
                    <p className={styles.summary}>전체 <strong>{result.totalItems.toLocaleString('ko-KR')}</strong>건</p>
                    <ul className={styles.list}>
                        {result.data.map(post => {
                            const expanded = expandedPost === post.postNum;
                            const contentId = `mypage-post-content-${post.postNum}`;
                            return (
                                <li key={post.postNum} className={styles.item}>
                                    <button
                                        type="button"
                                        className={styles.postButton}
                                        aria-expanded={expanded}
                                        aria-controls={contentId}
                                        onClick={() => setExpandedPost(expanded ? null : post.postNum)}
                                    >
                                        <span className={styles.category}>{post.category || '미분류'}</span>
                                        <span className={styles.title}>{post.title || '제목 없음'}</span>
                                        <span className={styles.indicator} aria-hidden="true">{expanded ? '−' : '+'}</span>
                                    </button>
                                    <div id={contentId} className={styles.content} hidden={!expanded}>
                                        {post.content || '본문이 없습니다.'}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                    {result.totalPages > 1 && (
                        <nav className={styles.pagination} aria-label="나의 게시글 페이지">
                            {result.startPage > 1 && (
                                <button type="button" onClick={() => changePage(result.startPage - 1)}>이전</button>
                            )}
                            {Array.from({ length: Math.max(0, result.endPage - result.startPage + 1) }, (_, index) => result.startPage + index).map(number => (
                                <button
                                    key={number}
                                    type="button"
                                    aria-current={number === result.currentPage ? 'page' : undefined}
                                    disabled={number === result.currentPage}
                                    onClick={() => changePage(number)}
                                >
                                    {number}
                                </button>
                            ))}
                            {result.endPage < result.totalPages && (
                                <button type="button" onClick={() => changePage(result.endPage + 1)}>다음</button>
                            )}
                        </nav>
                    )}
                </>
            ) : (
                <div className={styles.state}>
                    <h3>아직 작성한 게시글이 없습니다.</h3>
                    <p>작성한 게시글은 이곳에 표시됩니다.</p>
                </div>
            )}
        </section>
    );
};

export default MyPosts;


// 주용현

import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './adminNoticeList.module.css';

interface NoticeVO {
    num: number;
    member_num: number;
    title: string;
    content: string;
    imgn?: string;
    hit?: number;
    created_date?: string;
    updated_date?: string;
}

interface PageVO {
    totalPage: number;
    startPage: number;
    endPage: number;
}

interface NoticeListResponse {
    data: NoticeVO[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    startPage: number;
    endPage: number;
}

const AdminNoticeList: React.FC = () => {
    const navigate = useNavigate();

    const [notices, setNotices] = useState<NoticeVO[]>([]);
    const [cPage, setCPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState<PageVO>({ totalPage: 1, startPage: 1, endPage: 1 });

    const [searchType, setSearchType] = useState('1');
    const [keyword, setKeyword] = useState('');
    const [searchField, setSearchField] = useState('1');
    const [searchKeyword, setSearchKeyword] = useState('');

    const [loading, setLoading] = useState(false);
    const [deletingNum, setDeletingNum] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);

    // 공지사항 목록 조회
    const fetchNoticeList = useCallback(async (signal?: AbortSignal) => {
        setLoading(true);
        setErrorMessage('');

        try {
            const urls = 'http://localhost:80/back/api/notice/noticeList';
            const response = await axios.get<NoticeListResponse>(urls, {
                params: { cPage, searchType: searchField, searchValue: searchKeyword },
                signal
            });

            if (signal?.aborted) return;

            setNotices(response.data.data || []);
            setTotalCount(response.data.totalItems || 0);
            setPage({
                totalPage: Math.max(1, response.data.totalPages || 1),
                startPage: response.data.startPage || 1,
                endPage: response.data.endPage || 1
            });
        } catch (error) {
            if (signal?.aborted || axios.isCancel(error)) return;

            console.error('공지사항 목록 조회 실패:', error);
            setNotices([]);
            setTotalCount(0);
            setPage({ totalPage: 1, startPage: 1, endPage: 1 });
            setErrorMessage('공지사항 목록을 불러오지 못했습니다.');
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }, [cPage, searchField, searchKeyword]);

    useEffect(() => {
        const controller = new AbortController();
        fetchNoticeList(controller.signal);

        return () => controller.abort();
    }, [fetchNoticeList, refreshKey]);

    // 공지사항 검색
    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const nextKeyword = keyword.trim();

        if (cPage === 1 && searchField === searchType && searchKeyword === nextKeyword) {
            setRefreshKey(prev => prev + 1);
            return;
        }

        setCPage(1);
        setSearchField(searchType);
        setSearchKeyword(nextKeyword);
    };

    // 공지사항 삭제
    const handleDelete = async (num: number) => {
        if (deletingNum !== null) return;

        const confirmed = window.confirm('공지사항을 삭제하시겠습니까?');
        if (!confirmed) return;

        try {
            setDeletingNum(num);

            const urls = 'http://localhost:80/back/api/notice/noticeDelete';
            await axios.delete(urls, { params: { num } });

            alert('공지사항이 삭제되었습니다.');

            if (notices.length === 1 && cPage > 1) {
                setCPage(prev => prev - 1);
            } else {
                setRefreshKey(prev => prev + 1);
            }
        } catch (error) {
            console.error('공지사항 삭제 실패:', error);
            alert('공지사항 삭제에 실패했습니다.');
        } finally {
            setDeletingNum(null);
        }
    };

    // 페이지 번호
    const pageNumbers = Array.from(
        { length: Math.max(0, page.endPage - page.startPage + 1) },
        (_, i) => page.startPage + i
    );

    return (
        <div className={styles.page}>
            <div className={styles.container}>

                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <h1>공지사항 관리</h1>
                        <p>공지사항을 조회하고 등록, 수정, 삭제할 수 있습니다.</p>
                    </div>
                    <button type="button" className={styles.addButton} onClick={() => navigate('/admin/notice/add')}>
                        <Plus size={18} />
                        공지사항 등록
                    </button>
                </div>

                {/* Search */}
                <form className={styles.searchBox} onSubmit={handleSearch}>
                    <select value={searchType} onChange={e => setSearchType(e.target.value)}>
                        <option value="1">제목</option>
                        <option value="2">내용</option>
                    </select>
                    <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="검색어를 입력해주세요." />
                    <button type="submit"><Search size={17} /> 검색</button>
                </form>

                {/* Notice List */}
                <div className={styles.tableBox}>
                    <div className={styles.tableHeader}>
                        <span>전체 {totalCount}건</span>
                    </div>

                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>번호</th>
                                <th>제목</th>
                                <th>작성일</th>
                                <th>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={4} className={styles.empty}>공지사항을 불러오는 중입니다.</td></tr>
                            ) : errorMessage ? (
                                <tr><td colSpan={4} className={styles.empty}>{errorMessage}</td></tr>
                            ) : notices.length === 0 ? (
                                <tr><td colSpan={4} className={styles.empty}>등록된 공지사항이 없습니다.</td></tr>
                            ) : (
                                notices.map(notice => (
                                    <tr key={notice.num}>
                                        <td>{notice.num}</td>
                                        <td className={styles.titleCell}>
                                            <button type="button" onClick={() => navigate(`/admin/notice/edit/${notice.num}`)}>{notice.title}</button>
                                        </td>
                                        <td>{notice.created_date || '-'}</td>
                                        <td>
                                            <div className={styles.manageButtons}>
                                                <button type="button" className={styles.editButton} onClick={() => navigate(`/admin/notice/edit/${notice.num}`)} title="수정">
                                                    <Pencil size={16} />
                                                </button>
                                                <button type="button" className={styles.deleteButton} onClick={() => handleDelete(notice.num)} title="삭제" disabled={deletingNum !== null}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className={styles.pagination}>
                    <button type="button" disabled={loading || cPage <= 1} onClick={() => setCPage(prev => prev - 1)}>
                        <ChevronLeft size={18} />
                    </button>

                    {pageNumbers.map(num => (
                        <button type="button" key={num} className={cPage === num ? styles.activePage : ''} onClick={() => setCPage(num)} disabled={loading}>
                            {num}
                        </button>
                    ))}

                    <button type="button" disabled={loading || cPage >= page.totalPage} onClick={() => setCPage(prev => prev + 1)}>
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminNoticeList;

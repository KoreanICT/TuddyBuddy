
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, Megaphone } from 'lucide-react';

import styles from './noticeList.module.css';

interface NoticeVO {
    num: number;
    admin_num: number;
    title: string;
    content: string;
    imgn?: string;
    regdate?: string;
}

interface PageVO {
    totalPage: number;
    startPage: number;
    endPage: number;
}

interface NoticeListResponse {
    list: NoticeVO[];
    totalCount: number;
    page: PageVO;
}

const NoticeList: React.FC = () => {
    const navigate = useNavigate();

    const [notices, setNotices] = useState<NoticeVO[]>([]);
    const [cPage, setCPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState<PageVO>({ totalPage: 1, startPage: 1, endPage: 1 });
    const [searchType, setSearchType] = useState('title');
    const [keyword, setKeyword] = useState('');
    const [searchField, setSearchField] = useState('title');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [loading, setLoading] = useState(false);

    // 공지사항 목록 조회
    const fetchNoticeList = async () => {
        setLoading(true);

        try {
            const urls = "http://localhost:80/back/api/notice/noticeList";
            const response = await axios.get<NoticeListResponse>(urls, {
                params: { cPage, searchType: searchField, keyword: searchKeyword }
            });

            setNotices(response.data.list || []);
            setTotalCount(response.data.totalCount || 0);
            setPage(response.data.page || { totalPage: 1, startPage: 1, endPage: 1 });
        } catch (error) {
            console.error('공지사항 목록 조회 실패:', error);
            setNotices([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNoticeList();
    }, [cPage, searchField, searchKeyword]);

    // 검색
    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setCPage(1);
        setSearchField(searchType);
        setSearchKeyword(keyword.trim());
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
                    <div className={styles.headerIcon}>
                        <Megaphone size={24} />
                    </div>
                    <h1>공지사항</h1>
                    <p>TuddyBuddy의 새로운 소식과 주요 안내사항을 확인하세요.</p>
                </div>

                {/* Search */}
                <form className={styles.searchBox} onSubmit={handleSearch}>
                    <select value={searchType} onChange={e => setSearchType(e.target.value)}>
                        <option value="title">제목</option>
                        <option value="content">내용</option>
                    </select>
                    <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="공지사항 검색" />
                    <button type="submit"><Search size={17} /> 검색</button>
                </form>

                {/* Notice List */}
                <div className={styles.tableBox}>
                    <div className={styles.tableHeader}>
                        <span>전체 <strong>{totalCount}</strong>건</span>
                    </div>

                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>번호</th>
                                <th>제목</th>
                                <th>작성일</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={3} className={styles.empty}>공지사항을 불러오는 중입니다.</td></tr>
                            ) : notices.length === 0 ? (
                                <tr><td colSpan={3} className={styles.empty}>등록된 공지사항이 없습니다.</td></tr>
                            ) : (
                                notices.map(notice => (
                                    <tr key={notice.num} onClick={() => navigate(`/notice/${notice.num}`)} className={styles.noticeRow}>
                                        <td>{notice.num}</td>
                                        <td className={styles.titleCell}>{notice.title}</td>
                                        <td>{notice.regdate || '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className={styles.pagination}>
                    <button type="button" disabled={cPage <= 1} onClick={() => setCPage(cPage - 1)}>
                        <ChevronLeft size={18} />
                    </button>

                    {pageNumbers.map(num => (
                        <button type="button" key={num} className={cPage === num ? styles.activePage : ''} onClick={() => setCPage(num)}>
                            {num}
                        </button>
                    ))}

                    <button type="button" disabled={cPage >= page.totalPage} onClick={() => setCPage(cPage + 1)}>
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NoticeList;

// 주용현

import axios from 'axios';
import { useAuth } from '../../login/hooks/useAuth';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Megaphone, ImageIcon } from 'lucide-react';

import styles from './noticeDetail.module.css';

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

const NoticeDetail: React.FC = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const { num } = useParams<{ num: string }>();

    const getAuthHeaders = useCallback(() => ({
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    }), [token]);

    const [notice, setNotice] = useState<NoticeVO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // 공지사항 상세 조회
    const fetchNoticeDetail = useCallback(async () => {
        setLoading(true);

        try {
            const urls = "http://localhost:80/back/api/notice/noticeDetail";
            const response = await axios.get<NoticeVO>(urls, {
                headers: getAuthHeaders(),
                params: { num }
            });

            setNotice(response.data);
            setError(false);
        } catch (error) {
            console.error('공지사항 상세 조회 실패:', error);
            setNotice(null);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [num, getAuthHeaders]);

    useEffect(() => {
        if (!num || !/^\d+$/.test(num)) {
            setNotice(null);
            setError(true);
            setLoading(false);
            return;
        }

        fetchNoticeDetail();
    }, [num, fetchNoticeDetail]);

    // 작성일 표시
    const formatDate = (date?: string) => {
        if (!date) return '-';

        const parsed = new Date(date);
        return isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString('ko-KR');
    };

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

                {/* Detail */}
                {loading ? (
                    <div className={styles.message}>공지사항을 불러오는 중입니다.</div>
                ) : error || !notice ? (
                    <div className={styles.message}>
                        <h2>공지사항을 찾을 수 없습니다.</h2>
                        <p>삭제되었거나 존재하지 않는 공지사항입니다.</p>
                        <button type="button" onClick={() => navigate('/notice')}>목록으로 돌아가기</button>
                    </div>
                ) : (
                    <div className={styles.detailBox}>
                        <div className={styles.detailHeader}>
                            <h2>{notice.title}</h2>
                            <div className={styles.meta}>
                                <span><CalendarDays size={16} /> {formatDate(notice.created_date)}</span>
                                <span>공지번호 {notice.num}</span>
                            </div>
                        </div>

                        <div className={styles.detailContent}>
                            <div className={styles.content}>{notice.content}</div>

                            {notice.imgn && (
                                <div className={styles.imageBox}>
                                    <div className={styles.imageLabel}>
                                        <ImageIcon size={17} />
                                        첨부 이미지
                                    </div>
                                    <img
                                        src={`http://localhost:80/back/imgfile/${encodeURIComponent(notice.imgn)}`}
                                        alt="공지사항 첨부 이미지"
                                        className={styles.noticeImage}
                                    />
                                </div>
                            )}
                        </div>

                        <div className={styles.actions}>
                            <button type="button" className={styles.backButton} onClick={() => navigate('/notice')}>
                                <ArrowLeft size={18} />
                                목록으로
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NoticeDetail;

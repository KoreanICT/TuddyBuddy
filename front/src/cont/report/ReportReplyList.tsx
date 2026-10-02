import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './report.module.css';

interface ReportReplyVO {
    num: number;
    content: string;
    created_date: string;
    report_num: number;
    admin_num: number;
}

const ReportReplyList: React.FC = () => {

    const navigate = useNavigate();
    const [replyList, setReplyList] = useState<ReportReplyVO[]>([]);

    // 신고 답변 목록 조회
    const fetchReplyList = async () => {
        try {
            const urls = "http://localhost:80/back/api/report/reportReplyList"; // '/back/api/report/reportReplyList',

            const response = await axios.get(urls, {
                params: {
                    // TODO: 로그인 연결 후 실제 회원 번호 사용
                    member_num: 1
                }
            });

            setReplyList(response.data);

        } catch (error) {
            console.error('신고 답변 목록 조회 실패:', error);
        }
    };

    useEffect(() => {
        fetchReplyList();
    }, []);

    // 답변 상세 이동
    const handleDetail = (report_num: number) => {
        navigate(`/report/replyDetail/${report_num}`);
    };

    return (
        <div className={styles.reportReplyList}>

            {/* Header */}
            <div className={styles.header}>
                <h1>신고 답변 내역</h1>
                <p>내가 신고한 내용에 대한 관리자 답변을 확인합니다.</p>
            </div>

            {/* 답변 수 */}
            <div className={styles.replyCount}>
                전체 답변 {replyList.length}건
            </div>

            {/* 답변 목록 */}
            <div className={styles.replyTableWrapper}>
                <table className={styles.replyTable}>
                    <thead>
                        <tr>
                            <th>번호</th>
                            <th>신고 번호</th>
                            <th>답변 내용</th>
                            <th>답변일</th>
                        </tr>
                    </thead>

                    <tbody>
                        {replyList.length > 0 ? (
                            replyList.map(reply => (
                                <tr
                                    key={reply.num}
                                    onClick={() => handleDetail(reply.report_num)}
                                >
                                    <td>{reply.num}</td>
                                    <td>{reply.report_num}</td>
                                    <td>
                                        <div className={styles.replyContent}>
                                            {reply.content}
                                        </div>
                                    </td>
                                    <td>{reply.created_date}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className={styles.replyEmpty}>
                                    등록된 신고 답변이 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReportReplyList;
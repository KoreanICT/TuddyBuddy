import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../login/hooks/useAuth';
import ProfileCard from '../../profile/ProfileCard';
import { ReportType } from '../../report/reportTarget';
import styles from './report.module.css';

interface TargetDetail {
    available: boolean;
    general?: boolean;
    title?: string;
    content?: string;
    memberNum?: number;
    groupNum?: number;
}

const ReportTargetPreview: React.FC<{ reportNum: number; type: ReportType; targetNum: number }> = ({ reportNum, type, targetNum }) => {
    const { token } = useAuth();
    const [target, setTarget] = useState<TargetDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [revision, setRevision] = useState(0);
    const [downloading, setDownloading] = useState(false);
    const downloadRef = useRef(false);

    const downloadDocument = async () => {
        if (!target?.available || type !== 'document' || downloadRef.current) return;
        downloadRef.current = true;
        setDownloading(true);
        try {
            const response = await axios.get(`http://localhost:80/back/api/detail/document/download/${targetNum}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}, responseType: 'blob'
            });
            const url = URL.createObjectURL(response.data);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = target.content?.split(/[\\/]/).pop() || `document-${targetNum}`;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch {
            alert('자료를 다운로드할 수 없습니다. 파일의 존재 여부와 접근 권한을 확인해주세요.');
        } finally {
            downloadRef.current = false;
            setDownloading(false);
        }
    };

    useEffect(() => {
        let active = true;
        setLoading(true);
        setTarget(null);
        setError('');
        void axios.get<TargetDetail>('http://localhost:80/back/api/report/reportTargetDetail', {
            headers: token ? { Authorization: `Bearer ${token}` } : {}, params: { num: reportNum }
        }).then(response => { if (active) setTarget(response.data); })
            .catch(() => { if (active) setError('신고 대상 정보를 불러오지 못했습니다.'); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [reportNum, token, revision]);

    return <section className={styles.targetPreview} aria-label="신고 대상 확인">
        <h2>신고 대상 확인</h2>
        {loading ? <p role="status">대상 정보를 불러오는 중입니다.</p> : error ? <div role="alert">
            <p>{error}</p><button type="button" onClick={() => setRevision(value => value + 1)}>다시 시도</button>
        </div> : target?.general ? <p>일반 신고입니다. 별도의 신고 대상이 없습니다.</p>
            : !target?.available ? <p>삭제되었거나 현재 조회할 수 없는 대상입니다. 대상 번호: {targetNum}</p>
                : <>
                    <strong>{target.title || `대상 #${targetNum}`}</strong>
                    <p className={styles.targetContent}>{type === 'user' ? '회원코드: ' : type === 'document' ? '파일명: ' : ''}{target.content}</p>
                    {target.memberNum != null && <div className={styles.targetMember}>
                        <ProfileCard memberNum={Number(target.memberNum)} /><span>{type === 'user' ? '회원' : '작성 회원'} #{target.memberNum}</span>
                    </div>}
                    {target.groupNum != null && <Link to={`/group/detail/${target.groupNum}`}>해당 스터디로 이동</Link>}
                    {type === 'document' && <button type="button" className={styles.listButton}
                        disabled={downloading} onClick={() => void downloadDocument()}>
                        {downloading ? '다운로드 중...' : '신고 자료 다운로드'}
                    </button>}
                </>}
    </section>;
};

export default ReportTargetPreview;

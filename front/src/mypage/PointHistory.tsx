import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_URL, memberSessionConfig } from '../login/authHttp';
import { memberSessionKey } from '../login/session';
import MemberSessionBoundary from './MemberSessionBoundary';
import './PointHistory.css';

interface PointHistoryProps {
  history?: PointHistoryItem[];
  embedded?: boolean;
  loading?: boolean;
  error?: string;
}

export interface PointHistoryItem {
  point_num: number;
  regdate: string | null;
  amount: number;
  balance_after: number;
  description: string | null;
}

interface PointHistoryContentProps extends PointHistoryProps {
  sessionKey: string;
}

const validHistory = (value: unknown): value is PointHistoryItem[] => Array.isArray(value) && value.every(item =>
  item !== null && typeof item === 'object' && Number.isSafeInteger(item.point_num) &&
  Number.isSafeInteger(item.amount) && Number.isSafeInteger(item.balance_after) &&
  (item.regdate === null || typeof item.regdate === 'string') &&
  (item.description === null || typeof item.description === 'string'));

// java.sql.Date 응답은 달력 날짜로 표시하여 브라우저 시간대에 따른 날짜 이동을 피한다.
const formatDate = (value: string | null) => {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T)/);
  return match ? `${match[1]}.${match[2]}.${match[3]}` : '-';
};

const PointHistoryContent: React.FC<PointHistoryContentProps> = ({ embedded = false, sessionKey }) => {
  const Heading = embedded ? 'h3' : 'h2';
  const [histories, setHistories] = useState<PointHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const isCurrent = () => !controller.signal.aborted && memberSessionKey() === sessionKey;
    setHistories([]);
    setLoading(true);
    setError('');
    const load = async () => {
      try {
        const response = await axios.get<unknown>(`${BACKEND_URL}/api/attendance/point-history`,
          memberSessionConfig(sessionKey, { signal: controller.signal, timeout: 15000 }));
        if (!isCurrent()) return;
        if (!validHistory(response.data)) throw new Error('잘못된 포인트 내역 응답');
        setHistories(response.data);
      } catch (err) {
        if (!isCurrent() || axios.isCancel(err)) return;
        const status = axios.isAxiosError(err) ? err.response?.status : undefined;
        setError(status === 401 ? '로그인이 만료되었습니다. 다시 로그인해주세요.'
          : status === 403 ? '포인트 내역을 조회할 권한이 없습니다.'
            : '포인트 내역을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        if (isCurrent()) setLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [sessionKey, retry]);

  return (
    <section className={`point-history-page${embedded ? ' point-history-embedded' : ''}`} aria-label="포인트 내역" aria-busy={loading}>
      <div className="point-history-container">
        {!embedded && <div className="point-history-header">
          <Heading>포인트 내역</Heading>
        </div>}
        {loading ? <p className="point-history-state" role="status">포인트 내역을 불러오는 중입니다.</p>
          : error ? <div className="point-history-state">
            <p role="alert">{error}</p>
            <button type="button" onClick={() => setRetry(value => value + 1)}>다시 시도</button>
          </div>
            : histories.length === 0 ? <p className="point-history-state">포인트 변동 내역이 없습니다.</p>
              : <div className="point-history-scroll">
                <table className="point-history-table">
                  <caption className="point-history-caption">포인트 변동 내역</caption>
                  <thead><tr><th scope="col">변동일</th><th scope="col">변동 포인트</th><th scope="col">변동 후 잔액</th><th scope="col">변동 사유</th></tr></thead>
                  <tbody>{histories.map(item => <tr key={item.point_num}>
                    <td>{formatDate(item.regdate)}</td>
                    <td className={item.amount < 0 ? 'point-minus' : 'point-plus'}>{item.amount > 0 ? '+' : ''}{item.amount.toLocaleString('ko-KR')}P</td>
                    <td>{item.balance_after.toLocaleString('ko-KR')}P</td>
                    <td>{item.description?.trim() || '-'}</td>
                  </tr>)}</tbody>
                </table>
              </div>}
      </div>
    </section>
  );
};

const PointHistory: React.FC<PointHistoryProps> = props => (
  <MemberSessionBoundary>{key => <PointHistoryContent {...props} sessionKey={key} />}</MemberSessionBoundary>
);

export default PointHistory;

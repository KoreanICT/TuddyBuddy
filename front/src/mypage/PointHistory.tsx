import React from 'react';
import './PointHistory.css';

interface PointHistoryProps {
  history?: PointHistoryItem[];
  embedded?: boolean;
  loading?: boolean;
  error?: string;
}

export interface PointHistoryItem {
  point_num: number;
  amount: number;
  balance_after: number;
  description: string | null;
  regdate: string;
}

const PointHistory: React.FC<PointHistoryProps> = ({
  history,
  embedded = false,
  loading = false,
  error = '',
}) => {
  const Heading = embedded ? 'h3' : 'h2';
  const formatDate = (regdate: string) => {
    const date = new Date(regdate);
    return Number.isNaN(date.getTime()) ? regdate : date.toLocaleDateString('ko-KR');
  };

  return (
    <section className={`point-history-page${embedded ? ' point-history-embedded' : ''}`} aria-label="포인트 내역">
      <div className="point-history-container">
        {!embedded && <div className="point-history-header">
          <Heading>포인트 내역</Heading>
        </div>}
        {loading ? (
          <p className="point-history-status" role="status">포인트 내역을 불러오는 중입니다.</p>
        ) : error ? (
          <p className="point-history-status point-history-error" role="alert">{error}</p>
        ) : history === undefined ? (
          <p className="point-history-status">마이페이지에서 포인트 내역 보기를 선택하면 내역을 확인할 수 있습니다.</p>
        ) : history.length === 0 ? (
          <p className="point-history-status">아직 포인트 변동 내역이 없습니다.</p>
        ) : (
          <div className="point-history-list">
            {history.map((item) => (
              <article className="point-history-item" key={item.point_num}>
                <div className="point-history-info">
                  <strong>{item.description || '포인트 변동'}</strong>
                  <span>{formatDate(item.regdate)}</span>
                  <span>변경 후 잔액 {item.balance_after.toLocaleString('ko-KR')}P</span>
                </div>
                <strong className={item.amount >= 0 ? 'point-plus' : 'point-minus'}>
                  {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString('ko-KR')}P
                </strong>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PointHistory;

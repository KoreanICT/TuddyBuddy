import React from 'react';
import './PointHistory.css';

interface PointHistoryProps {
  embedded?: boolean;
}

const PointHistory: React.FC<PointHistoryProps> = ({ embedded = false }) => {
  const Heading = embedded ? 'h3' : 'h2';

  return (
    <section className={`point-history-page${embedded ? ' point-history-embedded' : ''}`} aria-label="포인트 내역">
      <div className="point-history-container">
        <div className="point-history-header">
          <Heading>포인트 내역</Heading>
        </div>
        <p className="point-history-unconnected">
          포인트 적립·사용 내역은 아직 연결되지 않았습니다.
        </p>
      </div>
    </section>
  );
};

export default PointHistory;

import React from 'react';

// 포인트 내역 페이지 CSS를 불러옵니다.
import './PointHistory.css';


const PointHistory: React.FC = () => {

  // 포인트 내역 테스트 데이터입니다.
  // 나중에는 API를 통해 DB에서 가져오면 됩니다.
  const pointHistory = [
    {
      id: 1,
      date: '2026-09-30',
      content: '출석 포인트',
      point: 500,
    },
    {
      id: 2,
      date: '2026-09-28',
      content: '문제 풀이 보상',
      point: 1000,
    },
    {
      id: 3,
      date: '2026-09-25',
      content: '포인트 사용',
      point: -2000,
    },
    {
      id: 4,
      date: '2026-09-20',
      content: '회원가입 포인트',
      point: 5000,
    },
  ];


  return (
    <div className="point-history-page">

      <div className="point-history-container">


        {/* =========================
            페이지 제목 영역
        ========================= */}

        <div className="point-history-header">

          <h2>
            포인트 내역
          </h2>

          <p>
            회원님의 포인트 적립 및 사용 내역입니다.
          </p>

        </div>


        {/* =========================
            포인트 내역 리스트
        ========================= */}

        <div className="point-history-list">

          {pointHistory.map((item) => (

            <div
              className="point-history-item"
              key={item.id}
            >


              {/* =========================
                  포인트 내역 내용
              ========================= */}

              <div className="point-history-info">

                <strong>
                  {item.content}
                </strong>

                <span>
                  {item.date}
                </span>

              </div>


              {/* =========================
                  포인트 증감
              ========================= */}

              <div
                className={
                  item.point > 0
                    ? 'point-plus'
                    : 'point-minus'
                }
              >

                {/* 양수면 + 표시 */}
                {item.point > 0 ? '+' : ''}

                {/* 포인트 숫자 */}
                {item.point.toLocaleString()} P

              </div>


            </div>

          ))}

        </div>


      </div>

    </div>
  );
};


export default PointHistory;
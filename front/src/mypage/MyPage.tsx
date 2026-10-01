import React, { useState } from 'react';

// 페이지 이동을 위해 useNavigate를 가져옵니다.
import { useNavigate } from 'react-router-dom';

// 마이페이지 CSS를 불러옵니다.
import './MyPage.css';


const MyPage: React.FC = () => {

  // 페이지 이동에 사용할 navigate입니다.
  const navigate = useNavigate();


  // 회원 정보 예시 데이터입니다.
  // 실제 프로젝트에서는 로그인한 회원의 정보를 API에서 받아오면 됩니다.
  const [formData, setFormData] = useState({
    email: 'user@example.com',
    name: '홍길동',
    nickname: '길동이',
    phone: '010-1234-5678',
    authority: '학생',
    path: '온라인(SNS 및 검색)',
  });


  // 현재 회원이 가지고 있는 잔여 포인트입니다.
  // 현재는 테스트를 위해 12,500P로 설정했습니다.
  // 나중에는 DB/API에서 받아온 값을 사용하면 됩니다.
  const [point] = useState(12500);


  return (
    <div className="mypage-page">

      <div className="mypage-container">


        {/* =========================
            마이페이지 헤더
        ========================= */}

        <div className="mypage-header">

          <h2>마이페이지</h2>

          <p>
            회원님의 정보를 확인하고 수정할 수 있습니다.
          </p>

        </div>


        <form className="mypage-form">


          {/* =========================
              프로필 요약 카드
          ========================= */}

          <div className="mypage-profile-card">

            {/* 회원 이름의 첫 글자를 보여주는 프로필 영역 */}
            <div className="profile-avatar">

              <span>
                {formData.name.charAt(0)}
              </span>

            </div>


            {/* 회원의 닉네임과 이메일을 보여주는 영역 */}
            <div className="profile-info">

              <h3>
                {formData.nickname} 님
              </h3>

              <p>
                {formData.email} ·{' '}

                <span className="badge">
                  {formData.authority}
                </span>
              </p>

            </div>

          </div>


          {/* =========================
              포인트 영역
          ========================= */}

          <div className="mypage-point-section">


            {/* 현재 잔여 포인트 */}
            <div className="point_summary">

              <div className="point_summary_title">

                <span>
                  잔여 포인트
                </span>

              </div>


              <div className="point_amount">

                {point.toLocaleString()}

                <span>
                  P
                </span>

              </div>

            </div>


            {/* 포인트 내역 페이지로 이동 */}
            <button
              type="button"
              className="point_history_button"

              // 포인트 내역 페이지로 이동합니다.
              onClick={() => navigate('/point_history')}
            >
              포인트 내역
            </button>


          </div>


          {/* =========================
              이메일
              이메일은 변경할 수 없도록 disabled 처리
          ========================= */}

          <div className="mypage-input-group">

            <label>
              이메일
            </label>

            <input
              type="email"
              value={formData.email}
              disabled
              className="input-disabled"
            />

          </div>


          {/* =========================
              이름
          ========================= */}

          <div className="mypage-input-group">

            <label>
              이름
            </label>

            <input
              type="text"
              value={formData.name}

              // 이름이 변경되면 formData의 name을 변경합니다.
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }

              placeholder="이름을 입력해주세요"
            />

          </div>


          {/* =========================
              닉네임
          ========================= */}

          <div className="mypage-input-group">

            <label>
              닉네임
            </label>


            {/* 닉네임 입력창 + 중복확인 버튼 */}
            <div className="mypage-input-button">

              <input
                type="text"
                value={formData.nickname}

                // 닉네임이 변경되면 formData의 nickname을 변경합니다.
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nickname: e.target.value,
                  })
                }

                placeholder="닉네임을 입력해주세요"
              />


              {/* 현재는 UI만 존재하는 중복확인 버튼입니다. */}
              <button type="button">
                중복확인
              </button>

            </div>

          </div>


          {/* =========================
              전화번호
          ========================= */}

          <div className="mypage-input-group">

            <label>
              전화번호
            </label>

            <input
              type="text"
              value={formData.phone}

              // 전화번호가 변경되면 formData의 phone을 변경합니다.
              onChange={(e) =>
                setFormData({
                  ...formData,
                  phone: e.target.value,
                })
              }

              placeholder="010-0000-0000"
            />

          </div>


          {/* =========================
              가입 유형
              회원의 권한은 변경하지 못하도록 disabled 처리
          ========================= */}

          <div className="mypage-input-group">

            <label>
              가입 유형
            </label>

            <input
              type="text"
              value={formData.authority}
              disabled
              className="input-disabled"
            />

          </div>


          {/* =========================
              하단 버튼
          ========================= */}

          <div className="mypage-buttons">


            {/* =========================
                취소 버튼
                클릭하면 홈으로 이동
            ========================= */}

            <button
              type="button"
              className="mypage-cancel-button"

              // 취소를 누르면 홈("/")으로 이동합니다.
              onClick={() => navigate('/')}
            >
              취소
            </button>


            {/* =========================
                정보 수정하기 버튼
                클릭하면 회원정보 수정 페이지로 이동
            ========================= */}

            <button
              type="button"
              className="mypage-submit-button"

              // 회원정보 수정 페이지로 이동합니다.
              // '/member_edit' 부분은 네가 만든 라우트 주소에 맞게 변경하면 됩니다.
              onClick={() => navigate('/member_edit')}
            >
              정보 수정하기
            </button>


          </div>


          {/* =========================
              계정 관리
          ========================= */}

          <div className="mypage-footer-links">


            {/* 로그아웃 버튼 */}
            <button
              type="button"
              className="link-button"
            >
              로그아웃
            </button>


            {/* 구분선 */}
            <span className="divider">
              |
            </span>


            {/* 회원 탈퇴 버튼 */}
            <button
              type="button"
              className="link-button dangerous"
            >
              회원 탈퇴
            </button>


          </div>


        </form>

      </div>

    </div>
  );
};


export default MyPage;
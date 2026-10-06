import React, { useState } from 'react';

// 페이지 이동을 위해 useNavigate를 가져옵니다.
import { useNavigate } from 'react-router-dom';

// 마이페이지 CSS를 불러옵니다.
import './MyPage.css';

const MyPage: React.FC = () => {

  // 페이지 이동에 사용할 navigate입니다.
  const navigate = useNavigate();

  // 회원 정보 예시 데이터입니다.
  const [formData, setFormData] = useState({
    email: 'user@example.com',
    name: '홍길동',
    nickname: '길동이',
    phone: '010-1234-5678',
    authority: '학생',
    path: '온라인(SNS 및 검색)',
  });

  // 현재 회원이 가지고 있는 잔여 포인트입니다.
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
            <div className="profile-avatar">
              <span>
                {formData.name.charAt(0)}
              </span>
            </div>

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
              [수정됨] 포인트 영역 (가로 정렬 & 디자인 개선)
          ========================= */}
          <div className="mypage-point-box">
            <div className="point_info_group">
              <span className="point_label">잔여 포인트</span>
              <div className="point_amount">
                <strong>{point.toLocaleString()}</strong>
                <span className="point_unit">P</span>
              </div>
            </div>

            <button
              type="button"
              className="point_history_button"
              onClick={() => navigate('/point_history')}
            >
              포인트 내역 &gt;
            </button>
          </div>


          {/* =========================
              이메일
          ========================= */}
          <div className="mypage-input-group">
            <label>이메일</label>
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
            <label>이름</label>
            <input
              type="text"
              value={formData.name}
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
            <label>닉네임</label>
            <div className="mypage-input-button">
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nickname: e.target.value,
                  })
                }
                placeholder="닉네임을 입력해주세요"
              />
              <button type="button">
                중복확인
              </button>
            </div>
          </div>

          {/* =========================
              전화번호
          ========================= */}
          <div className="mypage-input-group">
            <label>전화번호</label>
            <input
              type="text"
              value={formData.phone}
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
          ========================= */}
          <div className="mypage-input-group">
            <label>가입 유형</label>
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
            <button
              type="button"
              className="mypage-cancel-button"
              onClick={() => navigate('/')}
            >
              취소
            </button>

            <button
              type="button"
              className="mypage-submit-button"
              onClick={() => navigate('/member_edit')}
            >
              정보 수정하기
            </button>
          </div>

          {/* =========================
              계정 관리
          ========================= */}
          <div className="mypage-footer-links">
            <button type="button" className="link-button">
              로그아웃
            </button>
            <span className="divider">|</span>
            <button type="button" className="link-button dangerous">
              회원 탈퇴
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default MyPage;
import React, { useState } from 'react';
import './MyPage.css';

const MyPage: React.FC = () => {
  // 예시 상태값 (실제 프로젝트에서는 API response 값으로 세팅)
  const [formData, setFormData] = useState({
    email: 'user@example.com',
    name: '홍길동',
    nickname: '길동이',
    phone: '010-1234-5678',
    authority: '학생',
    path: '온라인(SNS 및 검색)',
  });

  return (
    <div className="mypage-page">
      <div className="mypage-container">

        {/* 헤더 영역 */}
        <div className="mypage-header">
          <h2>마이페이지</h2>
          <p>회원님의 정보를 확인하고 수정할 수 있습니다.</p>
        </div>

        <form className="mypage-form">

          {/* 프로필 요약 카드 */}
          <div className="mypage-profile-card">
            <div className="profile-avatar">
              <span>{formData.name.charAt(0)}</span>
            </div>
            <div className="profile-info">
              <h3>{formData.nickname} 님</h3>
              <p>{formData.email} · <span className="badge">{formData.authority}</span></p>
            </div>
          </div>

          {/* 이메일 (계정 정보 - 변경 불가) */}
          <div className="mypage-input-group">
            <label>이메일</label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="input-disabled"
            />
          </div>

          {/* 비밀번호 변경 영역 */}
          <div className="mypage-input-group">
            <label>비밀번호 변경</label>
            <div className="mypage-password-box">
              <input
                type="password"
                placeholder="현재 비밀번호"
              />
              <input
                type="password"
                placeholder="새 비밀번호"
              />
              <input
                type="password"
                placeholder="새 비밀번호 확인"
              />
            </div>
          </div>

          {/* 이름 */}
          <div className="mypage-input-group">
            <label>이름</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="이름을 입력해주세요"
            />
          </div>

          {/* 닉네임 */}
          <div className="mypage-input-group">
            <label>닉네임</label>
            <div className="mypage-input-button">
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                placeholder="닉네임을 입력해주세요"
              />
              <button type="button">중복확인</button>
            </div>
          </div>

          {/* 전화번호 */}
          <div className="mypage-input-group">
            <label>전화번호</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="010-0000-0000"
            />
          </div>

          {/* 가입 유형 (조회전용) */}
          <div className="mypage-input-group">
            <label>가입 유형</label>
            <input
              type="text"
              value={formData.authority}
              disabled
              className="input-disabled"
            />
          </div>

          {/* 가입 경로 (조회전용) */}
          <div className="mypage-input-group">
            <label>가입 경로</label>
            <input
              type="text"
              value={formData.path}
              disabled
              className="input-disabled"
            />
          </div>

          {/* 하단 버튼 영역 */}
          <div className="mypage-buttons">
            <button type="button" className="mypage-cancel-button">
              취소
            </button>
            <button type="button" className="mypage-submit-button">
              정보 수정하기
            </button>
          </div>

          {/* 계정 관리 링크 */}
          <div className="mypage-footer-links">
            <button type="button" className="link-button">로그아웃</button>
            <span className="divider">|</span>
            <button type="button" className="link-button dangerous">회원 탈퇴</button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default MyPage;
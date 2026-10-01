import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. useNavigate 임포트 추가
import './Signup.css';

const Signup: React.FC = () => {
  const [modalType, setModalType] = useState<string | null>(null);
  const navigate = useNavigate(); // 2. 훅 선언

  // 뒤로가기 버튼 핸들러
  const handleBack = () => {
    navigate(-1); // 이전 페이지로 이동
  };

  const getModalContent = (type: string | null) => {
    switch (type) {
      case 'terms':
        return {
          title: '서비스 이용약관',
          content: 'abc: 이곳은 서비스 이용약관 상세 내용입니다.',
        };
      case 'privacy':
        return {
          title: '개인정보 수집 및 이용 동의',
          content: 'abc: 이곳은 개인정보 수집 및 이용 동의 상세 내용입니다.',
        };
      case 'marketing':
        return {
          title: '마케팅 정보 수신 동의',
          content: 'abc: 이곳은 마케팅 정보 수신 동의 상세 내용입니다.',
        };
      default:
        return { title: '', content: '' };
    }
  };

  const currentModal = getModalContent(modalType);

  return (
    <div className="signup-page">
      <div className="signup-container">

        {/* 제목 */}
        <div className="signup-header">
          <h2>회원가입</h2>
          <p>TuddyBuddy에 오신 것을 환영합니다.</p>
        </div>

        <form className="signup-form">

          {/* 이메일 */}
          <div className="signup-input-group">
            <label>이메일</label>
            <div className="signup-input-button">
              <input type="email" placeholder="이메일을 입력해주세요" />
              <button type="button">인증요청</button>
            </div>
          </div>

          {/* 이메일 인증번호 */}
          <div className="signup-input-group">
            <label>이메일 인증번호</label>
            <div className="signup-input-button">
              <input type="text" placeholder="인증번호를 입력해주세요" />
              <button type="button">확인</button>
            </div>
          </div>

          {/* 비밀번호 */}
          <div className="signup-input-group">
            <label>비밀번호</label>
            <input type="password" placeholder="비밀번호를 입력해주세요" />
          </div>

          {/* 비밀번호 재확인 */}
          <div className="signup-input-group">
            <label>비밀번호 재확인</label>
            <input type="password" placeholder="비밀번호를 다시 입력해주세요" />
          </div>

          {/* 이름 */}
          <div className="signup-input-group">
            <label>이름</label>
            <input type="text" placeholder="이름을 입력해주세요" />
          </div>

          {/* 닉네임 */}
          <div className="signup-input-group">
            <label>닉네임</label>
            <input type="text" placeholder="닉네임을 입력해주세요" />
          </div>

          {/* 전화번호 */}
          <div className="signup-input-group">
            <label>전화번호</label>
            <input type="text" placeholder="010-0000-0000" />
          </div>

          {/* 추천인 코드 */}
          <div className="signup-input-group">
            <label>추천인 코드</label>
            <input type="text" placeholder="fuxkub" />
          </div>

          {/* 가입 유형 */}
          <div className="signup-input-group">
            <label>가입 유형</label>
            <div className="signup-radio-group">
              <label className="signup-radio">
                <input type="radio" name="authority" />
                <span>학생</span>
              </label>
              <label className="signup-radio">
                <input type="radio" name="authority" />
                <span>선생님</span>
              </label>
              <label className="signup-radio">
                <input type="radio" name="authority" />
                <span>관리자</span>
              </label>
            </div>
          </div>

          {/* 약관 */}
          <div className="signup-agreement">
            <div className="agreement-all">
              <label>
                <input type="checkbox" />
                <span>전체 동의하기</span>
              </label>
            </div>

            <div className="agreement-item">
              <label>
                <input type="checkbox" />
                <span><em>(필수) </em>서비스 이용약관 동의</span>
              </label>
              <button type="button" className="agreement-view-btn" onClick={() => setModalType('terms')}>
                [보기]
              </button>
            </div>

            <div className="agreement-item">
              <label>
                <input type="checkbox" />
                <span><em>(필수) </em>개인정보 수집 및 이용 동의</span>
              </label>
              <button type="button" className="agreement-view-btn" onClick={() => setModalType('privacy')}>
                [보기]
              </button>
            </div>

            <div className="agreement-item">
              <label>
                <input type="checkbox" />
                <span><em className="optional">(선택) </em>마케팅 정보 수신 동의</span>
              </label>
              <button type="button" className="agreement-view-btn" onClick={() => setModalType('marketing')}>
                [보기]
              </button>
            </div>
          </div>

          {/* 버튼 (뒤로가기에 onClick={handleBack} 연결) */}
          <div className="signup-buttons">
            <button type="button" className="signup-back-button" onClick={handleBack}>
              뒤로가기
            </button>
            <button type="button" className="signup-submit-button">
              회원가입
            </button>
          </div>

        </form>
      </div>

      {/* 팝업 모달창 (글로벌 CSS 변수 연동) */}
      {modalType && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{currentModal.title}</h3>
            </div>
            <div className="modal-body">
              <p>{currentModal.content}</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="modal-close-btn" onClick={() => setModalType(null)}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
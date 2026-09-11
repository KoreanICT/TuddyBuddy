import React from 'react';
import './Signup.css';

const Signup: React.FC = () => {
  return (
    <div className="signup-page">
      <div className="signup-container">

        {/* 제목 */}
        <div className="signup-header">
          <h2>회원가입</h2>
          <p>ㅇㅇ에 오신 것을 환영합니다.</p>
        </div>

        <form className="signup-form">

          {/* 이메일 */}
          <div className="signup-input-group">
            <label>이메일</label>
            <div className="signup-input-button">
              <input
                type="email"
                placeholder="이메일을 입력해주세요"
              />
              <button type="button">인증요청</button>
            </div>
          </div>

          {/* 이메일 인증번호 */}
          <div className="signup-input-group">
            <label>이메일 인증번호</label>
            <div className="signup-input-button">
              <input
                type="text"
                placeholder="인증번호를 입력해주세요"
              />
              <button type="button">확인</button>
            </div>
          </div>

          {/* 비밀번호 */}
          <div className="signup-input-group">
            <label>비밀번호</label>
            <input
              type="password"
              placeholder="비밀번호를 입력해주세요"
            />
          </div>

          {/* 비밀번호 재확인 */}
          <div className="signup-input-group">
            <label>비밀번호 재확인</label>
            <input
              type="password"
              placeholder="비밀번호를 다시 입력해주세요"
            />
          </div>

          {/* 이름 */}
          <div className="signup-input-group">
            <label>이름</label>
            <input
              type="text"
              placeholder="이름을 입력해주세요"
            />
          </div>

          {/* 닉네임 */}
          <div className="signup-input-group">
            <label>닉네임</label>
            <input
              type="text"
              placeholder="닉네임을 입력해주세요"
            />
          </div>

          {/* 전화번호 */}
          <div className="signup-input-group">
            <label>전화번호</label>
            <input
              type="text"
              placeholder="010-0000-0000"
            />
          </div>

          {/* 가입 유형 */}
          <div className="signup-input-group">
            <label>가입 유형</label>

            <div className="signup-radio-group">
              <label className="signup-radio">
                <input
                  type="radio"
                  name="authority"
                />
                <span>학생</span>
              </label>

              <label className="signup-radio">
                <input
                  type="radio"
                  name="authority"
                />
                <span>선생님</span>
              </label>
               <label className="signup-radio">
                <input
                  type="radio"
                  name="authority"
                />
                <span>관리자</span>
              </label>
            </div>
          </div>

           {/* 가입 경로 */}
          <div className="signup-input-group">
            <label>가입 경로</label>

            <div className="signup-radio-group">
              <label className="signup-radio">
                <input
                  type="radio"
                  name="authority"
                />
                <span>온라인(SNS 및 검색)</span>
              </label>

              <label className="signup-radio">
                <input
                  type="radio"
                  name="authority"
                />
                <span>지인소개</span>
              </label>
               <label className="signup-radio">
                <input
                  type="radio"
                  name="authority"
                />
                <span>기타</span>
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
                <span>
                  서비스 이용약관 동의
                  <em>(필수)</em>
                </span>
              </label>

              <button type="button">[보기]</button>
            </div>

            <div className="agreement-item">
              <label>
                <input type="checkbox" />
                <span>
                  개인정보 수집 및 이용 동의
                  <em>(필수)</em>
                </span>
              </label>

              <button type="button">[보기]</button>
            </div>

          </div>

          {/* 버튼 */}
          <div className="signup-buttons">
            <button
              type="button"
              className="signup-back-button"
            >
              뒤로가기
            </button>

            <button
              type="button"
              className="signup-submit-button"
            >
              회원가입
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Signup;
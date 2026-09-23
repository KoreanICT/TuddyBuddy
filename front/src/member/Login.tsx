import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="login-page">

      <div className="login-form">

        {/* 제목 */}
        <div className="login-header">
          <h2>로그인</h2>
          <p>OOO에 오신 것을 환영합니다.</p>
        </div>

        {/* 이메일 */}
        <div className="login-input-group">
          <label htmlFor="email">이메일</label>

          <input
            id="email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일을 입력해주세요"
          />
        </div>

        {/* 비밀번호 */}
        <div className="login-input-group">
          <label htmlFor="password">비밀번호</label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력해주세요"
          />
        </div>

        {/* 로그인 버튼 */}
        <button
          type="button"
          className="login-button"
        >
          로그인
        </button>

        {/* 회원가입 */}
        <div className="login-footer">
          <span>아직 회원이 아니신가요?</span>

          <Link to="/user/signup">
            회원가입하기
          </Link>
        </div>

      </div>

    </div>
  );
};

export default Login;
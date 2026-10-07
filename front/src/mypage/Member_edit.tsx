import React, { useState } from 'react';

// 페이지 이동을 위해 useNavigate를 가져옵니다.
import { useNavigate } from 'react-router-dom';

// 정보수정 페이지 CSS를 불러옵니다.
import './Member_edit.css';


const Member_edit: React.FC = () => {

  // 페이지 이동에 사용할 navigate입니다.
  const navigate = useNavigate();


  // 회원 정보 예시 데이터입니다.
  // 나중에는 로그인한 회원의 정보를 API에서 받아오면 됩니다.
  const [formData, setFormData] = useState({
    email: 'user@example.com',
    password: '',
    passwordCheck: '',
    name: '홍길동',
    nickname: '길동이',
    phone: '010-1234-5678',
    authority: '학생',
  });


  return (
    <div className="member-edit-page">

      <div className="member-edit-container">


        {/* =========================
            페이지 헤더
        ========================= */}

        <div className="member-edit-header">

          <h2>
            정보 수정
          </h2>

          <p>
            회원님의 정보를 수정할 수 있습니다.
          </p>

        </div>


        <form className="member-edit-form">


          {/* =========================
              이메일
              이메일은 변경하지 못하도록 disabled 처리
          ========================= */}

          <div className="member-edit-input-group">

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
              비밀번호
          ========================= */}

          <div className="member-edit-input-group">

            <label>
              새 비밀번호
            </label>

            <input
              type="password"
              value={formData.password}

              // 비밀번호 입력값을 변경합니다.
              onChange={(e) =>
                setFormData({
                  ...formData,
                  password: e.target.value,
                })
              }

              placeholder="새 비밀번호를 입력해주세요"
            />

          </div>


          {/* =========================
              비밀번호 확인
          ========================= */}

          <div className="member-edit-input-group">

            <label>
              새 비밀번호 확인
            </label>

            <input
              type="password"
              value={formData.passwordCheck}

              // 비밀번호 확인 입력값을 변경합니다.
              onChange={(e) =>
                setFormData({
                  ...formData,
                  passwordCheck: e.target.value,
                })
              }

              placeholder="새 비밀번호를 다시 입력해주세요"
            />

          </div>


          {/* =========================
              이름
          ========================= */}

          <div className="member-edit-input-group">

            <label>
              이름
            </label>

            <input
              type="text"
              value={formData.name}

              // 이름을 수정합니다.
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

          <div className="member-edit-input-group">

            <label>
              닉네임
            </label>

            {/* 닉네임 입력창 + 중복확인 버튼 */}
            <div className="member-edit-input-button">

              <input
                type="text"
                value={formData.nickname}

                // 닉네임을 수정합니다.
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nickname: e.target.value,
                  })
                }

                placeholder="닉네임을 입력해주세요"
              />

              {/* 현재는 UI만 만들어둔 중복확인 버튼입니다. */}
              <button
                type="button"
                className="nickname-check-button"
              >
                중복확인
              </button>

            </div>

          </div>


          {/* =========================
              전화번호
          ========================= */}

          <div className="member-edit-input-group">

            <label>
              전화번호
            </label>

            <input
              type="text"
              value={formData.phone}

              // 전화번호를 수정합니다.
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
              회원 권한은 변경하지 못하도록 disabled 처리
          ========================= */}

          <div className="member-edit-input-group">

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

          <div className="member-edit-buttons">


            {/* 취소 버튼 */}
            <button
              type="button"
              className="member-edit-cancel-button"

              // 취소하면 마이페이지로 돌아갑니다.
              onClick={() => navigate('/auth/mypage')}
            >
              취소
            </button>

            {/* 수정 완료 버튼 */}
            <button
              type="button"
              className="member-edit-submit-button"

              // 현재는 UI만 존재합니다.
              // 나중에 API를 연결해서 회원정보를 저장하면 됩니다.
              onClick={() => {
                console.log('회원정보 수정:', formData);
              }}
            >
              수정 완료
            </button>


          </div>


        </form>

      </div>

    </div>
  );
};


export default Member_edit;
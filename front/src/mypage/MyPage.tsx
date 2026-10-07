import React, { useState } from 'react';
import './MyPage.css';

const MyPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState('info');

  return (
    <div className="mypage-page">
      <div className="mypage-layout">

        {/* 왼쪽 사이드 메뉴 */}
        <aside className="mypage-sidebar">
          <h3 className="sidebar-title">마이페이지</h3>

          <button
            className={
              activeMenu === 'info'
                ? 'sidebar-menu active'
                : 'sidebar-menu'
            }
            onClick={() => setActiveMenu('info')}
          >
            회원정보
          </button>

          <button
            className={
              activeMenu === 'point'
                ? 'sidebar-menu active'
                : 'sidebar-menu'
            }
            onClick={() => setActiveMenu('point')}
          >
            포인트 내역
          </button>

          <button
            className={
              activeMenu === 'example1'
                ? 'sidebar-menu active'
                : 'sidebar-menu'
            }
            onClick={() => setActiveMenu('example1')}
          >
            나의 게시글
          </button>

          <button
            className={
              activeMenu === 'example2'
                ? 'sidebar-menu active'
                : 'sidebar-menu'
            }
            onClick={() => setActiveMenu('example2')}
          >
            친구 목록
          </button>

          <button
            className={
              activeMenu === 'example3'
                ? 'sidebar-menu active'
                : 'sidebar-menu'
            }
            onClick={() => setActiveMenu('example3')}
          >
            나의 스터디 그룹
          </button>

          <button
            className={
              activeMenu === 'example4'
                ? 'sidebar-menu active'
                : 'sidebar-menu'
            }
            onClick={() => setActiveMenu('example4')}
          >
            학습 분석
          </button>
        </aside>

        {/* 오른쪽 본문 */}
        <main className="mypage-content">

          {/* 회원정보 */}
          {activeMenu === 'info' && (
            <div className="mypage-container">
              <h2 className="mypage-title">마이페이지</h2>

              <p className="mypage-subtitle">
                회원님의 정보를 확인하고 수정할 수 있습니다.
              </p>

              <div className="profile-card">
                <div className="profile-avatar">
                  홍
                </div>

                <div className="profile-info">
                  <h3>길동이 님</h3>

                  <p>
                    user@example.com
                    <span className="badge">
                      학생
                    </span>
                  </p>
                </div>
              </div>

              <div className="point-box">
                <p>잔여 포인트</p>
                <strong>12,500P</strong>

                <button
                  className="point-link"
                  onClick={() => setActiveMenu('point')}
                >
                  포인트 내역 &gt;
                </button>
              </div>

              <div className="form-group">
                <label>이메일</label>

                <input
                  type="text"
                  value="user@example.com"
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>이름</label>

                <input
                  type="text"
                  value="홍길동"
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>닉네임</label>

                <div className="nickname-row">
                  <input
                    type="text"
                    value="길동이"
                    readOnly
                  />

                  <button>
                    중복확인
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>전화번호</label>

                <input
                  type="text"
                  value="010-1234-5678"
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>가입 유형</label>

                <input
                  type="text"
                  value="학생"
                  readOnly
                />
              </div>
            </div>
          )}

          {/* 포인트 내역 */}
          {activeMenu === 'point' && (
            <div className="menu-panel">
              <h2>포인트 내역</h2>

              <p>
                여기에 포인트 내역 내용을 넣으면 됩니다.
              </p>
            </div>
          )}

          {/* 나의 게시글 */}
          {activeMenu === 'example1' && (
            <div className="menu-panel">
              <h2>나의 게시글</h2>

              <p>
                나의 게시글을 눌렀을 때 보여줄 내용입니다.
              </p>
            </div>
          )}

          {/* 친구 목록 */}
          {activeMenu === 'example2' && (
            <div className="menu-panel">
              <h2>친구 목록</h2>

              <p>
                친구 목록 메뉴를 눌렀을 때 보여줄 내용입니다.
              </p>
            </div>
          )}

          {/* 나의 스터디 그룹 */}
          {activeMenu === 'example3' && (
            <div className="menu-panel">
              <h2>나의 스터디 그룹</h2>

              <p>
                내가 참여한 스터디 그룹을 보여주는 영역입니다.
              </p>
            </div>
          )}

          {/* 학습 분석 */}
          {activeMenu === 'example4' && (
            <div className="menu-panel">
              <h2>학습 분석</h2>

              <p>
                학습 분석 메뉴를 눌렀을 때 보여줄 내용입니다.
              </p>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default MyPage;
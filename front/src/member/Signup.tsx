import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Signup.css';

const Signup: React.FC = () => {

  const navigate = useNavigate();

  const backendUrl =
    process.env.REACT_APP_BACK_END_URL ||
    'http://localhost/back';


  // =========================
  // 입력값
  // =========================

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  const [pwd1, setPwd1] = useState('');
  const [pwd2, setPwd2] = useState('');

  const [name, setName] = useState('');
  const [nick, setNick] = useState('');
  const [phone, setPhone] = useState('');

  const [emailVerified, setEmailVerified] =
    useState(false);


  // =========================
  // 약관
  // =========================

  const [termsAgree, setTermsAgree] =
    useState(false);

  const [privacyAgree, setPrivacyAgree] =
    useState(false);

  const [marketingAgree, setMarketingAgree] =
    useState(false);

  const [modalType, setModalType] =
    useState<string | null>(null);


  // =========================
  // 뒤로가기
  // =========================

  const handleBack = () => {
    navigate(-1);
  };


  // =========================
  // 이메일 인증번호 발송
  // =========================

  const handleEmailSend = async () => {

    if (!email.trim()) {
      alert('이메일을 입력해주세요.');
      return;
    }

    try {

      const response = await axios.post(
        `${backendUrl}/api/auth/emailCheck`,
        {
          email: email
        },
        {
          withCredentials: true
        }
      );

      console.log(
        '이메일 인증 요청 결과:',
        response.data
      );

      if (response.data === 0) {

        alert(
          '인증번호가 이메일로 발송되었습니다.'
        );

        setEmailVerified(false);

      } else {

        alert(
          '이미 사용 중인 이메일입니다.'
        );
      }

    } catch (error) {

      console.error(
        '이메일 인증 요청 오류:',
        error
      );

      if (axios.isAxiosError(error)) {

        console.log(
          '서버 응답:',
          error.response?.data
        );

        console.log(
          '상태 코드:',
          error.response?.status
        );
      }

      alert(
        '이메일 인증 요청 중 오류가 발생했습니다.'
      );
    }
  };


  // =========================
  // 이메일 인증번호 확인
  // =========================

  const handleEmailVerify = async () => {

    if (!email.trim()) {
      alert('이메일을 입력해주세요.');
      return;
    }

    if (!code.trim()) {
      alert('인증번호를 입력해주세요.');
      return;
    }

    try {

      const response = await axios.post(
        `${backendUrl}/api/auth/emailCheck/certi`,
        {
          email: email,
          code: code
        },
        {
          withCredentials: true
        }
      );

      console.log(
        '인증번호 확인 결과:',
        response.data
      );

      if (response.data.success === true) {

        setEmailVerified(true);

        alert(
          '이메일 인증이 완료되었습니다.'
        );

        return;
      }

      const reason =
        response.data.reason;

      if (reason === 'wrong') {

        alert(
          '인증번호가 일치하지 않습니다.'
        );

      } else if (reason === 'expired') {

        alert(
          '인증번호가 만료되었습니다. 다시 인증 요청해주세요.'
        );

      } else if (reason === 'exceeded') {

        alert(
          '인증 시도 횟수를 초과했습니다. 다시 인증 요청해주세요.'
        );

      } else {

        alert(
          '이메일 인증에 실패했습니다.'
        );
      }

    } catch (error) {

      console.error(
        '인증번호 확인 오류:',
        error
      );

      alert(
        '인증번호 확인 중 오류가 발생했습니다.'
      );
    }
  };


  // =========================
  // 회원가입
  // =========================

  const handleSignup = async () => {

    if (!emailVerified) {

      alert(
        '이메일 인증을 먼저 완료해주세요.'
      );

      return;
    }

    if (
      !email.trim() ||
      !pwd1.trim() ||
      !pwd2.trim() ||
      !name.trim() ||
      !nick.trim() ||
      !phone.trim()
    ) {

      alert(
        '필수 정보를 모두 입력해주세요.'
      );

      return;
    }

    if (pwd1 !== pwd2) {

      alert(
        '비밀번호가 일치하지 않습니다.'
      );

      return;
    }

    if (!termsAgree || !privacyAgree) {

      alert(
        '필수 약관에 동의해주세요.'
      );

      return;
    }

    try {

      const response = await axios.post(
        `${backendUrl}/api/member/signup`,
        {
          member_email: email,
          member_pwd: pwd1,
          member_name: name,
          member_nick: nick,
          member_phone: phone
        },
        {
          withCredentials: true
        }
      );

      console.log(
        '회원가입 결과:',
        response.data
      );

      alert(response.data);

      navigate('/auth/member');

    } catch (error) {

      console.error(
        '회원가입 오류:',
        error
      );

      if (axios.isAxiosError(error)) {

        console.log(
          '서버 상태:',
          error.response?.status
        );

        console.log(
          '서버 응답:',
          error.response?.data
        );
      }

      alert(
        '회원가입 중 오류가 발생했습니다.'
      );
    }
  };


  // =========================
  // 전체 약관 동의
  // =========================

  const handleAllAgree = (
    checked: boolean
  ) => {

    setTermsAgree(checked);
    setPrivacyAgree(checked);
    setMarketingAgree(checked);
  };


  const allAgree =
    termsAgree &&
    privacyAgree &&
    marketingAgree;


  // =========================
  // 약관 모달 내용
  // =========================

  const getModalContent = (
    type: string | null
  ) => {

    switch (type) {

      // =========================
      // 서비스 이용약관
      // =========================

      case 'terms':
        return {
          title: '서비스 이용약관',
          content: `[필수] 서비스 이용약관 동의

TuddyBuddy(이하 "회사")가 제공하는 서비스의 이용조건 및 절차, 회사와 회원 간의 권리, 의무 및 책임사항 등을 규정합니다.

1. 목적
- 본 약관은 회사가 제공하는 TuddyBuddy 관련 제반 서비스의 이용조건 및 절차를 규정합니다.

2. 용어의 정의
- "서비스"란 구현되는 단말기(PC, 휴대형기기 등)와 상관없이 회원이 이용할 수 있는 서비스를 의미합니다.
- "회원"이란 회사의 서비스에 접속하여 본 약관에 동의하고 계정을 생성한 자를 말합니다.

3. 약관의 효력과 개정
- 본 약관은 서비스 화면에 공지함으로써 효력이 발생합니다.`,
        };


      // =========================
      // 개인정보 필수
      // =========================

      case 'privacyRequired':
        return {
          title:
            '개인정보 수집 및 이용 동의 (필수)',

          content: `[필수] 개인정보 수집 및 이용 동의

TuddyBuddy(이하 "회사")는 회원가입, 원활한 고객 상담, 각종 서비스 제공을 위해 아래와 같이 개인정보를 수집 및 이용합니다.

1. 수집 및 이용 목적
   • 회원제 서비스 제공 및 본인 식별·인증
   • 가입 의사 확인 및 연령 확인
   • 불량회원의 부정 이용 방지와 비인가 사용 방지
   • 고지사항 전달 및 원활한 의사소통 경로 확보

2. 수집하는 개인정보 항목
   • [필수항목] 이메일(아이디), 비밀번호, 이름, 닉네임, 휴대전화번호, 가입 유형(학생/선생님/관리자)

3. 보유 및 이용 기간
   • 회원 탈퇴 시 지체 없이 파기합니다.
   • 단, 관계법령 규정에 의하여 보존할 필요가 있는 경우 법령이 정한 기간 동안 보관합니다.
     - 전자상거래 계약 및 청약철회 기록: 5년
     - 소비자의 불만 또는 분쟁 처리에 관한 기록: 3년
     - 통신사실확인자료(로그 기록 등): 3개월

4. 동의 거부 권리 및 불이익
   • 정보주체는 개인정보 수집·이용에 동의하지 않을 권리가 있습니다.
   • 필수항목 수집·이용에 대한 동의를 거부할 경우 회원가입 및 기본 서비스 이용이 불가능합니다.`,
        };


      // =========================
      // 마케팅 선택
      // =========================

      case 'privacyOptional':
        return {
          title:
            '마케팅 정보 수신 동의 (선택)',

          content: `[선택] 마케팅 정보 수신 동의

회사는 이용자에게 신규 서비스 안내, 이벤트 혜택 등 유용한 정보를 제공하기 위해 마케팅 목적으로 개인정보를 수집 및 이용하고자 합니다.

1. 수집 및 이용 목적
   • 신규 서비스 개발 및 맞춤형 서비스 제공
   • 이벤트 및 광고성 정보 제공 및 참여 기회 제공
   • 접속 빈도 파악 또는 회원의 서비스 이용에 대한 통계 분석

2. 수집하는 개인정보 항목
   • 휴대전화번호, 이메일 주소, 서비스 이용 기록, 접속 로그, 관심사 키워드

3. 보유 및 이용 기간
   • 회원 탈퇴 시 혹은 마케팅 동의 철회 시까지

4. 동의 거부 권리 및 불이익
   • 정보주체는 개인정보의 선택적 수집·이용 및 마케팅 활용 동의를 거부할 권리가 있습니다.
   • 동의를 거부하시더라도 회원가입 및 기본 서비스 이용은 제한되지 않으며, 다만 이벤트 혜택 안내 등 일부 서비스가 제한될 수 있습니다.`,
        };


      default:
        return {
          title: '',
          content: ''
        };
    }
  };


  const currentModal =
    getModalContent(modalType);


  return (

    <div className="signup-page">

      <div className="signup-container">


        {/* 제목 */}

        <div className="signup-header">

          <h2>
            회원가입
          </h2>

          <p>
            TuddyBuddy에 오신 것을 환영합니다.
          </p>

        </div>


        <form
          className="signup-form"
          onSubmit={(e) =>
            e.preventDefault()
          }
        >


          {/* 이메일 */}

          <div className="signup-input-group">

            <label>
              이메일
            </label>

            <div className="signup-input-button">

              <input
                type="email"
                placeholder="이메일을 입력해주세요"
                value={email}
                onChange={(e) => {

                  setEmail(
                    e.target.value
                  );

                  setEmailVerified(false);
                }}
              />

              <button
                type="button"
                onClick={handleEmailSend}
              >
                인증요청
              </button>

            </div>

          </div>


          {/* 인증번호 */}

          <div className="signup-input-group">

            <label>
              이메일 인증번호
            </label>

            <div className="signup-input-button">

              <input
                type="text"
                placeholder="인증번호를 입력해주세요"
                value={code}
                onChange={(e) =>
                  setCode(
                    e.target.value
                  )
                }
              />

              <button
                type="button"
                onClick={
                  handleEmailVerify
                }
              >
                확인
              </button>

            </div>


            {emailVerified && (

              <p className="email-verified-text">
                이메일 인증 완료
              </p>

            )}

          </div>


          {/* 비밀번호 */}

          <div className="signup-input-group">

            <label>
              비밀번호
            </label>

            <input
              type="password"
              placeholder="비밀번호를 입력해주세요"
              value={pwd1}
              onChange={(e) =>
                setPwd1(
                  e.target.value
                )
              }
            />

          </div>


          {/* 비밀번호 확인 */}

          <div className="signup-input-group">

            <label>
              비밀번호 재확인
            </label>

            <input
              type="password"
              placeholder="비밀번호를 다시 입력해주세요"
              value={pwd2}
              onChange={(e) =>
                setPwd2(
                  e.target.value
                )
              }
            />

          </div>


          {/* 이름 */}

          <div className="signup-input-group">

            <label>
              이름
            </label>

            <input
              type="text"
              placeholder="이름을 입력해주세요"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
            />

          </div>


          {/* 닉네임 */}

          <div className="signup-input-group">

            <label>
              닉네임
            </label>

            <input
              type="text"
              placeholder="닉네임을 입력해주세요"
              value={nick}
              onChange={(e) =>
                setNick(
                  e.target.value
                )
              }
            />

          </div>


          {/* 전화번호 */}

          <div className="signup-input-group">

            <label>
              전화번호
            </label>

            <input
              type="text"
              placeholder="010-0000-0000"
              value={phone}
              onChange={(e) =>
                setPhone(
                  e.target.value
                )
              }
            />

          </div>


          {/* 추천인 코드 */}

          <div className="signup-input-group">

            <label>
              추천인 코드
            </label>

            <input
              type="text"
              placeholder="추천인 코드를 입력해주세요"
            />

          </div>


          {/* 가입 유형 */}

          <div className="signup-input-group">

            <label>
              가입 유형
            </label>

            <div className="signup-radio-group">

              <label className="signup-radio">

                <input
                  type="radio"
                  name="authority"
                  defaultChecked
                />

                <span>
                  학생
                </span>

              </label>


              <label className="signup-radio">

                <input
                  type="radio"
                  name="authority"
                />

                <span>
                  선생님
                </span>

              </label>


              <label className="signup-radio">

                <input
                  type="radio"
                  name="authority"
                />

                <span>
                  관리자
                </span>

              </label>

            </div>

          </div>


          {/* 약관 */}

          <div className="signup-agreement">


            {/* 전체동의 */}

            <div className="agreement-all">

              <label>

                <input
                  type="checkbox"
                  checked={allAgree}
                  onChange={(e) =>
                    handleAllAgree(
                      e.target.checked
                    )
                  }
                />

                <span>
                  전체 동의하기
                </span>

              </label>

            </div>


            {/* 서비스 이용약관 */}

            <div className="agreement-item">

              <label>

                <input
                  type="checkbox"
                  checked={termsAgree}
                  onChange={(e) =>
                    setTermsAgree(
                      e.target.checked
                    )
                  }
                />

                <span>

                  <em>
                    (필수){' '}
                  </em>

                  서비스 이용약관 동의

                </span>

              </label>


              <button
                type="button"
                className="agreement-view-btn"
                onClick={() =>
                  setModalType('terms')
                }
              >
                [보기]
              </button>

            </div>


            {/* 개인정보 필수 */}

            <div className="agreement-item">

              <label>

                <input
                  type="checkbox"
                  checked={privacyAgree}
                  onChange={(e) =>
                    setPrivacyAgree(
                      e.target.checked
                    )
                  }
                />

                <span>

                  <em>
                    (필수){' '}
                  </em>

                  개인정보 수집 및 이용 동의

                </span>

              </label>


              <button
                type="button"
                className="agreement-view-btn"
                onClick={() =>
                  setModalType(
                    'privacyRequired'
                  )
                }
              >
                [보기]
              </button>

            </div>


            {/* 마케팅 선택 */}

            <div className="agreement-item">

              <label>

                <input
                  type="checkbox"
                  checked={marketingAgree}
                  onChange={(e) =>
                    setMarketingAgree(
                      e.target.checked
                    )
                  }
                />

                <span>

                  <em className="optional">
                    (선택){' '}
                  </em>

                  마케팅 정보 수신 동의

                </span>

              </label>


              <button
                type="button"
                className="agreement-view-btn"
                onClick={() =>
                  setModalType(
                    'privacyOptional'
                  )
                }
              >
                [보기]
              </button>

            </div>

          </div>


          {/* 하단 버튼 */}

          <div className="signup-buttons">

            <button
              type="button"
              className="signup-back-button"
              onClick={handleBack}
            >
              뒤로가기
            </button>


            <button
              type="button"
              className="signup-submit-button"
              onClick={handleSignup}
            >
              회원가입
            </button>

          </div>

        </form>

      </div>


      {/* =========================
          약관 모달
      ========================= */}

      {modalType && (

        <div className="modal-overlay">

          <div className="modal-card">

            <div className="modal-header">

              <h3>
                {currentModal.title}
              </h3>

            </div>


            <div className="modal-body">

              <p className="agreement-content">
                {currentModal.content}
              </p>

            </div>


            <div className="modal-footer">

              <button
                type="button"
                className="modal-close-btn"
                onClick={() =>
                  setModalType(null)
                }
              >
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
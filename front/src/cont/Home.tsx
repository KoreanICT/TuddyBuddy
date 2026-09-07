import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './home.module.css';

import fullpage from 'fullpage.js';
import 'fullpage.js/dist/fullpage.css';

import Modal from './modal/Modal';

const Home: React.FC = () => {

  // =========================
  // Modal 상태
  // =========================

  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isEmailPolicyOpen, setIsEmailPolicyOpen] = useState(false);

  const navigate = useNavigate()
  
  // =========================
  // FullPage
  // =========================

  useEffect(() => {
    const fullpageInstance = new fullpage('#fullpage', {
      licenseKey: 'YOUR_KEY',

      navigation: true,
      navigationPosition: 'right',

      scrollingSpeed: 700,

      fitToSection: true,

      keyboardScrolling: true,

      credits: {
        enabled: false,
      },
    });

    return () => {
      fullpageInstance.destroy('all');
    };
  }, []);


  return (
    <>
      <div id="fullpage">

        {/* =========================
            Section 1
            스터디 그룹
        ========================= */}
        <section className="section">
          <div className={styles.sectionInner}>

            <div className={styles.content}>

              <span className={styles.eyebrow}>
                함께 공부하는 즐거움
              </span>

              <h1 className={styles.title}>
                함께 공부하면<br />
                더 오래 집중할 수 있어요.
              </h1>

              <p className={styles.description}>
                관심사가 비슷한 사람들과 스터디 그룹을 만들고
                함께 공부해보세요.
              </p>

              <button className={styles.primaryButton} onClick={()=>{navigate('/homeGroup')}}>
                스터디 그룹 참가하기
              </button>

            </div>


            <div className={styles.visual}>
              <img
                src="/images/groupStudy.png"
                alt="스터디 그룹에서 함께 공부하는 모습"
                className={styles.sectionImage}
              />
            </div>

          </div>
        </section>


        {/* =========================
            Section 2
            개인 스터디
        ========================= */}
        <section className="section">
          <div className={styles.sectionInner}>

            <div className={styles.visual}>
              <img
                src="/images/selfStudy.png"
                alt="개인 학습 공간에서 공부하는 모습"
                className={styles.sectionImage}
              />
            </div>


            <div className={styles.content}>

              <span className={styles.eyebrow}>
                나만의 학습 공간
              </span>

              <h2 className={styles.title}>
                혼자서도<br />
                꾸준하게 공부해보세요.
              </h2>

              <p className={styles.description}>
                나만의 학습 목표를 설정하고
                학습 현황을 기록하며 꾸준히 공부할 수 있어요.
              </p>

              <button className={styles.primaryButton} onClick={()=>{navigate('/homeGroup')}}>
                개인 스터디 시작하기
              </button>

            </div>

          </div>
        </section>


        {/* =========================
            Section 3
            교육 이슈
        ========================= */}
        <section className="section">
          <div className={styles.sectionInner}>

            <div className={styles.content}>

              <span className={styles.eyebrow}>
                교육 이야기
              </span>

              <h2 className={styles.title}>
                지금 주목해야 할<br />
                교육 이슈를 만나보세요.
              </h2>

              <p className={styles.description}>
                교육과 학습에 관한 다양한 소식을
                한곳에서 확인할 수 있어요.
              </p>

              <button className={styles.secondaryButton}>
                교육 이슈 확인하기
              </button>

            </div>


            <div className={styles.issueImage}>
              <img
                src="/images/eduIssue.png"
                alt="교육 이슈와 관련된 정보"
                className={styles.sectionImage}
              />
            </div>

          </div>
        </section>


        {/* =========================
            Footer
        ========================= */}
        <footer className="section fp-auto-height">

          <div className={styles.footer}>
            <div className={styles.footerInner}>

              <div className={styles.footerInfo}>

                <strong className={styles.footerLogo}>
                  프로젝트 로고
                </strong>

                <p>
                  함께 공부하고 성장하는 교육 커뮤니티
                </p>

              </div>


              {/* Footer Navigation */}
              <nav className={styles.footerLinks}>

                <button
                  type="button"
                  onClick={() => setIsTermsOpen(true)}
                >
                  이용약관
                </button>

                <button
                  type="button"
                  onClick={() => setIsPrivacyOpen(true)}
                >
                  개인정보처리방침
                </button>

                <button
                  type="button"
                  onClick={() => setIsEmailPolicyOpen(true)}
                >
                  이메일무단수집거부
                </button>

                <Link to="/contact">
                  문의하기
                </Link>

              </nav>


              {/* Copyright */}
              <div className={styles.footerCopyright}>
                <p>
                  © 2026 프로젝트 로고. All rights reserved.
                </p>
              </div>

            </div>
          </div>

        </footer>

      </div>


      {/* =========================
          이용약관 Modal
      ========================= */}
      <Modal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
        title="이용약관"
      >
        <h3>제1조 (목적)</h3>

        <p>
          본 약관은 프로젝트에서 제공하는 서비스의
          이용과 관련하여 서비스와 회원 간의 권리,
          의무 및 책임사항을 규정함을 목적으로 합니다.
        </p>

        <h3>제2조 (서비스 이용)</h3>

        <p>
          회원은 본 약관 및 관련 법령을 준수하여
          서비스를 이용해야 합니다.
        </p>
      </Modal>


      {/* =========================
          개인정보처리방침 Modal
      ========================= */}
      <Modal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        title="개인정보처리방침"
      >
        <h3>개인정보의 수집 및 이용</h3>

        <p>
          서비스 이용에 필요한 최소한의 개인정보를
          수집하며, 수집된 개인정보는 서비스 제공을
          위한 목적으로만 이용됩니다.
        </p>

        <h3>개인정보의 보관</h3>

        <p>
          개인정보는 관련 법령에서 정한 기간 동안
          안전하게 보관됩니다.
        </p>
      </Modal>


      {/* =========================
          이메일무단수집거부 Modal
      ========================= */}
      <Modal
        isOpen={isEmailPolicyOpen}
        onClose={() => setIsEmailPolicyOpen(false)}
        title="이메일무단수집거부"
      >
        <p>
          본 웹사이트에 게시된 이메일 주소가
          전자우편 수집 프로그램이나 기술적 장치를
          이용하여 무단으로 수집되는 것을 거부합니다.
        </p>

        <p>
          이를 위반할 경우 관련 법령에 따라
          처벌받을 수 있습니다.
        </p>
      </Modal>

    </>
  );
};

export default Home;
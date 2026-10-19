import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Camera, Pause, Play, Upload, BookOpen, CheckCircle2, Bot } from 'lucide-react';
import { BACKEND_URL } from '../login/authHttp';
import { useAuth } from '../login/hooks/useAuth';
import styles from './home.module.css';
import Modal from './modal/Modal';
import StudyRoomGuide from './modal/StudyRoomGuide';
import NoticeBanner from './notice/NoticeBanner';
import PrivacyPolicyContent from './modal/PrivacyPolicyContent';
import fullpage from 'fullpage.js';
import 'fullpage.js/dist/fullpage.css';

interface HomeNotice {
  num: number;
  title: string;
  created_date?: string;
}

const Home: React.FC = () => {
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isEmailPolicyOpen, setIsEmailPolicyOpen] = useState(false);
  const [isFocusInfoOpen, setIsFocusInfoOpen] = useState(false);
  const [isStudyRoomGuideOpen, setIsStudyRoomGuideOpen] = useState(false);
  const [notices, setNotices] = useState<HomeNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const { token } = useAuth();
  const showHowToRef = useRef<(() => void) | null>(null);
  const setPageScrollingRef = useRef<((enabled: boolean) => void) | null>(null);

  useEffect(() => {
    const home = document.getElementById('fullpage');
    const topOffset = Math.max(0, home?.getBoundingClientRect().top ?? 0);
    home?.style.setProperty('--home-top-offset', `${topOffset}px`);
    document.body.classList.add('homeFullpageActive');
    const instance = new fullpage('#fullpage', {
      licenseKey: 'YOUR_KEY',
      navigation: true,
      navigationPosition: 'right',
      navigationTooltips: ['공지 · 버디봇', '개인 스터디', '그룹 스터디', '이용 방법', '서비스 안내'],
      scrollingSpeed: 700,
      fitToSection: true,
      keyboardScrolling: true,
      scrollOverflow: true,
      normalScrollElements: `.${styles.modalLayer}`,
      credits: { enabled: false }
    });
    showHowToRef.current = () => instance.moveTo(4);
    setPageScrollingRef.current = enabled => {
      instance.setAllowScrolling(enabled);
      instance.setKeyboardScrolling(enabled);
    };
    return () => {
      showHowToRef.current = null;
      setPageScrollingRef.current = null;
      instance.destroy('all');
      document.body.classList.remove('homeFullpageActive');
      home?.style.removeProperty('--home-top-offset');
    };
  }, []);

  useEffect(() => {
    setPageScrollingRef.current?.(!(isFocusInfoOpen || isStudyRoomGuideOpen || isTermsOpen || isPrivacyOpen || isEmailPolicyOpen));
  }, [isFocusInfoOpen, isStudyRoomGuideOpen, isTermsOpen, isPrivacyOpen, isEmailPolicyOpen]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    void axios.get<{ data: HomeNotice[] }>(`${BACKEND_URL}/api/notice/noticeList`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}, params: { cPage: 1 }
    }).then(response => {
      if (active) setNotices([...response.data.data].sort((a, b) => b.num - a.num).slice(0, 3));
    }).catch(() => {
      if (active) {
        setNotices([]);
        setError('공지사항을 불러오지 못했습니다.');
      }
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token, revision]);

  return (
    <>
      <div id="fullpage" className={styles.home}>
        <section className="section" aria-labelledby="home-chatbot-title">
        <div className={styles.introSection}>
        <NoticeBanner notices={notices} loading={loading} error={error} onRetry={() => setRevision(value => value + 1)} />
        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>TUDDYBUDDY · 버디봇</span>
            <h1 id="home-chatbot-title">궁금할 땐 버디봇에게<br />편하게 물어보세요.</h1>
            <p className={styles.description}>공부하다 생긴 궁금증이나 서비스 이용 방법을 질문해보세요.<br className={styles.desktopBreak} /> 오른쪽 아래 로봇 모양 버튼으로 대화를 시작할 수 있어요.</p>
            <p className={styles.caption}>버디봇은 로그인하지 않아도 이용할 수 있어요.</p>
          </div>
          <div className={styles.chatbotGuide}>
            <div className={styles.guideHeading}><Bot size={24} /><strong>이런 질문으로 시작해보세요</strong></div>
            <ul className={styles.chatbotExamples}>
              <li>“이미지로 학습 문제를 만들려면 어떻게 하나요?”</li>
              <li>“함께 공부할 스터디룸은 어디서 만드나요?”</li>
              <li>“오늘 공부할 내용을 정리하고 싶어요.”</li>
            </ul>
            <p className={styles.guideNote}>예시 질문이에요. AI 답변은 참고용으로 활용하고 중요한 내용은 다시 확인해주세요.</p>
          </div>
        </div>
        </div>
        </section>

        <section className="section" aria-labelledby="home-personal-title">
        <div className={styles.hero}>
          <div className={styles.featureVisual}>
            <img src="/images/selfStudy.png" alt="이미지 학습 자료로 AI 문제를 생성하는 개인 스터디" />
          </div>
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>PERSONAL STUDY · 개인 스터디</span>
            <h2 id="home-personal-title" className={styles.featureTitle}>내 교재와 노트가<br />나만의 문제가 돼요.</h2>
            <p className={styles.description}>학습 자료 이미지를 올리면 AI가 문제를 생성해요.<br className={styles.desktopBreak} /> 원하는 유형과 난이도로 풀고, 오답과 학습 기록을 확인하세요.</p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryButton} to="/selfStudy">개인 스터디 시작하기 <ArrowRight size={18} /></Link>
              <button type="button" className={styles.secondaryButton} onClick={() => showHowToRef.current?.()}>이용 방법 보기</button>
            </div>
            <button type="button" className={styles.focusInfoButton} onClick={() => setIsFocusInfoOpen(true)}>
              <Camera size={16} /> 보조 기능 · 집중 학습 알아보기
            </button>
          </div>
        </div>
        </section>

        <section className="section" aria-labelledby="home-group-title">
          <div className={styles.hero}>
            <div className={styles.heroContent}>
              <span className={styles.eyebrow}>GROUP STUDY · 그룹 스터디</span>
              <h2 id="home-group-title" className={styles.featureTitle}>함께 공부할 공간,<br />스터디룸을 만들어보세요.</h2>
              <p className={styles.description}>관심사에 맞는 스터디룸을 직접 만들고,<br className={styles.desktopBreak} /> 함께할 사람들과 자료를 나누며 공부해요.</p>
              <div className={styles.heroActions}>
                <Link className={styles.primaryButton} to="/group">스터디룸 만들러 가기 <ArrowRight size={18} /></Link>
                <button type="button" className={styles.secondaryButton} onClick={() => setIsStudyRoomGuideOpen(true)}>
                  스터디룸 이용 방법
                </button>
              </div>
              <p className={styles.caption}>스터디룸 목록에서 새 방을 만들거나 공개된 방에 참여할 수 있어요.</p>
            </div>
          <div className={styles.featureVisual}>
              <img src="/images/groupStudy.png" alt="스터디룸을 만들어 함께 공부하는 그룹 스터디" />
            </div>
        </div>
        </section>

        <section className="section" aria-labelledby="home-how-title">
        <div className={styles.howTo}>
          <div className={styles.sectionHeading}><div><span className={styles.eyebrow}>HOW TO STUDY</span><h2 id="home-how-title">내 자료로 시작하는 세 단계</h2><p className={styles.sectionDescription}>교재나 노트 이미지를 학습 문제로 바꿔보세요.</p></div></div>
          <ol className={styles.howSteps}>
            <li><div className={styles.howStepTop}><span>01</span><Upload size={25} /></div><h3>학습 자료 올리기</h3><p>개인 스터디에서 새 학습 세션을 열고 교재나 노트 이미지를 업로드해요.</p></li>
            <li><div className={styles.howStepTop}><span>02</span><BookOpen size={25} /></div><h3>AI 문제 풀기</h3><p>문제 유형과 난이도를 선택하고, 생성된 문제로 배운 내용을 확인해요.</p></li>
            <li><div className={styles.howStepTop}><span>03</span><CheckCircle2 size={25} /></div><h3>결과 확인하고 복습하기</h3><p>제출 결과와 오답을 확인하고, 내 학습 기록에서 이전 학습을 다시 살펴봐요.</p></li>
          </ol>
          <div className={styles.bottomAction}><Link className={styles.primaryButton} to="/selfStudy">첫 학습 시작하기 <ArrowRight size={18} /></Link></div>
        </div>
        </section>
        <footer className="section fp-auto-height" aria-label="TuddyBuddy 서비스 안내">
          <div className={styles.footer}>
            <div className={styles.footerInner}>
              <div className={styles.footerBrand}>
                <img className={styles.footerLogo} src="/images/footerlogo.png" alt="TuddyBuddy 로고" />
              <div className={styles.footerInfo}>
                <p><strong>TuddyBuddy</strong><span>대표자 : 춘식이</span></p>
                <p>함께 공부하고 성장하는 교육 커뮤니티</p>
              </div>
              </div>
              <div className={styles.footerBottom}>
                <nav className={styles.footerLinks} aria-label="서비스 정책">
                  <button type="button" onClick={() => setIsTermsOpen(true)}>이용약관</button>
                  <button type="button" className={styles.footerPrivacy} onClick={() => setIsPrivacyOpen(true)}>개인정보처리방침</button>
                  <button type="button" onClick={() => setIsEmailPolicyOpen(true)}>이메일무단수집거부</button>
                </nav>
                <div className={styles.footerCopyright}>
                  <p>© {new Date().getFullYear()} TuddyBuddy. All rights reserved.</p>
                </div>
              </div>
            </div>
          </div>
        </footer>

      </div>


      <div className={styles.modalLayer}>
      <StudyRoomGuide isOpen={isStudyRoomGuideOpen} onClose={() => setIsStudyRoomGuideOpen(false)} />
      <Modal isOpen={isFocusInfoOpen} onClose={() => setIsFocusInfoOpen(false)} title="학습을 돕는 집중 학습 모드">
        <div className={styles.focusGuide}>
          <div className={styles.guideHeading}><Camera size={20} /><strong>개인 스터디에서 선택하는 보조 기능이에요</strong></div>
          <ol className={styles.focusSteps}>
            <li><span className={`${styles.stepIcon} ${styles.activeIcon}`}><Play size={18} /></span><div><strong>학습이 감지되면 시작</strong><p>카메라 연결 후 첫 학습 감지부터 시간을 기록해요.</p></div></li>
            <li><span className={`${styles.stepIcon} ${styles.pauseIcon}`}><Pause size={18} /></span><div><strong>5초 동안 미감지 시 일시정지</strong><p>얼굴과 움직임이 감지되지 않으면 잠시 멈춰요.</p></div></li>
            <li><span className={`${styles.stepIcon} ${styles.activeIcon}`}><CheckCircle2 size={18} /></span><div><strong>돌아오면 다시 학습</strong><p>자동 정지한 타이머는 학습 감지 시 재개돼요.</p></div></li>
          </ol>
          <p className={styles.guideNote}>카메라 권한이 필요하며, 카메라 없이 일반 타이머도 사용할 수 있어요. 직접 누른 일시정지는 재개 버튼으로 해제해요. 감지 결과는 학습 상태를 추정하는 보조 정보예요.</p>
        </div>
      </Modal>
      {/* 이용약관 Modal */}
      <Modal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
        title="이용약관"
      >
        <h3>제1조 (목적)</h3>

        <p>
          본 약관은 TuddyBuddy에서 제공하는 서비스의
          이용과 관련하여 서비스와 회원 간의 권리,
          의무 및 책임사항을 규정함을 목적으로 합니다.
        </p>

        <h3>제2조 (서비스 이용)</h3>

        <p>
          회원은 본 약관 및 관련 법령을 준수하여
          서비스를 이용해야 합니다.
        </p>
      </Modal>


      {/* 개인정보처리방침 Modal */}
      <Modal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        title="개인정보처리방침"
      >
        <PrivacyPolicyContent />
      </Modal>


      {/* 이메일무단수집거부 Modal */}
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
      </div>
    </>
  );
};

export default Home;

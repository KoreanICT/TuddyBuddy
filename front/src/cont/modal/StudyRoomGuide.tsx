import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Modal from './Modal';
import styles from './studyRoomGuide.module.css';

interface StudyRoomGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const StudyRoomGuide: React.FC<StudyRoomGuideProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isOpen, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="스터디룸 이용 방법">
      <p className={styles.intro}>직접 스터디룸을 만들거나, 함께 공부할 방을 찾아 참여해보세요.</p>
      <ol className={styles.steps}>
        <li>
          <span className={styles.number}>01</span>
          <div><h3>로그인하고 스터디룸으로 이동</h3><p>상단의 스터디룸 메뉴로 이동하세요. 스터디룸 생성과 참여는 로그인 후 이용할 수 있어요.</p></div>
        </li>
        <li>
          <span className={styles.number}>02</span>
          <div><h3>새로운 방 만들기</h3><p>오른쪽 메뉴에서 ‘스터디룸 생성’을 누르세요. 방 이름·소개·최대 인원·공개 여부를 설정하고, 태그와 썸네일로 방을 소개할 수 있어요.</p></div>
        </li>
        <li>
          <span className={styles.number}>03</span>
          <div><h3>기존 방에 참여하기</h3><p>공개된 스터디룸을 이름이나 태그로 찾아보세요. 초대받은 방은 ‘초대코드로 입장하기’에서 전달받은 코드를 입력하면 돼요.</p></div>
        </li>
        <li>
          <span className={styles.number}>04</span>
          <div><h3>내 스터디룸에서 함께 학습</h3><p>참여한 방은 ‘내 스터디룸’에서 확인하세요. 방 안에서 자료·메모를 공유하고 일정과 할 일을 관리하며 함께 공부할 수 있어요.</p></div>
        </li>
      </ol>
      <div className={styles.actions}>
        <button type="button" className={styles.closeButton} onClick={onClose}>닫기</button>
        <Link className={styles.startLink} to="/group" onClick={onClose}>스터디룸으로 이동</Link>
      </div>
    </Modal>
  );
};

export default StudyRoomGuide;

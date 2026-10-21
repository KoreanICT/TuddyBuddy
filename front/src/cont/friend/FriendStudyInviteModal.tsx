import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Modal from '../modal/Modal';
import styles from './friendStudyInviteModal.module.css';

interface FriendStudyInviteModalProps {
  friendNick: string;
  onClose: () => void;
}

const FriendStudyInviteModal: React.FC<FriendStudyInviteModalProps> = ({ friendNick, onClose }) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const previewRef = useRef<HTMLTextAreaElement | null>(null);
  const mountedRef = useRef(false);
  const [roomName, setRoomName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [copying, setCopying] = useState(false);
  const [feedback, setFeedback] = useState('');
  const ready = Boolean(roomName.trim() && inviteCode.trim());
  const invitation = ready ? [
    `${friendNick}님, TuddyBuddy에서 함께 공부해요!`,
    `스터디룸: ${roomName.trim()}`,
    `초대코드: ${inviteCode.trim()}`,
    `스터디룸 페이지: ${new URL('/group', window.location.origin).href}`,
    '로그인 후 ‘초대코드로 입장하기’에서 위 코드를 입력해주세요.',
  ].join('\n') : '';

  useEffect(() => {
    mountedRef.current = true;
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog?.showModal();
    return () => {
      mountedRef.current = false;
      dialog?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const copyInvitation = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!ready || copying) return;
    setCopying(true);
    setFeedback('');
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(invitation);
      if (mountedRef.current) setFeedback('초대 문구를 복사했습니다. 메신저 등에 붙여넣어 친구에게 전달해주세요.');
    } catch {
      if (mountedRef.current) {
        previewRef.current?.focus();
        previewRef.current?.select();
        setFeedback('자동 복사를 사용할 수 없습니다. 선택된 초대 문구를 Ctrl+C 또는 기기의 복사 메뉴로 복사해주세요.');
      }
    } finally {
      if (mountedRef.current) setCopying(false);
    }
  };

  return createPortal(
    <dialog ref={dialogRef} className={styles.dialog} aria-label="친구에게 스터디 초대 문구 공유"
      onCancel={event => { event.preventDefault(); onClose(); }}>
      <Modal isOpen onClose={onClose} title="스터디 초대 문구 만들기">
        <form className={styles.form} onSubmit={copyInvitation}>
          <p className={styles.intro}><strong>{friendNick}</strong>님에게 공유할 방 이름과 초대코드를 입력해주세요.</p>
          <p className={styles.note}>이 화면은 초대 문구를 만드는 기능입니다. 친구에게 자동 전송되지 않으며, 입력한 코드의 유효 여부는 상대방이 입장할 때 확인됩니다. 방장이 공유를 허용한 코드만 사용해주세요.</p>
          <label className={styles.field} htmlFor="friend-invite-room">스터디룸 이름
            <input id="friend-invite-room" value={roomName} maxLength={100} required disabled={copying}
              onChange={event => { setRoomName(event.target.value); setFeedback(''); }} placeholder="함께 공부할 스터디룸 이름" />
          </label>
          <label className={styles.field} htmlFor="friend-invite-code">초대코드
            <input id="friend-invite-code" value={inviteCode} maxLength={10} required disabled={copying}
              autoComplete="off" spellCheck={false}
              onChange={event => { setInviteCode(event.target.value); setFeedback(''); }} placeholder="전달받은 초대코드" />
          </label>
          <label className={styles.field} htmlFor="friend-invite-preview">공유 문구 미리보기
            <textarea id="friend-invite-preview" ref={previewRef} value={invitation} readOnly rows={6}
              placeholder="방 이름과 초대코드를 입력하면 공유 문구가 표시됩니다." />
          </label>
          {feedback && <p className={styles.feedback} role="status">{feedback}</p>}
          <div className={styles.actions}>
            <button type="button" onClick={onClose}>닫기</button>
            <button type="submit" disabled={!ready || copying} className={styles.copyButton}>
              {copying ? '복사 중...' : '초대 문구 복사'}
            </button>
          </div>
        </form>
      </Modal>
    </dialog>, document.body
  );
};

export default FriendStudyInviteModal;

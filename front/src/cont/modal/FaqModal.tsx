import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import Modal from './Modal';
import { FAQ_CATEGORIES, FAQ_ITEMS, FaqCategory } from './faqContent';
import styles from './faqModal.module.css';

interface FaqModalProps {
  onClose: () => void;
}

const FaqModal: React.FC<FaqModalProps> = ({ onClose }) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [category, setCategory] = useState<FaqCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const keyword = search.trim().toLocaleLowerCase('ko-KR');
  const items = FAQ_ITEMS.filter(item => (category === 'all' || item.category === category)
    && (!keyword || `${item.question} ${item.answer}`.toLocaleLowerCase('ko-KR').includes(keyword)));

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog?.showModal();
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return createPortal(
    <dialog ref={dialogRef} className={styles.dialog} aria-label="자주 묻는 질문"
      onCancel={event => { event.preventDefault(); onClose(); }}>
      <Modal isOpen onClose={onClose} title="자주 묻는 질문">
        <div className={styles.content}>
          <p className={styles.intro}>궁금한 내용을 검색하거나 분류를 선택해 확인하세요.</p>
          <label className={styles.search} htmlFor="faq-search">도움말 검색
            <input id="faq-search" type="search" value={search} placeholder="예: 친구 코드, 신고, 이미지"
              onChange={event => setSearch(event.target.value)} />
          </label>
          <div className={styles.categories} role="group" aria-label="질문 분류">
            <button type="button" aria-pressed={category === 'all'} onClick={() => setCategory('all')}>전체</button>
            {FAQ_CATEGORIES.map(item => <button key={item.id} type="button" aria-pressed={category === item.id}
              onClick={() => setCategory(item.id)}>{item.label}</button>)}
          </div>
          <p className={styles.count} role="status">질문 {items.length}개</p>
          <div className={styles.list}>
            {items.map(item => <details key={`${category}:${item.id}`} className={styles.item}>
              <summary>{item.question}</summary>
              <div className={styles.answer}>
                <p>{item.answer}</p>
                {item.action && <Link to={item.action.to} onClick={onClose}>{item.action.label} →</Link>}
              </div>
            </details>)}
            {items.length === 0 && <p className={styles.empty}>검색 결과가 없습니다. 다른 검색어나 분류를 선택해주세요.</p>}
          </div>
          <div className={styles.actions}>
            <button type="button" onClick={onClose}>닫기</button>
          </div>
        </div>
      </Modal>
    </dialog>, document.body
  );
};

export default FaqModal;

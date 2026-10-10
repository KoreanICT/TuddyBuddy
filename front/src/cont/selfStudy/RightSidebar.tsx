import React from 'react';
import { RightTabType } from './types';
import styles from './selfstudy.module.css';
import Timer from '../timer/Timer';

interface Props {
  rightTab: RightTabType;
  setRightTab: (tab: RightTabType) => void;
  searchFilter: string;
  setSearchFilter: (filter: string) => void;
  searchKeyword: string;
  setSearchKeyword: (keyword: string) => void;
}

export const RightSidebar: React.FC<Props> = ({
  rightTab,
  setRightTab,
  searchFilter,
  setSearchFilter,
  searchKeyword,
  setSearchKeyword,
}) => {
  return (
    <aside className={styles.rightSidebar}>
      <div className={styles.menuCard}>
        <button
          type="button"
          className={`${styles.sidebarMenuBtn} ${
            rightTab === 'my' ? styles.activeSidebarBtn : ''
          }`}
          onClick={() => setRightTab('my')}
        >
          내 스터디룸
        </button>

        <div className={styles.menuDivider} />

        <button
          type="button"
          className={`${styles.sidebarMenuBtn} ${
            rightTab === 'public' ? styles.activeSidebarBtn : ''
          }`}
          onClick={() => setRightTab('public')}
        >
          공개된 스터디룸
        </button>

        <div className={styles.menuDivider} />

        <button
          type="button"
          className={`${styles.sidebarMenuBtn} ${
            rightTab === 'create' ? styles.activeSidebarBtn : ''
          }`}
          onClick={() => setRightTab('create')}
        >
          스터디룸 생성
        </button>
      </div>

      {/* 검색 영역 */}
      <div className={styles.searchCard}>
        <select
          className={styles.searchSelect}
          value={searchFilter}
          onChange={event => setSearchFilter(event.target.value)}
        >
          <option value="name">이름으로 검색</option>
          <option value="tag">태그로 검색</option>
        </select>

        <input
          type="text"
          className={styles.searchInput}
          placeholder="검색어 입력"
          value={searchKeyword}
          onChange={event => setSearchKeyword(event.target.value)}
        />
      </div>

      {/* 검색 영역 아래 타이머 */}
      <Timer />
    </aside>
  );
};

export default RightSidebar;
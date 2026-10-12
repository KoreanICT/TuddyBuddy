import { useId, useState } from 'react';
import { UseTimer } from './UseTimer';
import styles from './timer.module.css';

const formatTime = (seconds: number): string => {
  const value = Math.max(0, Math.floor(seconds));

  return [
    Math.floor(value / 3600),
    Math.floor((value % 3600) / 60),
    value % 60,
  ]
    .map(part => String(part).padStart(2, '0'))
    .join(':');
};

export default function Timer() {
  const [minutes, setMinutes] = useState(25);
  const [collapsed, setCollapsed] = useState(false);
  const contentId = useId();

  // 접어도 훅과 타이머 상태는 유지됩니다.
  const timer = UseTimer();

  const ready =
    timer.status === 'idle' || timer.status === 'saved';

  const validMinutes =
    Number.isInteger(minutes) && minutes >= 1 && minutes <= 240;

  const targetSeconds =
    (timer.session?.setTimeMinutes ?? minutes) * 60;

  const remainingSeconds = ready
    ? minutes * 60
    : timer.remainingSeconds;

  const progress =
    ready || targetSeconds <= 0
      ? 0
      : Math.min(100, (timer.elapsedSeconds / targetSeconds) * 100);

  const statusText = {
    idle: '시작 대기',
    running: '집중 중',
    paused:
      timer.remainingSeconds === 0 ? '목표 완료' : '일시정지',
    pending: '저장 대기',
    saved: '저장 완료',
  }[timer.status];

  return (
    <section className={styles.card} aria-label="개인 공부 타이머">
      <header className={styles.header}>
        <div className={styles.heading}>
          <span className={styles.title}>Timer</span>
          <span className={styles.badge}>{statusText}</span>
        </div>

        <button
          type="button"
          className={styles.toggleButton}
          aria-expanded={!collapsed}
          aria-controls={contentId}
          onClick={() => setCollapsed(value => !value)}
        >
          {collapsed ? '펼치기' : '접기'}
        </button>
      </header>

      {collapsed && (
        <div className={styles.compact}>
          <span>남은 시간</span>
          <strong role="timer">
            {formatTime(remainingSeconds)}
          </strong>
        </div>
      )}

      <div id={contentId} hidden={collapsed}>
        <div className={styles.clock}>
          <span className={styles.caption}>남은 시간</span>

          <strong className={styles.time} role="timer">
            {formatTime(remainingSeconds)}
          </strong>

          <span className={styles.elapsed}>
            이번 공부 {formatTime(timer.elapsedSeconds)}
          </span>
        </div>

        <div
          className={styles.progressTrack}
          role="progressbar"
          aria-label="목표 시간 진행률"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.floor(progress)}
        >
          <div
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
        </div>

        <label className={styles.setting}>
          <span>목표 시간</span>

          <span className={styles.inputGroup}>
            <input
              className={styles.input}
              type="number"
              min={1}
              max={240}
              step={1}
              value={minutes}
              disabled={!ready || timer.busy}
              onChange={event =>
                setMinutes(Number(event.target.value))
              }
            />
            <span>분</span>
          </span>
        </label>

        {ready && !validMinutes && (
          <p className={styles.validation}>
            1~240 사이의 정수를 입력해주세요.
          </p>
        )}

        <div className={styles.buttons}>
          {ready && (
            <button
              type="button"
              className={styles.primaryButton}
              disabled={timer.busy || !validMinutes}
              onClick={() => void timer.start(minutes)}
            >
              {timer.busy ? '시작 중…' : '공부 시작'}
            </button>
          )}

          {timer.status === 'running' && (
            <button
              type="button"
              className={styles.primaryButton}
              disabled={timer.busy}
              onClick={timer.pause}
            >
              일시정지
            </button>
          )}

          {timer.status === 'paused' &&
            timer.remainingSeconds > 0 && (
              <button
                type="button"
                className={styles.primaryButton}
                disabled={timer.busy}
                onClick={timer.resume}
              >
                계속 공부
              </button>
            )}

          {!ready && (
            <button
              type="button"
              className={styles.secondaryButton}
              disabled={timer.busy}
              onClick={() => void timer.finish()}
            >
              {timer.busy
                ? '저장 중…'
                : timer.status === 'pending'
                  ? '저장 다시 시도'
                  : '종료 및 저장'}
            </button>
          )}
        </div>

        <p className={styles.help}>
          접어도 계속 측정됩니다.
          <br />
          기록은 종료 및 저장을 눌러야 반영됩니다.
        </p>

        <div className={styles.total}>
          <span>누적 공부</span>
          <strong>
            {formatTime(timer.summary.totalTimeSeconds)}
          </strong>
        </div>

        <details className={styles.history}>
          <summary>최근 공부 기록</summary>

          <button
            type="button"
            className={styles.refreshButton}
            disabled={timer.busy}
            onClick={timer.refresh}
          >
            기록 새로고침
          </button>

          {timer.summary.sessions.length === 0 ? (
            <p className={styles.empty}>
              저장한 기록이 없습니다.
            </p>
          ) : (
            <ul className={styles.historyList}>
              {timer.summary.sessions.map(session => (
                <li key={session.timerSessionId}>
                  <span>목표 {session.setTimeMinutes}분</span>
                  <strong>
                    {formatTime(session.totalTimeSeconds)}
                  </strong>
                </li>
              ))}
            </ul>
          )}
        </details>
      </div>

      {timer.error && (
        <p className={styles.error} role="alert">
          {timer.error}
        </p>
      )}
    </section>
  );
}
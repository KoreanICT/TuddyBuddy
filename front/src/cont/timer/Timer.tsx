//최솔
import { useState } from 'react';
import { UseTimer } from './UseTimer';
import styles from './timer.module.css';

export type TimerControls = ReturnType<typeof UseTimer>;

interface TimerProps {
  timer?: TimerControls;
  startLabel?: string;
  embedded?: boolean;
}

// 단독 사용도 유지하며, 집중 학습에서는 부모의 타이머 하나를 공유합니다.
export default function Timer(props: TimerProps) {
  return props.timer
    ? <TimerView timer={props.timer} startLabel={props.startLabel} embedded={props.embedded} />
    : <StandaloneTimer startLabel={props.startLabel} />;
}

function StandaloneTimer({ startLabel }: { startLabel?: string }) {
  const timer = UseTimer();
  return <TimerView timer={timer} startLabel={startLabel} />;
}

function TimerView({ timer, startLabel = '시작', embedded = false }: {
  timer: TimerControls; startLabel?: string; embedded?: boolean;
}) {
  const [minutes, setMinutes] = useState(25);
  const [collapsed, setCollapsed] = useState(false);

  const {
    status,
    elapsedSeconds,
    remainingSeconds,
    summary,
    busy,
    error,
    start,
    pause,
    resume,
    finish,
    refresh,
  } = timer;

  const formatTime = (seconds: number) => {
    const safeSeconds = Math.max(0, Math.floor(seconds));

    const hours = Math.floor(safeSeconds / 3600);
    const mins = Math.floor((safeSeconds % 3600) / 60);
    const secs = safeSeconds % 60;

    return [hours, mins, secs]
      .map((value) => String(value).padStart(2, '0'))
      .join(':');
  };

  const isActive =
    status === 'running' ||
    status === 'paused' ||
    status === 'pending';

  const canStart =
    status === 'idle' || status === 'saved';

  const isValidMinutes =
    Number.isInteger(minutes) &&
    minutes >= 1 &&
    minutes <= 240;

  const totalSeconds = minutes * 60;

  const progress =
    totalSeconds > 0
      ? Math.min(
          100,
          Math.max(0, (elapsedSeconds / totalSeconds) * 100)
        )
      : 0;

  const statusText: Record<string, string> = {
    idle: '대기 중',
    running: '학습 중',
    paused: '일시정지',
    pending: '저장 대기',
    saved: '저장 완료',
  };

  return (
    <section className={`${styles.card} ${embedded ? styles.embedded : ''}`}>
      <div className={styles.header}>
        <div className={styles.heading}>
          <span className={styles.title}>
            학습 타이머
          </span>

          <span className={styles.badge}>
            {statusText[status] ?? status}
          </span>
        </div>

        <button
          type="button"
          className={styles.toggleButton}
          onClick={() => setCollapsed((prev) => !prev)}
          aria-expanded={!collapsed}
        >
          {collapsed ? '펼치기' : '접기'}
        </button>
      </div>

      {collapsed ? (
        <div className={styles.compact}>
          <span>
            {isActive ? '남은 시간' : '누적 학습 시간'}
          </span>

          <strong>
            {formatTime(
              isActive
                ? remainingSeconds
                : summary.totalTimeSeconds
            )}
          </strong>
        </div>
      ) : (
        <>
          <div className={styles.clock}>
            <span className={styles.caption}>
              남은 학습 시간
            </span>

            <strong className={styles.time}>
              {formatTime(remainingSeconds)}
            </strong>

            <span className={styles.elapsed}>
              현재 학습 시간{' '}
              {formatTime(elapsedSeconds)}
            </span>
          </div>

          <div
            className={styles.progressTrack}
            role="progressbar"
            aria-label="학습 진행률"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
          >
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className={styles.setting}>
            <span>학습 시간 설정</span>

            <div className={styles.inputGroup}>
              <input
                className={styles.input}
                type="number"
                name="studyTimerMinutes"
                min={1}
                max={240}
                step={1}
                value={minutes}
                disabled={!canStart || busy}
                onChange={(e) =>
                  setMinutes(Number(e.target.value))
                }
                aria-label="학습 시간(분)"
              />

              <span>분</span>
            </div>
          </div>

          {!isValidMinutes && canStart && (
            <p className={styles.validation}>
              학습 시간은 1분부터 240분까지 설정할 수 있습니다.
            </p>
          )}

          <div className={styles.buttons}>
            {canStart && (
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => void start(minutes)}
                disabled={busy || !isValidMinutes}
              >
                {startLabel}
              </button>
            )}

            {status === 'running' && (
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={pause}
                disabled={busy}
              >
                일시정지
              </button>
            )}

            {status === 'paused' &&
              remainingSeconds > 0 && (
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={resume}
                  disabled={busy}
                >
                  재개
                </button>
              )}

            {isActive && (
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => void finish()}
                disabled={busy}
              >
                {status === 'pending'
                  ? '저장 재시도'
                  : '종료 및 저장'}
              </button>
            )}
          </div>

          <p className={styles.help}>
            학습 중에는 타이머를 일시정지하거나
            종료할 수 있습니다.
          </p>

          <div className={styles.total}>
            <span>누적 학습 시간</span>

            <strong>
              {formatTime(summary.totalTimeSeconds)}
            </strong>
          </div>

          <div className={styles.history}>
            <details>
              <summary>학습 기록 보기</summary>

              {summary.sessions.length === 0 ? (
                <p className={styles.empty}>
                  저장된 학습 기록이 없습니다.
                </p>
              ) : (
                <ul className={styles.historyList}>
                  {[...summary.sessions]
                    .reverse()
                    .map((session, index) => (
                      <li
                        key={`${session.timerSessionId}-${index}`}
                      >
                        <span>
                          {session.setTimeMinutes}분 설정
                        </span>

                        <strong>
                          {formatTime(
                            session.totalTimeSeconds
                          )}
                        </strong>
                      </li>
                    ))}
                </ul>
              )}

              <button
                type="button"
                className={styles.refreshButton}
                onClick={refresh}
                disabled={busy}
              >
                기록 새로고침
              </button>
            </details>
          </div>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
        </>
      )}
    </section>
  );
}

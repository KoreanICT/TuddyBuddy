//최솔
import { useState, type CSSProperties } from 'react';
import { UseTimer } from './UseTimer';
import { useSharedTimerContext } from './UseTimer';
import styles from './timer.module.css';

export type TimerControls = ReturnType<typeof UseTimer>;

interface TimerProps {
  timer?: TimerControls;
  startLabel?: string;
  embedded?: boolean;
  quizMode?: boolean;
  startDisabled?: boolean;
  controlsDisabled?: boolean;
  onStarted?: () => void;
  quizStarted?: boolean;
  quizCompleted?: boolean;
}

// 단독 사용도 유지하며, 집중 학습에서는 부모의 타이머 하나를 공유합니다.
export default function Timer(props: TimerProps) {
  const [localMinutes, setLocalMinutes] = useState(25);
  const shared = useSharedTimerContext();
  const minutes = shared?.quizTimerMinutes ?? localMinutes;
  const setMinutes = shared?.setQuizTimerMinutes ?? setLocalMinutes;
  if (shared && props.timer) {
    shared.quizTimerStarterRef.current = async () => {
      const timer = props.timer!;
      const status = timer.getSnapshot().status;

      // 일반 학습 타이머가 남아 있으면 먼저 저장한 뒤 문제 풀이 타이머를 시작합니다.
      if (status === 'running' || status === 'paused' || status === 'pending') {
        await timer.finish();
        if (timer.getSnapshot().status !== 'saved') return false;
      }

      return timer.start(minutes);
    };
  }
  const quizMode = props.quizMode ?? Boolean(
    shared && (shared.quizReady || (shared.quizStarted && !shared.quizCompleted))
  );
  const quizStarted = props.quizStarted ?? shared?.quizStarted;
  const quizCompleted = props.quizCompleted ?? shared?.quizCompleted;
  const startDisabled = props.startDisabled ?? Boolean(
    shared && ((shared.quizStarted && !shared.quizCompleted) || shared.quizSubmitting)
  );
  const controlsDisabled = props.controlsDisabled ?? Boolean(shared && shared.quizSubmitting);
  const startLabel = shared?.quizReady ? '시험 시작' : props.startLabel;
  return props.timer
    ? <TimerView timer={props.timer} minutes={minutes} setMinutes={setMinutes} startLabel={startLabel} embedded={props.embedded} quizMode={quizMode} startDisabled={startDisabled} controlsDisabled={controlsDisabled} onStarted={props.onStarted} quizStarted={quizStarted} quizCompleted={quizCompleted} />
    : <StandaloneTimer startLabel={startLabel} />;
}

function StandaloneTimer({ startLabel }: { startLabel?: string }) {
  const timer = UseTimer();
  const [minutes, setMinutes] = useState(25);
  return <TimerView timer={timer} minutes={minutes} setMinutes={setMinutes} startLabel={startLabel} />;
}

function TimerView({ timer, minutes, setMinutes, startLabel = '시작', embedded = false, quizMode = false, startDisabled = false, controlsDisabled = false, onStarted, quizStarted = false, quizCompleted = false }: {
  timer: TimerControls; minutes: number; setMinutes: (minutes: number) => void; startLabel?: string; embedded?: boolean; quizMode?: boolean; startDisabled?: boolean; controlsDisabled?: boolean; onStarted?: () => void; quizStarted?: boolean; quizCompleted?: boolean;
}) {
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
  const showSavedQuizResult = quizMode && quizCompleted && status === 'saved';
  const displayedElapsedSeconds = quizMode && !quizStarted ? 0 : elapsedSeconds;
  const displayedRemainingSeconds = quizMode && !quizStarted ? totalSeconds : remainingSeconds;
  const timeExpired =
    status !== 'idle' &&
    displayedRemainingSeconds === 0 &&
    (status === 'paused' || status === 'pending' || status === 'saved');
  const warningThresholdSeconds = totalSeconds * 0.3;
  const urgency =
    warningThresholdSeconds > 0 &&
    displayedRemainingSeconds <= warningThresholdSeconds &&
    (status !== 'saved' || timeExpired)
      ? Math.min(
          1,
          Math.max(
            0,
            (warningThresholdSeconds - displayedRemainingSeconds) /
              warningThresholdSeconds
          )
        )
      : 0;
  const urgencyStyle = {
    '--timer-urgency': `${Math.round(urgency * 100)}%`,
  } as CSSProperties & { '--timer-urgency': string };

  const progress =
    totalSeconds > 0
      ? Math.min(
          100,
          Math.max(0, (displayedElapsedSeconds / totalSeconds) * 100)
        )
      : 0;

  const statusText: Record<string, string> = {
    idle: '대기 중',
    running: quizMode ? '문제 풀이 중' : '학습 중',
    paused: '일시정지',
    pending: '저장 대기',
    saved: '저장 완료',
  };

  const startTimer = async () => {
    const started = await start(minutes);
    if (started) onStarted?.();
  };

  return (
    <section className={`${styles.card} ${embedded ? styles.embedded : ''}`} style={urgencyStyle}>
      <div className={styles.header}>
        <div className={styles.heading}>
          <span className={styles.title}>
            {quizMode ? '문제 풀이 타이머' : '학습 타이머'}
          </span>

          <span className={`${styles.badge} ${timeExpired ? styles.expiredBadge : ''}`}>
            {timeExpired
              ? '시간 종료'
              : quizMode && !quizStarted && status === 'saved'
                ? '대기 중'
                : (statusText[status] ?? status)}
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
            {quizMode
              ? (showSavedQuizResult ? '저장된 풀이 시간' : '남은 풀이 시간')
              : (isActive ? '남은 시간' : '누적 학습 시간')}
          </span>

          <strong>
            {formatTime(
              quizMode
                ? (showSavedQuizResult ? displayedElapsedSeconds : displayedRemainingSeconds)
                : (isActive ? remainingSeconds : summary.totalTimeSeconds)
            )}
          </strong>
        </div>
      ) : (
        <>
          <div className={styles.clock}>
            <span className={styles.caption}>
              {quizMode
                ? (showSavedQuizResult ? '저장된 문제 풀이 시간' : '남은 문제 풀이 시간')
                : '남은 학습 시간'}
            </span>

            <strong className={`${styles.time} ${timeExpired ? styles.timeExpired : ''}`}>
              {formatTime(quizMode && showSavedQuizResult ? displayedElapsedSeconds : displayedRemainingSeconds)}
            </strong>

            <span className={styles.elapsed}>
            {quizMode ? '현재 풀이 시간 ' : '현재 학습 시간 '}
              {formatTime(displayedElapsedSeconds)}
            </span>
          </div>

          <div
            className={`${styles.progressTrack} ${timeExpired ? styles.progressTrackExpired : ''}`}
            role="progressbar"
            aria-label={quizMode ? '문제 풀이 진행률' : '학습 진행률'}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
          >
            <div
              className={`${styles.progressFill} ${timeExpired ? styles.progressFillExpired : ''}`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className={styles.setting}>
            <span>{quizMode ? '풀이 제한 시간 설정' : '학습 시간 설정'}</span>

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
                aria-label={quizMode ? '문제 풀이 제한 시간(분)' : '학습 시간(분)'}
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
                onClick={() => void startTimer()}
                disabled={busy || startDisabled || !isValidMinutes}
              >
                {startLabel}
              </button>
            )}

            {status === 'running' && (
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={pause}
                disabled={busy || controlsDisabled}
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
                  disabled={busy || controlsDisabled}
                >
                  재개
                </button>
              )}

            {isActive && (!quizMode || status === 'pending') && (
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => void finish()}
                disabled={busy || (!quizMode && controlsDisabled)}
              >
                {status === 'pending'
                  ? '저장 재시도'
                  : '종료 및 저장'}
              </button>
            )}
          </div>

          {!quizMode && <p className={styles.help}>
            학습 중에는 타이머를 일시정지하거나
            종료할 수 있습니다.
          </p>}

          {!quizMode && <div className={styles.total}>
            <span>누적 학습 시간</span>

            <strong>
              {formatTime(summary.totalTimeSeconds)}
            </strong>
          </div>}

          {!quizMode && <div className={styles.history}>
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
            </details>
          </div>}

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

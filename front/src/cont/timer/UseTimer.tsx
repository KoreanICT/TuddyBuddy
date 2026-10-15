
 //최솔
import { useCallback, useEffect, useRef, useState } from 'react';
import { TimerEngine } from './TimerEngine';
import { TimerSession, TimerSummary } from './types';

const STORAGE_KEY = 'selfstudy_timer_sessions';

export function UseTimer() {
  const engine = useRef(new TimerEngine());
  const lock = useRef(false);
  const minutesRef = useRef(25);

  const [snapshot, setSnapshot] = useState(
    () => engine.current.snapshot(Date.now())
  );

  const [session, setSession] = useState<TimerSession | null>(null);

  const [summary, setSummary] = useState<TimerSummary>({
    totalTimeSeconds: 0,
    sessions: [],
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // 현재 타이머 상태 갱신
  const update = useCallback(() => {
    setSnapshot(engine.current.snapshot(Date.now()));
  }, []);

  // 브라우저에 저장된 학습 기록 조회
  const readSessions = useCallback((): TimerSession[] => {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      throw new Error('저장된 타이머 기록 형식이 올바르지 않습니다.');
    }

    return parsed as TimerSession[];
  }, []);

  // 누적 학습 시간 계산
  const refresh = useCallback(async () => {
    const sessions = readSessions();

    const totalTimeSeconds = sessions.reduce(
      (sum, item) => sum + item.totalTimeSeconds,
      0
    );

    setSummary({
      totalTimeSeconds,
      sessions,
    });
  }, [readSessions]);

  // 최초 실행 시 저장된 기록 조회
  useEffect(() => {
    void refresh().catch((e) => {
      setError(
        e instanceof Error
          ? e.message
          : '학습 기록 조회 실패'
      );
    });
  }, [refresh]);

  // 타이머 실행 중 1초마다 갱신
  useEffect(() => {
    if (snapshot.status !== 'running') {
      return;
    }

    const id = window.setInterval(update, 1000);

    const visible = () => {
      if (document.visibilityState === 'visible') {
        update();
      }
    };

    document.addEventListener('visibilitychange', visible);

    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', visible);
    };
  }, [update, snapshot.status]);

  // 미저장 타이머가 있을 때 페이지 이탈 경고
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      const state = engine.current.snapshot(Date.now()).status;

      if (
        state === 'running' ||
        state === 'paused' ||
        state === 'pending'
      ) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', warn);

    return () => {
      window.removeEventListener('beforeunload', warn);
    };
  }, []);

  // 타이머 시작
  const start = async (minutes: number) => {
    if (lock.current) return;

    lock.current = true;
    setBusy(true);
    setError('');

    try {
      if (
        !Number.isInteger(minutes) ||
        minutes < 1 ||
        minutes > 240
      ) {
        throw new Error('목표 시간은 1~240분입니다.');
      }

      const state = engine.current.snapshot(Date.now()).status;

      if (state !== 'idle' && state !== 'saved') {
        throw new Error('현재 기록을 먼저 저장해주세요.');
      }

      engine.current.start(minutes, Date.now());

      minutesRef.current = minutes;

      // 서버 세션 생성 없이 클라이언트에서 시작
      setSession(null);
      update();

    } catch (e) {
      setError(
        e instanceof Error ? e.message : '시작 실패'
      );

    } finally {
      lock.current = false;
      setBusy(false);
    }
  };

  // 일시정지
  const pause = () => {
    if (lock.current) return;

    try {
      engine.current.pause(Date.now());
      setError('');
      update();

    } catch (e) {
      setError(
        e instanceof Error ? e.message : '일시정지 실패'
      );
    }
  };

  // 재개
  const resume = () => {
    if (lock.current) return;

    try {
      engine.current.resume(Date.now());
      setError('');
      update();

    } catch (e) {
      setError(
        e instanceof Error ? e.message : '재개 실패'
      );
    }
  };

  // 종료 후 localStorage에 학습 기록 저장
  const finish = async () => {
    if (lock.current) return;

    const state = engine.current.snapshot(Date.now()).status;

    if (
      state !== 'running' &&
      state !== 'paused' &&
      state !== 'pending'
    ) {
      return;
    }

    lock.current = true;
    setBusy(true);
    setError('');

    try {
      const intervals = engine.current.finish(Date.now());

      update();

      // 모든 학습 구간의 밀리초를 합산한 뒤 초 단위로 변환
      const totalTimeSeconds = Math.floor(
        intervals.reduce((sum, interval) => {
          const startedAt = Date.parse(interval.startedAt);
          const endedAt = Date.parse(interval.endedAt);

          if (
            !Number.isFinite(startedAt) ||
            !Number.isFinite(endedAt)
          ) {
            throw new Error('학습 시간 데이터가 올바르지 않습니다.');
          }

          return sum + Math.max(0, endedAt - startedAt);
        }, 0) / 1000
      );

      const sessions = readSessions();

      const savedSession: TimerSession = {
        timerSessionId: Date.now(),
        setTimeMinutes: minutesRef.current,
        totalTimeSeconds,
      };

      // 저장에 성공해야 엔진 상태를 saved로 변경
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([...sessions, savedSession])
      );

      engine.current.saved();
      setSession(savedSession);
      update();

      // 저장 이후 누적 시간 조회
      try {
        await refresh();
      } catch {
        setError(
          '저장은 완료됐지만 누적 조회에 실패했습니다.'
        );
      }

    } catch (e) {
      update();

      setError(
        e instanceof Error ? e.message : '저장 실패'
      );

    } finally {
      lock.current = false;
      setBusy(false);
    }
  };

  return {
    ...snapshot,
    session,
    summary,
    busy,
    error,
    start,
    pause,
    resume,
    finish,

    refresh: () =>
      void refresh()
        .then(() => setError(''))
        .catch((e) =>
          setError(
            e instanceof Error
              ? e.message
              : '학습 기록 조회 실패'
          )
        ),
  };
}


 //최솔
import { useCallback, useEffect, useRef, useState } from 'react';
import { TimerEngine } from './TimerEngine';
import { TimerSession, TimerSummary } from './types';
import { timerApi } from './timerApi';

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

  // DB에 저장된 누적 학습 기록 조회
  const refresh = useCallback(async () => {
    setSummary(await timerApi.summary());
  }, []);

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
const start = async (minutes: number, canRun: () => boolean = () => true) => {
  if (lock.current) return false;

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

    // 서버에 타이머 세션 생성
    const createdSession = await timerApi.create(minutes);

    // 카메라 연결이 끊기거나 화면을 떠난 동안에는 늦은 응답으로 시작하지 않습니다.
    if (!canRun()) return false;

    // 서버에서 생성한 세션 ID 보관
    setSession(createdSession);

    // 타이머 시간은 클라이언트에서 관리
    engine.current.start(minutes, Date.now());

    minutesRef.current = minutes;
    update();
    return true;

  } catch (e) {
    setError(
      e instanceof Error ? e.message : '시작 실패'
    );
    return false;

  } finally {
    lock.current = false;
    setBusy(false);
  }
};

  // 일시정지
  const pause = () => {
    if (lock.current || engine.current.snapshot(Date.now()).status !== 'running') return false;

    try {
      engine.current.pause(Date.now());
      setError('');
      update();
      return true;

    } catch (e) {
      setError(
        e instanceof Error ? e.message : '일시정지 실패'
      );
      return false;
    }
  };

  // 재개
  const resume = () => {
    if (lock.current || engine.current.snapshot(Date.now()).status !== 'paused') return false;

    try {
      engine.current.resume(Date.now());
      setError('');
      update();
      return engine.current.snapshot(Date.now()).status === 'running';

    } catch (e) {
      setError(
        e instanceof Error ? e.message : '재개 실패'
      );
      return false;
    }
  };

  // 종료 후 DB에 학습 기록 저장
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

      if (!session) {
        throw new Error('서버 타이머 세션이 없습니다. 새 타이머를 시작해주세요.');
      }
      const savedSession = await timerApi.save(session.timerSessionId, intervals);

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
    getSnapshot: () => engine.current.snapshot(Date.now()),
  };
}

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import FaceDetector, { DetectResponse } from '../detect/FaceDetector';
import Timer from '../timer/Timer';
import { UseTimer } from '../timer/UseTimer';
import styles from './focusStudyPanel.module.css';

type PauseReason = 'manual' | 'absence' | 'unavailable' | null;
type StartRequest = { kind: 'start'; minutes: number } | { kind: 'resume' };
const FOCUS_PAUSE_SECONDS = 5;

const FocusStudyPanel: React.FC = () => {
    const timer = UseTimer();
    const timerRef = useRef(timer);
    timerRef.current = timer;
    const mountedRef = useRef(true);
    const generationRef = useRef(0);
    const phaseRef = useRef<'off' | 'preparing' | 'starting' | 'active'>('off');
    const requestRef = useRef<StartRequest | null>(null);
    const lastResultRef = useRef<DetectResponse | null>(null);
    const pauseReasonRef = useRef<PauseReason>(null);
    const [mode, setMode] = useState<'normal' | 'focus'>('normal');
    const [detecting, setDetecting] = useState(false);
    const [preparing, setPreparing] = useState(false);
    const [pauseReason, setPauseReason] = useState<PauseReason>(null);
    const [notice, setNotice] = useState('');
    const [previewCollapsed, setPreviewCollapsed] = useState(false);
    const windowRef = useRef<HTMLElement | null>(null);
    const dragRef = useRef<{ pointerId: number; offsetX: number; offsetY: number } | null>(null);
    const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

    const clampPosition = useCallback((x: number, y: number) => {
        const rect = windowRef.current?.getBoundingClientRect();
        const margin = 8;
        return {
            x: Math.max(margin, Math.min(x, window.innerWidth - (rect?.width || 380) - margin)),
            y: Math.max(margin, Math.min(y, window.innerHeight - (rect?.height || 0) - margin))
        };
    }, []);

    const startDrag = (event: React.PointerEvent<HTMLElement>) => {
        if (!event.isPrimary || event.button !== 0 || (event.target as HTMLElement).closest('button')) return;
        const rect = windowRef.current?.getBoundingClientRect();
        if (!rect) return;
        dragRef.current = { pointerId: event.pointerId, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top };
        event.currentTarget.setPointerCapture(event.pointerId);
        setPosition(clampPosition(rect.left, rect.top));
    };

    const moveDrag = (event: React.PointerEvent<HTMLElement>) => {
        const drag = dragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) return;
        setPosition(clampPosition(event.clientX - drag.offsetX, event.clientY - drag.offsetY));
    };

    const endDrag = (event: React.PointerEvent<HTMLElement>) => {
        if (dragRef.current?.pointerId !== event.pointerId) return;
        dragRef.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    };

    const moveWithKeyboard = (event: React.KeyboardEvent<HTMLElement>) => {
        if (event.target !== event.currentTarget) return;
        const offsets: Record<string, [number, number]> = {
            ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1]
        };
        const offset = offsets[event.key];
        const rect = windowRef.current?.getBoundingClientRect();
        if (!offset || !rect) return;
        event.preventDefault();
        const step = event.shiftKey ? 32 : 16;
        setPosition(clampPosition(rect.left + offset[0] * step, rect.top + offset[1] * step));
    };

    useEffect(() => {
        if (!detecting) return;
        const keepVisible = () => setPosition(current => {
            if (!current) return current;
            const next = clampPosition(current.x, current.y);
            return next.x === current.x && next.y === current.y ? current : next;
        });
        const observer = new ResizeObserver(keepVisible);
        if (windowRef.current) observer.observe(windowRef.current);
        window.addEventListener('resize', keepVisible);
        return () => {
            observer.disconnect();
            window.removeEventListener('resize', keepVisible);
            dragRef.current = null;
        };
    }, [detecting, clampPosition]);

    const setReason = useCallback((reason: PauseReason) => {
        pauseReasonRef.current = reason;
        setPauseReason(reason);
    }, []);

    const disconnect = useCallback(() => {
        generationRef.current += 1;
        phaseRef.current = 'off';
        requestRef.current = null;
        lastResultRef.current = null;
        setDetecting(false);
        setPreparing(false);
    }, []);

    const detectionEnded = () => {
        if (!mountedRef.current || phaseRef.current === 'off') return;
        const state = timerRef.current.getSnapshot();
        if (state.status === 'running') timerRef.current.pause();
        // 수동 정지는 연결 복구 후에도 자동으로 풀지 않습니다.
        if (pauseReasonRef.current !== 'manual') setReason('unavailable');
        disconnect();
        setNotice('감지가 종료되었습니다. 집중 학습을 다시 시작하거나 일반 모드로 계속할 수 있습니다.');
    };

    const prepare = (request: StartRequest) => {
        if (phaseRef.current !== 'off' || timerRef.current.busy) return;
        if (request.kind === 'start') setReason(null);
        generationRef.current += 1;
        requestRef.current = request;
        phaseRef.current = 'preparing';
        lastResultRef.current = null;
        setPreparing(true);
        setPreviewCollapsed(false);
        setNotice('카메라와 감지를 연결하고 있습니다. 얼굴 또는 움직임이 감지되면 학습이 시작됩니다.');
        setDetecting(true);
    };

    const applyResult = (data: DetectResponse) => {
        const current = timerRef.current;
        const state = current.getSnapshot();
        if (state.status === 'paused' && state.remainingSeconds === 0) {
            disconnect();
            setReason(null);
            setNotice('목표 시간을 완료했습니다. 종료 및 저장을 눌러 기록을 저장해주세요.');
        } else if (!data.studying && data.not_studying_seconds >= FOCUS_PAUSE_SECONDS && state.status === 'running') {
            if (current.pause()) {
                setReason('absence');
                setNotice('5초 동안 학습 상태가 감지되지 않아 자동으로 일시정지했습니다. 복귀하면 재개됩니다.');
            }
        } else if (data.studying && state.status === 'paused' && pauseReasonRef.current === 'absence') {
            if (current.resume()) {
                setReason(null);
                setNotice('학습 상태가 다시 감지되어 타이머를 재개했습니다.');
            }
        }
    };

    const onResult = (data: DetectResponse) => {
        if (!mountedRef.current || phaseRef.current === 'off') return;
        lastResultRef.current = data;
        if (phaseRef.current === 'preparing' && data.studying) {
            const request = requestRef.current;
            if (!request) return;
            phaseRef.current = 'starting';
            const generation = generationRef.current;
            const stillActive = () => mountedRef.current && generationRef.current === generation;
            void (async () => {
                const started = request.kind === 'start'
                    ? await timerRef.current.start(request.minutes, stillActive)
                    : timerRef.current.resume();
                if (!stillActive()) return;
                setPreparing(false);
                if (!started) {
                    disconnect();
                    setNotice('타이머를 시작하지 못했습니다. 타이머 상태와 오류를 확인해주세요.');
                    return;
                }
                phaseRef.current = 'active';
                setReason(null);
                setNotice('집중 학습 중입니다. 5초 동안 학습 상태가 감지되지 않으면 자동으로 일시정지합니다.');
                if (lastResultRef.current) applyResult(lastResultRef.current);
            })();
        } else if (phaseRef.current === 'active') {
            applyResult(data);
        }
    };

    const start = async (minutes: number) => {
        if (mode === 'normal') return timer.start(minutes);
        prepare({ kind: 'start', minutes });
        return false; // 실제 시작은 첫 학습 감지와 서버 세션 생성 이후입니다.
    };

    const pause = () => {
        const paused = timer.pause();
        if (paused) {
            setReason('manual');
            setNotice('직접 일시정지했습니다. 재개 버튼을 눌러야 다시 시작됩니다.');
        }
        return paused;
    };

    const resume = () => {
        if (mode === 'focus') {
            if (phaseRef.current === 'off') {
                prepare({ kind: 'resume' });
                return false;
            }
            if (phaseRef.current !== 'active' || !lastResultRef.current?.studying) {
                setNotice('얼굴 또는 움직임이 감지된 후 재개할 수 있습니다.');
                return false;
            }
        }
        const resumed = timer.resume();
        if (resumed) {
            setReason(null);
            setNotice('학습을 재개했습니다.');
        }
        return resumed;
    };

    const finish = async () => {
        // 저장 실패 시에도 기존 pending 기록을 유지하고 감지는 종료합니다.
        disconnect();
        setReason(null);
        setNotice('');
        await timer.finish();
    };

    const stopFocus = () => {
        if (timer.getSnapshot().status === 'running') timer.pause();
        disconnect();
        setReason('manual');
        setNotice('집중 학습을 중지했습니다. 기록은 유지됩니다. 재개하거나 종료 및 저장할 수 있습니다.');
    };

    const changeMode = (next: 'normal' | 'focus') => {
        if (mode === next || timer.busy || preparing) return;
        // 실행 중 모드 변경은 허용하지 않아 감지 없이 시간이 쌓이는 상황을 방지합니다.
        if (timer.getSnapshot().status === 'running') return;
        disconnect();
        setMode(next);
        setReason(timer.getSnapshot().status === 'paused' ? 'manual' : null);
        setNotice('');
    };

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            generationRef.current += 1;
            phaseRef.current = 'off';
        };
    }, []);

    // 서버 응답이 없어도 목표 시간이 끝나면 카메라를 정리합니다.
    useEffect(() => {
        if (detecting && !preparing && timer.status === 'paused' && timer.remainingSeconds === 0) {
            disconnect();
            setReason(null);
            setNotice('목표 시간을 완료했습니다. 종료 및 저장을 눌러 기록을 저장해주세요.');
        }
    }, [detecting, preparing, timer.status, timer.remainingSeconds, disconnect, setReason]);

    const modeLocked = timer.busy || preparing || timer.status === 'running' || timer.status === 'pending';
    const remainingTime = `${Math.floor(timer.remainingSeconds / 60).toString().padStart(2, '0')}:${(timer.remainingSeconds % 60).toString().padStart(2, '0')}`;

    return (
        <section className={styles.panel} aria-label="학습 공간">
            <div className={styles.modeButtons} role="group" aria-label="학습 모드">
                <button type="button" aria-pressed={mode === 'normal'} disabled={modeLocked}
                    onClick={() => changeMode('normal')}>일반 학습</button>
                <button type="button" aria-pressed={mode === 'focus'} disabled={modeLocked}
                    onClick={() => changeMode('focus')}>집중 학습</button>
            </div>
            <Timer embedded timer={{ ...timer, busy: timer.busy || preparing, start, pause, resume, finish }}
                startLabel={preparing ? '감지 준비 중...' : mode === 'focus' ? '집중 학습 시작' : '시작'} />
            {!detecting && notice && <p className={styles.notice} role="status">{notice}</p>}
            {mode === 'focus' && !detecting && <p className={styles.description}>
                시작하면 작은 카메라 창이 열립니다. 첫 학습 감지 후 타이머가 시작됩니다.
            </p>}
            {detecting && createPortal(
                <aside ref={windowRef} className={styles.focusWindow} role="dialog" aria-modal="false" aria-label="집중 학습 감지"
                    style={position ? { left: position.x, top: position.y, right: 'auto', bottom: 'auto' } : undefined}>
                    <header className={styles.windowHeader} tabIndex={0}
                        aria-label="집중 학습 패널 이동. 드래그하거나 방향키로 이동하세요."
                        title="드래그하여 이동"
                        onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag}
                        onPointerCancel={endDrag} onLostPointerCapture={() => { dragRef.current = null; }}
                        onKeyDown={moveWithKeyboard}>
                        <strong>집중 학습 <span>{preparing ? '준비 중' : remainingTime}</span></strong>
                        <button type="button" onClick={() => setPreviewCollapsed(value => !value)}
                            aria-expanded={!previewCollapsed}>{previewCollapsed ? '펼치기' : '접기'}</button>
                    </header>
                    <div hidden={previewCollapsed}>
                <FaceDetector autoStart onDetectionResult={onResult} onDetectionEnd={detectionEnded}
                    onDetectionError={message => {
                        detectionEnded();
                        if (mountedRef.current) setNotice(message);
                    }} />
                    </div>
                    {notice && <p className={styles.notice} role="status">{notice}</p>}
                    {pauseReason === 'manual' && <p className={styles.description}>
                        수동 일시정지는 재개 버튼을 눌러야 해제됩니다.
                    </p>}
                    <div className={styles.windowActions}>
                        {!preparing && timer.status === 'running' && <button type="button" disabled={timer.busy}
                            onClick={pause}>일시정지</button>}
                        {!preparing && timer.status === 'paused' && timer.remainingSeconds > 0 && <button
                            type="button" disabled={timer.busy} onClick={resume}>재개</button>}
                        {!preparing && <button type="button" disabled={timer.busy} onClick={() => void finish()}>종료 및 저장</button>}
                    </div>
                <button type="button" className={styles.stopButton} disabled={timer.busy} onClick={stopFocus}>
                    {preparing ? '집중 학습 준비 취소' : '감지 중지 및 일시정지'}
                </button>
                </aside>, document.body
            )}
        </section>
    );
};

export default FocusStudyPanel;

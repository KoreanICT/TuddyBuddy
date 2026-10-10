export interface Interval { startedAt: string; endedAt: string; }
export interface TimerSession { timerSessionId: number; setTimeMinutes: number; totalTimeSeconds: number; }
export interface TimerSummary { totalTimeSeconds: number; sessions: TimerSession[]; }
export type TimerStatus = 'idle' | 'running' | 'paused' | 'pending' | 'saved';
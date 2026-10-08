import { Interval, TimerStatus } from './types';
/** React/API와 독립적인 클라이언트 시간 계산. now를 받아 테스트 가능. */
export class TimerEngine {
  private status: TimerStatus='idle';
  private targetMs=0;
  private accumulatedMs=0;
  private runningSince: number | null=null;
  private intervals: Interval[]=[];
  start(minutes: number,now: number) {
    if(!Number.isInteger(minutes) || minutes<1 || minutes>240) throw new Error('목표 시간은 1~240분입니다.');
    if(this.status!=='idle' && this.status!=='saved') throw new Error('현재 기록을 먼저 저장해주세요.');
    this.targetMs=minutes*60000;this.accumulatedMs=0;this.intervals=[];
    this.runningSince=now;this.status='running';
  }
  pause(now: number) {
    if(this.status!=='running' || this.runningSince===null) return;
    if(now<this.runningSince) throw new Error('컴퓨터 시각이 뒤로 변경되었습니다. 시각을 복원한 후 다시 시도해주세요.');
    const duration=Math.min(Math.max(0,now-this.runningSince),this.targetMs-this.accumulatedMs);
    if(duration>0) this.intervals.push({startedAt:new Date(this.runningSince).toISOString(),endedAt:new Date(this.runningSince+duration).toISOString()});
    this.accumulatedMs+=duration;this.runningSince=null;this.status='paused';
  }
  resume(now: number) {
    if(this.status!=='paused' || this.accumulatedMs>=this.targetMs) return;
    if(this.intervals.length>=500) throw new Error('실행 구간이 500개입니다. 현재 기록을 저장하고 새로 시작해주세요.');
    const last=this.intervals[this.intervals.length-1];
    if(last && now<Date.parse(last.endedAt)) throw new Error('컴퓨터 시각이 변경되었습니다. 시각을 확인해주세요.');
    this.runningSince=now;this.status='running';
  }
  snapshot(now: number) {
    if(this.status==='running' && this.runningSince!==null && now-this.runningSince>=this.targetMs-this.accumulatedMs) this.pause(now);
    const extra=this.runningSince===null?0:Math.max(0,now-this.runningSince);
    const ms=Math.min(this.targetMs,this.accumulatedMs+extra);
    return {status:this.status,elapsedSeconds:Math.floor(ms/1000),remainingSeconds:Math.max(0,Math.ceil((this.targetMs-ms)/1000))};
  }
  finish(now: number): Interval[] {
    if(this.status==='idle'||this.status==='saved') throw new Error('진행 중인 타이머가 없습니다.');
    this.pause(now);
    if(this.intervals.length===0) throw new Error('공부 시간이 아직 없습니다. 잠시 공부한 뒤 저장해주세요.');
    this.status='pending';return this.intervals.map(i=>({...i}));
  }
  saved() {
    if(this.status!=='pending') throw new Error('저장 대기 상태가 아닙니다.');
    this.status='saved';
  }
}

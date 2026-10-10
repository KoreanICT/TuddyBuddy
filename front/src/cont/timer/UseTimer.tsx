import { useCallback, useEffect, useRef, useState } from 'react';
import { TimerEngine } from './TimerEngine';
import { timerApi } from './timerApi';
import { TimerSession, TimerSummary } from './types';
export function UseTimer() {
  const engine=useRef(new TimerEngine());
  const lock=useRef(false);
  const queryVersion=useRef(0);
  const [snapshot,setSnapshot]=useState(()=>engine.current.snapshot(Date.now()));
  const [session,setSession]=useState<TimerSession|null>(null);
  const [summary,setSummary]=useState<TimerSummary>({totalTimeSeconds:0,sessions:[]});
  const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  const update=useCallback(()=>setSnapshot(engine.current.snapshot(Date.now())),[]);
  const refresh=useCallback(async()=>{
    const version=++queryVersion.current;
    const data=await timerApi.summary();
    if(version===queryVersion.current) setSummary(data);
  },[]);
  useEffect(()=>{void refresh().catch(e=>setError(e.message));},[refresh]);
  useEffect(()=>{
    if(snapshot.status!=='running') return;
    const id=window.setInterval(update,1000);
    const visible=()=>{if(document.visibilityState==='visible') update();};
    document.addEventListener('visibilitychange',visible);
    return ()=>{window.clearInterval(id);document.removeEventListener('visibilitychange',visible);};
  },[update,snapshot.status]);
  // 이탈 시 자동 저장 대신 미저장 기록을 알린다.
  useEffect(()=>{
    const warn=(e: BeforeUnloadEvent)=>{const state=engine.current.snapshot(Date.now()).status;
      if(state==='running'||state==='paused'||state==='pending'){e.preventDefault();e.returnValue='';}};
    window.addEventListener('beforeunload',warn);
    return ()=>window.removeEventListener('beforeunload',warn);
  },[]);
  const start=async(minutes: number)=>{
    if(lock.current) return;lock.current=true;setBusy(true);setError('');
    try{
      if(!Number.isInteger(minutes)||minutes<1||minutes>240) throw new Error('목표 시간은 1~240분입니다.');
      const state=engine.current.snapshot(Date.now()).status;
      if(state!=='idle' && state!=='saved') throw new Error('현재 기록을 먼저 저장해주세요.');
      const created=await timerApi.create(minutes);setSession(created);engine.current.start(minutes,Date.now());update();
    }catch(e){setError(e instanceof Error?e.message:'시작 실패');}
    finally{lock.current=false;setBusy(false);}
  };
  const pause=()=>{
    if(lock.current) return;
    try{engine.current.pause(Date.now());setError('');update();}
    catch(e){setError(e instanceof Error?e.message:'일시정지 실패');}
  };
  const resume=()=>{if(lock.current) return;try{engine.current.resume(Date.now());setError('');update();}catch(e){setError(e instanceof Error?e.message:'재개 실패');}};
  const finish=async()=>{
    if(lock.current||!session) return;lock.current=true;setBusy(true);setError('');
    try{
      const intervals=engine.current.finish(Date.now());update();
      const saved=await timerApi.save(session.timerSessionId,intervals);
      engine.current.saved();setSession(saved);update();
      // 저장 성공 후 조회 실패가 나더라도 저장 재시도 상태로 되돌리지 않음.
      try{await refresh();}catch{setError('저장은 완료됐지만 누적 조회에 실패했습니다. 기록을 새로고침해주세요.');}
    }catch(e){update();setError(e instanceof Error?e.message:'저장 실패');}
    finally{lock.current=false;setBusy(false);}
  };
  return {...snapshot,session,summary,busy,error,start,pause,resume,finish,
    refresh:()=>void refresh().then(()=>setError('')).catch(e=>setError(e.message))};
}

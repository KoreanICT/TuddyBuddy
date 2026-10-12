import { Interval, TimerSession, TimerSummary } from './types';
const BASE=(process.env.REACT_APP_BACK_END_URL || 'http://localhost/back').replace(/\/$/,'');
const URL=`${BASE}/api/timer-sessions`;
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response=await fetch(`${URL}${path}`,{...init,credentials:'include',headers:{'Content-Type':'application/json',...init?.headers}});
  const data=await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(data.message || `요청 실패 (${response.status})`);
  return data as T;
}
export const timerApi={
  create:(minutes: number)=>request<TimerSession>('',{method:'POST',body:JSON.stringify({setTimeMinutes:minutes})}),
  save:(id: number,intervals: Interval[])=>request<TimerSession>(`/${id}/records`,{method:'PUT',body:JSON.stringify({intervals})}),
  summary:()=>request<TimerSummary>('/summary'),
};

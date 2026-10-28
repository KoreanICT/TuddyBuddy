import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from './authHttp';
import './AccountRecoveryForm.css';

type Mode = 'email' | 'password';
interface Props { mode: Mode; onBack: () => void; }

export default function AccountRecoveryForm({ mode, onBack }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sentEmail, setSentEmail] = useState('');
  const [emails, setEmails] = useState<string[] | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const pending = useRef(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown(value => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  const request = async (action: 'email' | 'code' | 'reset') => {
    if (pending.current || done) return;
    pending.current = true;
    setBusy(true);
    setError('');
    setMessage('');
    controller.current = new AbortController();
    const signal = controller.current.signal;
    try {
      const path = action === 'email' ? '/email' : `/password/${action}`;
      const response = await axios.post(`${BACKEND_URL}/api/auth/recovery${path}`,
        action === 'email' ? { name, phone } : { email: action === 'reset' ? sentEmail : email.trim(), code },
        { signal, timeout: 30000 });
      if (signal.aborted) return;
      if (action === 'email') setEmails(response.data.emails);
      else {
        setMessage(response.data.message);
        if (action === 'code') {
          setSentEmail(email.trim());
          setCode('');
          setCooldown(60);
        } else setDone(true);
      }
    } catch (cause) {
      if (signal.aborted) return;
      setError(axios.isAxiosError(cause)
        ? cause.response?.data?.message || '서버 응답을 확인할 수 없습니다. 메일함을 확인한 후 다시 시도해주세요.'
        : '요청을 처리하지 못했습니다. 다시 시도해주세요.');
    } finally {
      pending.current = false;
      if (!signal.aborted) setBusy(false);
    }
  };

  return <section className="tb-recovery">
    <p className="tb-recovery-description">{mode === 'email'
      ? '가입할 때 입력한 이름과 휴대전화번호를 입력해주세요.'
      : '가입 이메일을 인증하면 새 비밀번호를 메일로 보내드려요. 카카오 회원은 카카오 로그인을 이용해주세요.'}</p>
    <form onSubmit={event => { event.preventDefault(); void request(mode === 'email' ? 'email' : sentEmail ? 'reset' : 'code'); }}>
      {mode === 'email' ? <>
        <div className="tb-auth-field"><label htmlFor="recovery-name">이름</label>
          <input autoFocus id="recovery-name" autoComplete="name" value={name} maxLength={50} required disabled={busy}
            onChange={event => { setName(event.target.value); setEmails(null); }} /></div>
        <div className="tb-auth-field"><label htmlFor="recovery-phone">휴대전화번호</label>
          <input id="recovery-phone" type="tel" autoComplete="tel" value={phone} maxLength={25} required disabled={busy}
            onChange={event => { setPhone(event.target.value); setEmails(null); }} placeholder="010-1234-5678" /></div>
      </> : <>
        <div className="tb-auth-field"><label htmlFor="recovery-email">가입 이메일</label>
          <input autoFocus id="recovery-email" type="email" autoComplete="email" value={email} maxLength={50} required disabled={busy || done}
            onChange={event => { setEmail(event.target.value); setSentEmail(''); setCode(''); setMessage(''); }} placeholder="이메일 주소" /></div>
        {sentEmail && !done && <>
          <div className="tb-auth-field"><label htmlFor="recovery-code">인증번호</label>
            <input id="recovery-code" inputMode="numeric" autoComplete="one-time-code" value={code} pattern="[0-9]{6}" maxLength={6} required disabled={busy}
              onChange={event => setCode(event.target.value.replace(/[^0-9]/g, ''))} placeholder="메일로 받은 숫자 6자리" /></div>
          <button type="button" className="tb-recovery-link" disabled={busy || cooldown > 0} onClick={() => void request('code')}>
            {cooldown > 0 ? `${cooldown}초 후 재발송 가능` : '인증번호 다시 받기'}
          </button>
          <p className="tb-recovery-hint">5분 이내에 입력해주세요. 새 비밀번호 발급 시 기존 비밀번호는 사용할 수 없어요.</p>
        </>}
      </>}
      {error && <p className="tb-auth-error" role="alert">{error}</p>}
      {message && <p className="tb-recovery-result" role="status">{message}</p>}
      {emails !== null && <div className="tb-recovery-result" role="status">
        {emails.length ? <><strong>가입된 이메일</strong><ul>{emails.map(item => <li key={item}>{item}</li>)}</ul><small>개인정보 보호를 위해 이메일 일부만 표시해요.</small></>
          : '입력한 정보와 일치하는 회원이 없습니다.'}
      </div>}
      {!done && <button className="tb-auth-primary" type="submit" disabled={busy}>
        {busy ? '처리 중...' : mode === 'email' ? '가입 이메일 찾기' : sentEmail ? '인증하고 새 비밀번호 받기' : '인증번호 받기'}
      </button>}
    </form>
    <button type="button" className="tb-recovery-back" disabled={busy} onClick={onBack}>로그인으로 돌아가기</button>
  </section>;
}

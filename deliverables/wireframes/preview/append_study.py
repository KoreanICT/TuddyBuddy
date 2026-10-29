from pathlib import Path
from PIL import Image
import json,re,base64,html
ROOT=Path(r'D:/ICTstudy/Project2/TuddyBuddy/deliverables/wireframes');WORK=ROOT/'preview/append-study';WORK.mkdir(exist_ok=True);(WORK/'after').mkdir(exist_ok=True);(WORK/'before').mkdir(exist_ok=True)
OUT=ROOT/'update-community/output';master=next(OUT.glob('*통합본.html')).read_text(encoding='utf-8');old=re.findall(r'<section>(.*?)</section>',master,re.S);assert len(old)==84
for n,s in enumerate(old,1):
    new=s.replace(f'>{n} / 84</text>',f'>{n} / 86</text>');assert new!=s
    (WORK/'after'/f'WF-{n:03}.svg').write_text(new,encoding='utf-8')
base=Path(r'C:/Users/ICT-018/Desktop/화면설계서/프로젝트화면캡처/로그인/내 계정/관리자메뉴')
screens=[(85,'관리자 메뉴 스터디 관리',[('스터디 관리 메뉴',76,370,20,460),('새로고침',1172,141,1500,265),('스터디명·방장 검색',674,232,20,305),('스터디룸 목록',657,540,20,650),('스터디룸 삭제',1173,418,1500,535),('페이지 이동',748,730,1500,840)]),(86,'관리자 메뉴 스터디 관리 스터디룸 삭제',[('삭제 확인 안내',594,349,20,450),('삭제 대상 스터디룸',604,434,20,585),('삭제 알림 안내',630,553,20,730),('취소',548,618,20,865),('삭제하기',733,618,1500,865),('창 닫기',818,271,1500,385)])]
for n,name,items in screens:
    f=base/(name+'.png');raw=f.read_bytes();im=Image.open(f);scale=1240/im.width;ih=im.height*scale
    s=f'<svg xmlns="http://www.w3.org/2000/svg" width="1720" height="1250" viewBox="0 0 1720 1250"><rect width="1720" height="1250" fill="white"/><text x="45" y="45" font-size="18" fill="#526074">TUDDYBUDDY · 화면설계서 · WF-{n:03}</text><text x="45" y="88" font-size="30" font-weight="700">{name}</text><text x="45" y="119" font-size="16" fill="#64748b">로그인 / 내 계정 / 관리자메뉴</text><image x="240" y="150" width="1240" height="{ih}" href="data:image/png;base64,{base64.b64encode(raw).decode()}"/>'
    for j,(label,x,y,bx,by) in enumerate(items,1):
        tx=240+x*scale;ty=150+y*scale;sx=bx+200 if bx<240 else bx
        s+=f'<path d="M {sx} {by+24} L {tx} {ty}" stroke="#df0000" stroke-width="2.5" fill="none"/><circle cx="{tx}" cy="{ty}" r="5.5" fill="#df0000"/><rect x="{bx}" y="{by}" width="200" height="49" rx="7" fill="white" stroke="#df0000" stroke-width="2"/><circle cx="{bx+23}" cy="{by+24}" r="25" fill="#df0000" stroke="white" stroke-width="2"/><text x="{bx+23}" y="{by+32}" font-size="26" text-anchor="middle" font-weight="700" fill="white">{j}</text><text x="{bx+54}" y="{by+30}" font-size="16" font-weight="700" fill="#b60000">{html.escape(label)}</text>'
    s+=f'<line x1="45" y1="1157" x2="1675" y2="1157" stroke="#e2e8f0"/><text x="45" y="1192" font-size="16" fill="#64748b">제공된 캡처 기준 · 빨간 번호는 화면의 주요 구성 요소를 표시합니다</text><text x="1675" y="1192" text-anchor="end" font-size="17" fill="#64748b">{n} / 86</text></svg>'
    (WORK/'after'/f'WF-{n:03}.svg').write_text(s,encoding='utf-8')
    (WORK/'before'/f'WF-{n:03}.svg').write_text(s,encoding='utf-8')
(WORK/'changed.json').write_text('[85,86]',encoding='utf-8')
print('Prepared WF-085 and WF-086')

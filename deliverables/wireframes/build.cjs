const fs=require('fs'),path=require('path');
const {chromium}=require('C:/Users/ICT-018/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=__dirname,m=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
// Each annotation stores its label and the observed target in screenshot percent coordinates.
const specs={
1:'이미지 미리보기,50,22;문제 생성 설정,49,46;추가 요청사항,49,70;생성 버튼,60,85',
2:'학습 유형 탭,20,20;오답 문제 영역,46,40;문제 풀이 버튼,59,72;학습 타이머,86,44',
3:'문제 생성 버튼,77,20;학습 데이터 없음,46,48;학습 타이머,86,46',
4:'관리자 메뉴,10,38;검색 조건,49,28;공지 등록,90,18;공지 목록,61,48',
5:'제목 입력,56,12;내용 입력,57,39;첨부 이미지,57,76;등록 버튼,86,97',
6:'공지 등록,90,18;검색 조건,49,28;빈 공지 목록,59,57;페이지 이동,62,69',
7:'관리 메뉴,10,40;현황 요약,60,24;회원 가입 추이,46,51;신고 처리 현황,81,51',
8:'조회 조건,59,20;조회 버튼,23,29;활동 로그 목록,60,60',
9:'관리 탭,32,12;조회 기간,42,21;이용 지표,59,38;이용 추이,58,63',
10:'관리 탭,32,22;카테고리 관리,58,39;콘텐츠 목록,58,70;새 콘텐츠,90,56',
11:'내 계정 메뉴,87,34;관리자 메뉴 진입,85,51;메뉴 닫기,96,4',
12:'회원 검색,78,21;회원 목록,58,51;회원 상태,78,43;회원 관리 버튼,91,43',
18:'계정 메뉴,86,22;마이페이지,85,13;로그아웃,83,96;닫기,96,4',
19:'마이페이지 메뉴,13,34;나의 게시글,38,15;게시글 없음,62,28',
20:'신고내역 메뉴,13,34;신고 목록 항목,62,25;신고내역 없음,62,36',
21:'친구 메뉴,13,47;친구 관련 탭,41,22;친구 수,87,31;친구 없음,59,49',
22:'포인트 내역 창,50,57;내역 없음,49,65;닫기,70,57',
23:'회원 요약,55,26;보유 포인트,39,39;회원정보,56,64;정보 수정,87,86',
24:'계정 정보,57,30;비밀번호 변경,57,54;변경 버튼,57,70;회원정보 입력,57,88',
25:'알림 제목,17,14;알림 항목,53,25;삭제 버튼,86,40',
26:'포인트 상품,50,43;선택 상품 금액,51,71;구매 버튼,50,78',
27:'스터디룸 정보,39,16;보기 전환,87,33;할 일 목록,51,44',
28:'상태별 보드,52,57;할 일 상세,42,42;삭제 버튼,51,58;할 일 추가,26,90',
29:'할 일 제목,50,28;상세 내용,50,42;상태 선택,50,64;마감 일시,50,74;등록 버튼,65,81',
30:'이동 대상 열,20,56;이동 중인 할 일,27,47;상태별 열,70,56',
31:'상태별 열,52,56;할 일 추가,26,90;보기 전환,87,29',
32:'다이어그램 캔버스,46,58;노드 연결,49,59;유형 선택,81,36;생성 버튼,81,53',
33:'빈 캔버스,45,54;다이어그램 설정,80,44;확대·축소,17,83;미니맵,81,84',
34:'메모 내용 입력,23,38;저장 버튼,33,52;메모 등록,87,20;메모 보드,53,60',
35:'메모 등록,87,28;빈 메모 보드,53,63;휴지통,88,92',
36:'등록된 메모,26,46;메모 보드,54,65;메모 등록,87,28;휴지통,88,92',
37:'공개 스터디룸 목록,38,26;참여 요청,69,33;스터디룸 메뉴,85,28;검색 조건,84,54',
38:'스터디룸 이름,51,23;소개 입력,51,36;태그 설정,51,51;공개·가입 설정,51,68;생성 버튼,65,89',
39:'스터디룸 이름,51,27;소개 입력,51,41;태그 설정,51,56;수정 버튼,65,82',
40:'참여 요청 확인창,53,6;확인 버튼,64,11;요청한 스터디룸,42,30',
41:'초대코드 입력,50,57;입장 버튼,62,63;취소 버튼,55,63',
42:'선택 날짜,43,34;등록된 일정,49,44;할 일 일정,48,56;일정 관리,59,44',
43:'날짜 선택,52,37;일정 제목,52,47;시작·종료 시간,52,55;상세 내용,52,68;등록 버튼,62,80',
44:'월 이동,30,19;달력,53,55;일정 등록,89,19;오늘 날짜,80,60',
45:'질의응답 영역,51,57;메시지 입력,49,89;전송 버튼,90,89',
46:'대화 내역,82,59;메시지 입력,49,89;전송 버튼,90,89',
47:'멤버 수,25,28;멤버 카드,28,40;초대코드 관리,89,28',
48:'참고자료 등록,18,30;등록된 파일,45,40;파일 작업,85,40;다운로드 완료 알림,87,8',
49:'자료 제목,50,42;파일 선택,46,52;자료 설명,51,62;등록 버튼,60,68',
50:'자료 등록,18,30;참고자료 없음,53,46;스터디룸 정보,44,16',
51:'공부 현황,52,32;최근 공지,53,52;공지 전체 보기,85,49',
52:'알림 팝업,83,14;알림 없음,83,18;닫기,92,8',
53:'신고 관련 알림,79,14;알림 내용,78,21;닫기,92,8',
54:'상단 알림 아이콘,83,4;최신 공지,52,27;내 계정,92,4',
55:'참여 요청 알림,82,18;요청자 안내,81,25;수락·거절,88,29',
56:'내 계정 패널,88,30;알림 메뉴,84,36;패널 닫기,96,4',
57:'알림 페이지,17,14;알림 없음,53,26;알림 수,87,15',
58:'알림 목록,53,31;알림 유형,24,25;알림 내용,50,32;삭제 버튼,86,40',
59:'버디봇 대화창,82,48;질문·답변 내역,82,48;메시지 입력,80,80;전송 버튼,94,80',
60:'로고,10,4;로그인 상단 메뉴,44,4;알림·내 계정,86,4;최신 공지,51,29;버디봇 안내,51,57',
61:'월 이동,27,31;출석 달력,38,57;출석 버튼,81,46;출석 현황,84,60',
62:'출석 완료 날짜,62,66;출석 완료 버튼,81,46;누적 출석 현황,84,60',
63:'분석 안내,51,27;분석 대상,50,41;필요 포인트,50,59;분석 시작,50,66',
64:'학습 요약,51,9;학습 비율,75,24;카테고리 분석,51,53;분석 결과 안내,51,83',
65:'신고 유형,40,25;신고 제목,49,31;상세 내용,49,51;동의 항목,47,75;신고 접수,76,86',
66:'플로팅 메뉴,90,68;추가 메뉴 버튼,94,89;버디봇 버튼,94,81',
67:'계정 입력,58,43;계속하기,58,49;회원가입,58,55;카카오 로그인,58,67;닫기,70,37',
68:'아이디·중복 확인,52,23;이메일 인증,52,34;비밀번호 입력,52,50;회원정보 입력,52,72',
69:'자주 묻는 질문,51,31;검색 조건,49,41;공지 목록,51,57;페이지 이동,51,68',
70:'자주 묻는 질문,51,31;검색 조건,49,41;공지 없음,51,58;페이지 이동,51,68',
71:'공지 제목,41,14;작성 정보,48,21;공지 내용,51,59;목록으로,51,90',
77:'뉴스 검색,46,28;정렬·새로고침,78,28;기사 목록,51,60;기사 링크,20,50',
78:'버디봇 안내,83,39;추천 질문,82,58;메시지 입력,80,76;전송 버튼,94,76',
79:'사용자 질문,88,42;버디봇 답변,82,59;입력 영역,80,76;대화창 닫기,94,32',
80:'대화 내역,83,53;후속 질문,86,63;질문 입력,80,76;전송 버튼,94,76',
81:'개인 학습 안내,63,47;문제 생성 진입,62,66;이용 방법 보기,75,66',
82:'스터디룸 안내,34,49;스터디룸 진입,22,67;목록 보기,36,67;슬라이드 표시점,98,56',
83:'학습 이용 단계,51,49;시작 버튼,47,71;기능 둘러보기,59,71;슬라이드 표시점,98,56',
84:'로고,10,4;상단 메뉴,35,4;로그인·회원가입,91,4;최신 공지,51,29;버디봇 안내,51,57;버디봇 버튼,94,94.10220376876397',
85:'커뮤니티 제목,20,16;글쓰기,83,16;게시판 분류,50,26;검색,50,36;로그인 안내,51,54'
};
for(let i=13;i<=17;i++)specs[i]='관리 메뉴,10,39;신고 상태 필터,32,17;신고 유형별 현황,42,39;신고 사유별 현황,78,39;신고 목록,59,76';
for(let i=72;i<=76;i++)specs[i]='FAQ 검색,50,28;질문 분류,46,35;질문·답변 목록,51,56;닫기,76,15';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const order=[84,81,82,83,60,67,68,69,70,71,72,73,74,75,76,77,78,79,80,59,85,3,1,2,37,38,39,40,41,51,31,29,30,28,27,44,43,42,33,32,35,34,36,45,46,50,49,48,47,61,62,63,64,18,23,24,19,20,21,22,26,52,54,53,55,56,57,58,25,66,65,11,7,12,6,5,4,14,15,17,16,13,10,9,8];
let pages=[];
for(const [index,id] of order.entries()){
 const it=m[id-1],a=specs[id].split(';').map(v=>{const [label,x,y]=v.split(',');return {label,x:+x,y:+y}});
 const data=fs.readFileSync(path.join(root,'assets',String(id).padStart(3,'0')+'.png')).toString('base64');
 // Preserve the full screenshot aspect ratio inside the annotation canvas.
 const iw=1240,ih=iw*it.height/it.width,ix=240,iy=150;
 let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1720" height="1250" viewBox="0 0 1720 1250"><rect width="1720" height="1250" fill="white"/><text x="45" y="45" font-size="18" fill="#526074">TUDDYBUDDY · 화면설계서 · WF-${String(index+1).padStart(3,'0')}</text><text x="45" y="88" font-size="30" font-weight="700">${esc(it.name)}</text><text x="45" y="119" font-size="16" fill="#64748b">${esc(it.category.replaceAll('\\',' / '))}</text><image x="${ix}" y="${iy}" width="${iw}" height="${ih}" href="data:image/png;base64,${data}"/>`;
 a.forEach((v,j)=>{const left=v.x<50,bx=left?20:1500,tx=ix+iw*v.x/100,ty=iy+ih*v.y/100; const side=a.map((z,k)=>({z,k})).filter(o=>(o.z.x<50)===left).sort((u,w)=>u.z.y-w.z.y);let last=140,by=140; for(const o of side){const yy=Math.min(1060,Math.max(last,iy+ih*o.z.y/100-24));if(o.k===j){by=yy;break;}last=yy+72;}svg+=`<path d="M ${left?bx+200:bx} ${by+24} L ${tx} ${ty}" stroke="#df0000" stroke-width="2.5" fill="none"/><circle cx="${tx}" cy="${ty}" r="5.5" fill="#df0000"/><rect x="${bx}" y="${by}" width="200" height="49" rx="7" fill="white" stroke="#df0000" stroke-width="2"/><circle cx="${bx+23}" cy="${by+24}" r="25" fill="#df0000" stroke="white" stroke-width="2"/><text x="${bx+23}" y="${by+32}" font-size="26" text-anchor="middle" font-weight="700" fill="white">${j+1}</text><text x="${bx+54}" y="${by+30}" font-size="${v.label.length>10?13:16}" font-weight="700" fill="#b60000">${esc(v.label)}</text>`});
 svg+=`<line x1="45" y1="1157" x2="1675" y2="1157" stroke="#e2e8f0"/><text x="45" y="1192" font-size="16" fill="#64748b">${id===85?'비로그인 캡처 기준 · 로그인 후 커뮤니티 화면은 후속 추가 예정':'제공된 캡처 기준 · 빨간 번호는 화면의 주요 구성 요소를 표시합니다'}</text><text x="1675" y="1192" text-anchor="end" font-size="17" fill="#64748b">${index+1} / 86</text></svg>`;
 pages.push({svg,name:it.name,id:index+1,annotations:a});
}
pages.push({id:86,name:'커뮤니티 추가 예정',annotations:[],svg:`<svg xmlns="http://www.w3.org/2000/svg" width="1720" height="1250"><rect width="1720" height="1250" fill="white"/><text x="70" y="90" font-size="34" font-weight="700">커뮤니티 화면 추가 예정</text><rect x="100" y="180" width="1520" height="810" fill="#fafafa" stroke="#cbd5e1" stroke-width="3" stroke-dasharray="14 10"/><text x="860" y="510" text-anchor="middle" font-size="38" fill="#64748b">추후 캡처 이미지 삽입</text><text x="860" y="580" text-anchor="middle" font-size="24" fill="#64748b">로그인 후 커뮤니티 및 상세 화면</text><text x="860" y="650" text-anchor="middle" font-size="21" fill="#64748b">이미지 추가 후 동일한 빨간 번호·연결선·명칭 형식을 적용합니다</text><text x="100" y="1080" font-size="22">현재 포함된 비로그인 커뮤니티 화면은 WF-021에서 확인할 수 있습니다</text><text x="1620" y="1190" text-anchor="end" font-size="18">86 / 86</text></svg>`});
fs.mkdirSync(path.join(root,'svg'),{recursive:true});fs.mkdirSync(path.join(root,'png'),{recursive:true});
for(const p of pages)fs.writeFileSync(path.join(root,'svg',`WF-${String(p.id).padStart(3,'0')}.svg`),p.svg);
const style=`*{box-sizing:border-box}body{margin:0;background:#e8edf4;font-family:'Malgun Gothic',sans-serif}nav{padding:20px;background:white;position:sticky;top:0;z-index:3}nav a{margin-right:12px;color:#2458a5}section{width:1720px;height:1250px;margin:22px auto;background:white}svg{font-family:'Malgun Gothic',sans-serif}@page{size:430mm 312.5mm;margin:0}@media print{body{background:white}nav{display:none}section{margin:0;break-after:page;width:1720px;height:1250px}}`;
fs.writeFileSync(path.join(root,'TuddyBuddy_와이어프레임.html'),`<!doctype html><html lang="ko"><meta charset="utf-8"><title>TuddyBuddy 화면설계서</title><style>${style}</style><nav>85개 캡처 + 커뮤니티 추가 예정 1쪽　<button onclick="window.print()">인쇄 / PDF 저장</button><br>${pages.map(p=>`<a href="#wf${p.id}">WF-${String(p.id).padStart(3,'0')}</a>`).join(' ')}</nav>${pages.map(p=>`<section id="wf${p.id}">${p.svg}</section>`).join('')}</html>`);
fs.writeFileSync(path.join(root,'화면목록.json'),JSON.stringify(pages.map(({svg,...p})=>p),null,2));
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage({viewport:{width:1720,height:1250},deviceScaleFactor:1});
 for(const p of pages){await page.setContent(`<html><meta charset="utf-8"><style>body{margin:0}svg{font-family:'Malgun Gothic',sans-serif}</style>${p.svg}</html>`);await page.screenshot({path:path.join(root,'png',`WF-${String(p.id).padStart(3,'0')}.png`)});}
 await page.goto('file:///'+path.join(root,'TuddyBuddy_와이어프레임.html').replaceAll('\\','/'));await page.pdf({path:path.join(root,'TuddyBuddy_와이어프레임.pdf'),preferCSSPageSize:true,printBackground:true});await browser.close();console.log('Created 86 PNGs, 86 SVGs, HTML and PDF');})();

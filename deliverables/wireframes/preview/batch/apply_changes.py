from pathlib import Path
import re, json, copy, base64
import xml.etree.ElementTree as ET
from PIL import Image
from io import BytesIO

ROOT=Path(r'D:/ICTstudy/Project2/TuddyBuddy/deliverables/wireframes')
WORK=ROOT/'preview/batch'
OUTPUT=ROOT/'update-community/output'
HTML=next(OUTPUT.glob('*통합본.html'))
source=HTML.read_text(encoding='utf-8')
sections=re.findall(r'<section>(.*?)</section>',source,re.S)
NS='{http://www.w3.org/2000/svg}'
def elements(s):return list(ET.fromstring('<svg xmlns="http://www.w3.org/2000/svg">'+s+'</svg>'))
def text(s):return [e.text for e in elements(s) if e.tag==NS+'text']
def set_text(s,which,value):
    matches=list(re.finditer(r'(<text\b[^>]*>)(.*?)(</text>)',s))
    m=matches[which];return s[:m.start(2)]+str(value)+s[m.end(2):]
def update_tag(s,tag,occurrence,attributes):
    matches=list(re.finditer('<'+tag+r'\b[^>]*/?>',s));m=matches[occurrence];t=m.group()
    for k,v in attributes.items():
        t,n=re.subn(r'\b'+k+r'="[^"]*"',lambda _:k+'="'+str(v)+'"',t,count=1);assert n
    return s[:m.start()]+t+s[m.end():]
def get_attr(s,tag,occurrence,name):
    matches=list(re.finditer('<'+tag+r'\b[^>]*/?>',s));return re.search(r'\b'+name+r'="([^"]*)"',matches[occurrence].group()).group(1)
class Page:
    def __init__(self,index,svg):
        self.index=index;self.original=svg;self.head=svg[:svg.index('<path ')];start=svg.index('<path ');end=svg.index('<line ',start)
        self.tail=svg[end:];self.groups={};self.order=[];self.touched=set()
        for g in re.findall(r'<path .*?(?=<path |$)',svg[start:end],re.S):
            no=int(text(g)[0]);self.groups[no]=g;self.order.append(no)
        self.original_groups=self.groups.copy()
        image=ET.fromstring(svg).find(NS+'image');self.ix=float(image.attrib['x']);self.iy=float(image.attrib['y']);self.iw=float(image.attrib['width']);self.ih=float(image.attrib['height'])
        raw=base64.b64decode(image.attrib['href'].split(',')[1]);im=Image.open(BytesIO(raw));self.rw,self.rh=im.size
    def change(self,no,g):self.groups[no]=g;self.touched.add(no)
    def label(self,no,label):self.change(no,set_text(self.groups[no],1,label))
    def number(self,no,new):self.change(no,set_text(self.groups[no],0,new))
    def delete(self,*numbers):
        for no in numbers:assert no in self.groups;self.touched.add(no);self.groups.pop(no)
    def point(self,no,x,y):
        g=self.groups[no];tx=self.ix+self.iw*x/self.rw;ty=self.iy+self.ih*y/self.rh
        old=get_attr(g,'path',0,'d');start=old.split(' L ')[0];g=update_tag(g,'path',0,{'d':f'{start} L {tx} {ty}'})
        g=update_tag(g,'circle',0,{'cx':tx,'cy':ty});self.change(no,g)
    def point_x(self,no,x):
        # Explicitly horizontal movement: preserve the old Y coordinate byte-for-byte.
        g=self.groups[no];tx=self.ix+self.iw*x/self.rw;ty=get_attr(g,'circle',0,'cy');start=get_attr(g,'path',0,'d').split(' L ')[0]
        g=update_tag(g,'path',0,{'d':f'{start} L {tx} {ty}'});g=update_tag(g,'circle',0,{'cx':tx});self.change(no,g)
    def shift(self,no,dy):
        g=self.groups[no]
        def change(m):
            t=m.group()
            if t.startswith('<path '):
                d=get_attr(t,'path',0,'d');v=re.match(r'M ([^ ]+) ([^ ]+) L ([^ ]+) ([^ ]+)',d);return update_tag(t,'path',0,{'d':f'M {v[1]} {float(v[2])+dy} L {v[3]} {float(v[4])+dy}'})
            return re.sub(r'\b(y|cy)="([^"]+)"',lambda a:f'{a[1]}="{float(a[2])+dy}"',t)
        self.change(no,re.sub(r'<(?:path|circle|rect|text)\b[^>]*>',change,g))
    def add(self,key,number,label,x,y,bx,by,template=None):
        # New annotations use an existing native group without changing its type styling.
        template=template or next(iter(self.original_groups.values()));g=template
        g=set_text(set_text(g,0,number),1,label)
        startx=bx+200 if bx<240 else bx
        g=update_tag(g,'path',0,{'d':f'M {startx} {by+24} L 0 0'})
        g=update_tag(g,'rect',0,{'x':bx,'y':by})
        g=update_tag(g,'circle',1,{'cx':bx+23,'cy':by+24})
        g=update_tag(g,'text',0,{'x':bx+23,'y':by+32})
        g=update_tag(g,'text',1,{'x':bx+54,'y':by+30})
        self.groups[key]=g;self.order.append(key);self.touched.add(key);self.point(key,x,y)
    def output(self):return self.head+''.join(self.groups[n] for n in self.order if n in self.groups)+self.tail

P={i:Page(i,s) for i,s in enumerate(sections,1)}
# Global request: remove only the wireframe annotations named '슬라이드 표시점'.
for p in P.values():
    for no,g in list(p.groups.items()):
        if text(g)[1]=='슬라이드 표시점':p.delete(no)

p=P[3];p.point_x(2,156);p.point_x(3,335);p.label(3,'스터디룸 이용 방법')
P[4].label(3,'자주 묻는 질문')
p=P[6];p.label(1,'이메일 입력');p.point(5,824,225)
P[7].label(1,'이메일 중복 확인')
P[9].delete(4)
p=P[10];p.delete(2);p.number(3,2);p.number(4,3)
P[11].label(1,'도움말 검색')
p=P[17];p.point(3,1000,752);p.point(4,1191,753)
p=P[18];p.point(4,1188,246);p.add(5,5,'로그인',1173,298,1500,285)
P[19].delete(3,4)
P[20].delete(2,3,4)
p=P[22];p.point(1,854,188);p.label(2,'학습 데이터')
p=P[24];p.delete(1,4);p.number(2,1);p.label(2,'오답 노트 영역');p.number(3,2);p.label(3,'문제 다시 만들기');p.add(5,3,'답안 저장',545,663,20,790);p.add(6,4,'PDF 내보내기',827,663,1500,870)
P[26].label(4,'공개 비공개 설정')
p=P[29];p.point(1,640,467);p.point(2,787,527);p.point(3,712,527)
p=P[30];p.point(1,639,398);p.point(2,165,642);p.label(2,'최신 공지');p.point(3,1107,642)
p=P[32];p.label(1,'해야할 일 제목');p.label(3,'반복 여부 선택')
p=P[34];p.label(2,'해야할 일 상세');p.point(3,571,584);p.delete(4)
p=P[35];p.delete(1);p.number(2,1);p.number(3,2);p.label(3,'해야할 일 목록')
p=P[36];p.point(1,114,185);p.point(4,990,724)
for no in range(1,6):P[37].shift(no,-10)
p=P[38];p.point(4,786,424);p.label(4,'일정 수정 및 삭제')
p=P[39];p.label(2,'다이어그램 편집');p.point(3,105,764)
p=P[40];p.label(3,'새 노드 생성');p.point(4,1039,440);p.label(4,'다이어그램 저장')
P[41].point(1,1129,198)
p=P[42];p.point(2,302,531);p.delete(3,4)
P[43].delete(2,3,4)
p=P[46];p.point(1,132,392);p.delete(2,3)
p=P[48];p.delete(1);p.number(2,1);p.point(2,139,508);p.number(3,2);p.point(3,1114,517);p.number(4,3);p.label(4,'다운로드 완료')
p=P[49];p.point(1,126,308);p.point(2,152,397);p.label(3,'스터디룸 탈퇴');p.point(3,1140,316)
P[50].point(1,739,259)
P[51].label(2,'출석 완료 확인')
p=P[52];p.delete(2);p.label(3,'이용 포인트');p.number(3,2);p.number(4,3)
p=P[53];p.label(1,'학습 통계');p.label(2,'전체 응시 비중')
p=P[54];p.delete(2);p.number(3,2);p.number(4,3)
P[55].label(1,'나의 코드')
p=P[56];p.delete(4)
for no in range(1,4):p.shift(no,13)
p=P[60];p.point(1,346,379);p.point(2,500,472);p.point(3,954,381)
p=P[61];p.delete(2);p.point(3,631,752);p.number(3,2)
P[62].point(3,1074,93)
P[64].delete(3)
P[65].point(3,1001,269)
P[66].point(2,995,426)
p=P[69];p.delete(1,3);p.number(2,1);p.label(2,'신고 알림')
p=P[70];p.delete(2);p.point(3,1185,784)
p=P[71];p.label(2,'신고 사유');p.delete(4);p.number(5,4)
p=P[72];p.point(2,1016,324);p.delete(3)
P[73].label(1,'관리자 메뉴')
p=P[74];p.label(3,'회원 권한');p.point(3,946,346);p.label(4,'탈퇴 처리 버튼')
p=P[77];p.delete(1,2,3);p.number(4,1);p.add(5,2,'공지사항 관리 버튼',1116,468,1500,720)
p=P[78];p.delete(1);p.number(2,1);p.point(2,440,207);p.number(3,2);p.number(4,3);p.label(4,'신고 사유별 비율');p.number(5,4)
p=P[83];p.label(3,'과목 관리');p.label(4,'과목 등록');p.point(4,1141,564)
p=P[84];p.delete(1);p.label(2,'기간 조회');p.point(2,684,157)
P[85].point(2,344,201)
P[87].point(6,1003,604)
p=P[88];p.point(1,344,288);p.point(4,838,733);p.point(5,930,733)

changed=[];audit=[]
(WORK/'before').mkdir(exist_ok=True);(WORK/'after').mkdir(exist_ok=True)
for i,p in P.items():
    if not p.touched:continue
    s=p.output();assert s!=p.original
    # Everything outside the specifically touched groups stays byte-for-byte identical.
    assert p.head==p.original[:p.original.index('<path ')]
    for no,g in p.groups.items():
        if no not in p.touched:assert g==p.original_groups[no]
    assert not any(text(g)[1]=='슬라이드 표시점' for g in p.groups.values())
    (WORK/'before'/f'WF-{i:03}.svg').write_text(p.original,encoding='utf-8')
    (WORK/'after'/f'WF-{i:03}.svg').write_text(s,encoding='utf-8')
    changed.append(i)
    audit.append({'page':i,'touched':sorted(p.touched),'before':[{'key':n,'text':text(g)} for n,g in p.original_groups.items() if n in p.touched],'after':[{'key':n,'text':text(g)} for n,g in p.groups.items() if n in p.touched]})
(WORK/'changed.json').write_text(json.dumps(changed),encoding='utf-8')
(WORK/'audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2),encoding='utf-8')
print('Changed pages:',len(changed),changed)

from pathlib import Path
import json,re,math,xml.etree.ElementTree as E,zipfile
from PIL import Image,ImageChops,ImageDraw
from reportlab.pdfgen import canvas
from pypdf import PdfReader

ROOT=Path(r'D:/ICTstudy/Project2/TuddyBuddy/deliverables/wireframes');WORK=ROOT/'preview/resequence';OUT=ROOT/'update-community/output'
mapping=json.loads((WORK/'mapping.json').read_text(encoding='utf-8'));q=json.loads((WORK/'render-qa.json').read_text(encoding='utf-8'))
details={33:{1,2,5},51:{4},52:{3},70:{4}}
for m in mapping:
    n=m['new'];a=Image.open(WORK/'before'/f'WF-{n:03}.png').convert('RGB');b=Image.open(WORK/'after'/f'WF-{n:03}.png').convert('RGB');diff=ImageChops.difference(a,b);draw=ImageDraw.Draw(diff)
    # The header ID and footer pagination are the requested global numbering changes.
    draw.rectangle((35,20,720,55),fill=(0,0,0));draw.rectangle((1530,1165,1700,1210),fill=(0,0,0))
    if m['renamed']:draw.rectangle((35,55,1450,100),fill=(0,0,0))
    if n==17:draw.rectangle((35,1170,1450,1210),fill=(0,0,0))
    for mode in ['before','after']:
        for g in q[str(n)][mode]:
            if int(g['texts'][0]['value']) not in details.get(n,set()):continue
            for r in g['nodes']:draw.rectangle((math.floor(r['x'])-4,math.floor(r['y'])-4,math.ceil(r['x']+r['width'])+4,math.ceil(r['y']+r['height'])+4),fill=(0,0,0))
    assert max(v[1] for v in diff.getextrema())<=1,('Unexpected pixel changes',n,diff.getbbox())
print('All 84 pages passed comparison outside authorized changes')

def pdf(path,numbers):
    c=canvas.Canvas(str(path),pagesize=(1238.4,900))
    for n in numbers:c.drawImage(str(WORK/'after'/f'WF-{n:03}.png'),0,0,width=1238.4,height=900);c.showPage()
    c.save();assert len(PdfReader(path).pages)==len(numbers)
full_pdf=next(OUT.glob('*통합본.pdf'));extra_pdf=next(OUT.glob('*추가분.pdf'))
pdf(full_pdf,list(range(1,85)));pdf(extra_pdf,list(range(78,85)))
html=next(OUT.glob('*통합본.html'));old_html=html.read_text(encoding='utf-8');svg=[(WORK/'after'/f'WF-{n:03}.svg').read_text(encoding='utf-8') for n in range(1,85)]
start=old_html.index('<section>');end=old_html.rindex('</section>')+len('</section>');new_html=old_html[:start]+''.join('<section>'+s+'</section>' for s in svg)+old_html[end:];html.write_text(new_html,encoding='utf-8')
meta=[];NS='{http://www.w3.org/2000/svg}'
for n,s in enumerate(svg,1):
    r=E.fromstring(s);all=list(r);ts=r.findall(NS+'text');im=r.find(NS+'image');annotations=[]
    assert f'WF-{n:03}' in ts[0].text;assert ts[-1].text==f'{n} / 84'
    for i,el in enumerate(all):
        if el.tag!=NS+'path':continue
        dot=all[i+1];annotations.append({'number':int(all[i+4].text),'label':all[i+5].text,'x':(float(dot.attrib['cx'])-float(im.attrib['x']))/float(im.attrib['width'])*100,'y':(float(dot.attrib['cy'])-float(im.attrib['y']))/float(im.attrib['height'])*100})
    meta.append({'id':n,'name':ts[1].text,'annotations':annotations})
    for folder in ['svg','png']:
        destination=ROOT/folder/f'WF-{n:03}.{folder}'
        data=s.encode('utf-8') if folder=='svg' else (WORK/'after'/f'WF-{n:03}.png').read_bytes()
        if destination.exists():
            with destination.open('r+b') as f:f.write(data);f.truncate()
        else:destination.write_bytes(data)
    if n>=78:
        for folder in ['svg','png']:
            (ROOT/'update-community'/folder/f'WF-{n:03}.{folder}').write_bytes((ROOT/folder/f'WF-{n:03}.{folder}').read_bytes())
# Remove only obsolete numbered artifact files inside the explicitly checked source folders.
for folder,valid in [(ROOT/'svg',set(range(1,85))),(ROOT/'png',set(range(1,85))),(ROOT/'update-community/svg',set(range(78,85))),(ROOT/'update-community/png',set(range(78,85)))]:
    assert folder.resolve().is_relative_to(ROOT.resolve())
    for f in folder.glob('WF-*'):
        hit=re.fullmatch(r'WF-(\d{3})\.(svg|png)',f.name)
        if hit and int(hit[1]) not in valid:f.unlink()
(ROOT/'화면목록.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2),encoding='utf-8')
(ROOT/'update-community/화면목록.json').write_text(json.dumps(meta[77:],ensure_ascii=False,indent=2),encoding='utf-8')
full_zip=next(OUT.glob('*통합본.zip'))
with zipfile.ZipFile(full_zip,'w',zipfile.ZIP_DEFLATED) as z:
    for n,s in enumerate(svg,1):z.writestr(f'svg/WF-{n:03}.svg',s)
    for f in [full_pdf,html]:z.write(f,f.name)
extra_zip=next(OUT.glob('*추가분.zip'))
with zipfile.ZipFile(extra_zip,'w',zipfile.ZIP_DEFLATED) as z:
    for n in range(78,85):
        for folder in ['svg','png']:z.write(ROOT/'update-community'/folder/f'WF-{n:03}.{folder}',f'{folder}/WF-{n:03}.{folder}')
    z.write(extra_pdf,extra_pdf.name);z.write(ROOT/'update-community/화면목록.json','화면목록.json')
with zipfile.ZipFile(full_zip) as z:assert len([n for n in z.namelist() if n.endswith('.svg')])==84
print('Existing PDF, HTML, ZIP and individual sources updated. Total: 84 pages.')

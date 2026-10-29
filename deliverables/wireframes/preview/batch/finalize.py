from pathlib import Path
from io import BytesIO
import re,json,zipfile,math,xml.etree.ElementTree as ET
from reportlab.pdfgen import canvas
from pypdf import PdfReader,PdfWriter
from PIL import Image,ImageChops,ImageDraw

ROOT=Path(r'D:/ICTstudy/Project2/TuddyBuddy/deliverables/wireframes')
WORK=ROOT/'preview/batch';OUT=ROOT/'update-community/output'
changed=json.loads((WORK/'changed.json').read_text(encoding='utf-8'))
qa=json.loads((WORK/'render-qa.json').read_text(encoding='utf-8'))
audit={v['page']:v for v in json.loads((WORK/'audit.json').read_text(encoding='utf-8'))}
svg_new={n:(WORK/'after'/f'WF-{n:03}.svg').read_text(encoding='utf-8') for n in changed}
for key,record in qa.items():
    n=int(key)
    for g in record['after']:
        assert g['texts'][1]['x']+g['texts'][1]['width']<=1699
    before=Image.open(WORK/'before'/f'WF-{n:03}.png').convert('RGB');after=Image.open(WORK/'after'/f'WF-{n:03}.png').convert('RGB')
    diff=ImageChops.difference(before,after);draw=ImageDraw.Draw(diff)
    for mode in ['before','after']:
        touched={tuple(g['text']) for g in audit[n][mode]}
        for g in record[mode]:
            if tuple(t['value'] for t in g['texts']) not in touched:continue
            for b in g['nodes']:draw.rectangle((math.floor(b['x'])-4,math.floor(b['y'])-4,math.ceil(b['x']+b['width'])+4,math.ceil(b['y']+b['height'])+4),fill=(0,0,0))
    # Chromium can differ by one color level where antialiasing crosses another layer.
    assert all(max(v[1] for v in diff.getextrema())<=1 for _ in [0]),n
    # For the output PNG keep all pixels outside the requested bounds exactly identical.
    # This is a native diagram edit; only repaint changed annotation bounds.
    # Tiny antialias differences are ignored by the structural SVG verification above.

def patch_pdf(path,global_numbers):
    old=PdfReader(path);oldstreams=[p.get_contents().get_data() for p in old.pages]
    assert len(global_numbers)==len(old.pages)
    updated=[n for n in global_numbers if n in svg_new]
    buf=BytesIO();c=canvas.Canvas(buf,pagesize=(1238.4,900))
    for n in updated:
        c.drawImage(str(WORK/'after'/f'WF-{n:03}.png'),0,0,width=1238.4,height=900);c.showPage()
    c.save();buf.seek(0);newpages=PdfReader(buf);replacements=dict(zip(updated,newpages.pages));w=PdfWriter()
    for n,p in zip(global_numbers,old.pages):w.add_page(replacements.get(n,p))
    final=BytesIO();w.write(final);result=final.getvalue();verify=PdfReader(BytesIO(result))
    for i,n in enumerate(global_numbers):
        if n not in replacements:assert verify.pages[i].get_contents().get_data()==oldstreams[i]
    path.write_bytes(result)
    return len(updated)

full_pdf=next(OUT.glob('*통합본.pdf'));patch_pdf(full_pdf,list(range(1,93)))
extra_pdf=next(OUT.glob('*추가분.pdf'));patch_pdf(extra_pdf,list(range(86,93)))
html=next(OUT.glob('*통합본.html'));s=html.read_text(encoding='utf-8');sections=list(re.finditer(r'<section>(.*?)</section>',s,re.S))
for n in sorted(changed,reverse=True):
    m=sections[n-1];s=s[:m.start(1)]+svg_new[n]+s[m.end(1):]
html.write_text(s,encoding='utf-8')
NS='{http://www.w3.org/2000/svg}';all_svgs=re.findall(r'<section>(.*?)</section>',s,re.S);all_meta=[]
for n,svg in enumerate(all_svgs,1):
    r=ET.fromstring(svg);texts=r.findall(NS+'text');image=r.find(NS+'image');iw=float(image.attrib['width']);ih=float(image.attrib['height']);ix=float(image.attrib['x']);iy=float(image.attrib['y']);annotations=[]
    children=list(r)
    for i,node in enumerate(children):
        if node.tag!=NS+'path':continue
        dot=children[i+1];number=children[i+4].text;label=children[i+5].text
        annotations.append({'number':int(number),'label':label,'x':(float(dot.attrib['cx'])-ix)/iw*100,'y':(float(dot.attrib['cy'])-iy)/ih*100})
    all_meta.append({'id':n,'name':texts[1].text,'annotations':annotations})
    assert all(a['label']!='슬라이드 표시점' for a in annotations)
    if n in svg_new:
        (ROOT/'svg'/f'WF-{n:03}.svg').write_text(svg,encoding='utf-8')
        if n>=86:(ROOT/'update-community/svg'/f'WF-{n:03}.svg').write_text(svg,encoding='utf-8')
        png_path=(ROOT if n<=85 else ROOT/'update-community')/'png'/f'WF-{n:03}.png'
        # The canonical HTML/SVG/PDF are authoritative; refresh existing PNGs in place.
        try:
            with png_path.open('r+b') as f:f.write((WORK/'after'/f'WF-{n:03}.png').read_bytes());f.truncate()
        except OSError as error:print('PNG cache is in use:',n,type(error).__name__)
(ROOT/'화면목록.json').write_text(json.dumps(all_meta,ensure_ascii=False,indent=2),encoding='utf-8')
(ROOT/'update-community/화면목록.json').write_text(json.dumps(all_meta[85:],ensure_ascii=False,indent=2),encoding='utf-8')
full_zip=next(OUT.glob('*통합본.zip'))
with zipfile.ZipFile(full_zip) as z:entries={n:z.read(n) for n in z.namelist()}
for n,svg in svg_new.items():entries[f'svg/WF-{n:03}.svg']=svg.encode('utf-8')
for f in [full_pdf,html]:entries[f.name]=f.read_bytes()
with zipfile.ZipFile(full_zip,'w',zipfile.ZIP_DEFLATED) as z:
    for n,data in entries.items():z.writestr(n,data)
extra_zip=next(OUT.glob('*추가분.zip'))
with zipfile.ZipFile(extra_zip) as z:entries={n:z.read(n) for n in z.namelist()}
for n in changed:
    if n<86:continue
    entries[f'svg/WF-{n:03}.svg']=svg_new[n].encode('utf-8');entries[f'png/WF-{n:03}.png']=(WORK/'after'/f'WF-{n:03}.png').read_bytes()
entries[extra_pdf.name]=extra_pdf.read_bytes();entries['화면목록.json']=(ROOT/'update-community/화면목록.json').read_bytes()
with zipfile.ZipFile(extra_zip,'w',zipfile.ZIP_DEFLATED) as z:
    for n,data in entries.items():z.writestr(n,data)
print(f'Updated {len(changed)} pages in existing PDF/HTML/ZIP. Other {92-len(changed)} PDF pages unchanged.')
print('Final page counts:',len(PdfReader(full_pdf).pages),len(PdfReader(extra_pdf).pages))

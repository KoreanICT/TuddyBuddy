from pathlib import Path
import re,json
ROOT=Path(r'D:/ICTstudy/Project2/TuddyBuddy/deliverables/wireframes')
code=(ROOT/'preview/batch/apply_changes.py').read_text(encoding='utf-8')
exec(code[:code.index('P={')])
WORK=ROOT/'preview/resequence';WORK.mkdir(exist_ok=True)
(WORK/'before').mkdir(exist_ok=True);(WORK/'after').mkdir(exist_ok=True)
pages={i:Page(i,s) for i,s in enumerate(sections,1)}
p=pages[37];p.point(1,845,294);p.label(2,'일정 이름');p.point(2,433,385);p.point(5,837,709)
pages[55].point(4,1123,815)
pages[56].point(3,632,713)
pages[74].point(4,1167,423)
deleted={12,13,14,15,79,80,81,82}
mapping=[]
for old,p in pages.items():
    if old in deleted:continue
    new=len(mapping)+1;s=p.output()
    # The only permitted header changes are sequential IDs and the two requested titles.
    s=s.replace(f'화면설계서 · WF-{old:03}',f'화면설계서 · WF-{new:03}')
    s=s.replace(f'>{old} / 92</text>',f'>{new} / 84</text>')
    if old==11:s=s.replace('공지사항_자주묻는질문1(비로그인)','공지사항_자주묻는질문(비로그인)')
    if old==78:s=s.replace('관리자 메뉴 신고 관리 전체','관리자 메뉴 신고 관리')
    for no,g in p.groups.items():
        if no not in p.touched:assert g==p.original_groups[no]
    # Remove only expected header substitutions to verify every other change is a touched group.
    expected=p.output().replace(f'화면설계서 · WF-{old:03}',f'화면설계서 · WF-{new:03}').replace(f'>{old} / 92</text>',f'>{new} / 84</text>')
    if old==11:expected=expected.replace('공지사항_자주묻는질문1(비로그인)','공지사항_자주묻는질문(비로그인)')
    if old==78:expected=expected.replace('관리자 메뉴 신고 관리 전체','관리자 메뉴 신고 관리')
    assert s==expected
    (WORK/'before'/f'WF-{new:03}.svg').write_text(p.original,encoding='utf-8')
    (WORK/'after'/f'WF-{new:03}.svg').write_text(s,encoding='utf-8')
    mapping.append({'old':old,'new':new,'details':bool(p.touched),'renamed':old in [11,78]})
(WORK/'mapping.json').write_text(json.dumps(mapping,indent=2),encoding='utf-8')
(WORK/'changed.json').write_text(json.dumps(list(range(1,85))),encoding='utf-8')
print('Prepared 84 retained pages. Requested details:',[m for m in mapping if m['details']])

import fs from 'node:fs/promises';
import path from 'node:path';
import { Presentation, PresentationFile } from '@oai/artifact-tool';

const root = 'D:/ictstudy/TuddyBuddy';
const buildDir = path.join(root, '.codex_build_ppt');
const outDir = path.join(root, 'deliverables', 'ppt');
const skillDir = 'C:/Users/ICT-006/.codex/plugins/cache/openai-primary-runtime/presentations/26.1024.11018/skills/presentations';
const finalPath = path.join(outDir, 'TuddyBuddy_LLM_핵심코드_발표자료_v2.pptx');
const W = 1280, H = 720;
const C = { bg: '#0B1220', panel: '#111D30', panel2: '#16263B', text: '#F3F6FC', muted: '#A8B5C8', cyan: '#55D6D0', blue: '#80AFFF', amber: '#FFCA70', green: '#8BE0A3', line: '#2A3A50' };
const FONT = 'Malgun Gothic';
const p = Presentation.create({ slideSize: { width: W, height: H } });

function shape(slide, geometry, x, y, w, h, fill='none', stroke='none', sw=0) {
  return slide.shapes.add({ geometry, position:{left:x,top:y,width:w,height:h}, fill, line:{style:'solid',fill:stroke,width:sw} });
}
function text(slide, txt, x, y, w, h, size=22, color=C.text, bold=false, opts={}) {
  const s=shape(slide,'textbox',x,y,w,h);
  s.text=[[{run:txt,style:{fontSize:`${size}px`,typeface:opts.font||FONT,color,bold}}]];
  s.text.style={fontSize:size,color,bold,alignment:opts.align||'left',verticalAlignment:opts.valign||'middle',wrap:true, ...(opts.style||{})};
  return s;
}
function code(slide, txt, x, y, w, h, size=18) {
  shape(slide,'roundRect',x,y,w,h,C.panel,'#263A55',1);
  text(slide,txt,x+22,y+14,w-44,h-28,size,'#D8E4F5',false,{font:'Consolas',valign:'top'});
}
function base(title, eyebrow='TUDDYBUDDY · FASTAPI LLM') {
  const s=p.slides.add(); s.background.fill=C.bg;
  text(s,eyebrow,64,30,700,24,14,C.cyan,true);
  text(s,title,64,70,1152,60,34,C.text,true);
  shape(s,'rect',64,140,1152,2,C.line);
  text(s,'TuddyBuddy AI · 코드 구조 설명',64,680,700,20,13,C.muted);
  text(s,String(p.slides.items.length).padStart(2,'0'),1160,678,56,22,13,C.muted,false,{align:'right'});
  return s;
}
function notes(slide, body) { slide.speakerNotes.text=body; slide.speakerNotes.setVisible(true); }
function node(slide,label,sub,x,y,w,accent=C.cyan) {
  shape(slide,'roundRect',x,y,w,100,C.panel2,C.line,1);
  text(slide,label,x+16,y+15,w-32,32,21,accent,true);
  text(slide,sub,x+16,y+50,w-32,40,16,C.muted,false,{valign:'top'});
}

// 1. Cover
{
 const s=p.slides.add(); s.background.fill=C.bg;
 shape(s,'rect',0,0,14,H,C.cyan);
 text(s,'TUDDYBUDDY · LLM SERVICE',76,82,760,30,15,C.cyan,true);
 text(s,'학습 분석 LLM의\n핵심 코드와 배포 흐름',76,155,900,150,48,C.text,true,{valign:'top'});
 text(s,'평가분석 · 성적예측 · RAG · 응답 필터 · Docker / Nginx',80,345,1000,42,22,C.muted);
 shape(s,'rect',80,430,650,2,C.line);
 text(s,'FastAPI 프로젝트 코드 기반 발표 자료',80,456,720,30,18,C.muted);
 text(s,'발표자 노트에 슬라이드별 대본 포함',80,505,720,30,16,C.cyan);
 notes(s,'안녕하세요. 이번 발표에서는 TuddyBuddy의 FastAPI 기반 학습 분석 LLM을 소개하겠습니다. 핵심은 두 가지 API가 여러 카테고리를 각각 처리하고, RAG로 분석 기준을 보강하며, 응답 필터로 출력 구조를 확인한다는 점입니다. 마지막에는 Docker와 Nginx 배포 구성을 설명하겠습니다. 코드는 현재 저장소에 있는 구현을 요약했고, 실제 Ubuntu 서버에서 컨테이너를 빌드하거나 실행한 결과를 의미하지는 않습니다.');
}
// 2. System map
{
 const s=base('서비스 구성과 두 가지 분석');
 text(s,'한 번의 요청에서 여러 카테고리를 받고, 카테고리별 결과를 반환합니다.',64,158,1120,34,20,C.muted);
 node(s,'Spring 백엔드','요청 데이터 전달',76,264,220,C.blue);
 node(s,'Nginx : 8001','외부 진입 · 프록시',390,264,220,C.cyan);
 node(s,'FastAPI : 8000','요청 검증 · 서비스 호출',704,264,220,C.green);
 node(s,'Gemini + RAG','분석 기준 검색 및 생성',1018,264,220,C.amber);
 // Editable connectors represented by arrows
 shape(s,'rightArrow',300,294,82,38,C.cyan);
 shape(s,'rightArrow',614,294,82,38,C.cyan);
 shape(s,'rightArrow',928,294,82,38,C.cyan);
 shape(s,'rect',76,430,536,132,C.panel,'#263A55',1);
 text(s,'POST /statistics',98,448,480,28,22,C.blue,true,{font:'Consolas'});
 text(s,'평가분석 · 취약점 근거 · 3단계 학습 경로',98,491,480,38,18,C.text);
 shape(s,'rect',664,430,574,132,C.panel,'#263A55',1);
 text(s,'POST /prediction',686,448,520,28,22,C.cyan,true,{font:'Consolas'});
 text(s,'성적예측 · 카테고리별 기준 추정치와 설명',686,491,520,38,18,C.text);
 notes(s,'전체 요청 흐름은 Spring 백엔드에서 Nginx의 8001 포트로 들어와 FastAPI 8000 포트로 전달되는 구조입니다. FastAPI에는 두 엔드포인트가 있습니다. /statistics는 문제 응답 기록을 평가분석하고, /prediction은 카테고리별 집계 통계를 받아 다음 시험의 기준 추정치를 반환합니다. 두 결과 모두 카테고리마다 별도로 생성됩니다.');
}
// 3. API and grouping
{
 const s=base('다중 카테고리 처리와 API 계약');
 text(s,'입력 카테고리를 먼저 묶고, 같은 그룹 수만큼 결과를 생성합니다.',64,158,1120,34,20,C.muted);
 code(s,'@app.post("/statistics")\nasync def analyze_performance(request: AnalyzeRequest):\n    quiz_logs = [log.model_dump() for log in request.quiz_logs]\n    return analyze_user_statistics(request.user_id, quiz_logs)',74,220,548,210,17);
 code(s,'@app.post("/prediction")\nasync def analyze_prediction_endpoint(stats_list: List[CategoryStatItem]):\n    stats = [item.model_dump() for item in stats_list]\n    return analyze_score_prediction(stats)',658,220,548,210,17);
 text(s,'그룹 식별 기준',76,462,280,28,18,C.cyan,true);
 text(s,'categoryId · 정규화한 categoryName · 명시적 categoryGroup',76,500,1110,32,19,C.text);
 text(s,'응답은 입력 그룹의 순서를 유지하며, 빈 입력은 빈 배열을 반환합니다.',76,557,1110,32,18,C.muted);
 text(s,'출처: fastapi/main.py · fastapi/service/category_grouping.py',76,625,1000,20,13,C.muted,false,{font:'Consolas'});
 notes(s,'이 슬라이드는 API 계약과 그룹화의 핵심을 보여줍니다. /statistics는 AnalyzeRequest의 문제 기록을 받고, /prediction은 CategoryStatItem 목록을 받습니다. 그룹화 코드는 카테고리 ID, 정규화한 이름, 명시적 그룹 이름을 이용해 중복 카테고리를 합칩니다. 예를 들어 같은 카테고리가 여러 번 입력되면 하나의 분석 단위로 묶습니다. 이 처리로 모델에게 여러 응답을 요청하더라도 입력 그룹 수와 순서를 기준으로 결과를 맞출 수 있습니다.');
}
// 4. RAG
{
 const s=base('RAG 검색 기준과 생성 입력');
 text(s,'RAG 자료는 정답 문서가 아니라, 응답 기준을 보충하는 정책·학습 가이드입니다.',64,158,1120,34,19,C.muted);
 node(s,'JSONL 지식 파일','prediction_policy\nstudy_guidance',84,254,248,C.blue);
 node(s,'Chroma 인덱스','컬렉션별 벡터 검색\ntop_k 기본값 3',408,254,248,C.cyan);
 node(s,'LLM 입력','카테고리 통계 +\n검색된 기준',732,254,248,C.green);
 node(s,'구조화 응답','Pydantic 스키마\n카테고리별 결과',1056,254,180,C.amber);
 shape(s,'rightArrow',336,286,62,34,C.cyan); shape(s,'rightArrow',660,286,62,34,C.cyan); shape(s,'rightArrow',984,286,62,34,C.cyan);
 code(s,'documents = store.similarity_search(query, k=top_k)\n\n# 인덱스가 없거나 검색 실패 시\n# 빈 문맥으로 계속 진행',106,436,520,132,18);
 text(s,'컬렉션 제한',690,440,250,28,18,C.cyan,true);
 text(s,'prediction_policy · study_guidance',690,480,510,34,19,C.text,false,{font:'Consolas'});
 text(s,'RAG 미구축 상태에서도 API 호출 흐름을 유지하도록 예외를 처리합니다.',690,526,510,48,17,C.muted);
 text(s,'출처: fastapi/rag/retriever.py · fastapi/service/llm_service.py',76,625,1120,20,13,C.muted,false,{font:'Consolas'});
 notes(s,'RAG는 두 컬렉션을 사용합니다. 성적예측에는 prediction_policy, 평가분석에는 study_guidance를 연결합니다. 검색 결과는 카테고리별 입력과 함께 프롬프트로 전달됩니다. 현재 검색 함수는 기본적으로 상위 세 문서를 찾습니다. 인덱스가 아직 없거나 검색 중 문제가 생기면 로그를 남기고 빈 문맥으로 계속 진행하도록 처리되어 있습니다. 따라서 RAG 검색은 기준을 보완하지만 API의 유일한 실행 조건은 아닙니다.');
}
// 5. Filters
{
 const s=base('응답 필터: 생성 결과의 계약 검증');
 text(s,'LLM 응답을 스키마로 파싱하고, 입력 카테고리와 결과의 완결성을 확인합니다.',64,158,1120,34,19,C.muted);
 code(s,'_validate_category_set(actual, expected)\n\nif actual != expected:\n    raise ValueError("카테고리 수·식별자·순서 불일치")',76,228,540,178,18);
 code(s,'# 평가분석\nconsultingPath 길이 == 3\nmentorComment 비어 있지 않음\n\n# 성적예측\n최근 평균 / actual\n다음 시험 예측 / predict',664,228,540,218,17);
 text(s,'검증 실패는 잘못된 결과를 정상 응답으로 통과시키지 않습니다.',76,492,1110,34,21,C.green,true);
 text(s,'포함: 카테고리 식별자·이름·순서 · 출력 스키마 · 필수 항목',76,548,1110,32,18,C.text);
 text(s,'별도 평가: 사실 정확도나 실제 점수 적중률까지 보증하지는 않음',76,590,1110,28,16,C.amber);
 text(s,'출처: fastapi/filters/responses.py',76,635,800,20,13,C.muted,false,{font:'Consolas'});
 notes(s,'필터는 생성 응답이 API의 약속을 지키는지 확인합니다. 먼저 Pydantic 모델로 응답을 파싱하고, 카테고리의 개수와 식별자, 순서, 이름이 입력 그룹과 같은지 비교합니다. 평가분석은 카테고리마다 3단계 consultingPath와 비어 있지 않은 멘토 코멘트를 요구합니다. 성적예측은 두 항목의 이름과 타입을 정확히 확인합니다. 다만 이 검증은 구조와 계약의 검사이며, 평가 내용이 사실인지 또는 실제 점수에 맞았는지까지 보증하지는 않습니다.');
}
// 6. Prediction policy
{
 const s=base('성적예측: 데이터가 적을 때 기준 추정치');
 text(s,'집계 데이터만 있거나 관측이 적으면 평균을 기준 추정치로 사용할 수 있습니다.',64,158,1120,34,19,C.muted);
 code(s,'# 평균에서 벗어난 점수를 낼 때\n# 조정 근거를 설명하도록 지시\nif no_evidence:\n    use average as baseline\n\n# 시간순 회차 점수가 있을 때만\n# 회차 간 변화 비교',76,226,540,246,18);
 text(s,'현재 입력 근거',676,236,400,28,18,C.cyan,true);
 text(s,'평균 · 최고 · 최저 · 응시 횟수',676,278,520,32,20,C.text);
 text(s,'결과 제한',676,350,400,28,18,C.cyan,true);
 text(s,'입력에 없는 추세·난이도·컨디션을 만들지 않음',676,392,520,56,18,C.text);
 text(s,'개인 기록만 사용 · 타인 기록은 예측에 섞지 않음',76,514,1110,34,18,C.green,true);
 text(s,'회차별 점수 입력은 백엔드 계약 반영 후 적용 예정 · 타이머 제외',76,565,1110,48,17,C.amber);
 text(s,'출처: fastapi/service/category_grouping.py · fastapi/service/llm_service.py · RAG policy',76,633,1120,20,12,C.muted,false,{font:'Consolas'});
 notes(s,'성적예측은 학습된 회귀 모델의 결과가 아니라 개인 입력을 바탕으로 한 추정치입니다. 현재 전달되는 평균, 최고, 최저, 응시 횟수만으로는 개인의 추세를 단정할 수 없습니다. 그래서 데이터가 적거나 집계값만 있으면 평균을 기준으로 둘 수 있고, 근거 없이 평균에서 벗어나게 점수를 조정하지 않도록 프롬프트에 적혀 있습니다. 타인의 성적 기록은 사용하지 않습니다. 회차별 점수는 백엔드 입력 계약이 반영된 뒤에야 활용할 수 있고, 타이머 정보는 현재 제외하기로 했습니다.');
}
// 7. Deployment
{
 const s=base('Docker와 Nginx 배포 구성');
 text(s,'컨테이너 내부 포트와 Spring에서 접근할 외부 포트를 분리합니다.',64,158,1120,34,19,C.muted);
 node(s,'Nginx','host 8001 → container 80\n요청 헤더 전달',94,250,270,C.cyan);
 node(s,'FastAPI','container 8000\nUvicorn 실행',506,250,270,C.green);
 node(s,'RAG 인덱스','rag_index named volume\n영속 저장',918,250,270,C.amber);
 shape(s,'rightArrow',376,282,102,38,C.cyan); shape(s,'rightArrow',790,282,102,38,C.cyan);
 code(s,'proxy_pass http://fastapi:8000;\nproxy_read_timeout 180s;',92,410,472,112,19);
 code(s,'CMD ["uvicorn", "main:app",\n     "--host", "0.0.0.0",\n     "--port", "8000"]',610,410,578,154,17);
 text(s,'Compose healthcheck: /openapi.json · .env는 이미지에 복사하지 않고 런타임 주입',92,590,1100,34,16,C.muted);
 text(s,'주의: Docker 빌드·Ubuntu 실행은 아직 수행하지 않은 설정 검토 단계',92,632,1100,24,15,C.amber,true);
 notes(s,'마지막은 배포 구성입니다. Dockerfile은 Python 3.11 이미지를 기반으로 의존성을 설치하고 FastAPI 코드와 지식 JSONL을 이미지에 복사한 뒤 Uvicorn을 8000 포트로 실행합니다. Compose는 FastAPI와 Nginx를 분리하고, FastAPI의 헬스체크가 정상인 뒤 Nginx가 시작되도록 합니다. Nginx는 호스트 8001 포트를 컨테이너 80으로 연결하고 요청을 FastAPI 8000으로 전달합니다. RAG 인덱스는 named volume에 보존하고, 환경변수 파일은 런타임에 주입합니다. 현재 자료는 설정 코드의 설명이며, 실제 Docker 빌드나 Ubuntu 실행을 검증했다는 뜻은 아닙니다.');
}

console.log('Built slide model', p.slides.items.length);
await fs.mkdir(buildDir,{recursive:true}); await fs.mkdir(outDir,{recursive:true});
for (let i=0;i<p.slides.items.length;i++) {
 console.log('Rendering',i+1);
 const png=await p.export({slide:p.slides.items[i],format:'png',scale:1});
 await fs.writeFile(path.join(buildDir,`slide-${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await png.arrayBuffer()));
}
console.log('Rendered all slides');
const { finalizePresentation } = await import(new URL(`file:///${skillDir.replaceAll('\\','/')}/container_tools/artifact_tool_utils.mjs`));
const candidate=path.join(buildDir,'candidate.pptx');
console.log('Exporting candidate');
await (await PresentationFile.exportPptx(p)).save(candidate);
console.log('Candidate exported');
const result=await finalizePresentation({
 workspaceDir:root,candidatePath:candidate,finalPath,
 pythonExecutable:'C:/Users/ICT-006/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',
 integrityValidatorPath:path.join(skillDir,'container_tools/inspect_presentation_package_integrity.py'),
 layoutValidatorPath:path.join(skillDir,'container_tools/inspect_presentation_layout_geometry.py'),
 layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit'],
 requiredNativeTableOwnerSlides:[],fontPolicy:{basis:'design',families:[FONT,'Consolas']},
 verifyArtifactToolImport:true,receiptPath:path.join(buildDir,'validation.json'),
 requirements:{explicitTotalSlideCount:7,requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[]}
});
console.log(JSON.stringify({finalPath,slides:p.slides.items.length,finalizer:result},null,2));

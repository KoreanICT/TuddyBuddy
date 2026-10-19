# 테이블별 CRUD 테스트

제공된 31개 테이블에 대응하는 `*CrudTest.java` 파일입니다. 현재 DAO·매퍼에 구현된 연산만 호출합니다. 수정·삭제가 없는 테이블에 임의의 기능을 추가하지 않았습니다. 운영 코드와 기존 테스트는 변경하지 않았습니다.

## 작성 범위

C=생성, R=조회, U=수정, D=삭제입니다. 상태 비활성화는 U이며 물리 D와 구분합니다.

| 테이블 | 파일 | 검증 범위 |
|---|---|---|
| categories | selfstudy/CategoriesCrudTest.java | C/R/U, 활성 상태 변경 |
| chat_message | chatbot/ChatMessageCrudTest.java | C/R, 세션·회원별 데이터 분리 |
| chat_session | chatbot/ChatSessionCrudTest.java | C/R, 회원·비회원 세션 |
| community_section | common/CommunitySectionCrudTest.java | 비활성: 현재 매퍼가 community/community_comment를 사용하여 테이블 불일치 |
| diagram | group/DiagramCrudTest.java | C/R/U, MERGE 저장 |
| friend | friend/FriendCrudTest.java | C/R/U/D, 중복·수락·거절·참여자 조건 |
| group_answer | group/GroupAnswerCrudTest.java | 비활성: 저장 기능 미구현 |
| group_document | group/GroupDocumentCrudTest.java | C/R/U/D, 조회수 및 파일 메타데이터 |
| group_member | group/GroupMemberCrudTest.java | C/R/U/D, 방장 위임·탈퇴·강퇴 조건 |
| group_question | group/GroupQuestionCrudTest.java | 비활성: 저장 기능 미구현 |
| group_tag | group/GroupTagCrudTest.java | C/R/D |
| login_log | member/LoginLogCrudTest.java | 비활성: 운영 기록·종료 기능 추가됨, 기존 테스트는 자리표시자이며 실행 검증되지 않음 |
| member | member/MemberCrudTest.java | C/R/U/D, 일반·카카오 저장, 검색·권한 변경 |
| memo | group/MemoCrudTest.java | C/R/U/D |
| notice | notice/NoticeCrudTest.java | C/R/U/D, 조회수 |
| notification | notification/NotificationCrudTest.java | 비활성: SSE 전송만 구현, 테이블 저장 기능 없음 |
| POINT | point/PointCrudTest.java | C/R, 로그 저장과 회원 잔액 분리 |
| quiz_responses | selfstudy/QuizResponseCrudTest.java | C/R/D, 세션별 삭제 범위 |
| quiz_sessions | selfstudy/QuizSessionCrudTest.java | C/R/D, 회원별 목록 |
| quizzes | selfstudy/QuizCrudTest.java | C/R/D, 세션별 목록·삭제 |
| report | report/ReportCrudTest.java | C/R/U/D, 상태 변경·행 잠금·회원 목록 |
| report_reply | report/ReportReplyCrudTest.java | C/R/U/D, 답변 개수·신고별 삭제 |
| schedule | schedule/ScheduleCrudTest.java | 비활성: 저장 기능 미구현 |
| selfstudy_results | selfstudy/SelfstudyResultCrudTest.java | C/R/D, 회원별 목록·세션별 삭제 |
| studygroup | group/StudygroupCrudTest.java | C/R/U/D, 그룹 목록 프로시저 |
| studytag | group/StudytagCrudTest.java | C/R, GroupDao·GroupDetailDao·TagDao 검색 |
| subjects | selfstudy/SubjectCrudTest.java | C/R/U, 활성 상태 변경·상위 카테고리 필터 |
| tdl | timer/TdlCrudTest.java | 비활성: 저장 기능 미구현 |
| tdl_history | timer/TdlHistoryCrudTest.java | 비활성: 저장 기능 미구현 |
| timer_sessions | timer/TimerSessionCrudTest.java | C/R/U, 회원 소유·누적 시간 |
| timers | timer/TimerCrudTest.java | C/R, 구간 시간순 조회 |

총 23개 활성 테스트 클래스, 8개 비활성 클래스입니다. 비활성 클래스는 누락 이유를 `@Disabled`에 기록했으며, 통과한 CRUD 검증으로 계산하지 않습니다.

## 실행 환경 및 데이터

- Java 25 및 프로젝트 Gradle 설정을 사용합니다. 실제 Oracle을 사용하는 Spring Boot 통합 테스트입니다.
- 테스트용 Oracle 스키마에 테이블·시퀀스와 기존 PL/SQL을 준비하고, 테스트 환경의 데이터소스 및 애플리케이션 필수 설정을 제공해야 합니다.
- 데이터 준비와 검증 모두 기존 DAO를 사용합니다. 회원은 MemberDAO, 신고는 ReportDao 등 실제 등록·조회 경로로 생성 ID를 찾습니다. JdbcTemplate이나 직접 SQL로 운영 매퍼를 우회하지 않습니다.
- 각 테스트가 합성 회원과 필요한 선행 데이터를 생성합니다. 기존 회원 번호나 기존 게시물을 재사용하지 않습니다.
- 활성 클래스는 직접 또는 fixture 상속으로 `@Transactional`을 적용하여 종료 시 행 변경을 롤백합니다. Oracle 시퀀스 번호 증가는 롤백되지 않습니다.
- 외부 메일·AI 호출, 실제 업로드·파일 삭제는 하지 않습니다. 파일 기능은 DAO 메타데이터만 검증합니다.
- 기존 `ReportListDataTest` 등은 데이터를 남기는 별도 테스트이므로, 이번 테스트 실행 시에는 반드시 `*CrudTest` 필터를 사용합니다.
- 이번 작업에서는 테스트와 빌드를 실행하지 않았습니다. 테스트 통과를 확인한 상태는 아닙니다.

테스트 환경 준비 후 `back` 폴더에서 이번 파일만 실행하는 명령:

```powershell
.\gradlew.bat test --tests '*CrudTest'
```

## 코드 대조 중 발견된 기존 불일치

아래 항목은 테스트를 통과시키기 위해 운영 코드를 임의 수정하거나 검증을 생략하지 않았습니다. 실제 DB가 제공된 생성문과 동일하면 관련 활성 테스트가 실패할 수 있습니다.

1. `point.xml`의 `insertPoint`는 `POINT_NUM`, `REGDATE`를 넣지 않습니다. 제공 DDL은 PK와 NOT NULL이며 기본값/IDENTITY가 없어 저장이 실패합니다. `PointCrudTest`가 실제 저장 경로를 검증합니다.
2. `TagMapper.xml`의 `TagDao.searchTags`는 `tag`를 조회합니다. 제공 DDL의 테이블은 `studytag`입니다. `StudytagCrudTest`의 해당 검색 테스트가 이를 드러냅니다.
3. `selfstudyAdmin.xml`의 카테고리·과목 생성은 `seq_categories`, `seq_subjects`를 사용하지만 DDL의 이름은 `categories_seq`, `subjects_seq`입니다.
4. 같은 매퍼의 과목 생성에는 DDL상 NOT NULL인 `created_at` 값이 빠져 있습니다. 선행 카테고리·과목도 DAO로 만들기 때문에 관련 자습 테스트도 이 생성 문제의 영향을 받습니다.
5. 그룹 목록 프로시저 `GET_MY_GROUPS_PROC`, `GET_PUBLIC_GROUPS_PROC`와 자료 접근 함수 `FN_GROUP_RESOURCE_PERMISSION` 등 기존 `plsql/groupPLSQL` 리소스도 설치되어 있어야 합니다.

이 테스트들은 DAO의 테이블 연산을 검증합니다. HTTP/JWT 권한 검사, 서비스 트랜잭션의 실패 시 원자성, 실제 동시성은 별도 테스트 범위입니다.

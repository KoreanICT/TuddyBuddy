# TuddyBuddy AI 기능 아키텍처

> 목적: AI 관련 기능이 프론트엔드에서 시작해 Spring 백엔드, AI 서버, 외부 AI·검색 구성요소를 거쳐 결과로 돌아오는 구현 흐름을 설명한다.
> 기준: 현재 TuddyBuddy 저장소와 전달된 `chatbot-ai.zip`, `TuddyBuddy_statistics_llm (2).zip`, `quiz-ai-server-main.zip`의 코드 구조.

## 1. AI 기능 통합 구조

```mermaid
flowchart LR
    U[사용자]
    FE[React 프론트엔드]
    BE[Spring Boot API]
    DB[(TuddyBuddy DB)]
    FILE[(퀴즈 이미지 저장소)]
    CHAT[버디봇 FastAPI]
    STAT[통계 AI FastAPI]
    QUIZ[퀴즈 AI FastAPI]
    FAISS[(버디봇 FAISS 문서 인덱스)]
    CHROMA[(통계 AI Chroma 가이드 인덱스)]
    GEMINI[Google Gemini]
    GROQ[Groq 검증 모델]

    U --> FE
    FE <-->|HTTPS / JSON| BE
    FE -->|퀴즈 이미지·옵션 / multipart| BE
    BE <--> DB
    BE -->|POST /chat| CHAT
    BE -->|POST /statistics, /prediction| STAT
    BE -->|POST /api/ai/generate-quiz / multipart| QUIZ
    BE --> FILE
    CHAT --> FAISS
    CHAT --> GEMINI
    STAT --> CHROMA
    STAT --> GEMINI
    QUIZ --> GEMINI
    QUIZ --> GROQ
```

### 경계와 통신

| 구간 | 통신 | 역할 |
|---|---|---|
| React ↔ Spring Boot | HTTP JSON; 퀴즈 생성은 multipart | 사용자 입력, 인증·검증, 결과 화면 표시 |
| Spring Boot ↔ 버디봇 FastAPI | 동기 HTTP `POST /chat` | 회원 유형을 포함한 질문 전달, AI 답변 반환 |
| Spring Boot ↔ 통계 FastAPI | 동기 HTTP `POST /statistics`, `POST /prediction` | 풀이 로그 또는 집계 통계를 전달하고 구조화된 분석 결과 수신 |
| Spring Boot ↔ 퀴즈 FastAPI | 동기 HTTP multipart `POST /api/ai/generate-quiz` | 이미지와 퀴즈 조건을 전달하고 검증된 문제 세트 수신 |
| AI 서버 ↔ 모델·검색 인덱스 | 서버 내부 호출 | RAG 검색, 문제·분석 생성, 생성 결과 검증 |

세 AI 요청은 현재 코드상 요청 하나에 응답 하나를 반환하는 동기 흐름이다. SSE나 WebSocket 스트리밍 흐름은 이 AI 아키텍처 범위에 포함하지 않는다.

## 2. 버디봇 안내 대화

```mermaid
sequenceDiagram
    autonumber
    actor User as 사용자
    participant FE as React ChatBot
    participant C as Spring ChatController
    participant S as Spring ChatBotService / ChatAIService
    participant DB as TuddyBuddy DB
    participant AI as 챗봇 FastAPI /chat
    participant RAG as FAISS 정책 문서 검색
    participant LLM as Gemini

    User->>FE: 질문 입력
    FE->>C: POST /api/chatbot/ai (chat_num, question)
    C->>DB: 채팅 세션 조회
    C->>C: 회원 JWT 또는 비회원 브라우저 세션 소유권 확인
    C->>C: user_type을 MEMBER 또는 GUEST로 서버에서 설정
    C->>S: chat(request)
    S->>S: 질문 유효성 확인
    S->>DB: 사용자 질문 저장
    S->>AI: POST /chat (question, user_type)
    AI->>AI: 빈 질문이면 검색·모델 호출 없이 안내 반환
    AI->>RAG: 질문 임베딩 후 관련 문서 최대 3개 검색
    Note over RAG: MEMBER는 COMMON + MEMBER 문서 검색<br/>GUEST는 COMMON 문서만 검색
    RAG-->>AI: 검색된 안내 문서 청크
    AI->>LLM: 문서 근거와 질문으로 답변 생성
    LLM-->>AI: Markdown 답변
    AI-->>S: {answer}
    S->>DB: AI 답변 저장
    S-->>C: ChatAIResponse
    C-->>FE: HTTP 응답
    FE-->>User: 답변 표시
```

**책임 분리:** Spring은 세션 권한 확인과 대화 내역 저장을 담당한다. FastAPI는 PDF로 만든 FAISS 인덱스에서 접근 수준에 맞는 안내 문서를 검색하고 Gemini로 답변을 만든다. AI 서버 통신 실패 또는 빈 응답은 Spring에서 서비스 이용 불가 응답으로 처리한다.

## 3. 평가 분석 및 성적 예측

```mermaid
sequenceDiagram
    autonumber
    actor User as 사용자
    participant FE as React PerformanceAnalytics
    participant C as Spring StatisticsController
    participant S as Spring StatisticsService
    participant DB as TuddyBuddy DB
    participant AI as 통계 AI FastAPI
    participant RAG as Chroma 가이드 인덱스
    participant LLM as Gemini

    User->>FE: 평가 분석 화면 열기
    FE->>C: POST /api/statistics/getCategories
    C->>DB: 회원별 카테고리 조회
    DB-->>FE: 분석 대상 카테고리
    FE->>C: POST /api/statistics/getStatistics (memberNum, description)
    C->>S: 통합 평가 분석 요청
    S->>DB: 분석 포인트 사용 처리
    S->>DB: 회원 풀이 로그 조회
    S->>AI: POST /statistics (user_id, quiz_logs)
    AI->>AI: 카테고리별 풀이 기록 그룹화
    AI->>RAG: study_guidance 검색
    RAG-->>AI: 관련 학습 가이드
    AI->>LLM: 오답 근거와 가이드 기반 카테고리 분석
    LLM-->>AI: 약점·멘토 의견·3단계 학습 경로
    AI-->>S: categoryAnalyses
    S->>DB: 성적 이력 조회
    S->>DB: 카테고리별 통계 조회
    S->>AI: POST /prediction (categoryStatsList)
    AI->>AI: 중복 카테고리 집계
    AI->>RAG: prediction_policy 검색
    RAG-->>AI: 예측 기준
    AI->>LLM: 통계와 기준 기반 성적 예측
    LLM-->>AI: 최근 평균·다음 시험 예측·멘토 의견
    AI-->>S: categoryPredictions
    S->>DB: 과목 비중 조회
    S->>S: 응답 필수 항목·값 검증
    S->>S: 차트 데이터와 LLM 결과 결합
    S-->>C: {chartData, llmFeedback}
    C-->>FE: HTTP JSON
    FE->>FE: 화면 상태와 브라우저 캐시에 반영
    FE-->>User: 차트·약점 분석·예측 표시
```

**책임 분리:** Spring은 회원 데이터 조회, 포인트 처리, 분석용 요청 구성, AI 응답 검증과 차트 데이터 결합을 담당한다. FastAPI는 입력을 카테고리 단위로 정리하고 Chroma에서 가이드를 찾은 뒤 Gemini에 구조화 응답을 요청한다. `/statistics`와 `/prediction`은 별도 동기 호출이다.

## 4. 이미지 기반 AI 퀴즈 생성

```mermaid
sequenceDiagram
    autonumber
    actor User as 사용자
    participant FE as React SelfStudy
    participant C as Spring SelfStudyController
    participant S as Spring SelfStudyService
    participant DB as TuddyBuddy DB
    participant FS as 이미지 저장소
    participant Client as Spring QuizAiClient
    participant AI as 퀴즈 AI FastAPI
    participant Vision as 이미지 분석·학습 자료 변환
    participant RAG as 요청별 학습 청크 검색
    participant Gemini as Gemini 문제 생성
    participant Groq as Groq 정답·해설 검증

    User->>FE: 이미지·문제 유형·난이도·문항 수 선택
    FE->>C: POST /api/selfstudy/generate (multipart)
    C->>S: 인증 회원 ID와 요청 전달
    S->>S: 입력·이미지 형식·크기·옵션 검증
    S->>DB: 과목 카탈로그 조회
    S->>Client: 이미지 바이트와 옵션, 카탈로그 전달
    Client->>AI: multipart POST /api/ai/generate-quiz
    AI->>Vision: 이미지에서 학습 내용·텍스트·주제 추출
    Vision-->>AI: 구조화된 StudyMaterial
    AI->>AI: 언어·분류 정보 정리
    AI->>RAG: 관련 학습 청크 검색
    RAG-->>AI: 문제 생성 근거 청크
    AI->>Gemini: 유형·난이도·문항 수에 맞는 문제 생성
    Gemini-->>AI: 구조화된 문제 후보
    AI->>AI: 스키마·문항 수·출처·유사도 검증
    AI->>Groq: 정답 독립 풀이와 해설 일관성 교차 검증
    Groq-->>AI: 문항별 통과·실패 사유
    opt 검증 실패 문항이 있으면
        AI->>Gemini: 실패 사유를 반영해 재생성
        Gemini-->>AI: 보완 문제 후보
        AI->>Groq: 다시 정답·해설 검증
        Groq-->>AI: 검증 결과
    end
    AI-->>Client: 분류명과 검증된 문제 목록
    Client->>Client: 응답 구조·보기·정답 형식 검증
    Client-->>S: AI 생성 결과
    S->>S: 요청 문항 수와 필수 필드 검증
    S->>FS: 원본 이미지 저장
    S->>DB: 트랜잭션 시작: 포인트 차감, 과목·세션·문제 저장
    DB-->>S: 저장 완료
    S-->>C: 세션 ID·분류명·문제 세트
    C-->>FE: HTTP JSON
    FE-->>User: 문제 풀이 화면 표시
```

**책임 분리:** Python AI 서버가 문제 생성과 자체 검증을 마친 뒤 결과를 반환한다. Spring은 반환값을 다시 검증하고, 이미지 파일 저장과 포인트 차감·세션·문제 데이터 저장을 처리한다. AI 생성 또는 응답 검증에 실패하면 저장 단계로 넘어가지 않는다. DB 저장 트랜잭션에서 오류가 나면 해당 DB 작업은 롤백된다.

## 5. 공통 다이어그램 표기 양식

기능 상세도는 다음 요소를 같은 순서로 표시한다.

1. **사용자 동작과 화면:** 어떤 화면에서 무엇을 입력하거나 실행하는가.
2. **프론트 ↔ 백엔드 계약:** API 경로, HTTP 메서드, JSON 또는 multipart 입력.
3. **Spring 처리:** 인증·소유권 확인, 유효성 검사, DB 읽기·쓰기, 트랜잭션.
4. **외부 AI 처리:** AI API, 모델, RAG 검색소스, 결과 검증과 재시도.
5. **응답과 실패 흐름:** 화면에 돌아오는 결과, 사용자 안내, 저장 여부.

일반적인 단순 CRUD는 이 상세 흐름과 같은 형태로 반복 작성하지 않고 기능 목록이나 공통 CRUD 표로 묶는다. 독립 다이어그램은 외부 연동, 비동기 통신, 인증 분기, 생성 결과 검증·재시도처럼 구현 흐름이 달라지는 기능에만 둔다.

## 확인할 점

- 첨부 ZIP은 AI 서버 구현을 확인하는 자료로 사용했고, 서비스 키나 `.env` 값은 문서에 포함하지 않았다.
- 퀴즈 AI 서버 코드는 이미지 분석 이후 RAG·생성·검증 단계를 제공하는 것으로 정리했다. 실제 배포 환경의 모델·엔드포인트 설정은 환경 설정에 따라 달라질 수 있다.
- 현재 다이어그램은 구현 흐름을 설명한다. 배포 서버·네트워크·운영 환경 구성도는 별도 인프라 아키텍처로 분리한다.

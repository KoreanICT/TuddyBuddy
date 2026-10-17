# 로그인 세션과 Refresh Token

Access Token은 기존 JSON 키를 유지합니다. 일반 로그인은 `accessToken`, 카카오 로그인·가입은 `access_token`을 반환합니다. Refresh Token은 JSON/JavaScript 저장소에 반환하지 않으며 `refreshToken` HttpOnly 쿠키로만 발급합니다. 일반 로그인과 기존 카카오 회원 로그인, 카카오 가입 완료 시 함께 발급합니다.

최초 도입 전에 로그인한 브라우저에는 Refresh Token 쿠키가 없으므로 한 번 다시 로그인해야 합니다. JWT_SECRET 도입·변경 또는 기존 임시 서명키에서 공유키로 전환할 때도 이전 Access Token은 무효화됩니다. 프런트의 REACT_APP_BACK_END_URL은 실제 접속하는 API 호스트로 맞추고 localhost와 LAN IP를 혼용하지 않습니다. 서로 다른 사이트의 프런트·API는 아래 SameSite 제한을 확인해야 합니다.

## API 계약

- `POST /api/auth/refresh`: 쿠키를 받아 `{accessToken, member_num, authority, username}`을 반환하고 쿠키를 교체합니다. 본문과 Authorization 헤더는 필요하지 않습니다. 유효하지 않거나 만료·소비·폐기된 쿠키는 401과 쿠키 삭제를 반환합니다. 회원번호와 이메일을 DB에서 재확인하고 최신 권한으로 JWT를 발급합니다.
- `POST /api/auth/logout`: 현재 쿠키의 Redis 레코드를 삭제하고 쿠키를 만료시킵니다. 이미 로그아웃했어도 204입니다. Redis 장애 시 삭제 성공으로 간주하지 않고 503을 반환합니다.
- 두 엔드포인트는 만료된 Bearer 헤더가 있어도 쿠키로 처리합니다. Origin이 CORS 허용목록 또는 현재 서버와 동일한 출처여야 합니다. Origin이 없는 비브라우저 요청은 허용하되 `Sec-Fetch-Site: cross-site`는 거절합니다. 거절 상태는 403입니다.
- 보호된 API는 비로그인 401, 인증되었지만 권한 부족이면 403입니다. 기존에 공개된 회원가입·닉네임 검사와 익명 챗봇 API는 기존 설정을 유지합니다.

클라이언트는 로그인/카카오/갱신/로그아웃 요청에 Axios `withCredentials: true` 또는 fetch `credentials: 'include'`를 사용해야 합니다. 동시에 만료된 요청은 하나의 갱신 요청으로 합치고 성공 후 각 요청을 한 번만 재시도합니다. 로그아웃은 진행 중인 갱신이 끝난 다음 보내야 합니다.

## 운영 설정

기존 실제 application.properties와 외부 Oracle/Redis 연결은 변경하지 않았습니다. 아래는 필요한 경우 별도 배포 설정으로 제공할 속성 이름입니다. 실제 비밀 값은 저장소에 넣지 않습니다.

| 설정 | 기본값 | 설명 |
| --- | --- | --- |
| 환경변수 `JWT_SECRET` | 없음 | 안전하게 생성한 최소 64바이트 키를 표준 Base64로 인코딩한 값. 모든 인스턴스에 동일하게 설정합니다. 잘못된 형식·길이는 시작 시 거절합니다. |
| `auth.access-token-ttl-seconds` / `AUTH_ACCESS_TOKEN_TTL_SECONDS` | `900` | Access Token 유효시간. 허용 범위 1~86400초. |
| `auth.refresh-cookie-secure` / `AUTH_REFRESH_COOKIE_SECURE` | `false` | 로컬 HTTP 개발용 기본값. 운영 HTTPS에서는 반드시 `true`로 설정합니다. |
| `auth.allowed-origins` / `AUTH_ALLOWED_ORIGINS` | 빈 값 | 추가 허용 출처를 쉼표로 구분. HTTPS 프런트 출처를 포트까지 정확하게 지정합니다. 와일드카드는 사용하지 않습니다. |

기존 `security.value` 호스트의 HTTP 3000/80 포트 및 `http://localhost:3000`은 계속 허용합니다. 쿠키는 호스트 전용이며 `HttpOnly`, `SameSite=Lax`, 7일 Max-Age, `Path={실제 contextPath}/api/auth`입니다. contextPath가 `/back`이면 `/back/api/auth`가 됩니다. 삭제도 동일한 경로·보안 속성을 사용합니다. 다른 사이트에 배포된 프런트·백 조합은 SameSite=Lax 쿠키로 동작하지 않으므로 같은 사이트의 HTTPS 배포 또는 리버스 프록시 구성이 필요합니다. 프록시 뒤에서는 신뢰 가능한 forwarded-header 설정으로 요청 scheme/host/port/contextPath가 외부 주소와 일치하도록 운영해야 합니다.

`JWT_SECRET`이 없는 개발 환경은 Redis `tuddy:auth:jwt-signing-key`에 암호학적 난수 키를 SET NX로 한 번 생성하여 공유합니다. Redis가 유지되는 한 재시작·다중 인스턴스에서 재사용합니다. 키는 첫 서명·검증 때 읽고 인스턴스 메모리에 캐시합니다. Redis persistence/접근 제어를 설정하고 운영에서는 명시적인 환경변수를 권장합니다. Redis 삭제·키 변경은 재로그인을 요구하며 기존 프로세스도 함께 재시작해야 합니다. 키 값이나 원문 토큰을 로그로 출력하지 않습니다.

## Redis와 폐기 동작

- 32바이트 난수 opaque 토큰의 SHA-256 digest만 Redis 키 이름에 사용합니다. 값에는 회원번호·세대 ID·회원 조회용 이메일이 있으므로 Redis 역시 개인정보 저장소로 접근을 제한해야 합니다. 원문 토큰은 저장하지 않습니다.
- 토큰 레코드 TTL은 7일이며 성공적인 회전마다 새로 시작합니다. 먼저 메타정보와 DB 회원을 확인한 다음 Lua에서 기존 레코드와 회원 세대를 비교하고 삭제·후속 토큰 저장을 원자적으로 처리합니다. 동시에 같은 토큰을 사용하면 한 요청만 성공합니다.
- 회원별 세대 키는 만료시키지 않습니다. 비밀번호 변경 성공과 회원 탈퇴 시 세대를 교체하여 해당 회원의 모든 Refresh Token을 무효화하고 응답에서 현재 쿠키를 지웁니다. 기존 토큰 레코드는 7일 이내 자연 삭제됩니다. 회원 세대 키는 재활용 방지를 위해 임의로 삭제하지 않습니다.
- 회원 변경은 DB 트랜잭션 내부에서 Redis 폐기를 수행합니다. Redis 예외는 503으로 전파되어 DB 작업을 롤백합니다. Oracle과 Redis는 분산 트랜잭션이 아니므로 이후 DB 커밋 실패 시 세션이 먼저 폐기될 수 있습니다. 이 경우 안전하게 재로그인해야 합니다.
- 로그아웃은 현재 Refresh Token만 폐기합니다. 다른 장치의 세션은 유지됩니다. 다중 탭/프로세스에서 같은 쿠키를 동시에 회전·로그아웃하는 작업은 클라이언트가 조정해야 합니다.

## 한계와 확인 범위

Redis 장애에는 503으로 실패하며 로컬 메모리 세션으로 대체하지 않습니다. 회전 전 Redis 조회/DB 조회가 실패하면 기존 토큰을 소비하지 않습니다. 다만 Redis가 스크립트를 실행한 후 네트워크 응답이 유실되는 경우 소비 여부를 확정할 수 없어 재로그인이 필요할 수 있습니다. 브라우저 쿠키 응답 유실도 동일합니다. Redis Cluster 다중 슬롯은 지원하지 않으며 기존 단일 Redis/동일 Redis primary 연결을 사용합니다.

로그아웃·비밀번호 변경은 Refresh Token을 폐기합니다. 이미 발급된 Access Token에는 블랙리스트를 두지 않아 최대 설정 TTL까지 유효할 수 있습니다. 매 요청 DB에서 회원을 조회하므로 실제 탈퇴 계정은 인증되지 않으며, Refresh Token 재발급은 원래 회원번호 일치도 확인합니다. 이메일을 즉시 재사용하면 기존 Access Token의 이메일 subject만으로 새 회원과 구분하지 못하는 기존 제한이 있으므로 회원번호 subject 전환은 별도 마이그레이션이 필요합니다.

변경은 정적 코드 검토만 수행했습니다. 사용자 지침에 따라 테스트·빌드·실제 Oracle/Redis 연결·브라우저 실행은 하지 않았습니다.

## 프런트 동작과 수정 위치

- `front/src/login/authHttp.ts` (추가): 공통 API 주소, Axios 인터셉터, `authenticatedFetch`, 401 재발급·원 요청 1회 재시도, 15초 인증 요청 제한, 로그인·로그아웃과 갱신 직렬화. 인증 API 자체와 403은 자동 갱신하지 않습니다. 네트워크 오류·503은 인증 상태를 지우지 않습니다.
- `front/src/login/session.ts` (추가): 저장소·Redux 동기화, 탭 간 변경 감지, 로그인 세대와 로그아웃 후 자동 갱신 차단.
- `front/src/index.tsx`, `login/reducers/authReducer.ts`: 앱 시작 시 공통 처리와 Redux 연결.
- `front/src/login/authActions/authActions.ts`, `KakaoCallback.tsx`, `KakaoSignup.tsx`: 일반·카카오 로그인 시 쿠키 수신과 공통 세션 저장. 기존 응답 키는 유지합니다.
- `front/src/login/auth/RequireAuthProps.tsx`: 만료 직후 로그인 화면으로 이동하는 대신 갱신 대기, 일시 장애 시 다시 시도 제공.
- `front/src/cont/study_group/api.ts`, `cont/admin/selfstudy/selfStudyAdminApi.ts`: 별도 Axios 인스턴스에도 동일한 갱신 처리 연결.
- `front/src/cont/timer/timerApi.ts`, `cont/selfStudy/SelfStudy.tsx`, `cont/chatbot/ChatBot.tsx`: fetch 요청에 동일한 갱신 처리 연결. 별도 AI 감지 서버는 변경하지 않습니다.
- `front/src/layout/UserMenu.tsx`: 서버 로그아웃 실패 시 안내. 로컬 인증은 정리하고 직접 로그인 전까지 자동 갱신을 차단합니다.
- `front/src/mypage/MyPage.tsx`, `Member_edit.tsx`, `friend/MyFriend.tsx`, `report/MyReportList.tsx`: 공통 API 주소 사용. 비밀번호 변경 완료 후 새 비밀번호로 재로그인하도록 안내합니다. 기존 화면 구성과 가입일·탈퇴 기능은 유지합니다.

기본 API 주소는 `http://localhost/back`입니다. 다른 호스트를 사용할 때는 CRA 환경변수 `REACT_APP_BACK_END_URL`을 실제 API 주소로 설정한 후 프런트를 다시 시작해야 합니다. 기존 코드에 있던 일부 backend 주소도 공통 주소로 정규화합니다. 지정된 backend 이외의 요청에 공통 인증 토큰을 전달하지 않습니다.

같은 탭의 동시 갱신은 하나의 Promise로 합칩니다. 브라우저가 Web Locks를 제공하는 환경에서는 여러 탭의 쿠키 변경도 직렬화하고, 대기 중 다른 탭이 토큰을 갱신했다면 해당 값을 재사용합니다. Web Locks가 없는 환경(일부 브라우저 또는 보안 컨텍스트가 아닌 LAN HTTP)에서는 여러 탭의 동시 회전이 재로그인을 요구할 수 있습니다.

서버를 재시작하고 다시 로그인한 뒤 개발자도구에서 로그인 응답의 HttpOnly 쿠키, 만료 후 refresh 응답과 원 요청 재시도, 로그아웃 후 쿠키 삭제를 확인할 수 있습니다. 이 문서는 확인 방법을 설명하며 실제 실행 검증이 완료되었다는 의미는 아닙니다.

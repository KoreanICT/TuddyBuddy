# 운영 환경설정 적용 절차

기준: ourproject 54.180.24.149 / ourdb 사설 주소 172.31.9.72.
설정 파일·소스 확인 결과이며, 서버에 적용했다고 의미하지 않는다.

## 설정 전달 위치

| 설정 | 위치 | 적용 방식 |
| --- | --- | --- |
| DB 주소, Redis 주소, Linux 업로드 경로 | deploy/k3s/backend-deployment.yaml | Pod 환경변수가 Secret의 개발 값을 덮어씀 |
| CORS 및 인증 origin, 카카오 콜백 | 같은 YAML | http://54.180.24.149:30000 기준 |
| 카카오 client-id/client-secret, 메일, quiz 토큰 | 기존 K3s Secret | 아래 도구로 해당 키만 갱신 |
| DB·Redis 비밀번호 | 기존 K3s Secret | 로컬 값으로 교체하지 않고 보존 |
| JWT 서명 키 | 기존 설정 또는 Redis | 현재 코드는 미지정 시 Redis에 생성·공유하므로 임의 교체하지 않음 |
| 학습분석 quiz.ai.base-url | YAML | http://13.124.62.97:8000/ |
| 이미지/통계 fastapi.url | YAML | http://3.34.123.123:8001 (코드가 /statistics 등을 붙이므로 끝 / 제거) |
| 챗봇 chatbot.ai.base-url | YAML | http://43.203.220.155:8000/ |
| 백엔드/감지 프론트 주소 | Jenkinsfile.react build arguments | /back 및 /detect |
| 프론트 카카오 REST API 키 | Jenkins Secret text | tuddybuddy-kakao-rest-api-key |
| detect 연결 | front/nginx.conf | /detect/ → http://54.180.243.14:8000/ |

다른 AI의 주소는 현재 로컬 application.properties에서 확인한 값이다.
네트워크 접근·각 API 규격·추론 결과 검증은 별도다. 이 값이 최신 서버가 아니라면 담당자에게 확인 후 YAML을 고친다.
로컬 front/.env 안의 quiz.ai.* 항목은 REACT_APP_ 접두사가 없으며 현재 프론트 코드에서도 읽지 않는다.
백엔드의 학습분석 설정은 프론트 .env가 아닌 위 YAML/Secret에 넣는다.
현재 쿠키는 HTTP 테스트용 secure=false이며 카메라 실사용에는 HTTPS 구성이 필요하다.

## 1. Jenkins·카카오 콘솔

작업 위치: Jenkins 웹 UI → Credentials.

- 종류: Secret text
- ID: tuddybuddy-kakao-rest-api-key
- 값: front/.env의 REACT_APP_KAKAO_REST_API_KEY 값만 입력

이 값은 로컬 백엔드 kakao.client-id와 일치하는 것을 확인했다. client-secret은 브라우저에 넣지 않는다.
작업 위치: 카카오 개발자 콘솔 → 해당 앱. 아래 Redirect URI를 등록한다.

```text
http://54.180.24.149:30000/auth/kakao/callback
```

## 2. 백엔드 인증정보만 안전하게 준비

실행 위치: 로컬 Windows PowerShell, D:\ictstudy\TuddyBuddy.
이 명령은 로컬 application.properties에서 메일·카카오·quiz 토큰만 추출한다.
DB·Redis 비밀번호나 테스트 회원 정보는 추출하지 않는다. 값은 화면에 출력하지 않는다.

```powershell
python deploy/scripts/prepare_backend_settings.py --source back/src/main/resources/application.properties --output deploy/secrets/backend-settings.properties
```

결과 파일은 Git 제외 대상이다. 기존 출력 파일이 있으면 덮어쓰지 않고 중지한다.
비밀 파일이므로 공유·커밋하지 않는다. 필요한 사용자만 파일을 읽을 수 있도록 관리한다.

실행 위치: ourproject EC2 ubuntu SSH 터미널, 디렉터리 무관.

```bash
install -d -m 700 /home/ubuntu/tuddybuddy/config-update
```

작업 위치: MobaXterm SFTP. 위 폴더에 아래 두 파일만 업로드한다.

- deploy/scripts/update_backend_secret.py
- deploy/secrets/backend-settings.properties

prepare_backend_settings.py는 로컬 준비용이므로 서버에 필요하지 않다.

## 3. 기존 Secret과 병합 후 적용

실행 위치: ourproject EC2 ubuntu SSH 터미널, /home/ubuntu/tuddybuddy/config-update.

```bash
cd /home/ubuntu/tuddybuddy/config-update
chmod 600 backend-settings.properties
export KUBECONFIG=/home/ubuntu/.kube/config

# 먼저 변경되는 키 이름만 확인. 값은 출력하지 않음.
python3 update_backend_secret.py --source backend-settings.properties

# 미리보기의 키 이름 확인 후 적용
python3 update_backend_secret.py --source backend-settings.properties --apply
```

이 도구는 기존 Secret 전체를 교체하지 않고 application.properties 항목만 JSON patch로 갱신한다.
DB·Redis·JWT 및 목록에 없는 서버 설정을 보존하며, 동시 변경이 있으면 덮어쓰지 않고 실패한다.
빈 필수값·중복 키·지원하지 않는 여러 줄 속성은 적용 전에 실패한다.
백업은 서버의 ~/.config/tuddybuddy/secret-backups 아래에 읽기 제한 파일로 저장한다.
백업에도 인증정보가 있으므로 화면 출력·Git 업로드를 하지 않는다.

## 4. Jenkins 배포 및 확인

새 Secret 값을 만든 뒤 backend·frontend Jenkins 작업으로 최신 master를 배포한다.
YAML 변경은 파이프라인이 적용하며 frontend 환경값은 이미지 재빌드 때 반영된다.
Secret만 갱신하고 이미 배포된 이미지를 계속 사용할 때는 아래와 같이 재시작한다.

실행 위치: ourproject EC2 ubuntu 터미널, 디렉터리 무관.

```bash
export KUBECONFIG=/home/ubuntu/.kube/config
kubectl rollout restart deployment/tuddybuddy-backend
kubectl rollout status deployment/tuddybuddy-backend --timeout=300s
kubectl rollout status deployment/tuddybuddy-frontend --timeout=300s

# 비밀값 없이 운영 주소 확인
kubectl exec deployment/tuddybuddy-backend -- printenv SPRING_DATASOURCE_URL SPRING_DATA_REDIS_HOST KAKAO_REDIRECT_URI AUTH_ALLOWED_ORIGINS QUIZ_AI_BASE_URL FASTAPI_URL CHATBOT_AI_BASE_URL
curl --fail --max-time 10 http://127.0.0.1:30000/ > /dev/null
curl --fail --max-time 10 http://127.0.0.1:30000/back/v3/api-docs > /dev/null
```

Swagger가 정상이어도 로그인·DB 스키마·메일·결제·AI 기능 전체 성공을 의미하지 않는다.
브라우저에서 카카오 로그인/콜백, 일반 로그인·새로고침, 업로드를 각각 확인한다.
메일 앱 비밀번호·카카오 client secret·AI 토큰 등 앞서 노출된 인증정보는
발급처에서 교체하고 같은 도구로 서버에도 반영한다. DB·Redis 비밀번호 교체는 해당 서버와 함께 별도 수행한다.

적용이 끝나면 업로드한 임시 입력 파일을 삭제한다. 보호된 백업은 운영 복구 정책에 따라 보관한다.

```bash
rm -- /home/ubuntu/tuddybuddy/config-update/backend-settings.properties
```

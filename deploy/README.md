# TuddyBuddy deployment

## Servers

| Server | Role | Private address |
| --- | --- | --- |
| myjenkins | Jenkins controller and jdk25 build agent | 172.31.5.218 |
| ourproject | Single-node K3s, React and Spring Boot | 172.31.39.80 |
| ourdb | Docker Oracle and Redis | 172.31.9.72 |
| detect | Existing camera inference API | Public endpoint: http://54.180.243.14:8000 |

The frontend is exposed at `http://54.180.24.149:30000/`. The backend Service `tuddybuddy-backend:80` is internal to K3s and serves the `/back` context. React's Nginx proxies API calls to that Service. Instance public addresses can change after stop/start.

## Prerequisites

1. Use the repository's `master` branch for both Jenkins Pipeline jobs. Set Script Path to `Jenkinsfile` for backend and `Jenkinsfile.react` for frontend. Configure the GitHub webhook to the current Jenkins address.
2. The `jdk25` agent needs Java 25, Git, SSH/SCP, Docker CLI and access to the Docker daemon. Backend builds use the checked-in Gradle wrapper. Frontend builds run inside the Docker build.
3. Jenkins credential `deploy-server-ssh` must authenticate as `ubuntu` on ourproject. Install the verified SSH host key for `172.31.39.80` in the build agent's `$HOME/.ssh/known_hosts`. Both pipelines require strict host-key verification. Do not blindly replace an existing key following a mismatch.
4. Ourproject needs `/home/ubuntu/.kube/config`, noninteractive permission for `sudo k3s ctr images import`, and `/home/ubuntu/tuddybuddy/{deploy-staging,deploy-state,uploads}`. Create writable `uploads/group` and `uploads/quiz` directories. Upload data uses a hostPath on this single node and needs a separate backup.
5. Permit SSH from Jenkins to ourproject. Permit Oracle TCP 1521 and Redis TCP 6379 from ourproject to ourdb through private networking. Permit frontend TCP 30000 only for intended users. No external backend NodePort is configured.
6. Provision the Oracle application user, complete schema/sequences and required initial data. Confirm Redis is running and configure its authentication if enabled. Infrastructure rollout alone does not establish database readiness.

## Backend configuration

### 운영 환경값과 기존 Secret 유지

`deploy/k3s/backend-deployment.yaml`은 비밀이 아닌 운영 값만 환경변수로 전달한다.
기존 `tuddybuddy-backend` Secret의 `application.properties`는 계속 사용하며,
로컬 설정 파일로 자동 교체하지 않는다. DB·Redis 비밀번호, 메일·카카오 client secret은
기존 Secret에 유지한다. 노출된 인증정보 교체는 별도로 해당 서비스와 Secret을 함께 갱신한다.

| 설정 | 전달 값 |
| --- | --- |
| SPRING_DATASOURCE_URL | jdbc:oracle:thin:@172.31.9.72:1521:xe |
| SPRING_DATA_REDIS_HOST / PORT | 172.31.9.72 / 6379 |
| SPRING_SERVLET_MULTIPART_LOCATION | /app/upload |
| FILE_UPLOAD_GROUP_THUMBNAIL | /app/upload/group |
| QUIZ_IMAGE_DIRECTORY | /app/upload/quiz |
| CORS_ALLOWED_ORIGINS | http://54.180.24.149:30000,http://localhost:3000 |
| AUTH_ALLOWED_ORIGINS | http://54.180.24.149:30000,http://localhost:3000 |
| SECURITY_VALUE | 54.180.24.149 |
| KAKAO_REDIRECT_URI | http://54.180.24.149:30000/auth/kakao/callback |
| AUTH_REFRESH_COOKIE_SECURE | false（현재 HTTP 테스트용） |

Spring 환경변수가 Secret 파일의 같은 속성을 덮어쓴다.
`security.value`는 AuthCookies에서 기본 origin을 만드는 호스트 값이며,
포트 30000을 별도로 `auth.allowed-origins`에 지정해야 한다.
HTTPS로 전환할 때 origin/콜백 주소와 쿠키 secure 설정을 함께 변경한다.
IP·포트·도메인이 바뀌면 이 표의 해당 주소와 YAML도 갱신한다.

### 프론트 설정 및 카카오 로그인

로컬 `front/.env`는 Git 및 Docker 컨텍스트에서 제외한다.
Jenkins는 `Jenkinsfile.react`에서 Docker build arguments로 `/back`, `/detect`,
카카오 REST API 키를 전달한다. `deploy/frontend.env.example`은 설정 항목 설명용이며 자동 로드되지 않는다.

최초 한 번 Jenkins 관리 → Credentials에서 다음을 등록한다.

- 종류: **Secret text**
- ID: **tuddybuddy-kakao-rest-api-key**
- 값: 해당 카카오 앱의 **REST API 키**

client secret이나 관리자 키를 넣지 않는다. 이 REST API 키는 브라우저 빌드에 포함되므로
사용자에게 보이는 값이다. Jenkins에 보관해도 브라우저 런타임 비밀이 되는 것은 아니다.
자격 증명 누락·빈 값이면 프론트 빌드가 실패한다. 키 변경 후에는 이미지를 다시 빌드해야 한다.

카카오 개발자 콘솔에도 아래 Redirect URI를 정확히 등록한다.

```text
http://54.180.24.149:30000/auth/kakao/callback
```

프론트는 현재 origin으로 콜백 주소를 생성하고 백엔드는 KAKAO_REDIRECT_URI로 토큰 교환을 한다.
두 값과 카카오 콘솔 등록값이 일치해야 한다. Nginx는 원래 Host의 포트도 전달하도록 구성한다.

### 적용·확인 순서

1. 위 Jenkins 자격 증명 및 카카오 콘솔 Redirect URI를 먼저 준비한다.
2. 배포 대상 저장소 `KoreanICT/TuddyBuddy`의 최신 master 기준으로 별도 브랜치·PR을 반영한다.
   이 PC origin이 `KoreanICT/projectA`를 가리킨다면 대상 저장소를 확인한 뒤 push한다.
   보호된 master에 직접 push하지 않는다.
3. backend·frontend Jenkins 작업으로 배포한다. 기존 서버 Secret은 새로 만들지 않는다.
4. 실행 위치: ourproject EC2의 ubuntu SSH 터미널, 디렉터리 무관.

```bash
export KUBECONFIG=/home/ubuntu/.kube/config
kubectl rollout status deployment/tuddybuddy-backend --timeout=300s
kubectl rollout status deployment/tuddybuddy-frontend --timeout=300s
kubectl exec deployment/tuddybuddy-backend -- printenv KAKAO_REDIRECT_URI AUTH_ALLOWED_ORIGINS
curl --fail --max-time 10 http://127.0.0.1:30000/ > /dev/null
```

로그인 완료는 브라우저에서 별도로 확인한다. DB 테이블·데이터가 없으면 사용자 조회/등록이 실패할 수 있다.
Swagger 화면 및 API 명세 GET 경로는 SecurityConfig에서 비로그인 접근을 허용하며,
JwtTokenFilter에서도 해당 GET 요청만 제외한다. 실제 업무 API의 인증·권한 정책은 유지한다.
이 Java 변경은 백엔드 이미지 재빌드·배포 후 적용된다.

```text
http://54.180.24.149:30000/back/swagger-ui/index.html
http://54.180.24.149:30000/back/v3/api-docs
```
다른 AI는 이번 배포 검증 범위에서 제외한다. Secret의 잘못된 `fastapi.url`은 담당 AI의 실제 주소를
확인한 뒤 별도로 수정해야 한다. detect 주소로 임의 대체하거나 토큰을 Git에 추가하지 않는다.

### Secret 최초 생성 시에만

Create an operational `application.properties` outside the repository. It must include required datasource credentials, JWT settings, mail credentials, Kakao settings and AI endpoint settings. Use the actual property names expected by the code. Do not commit or print secret values. The image excludes the local properties file.

On ourproject, import the protected file as a Kubernetes Secret:

```sh
export KUBECONFIG=/home/ubuntu/.kube/config
kubectl create secret generic tuddybuddy-backend \
  --from-file=application.properties=/secure/path/application.properties \
  --dry-run=client -o yaml | kubectl apply -f -
```

The backend Deployment mounts that Secret as `/app/config/application.properties` and explicitly loads it using `SPRING_CONFIG_ADDITIONAL_LOCATION`. Environment variables override the datasource address, Redis address and Windows upload paths. Secret changes require a backend restart to reload the file. Keep the source configuration protected and outside Git.

## Pipeline behavior

Both jobs check out their configured SCM branch, build an image tagged with commit prefix and Jenkins build number, save a tar archive, and transfer it with SCP. Ourproject imports the image into K3s containerd. The pipeline substitutes `__IMAGE__` in the Deployment template, applies the Service and Deployment, then waits for rollout. The templates cannot be applied directly until `__IMAGE__` is replaced with an imported image reference.

The frontend additionally checks HTTP on port 30000. Backend readiness currently confirms only that its TCP listener opened; it does not prove login, DB queries, Redis, mail or AI work. Failed rollouts fail the Jenkins job and do not update `deploy-state/*.commit`. Those commit files are an audit record; these initial pipelines intentionally rebuild on each triggered job rather than skipping by path. They do not automatically roll back a failed deployment.

Example verification on ourproject:

```sh
export KUBECONFIG=/home/ubuntu/.kube/config
kubectl get deployments,pods,services
kubectl rollout status deployment/tuddybuddy-frontend --timeout=180s
kubectl rollout status deployment/tuddybuddy-backend --timeout=300s
curl --fail http://127.0.0.1:30000/ > /dev/null
```

For rollback, inspect `kubectl rollout history deployment/tuddybuddy-backend` and select the intended revision before using `kubectl rollout undo`. Retain the corresponding local containerd image. Do not apply an old rendered manifest unintentionally, as its image tag may supersede the current deployment.

## Acceptance and remaining work

Database schema and seed data, production login/callback addresses, HTTPS/domain, existing upload migration and end-to-end feature checks must be completed separately. The existing camera AI endpoint is configured through the frontend proxy; other AI deployments and functionality checks are outside this deployment scope. Validate login, database writes, image upload/retrieval, Redis-backed flows and AI calls before calling the service ready. Back up Oracle and uploads; a single K3s node and hostPath storage do not provide server-level failover.

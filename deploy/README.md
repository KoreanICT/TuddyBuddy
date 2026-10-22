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

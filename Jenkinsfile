pipeline {
    agent { label 'jdk25' }
    options {
        disableConcurrentBuilds()
        skipDefaultCheckout()
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
    }
    environment {
        DEPLOY_HOST = 'ubuntu@172.31.39.80'
        DEPLOY_DIR = '/home/ubuntu/tuddybuddy'
        COMPONENT = 'backend'
        IMAGE_NAME = 'tuddybuddy-backend'
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.CURRENT_COMMIT = sh(script: 'git rev-parse HEAD', returnStdout: true).trim()
                    env.IMAGE_TAG = env.CURRENT_COMMIT.take(12) + '-' + env.BUILD_NUMBER
                }
            }
        }
        stage('Check deployment connection') {
            steps {
                sshagent(credentials: ['deploy-server-ssh']) {
                    sh '''
                        set -eu
                        test -s "$HOME/.ssh/known_hosts"
                        ssh -o BatchMode=yes -o StrictHostKeyChecking=yes \
                            "$DEPLOY_HOST" 'test -s /home/ubuntu/.kube/config'
                    '''
                }
            }
        }
        stage('Build Spring Boot') {
            steps {
                dir('back') {
                    sh '''
                        set -eu
                        chmod +x gradlew
                        ./gradlew clean bootJar --no-daemon --max-workers=1 \
                            -Dorg.gradle.jvmargs="-Xmx512m"
                    '''
                }
            }
        }
        stage('Build and save image') {
            steps {
                sh '''
                    set -eu
                    docker build -t "$IMAGE_NAME:$IMAGE_TAG" back
                    docker save "$IMAGE_NAME:$IMAGE_TAG" \
                        -o "$WORKSPACE/$IMAGE_NAME-$IMAGE_TAG.tar"
                '''
            }
        }
        stage('Transfer deployment') {
            steps {
                sshagent(credentials: ['deploy-server-ssh']) {
                    sh '''
                        set -eu
                        REMOTE_STAGE="$DEPLOY_DIR/deploy-staging/$COMPONENT-$IMAGE_TAG"
                        ssh -o BatchMode=yes -o StrictHostKeyChecking=yes "$DEPLOY_HOST" \
                            "mkdir -p '$REMOTE_STAGE'"
                        scp -o BatchMode=yes -o StrictHostKeyChecking=yes \
                            "$WORKSPACE/$IMAGE_NAME-$IMAGE_TAG.tar" \
                            "deploy/k3s/$COMPONENT-deployment.yaml" \
                            "deploy/k3s/$COMPONENT-service.yaml" \
                            "$DEPLOY_HOST:$REMOTE_STAGE/"
                    '''
                }
            }
        }
        stage('Sync quiz AI token') {
            steps {
                withCredentials([string(credentialsId: 'quiz.ai.token', variable: 'QUIZ_AI_TOKEN')]) {
                    sshagent(credentials: ['deploy-server-ssh']) {
                        sh '''
                            set +x
                            set -eu
                            test -n "$QUIZ_AI_TOKEN"
                            printf '%s' "$QUIZ_AI_TOKEN" | \
                                ssh -o BatchMode=yes -o StrictHostKeyChecking=yes "$DEPLOY_HOST" '
set -euo pipefail
export KUBECONFIG=/home/ubuntu/.kube/config
umask 077
TOKEN_FILE=$(mktemp)
trap "rm -f $TOKEN_FILE" EXIT
cat > "$TOKEN_FILE"
test -s "$TOKEN_FILE"
kubectl create secret generic tuddybuddy-quiz-ai \
    --namespace=default \
    --from-file=token="$TOKEN_FILE" \
    --dry-run=client -o yaml | kubectl apply --namespace=default -f -
'
                        '''
                    }
                }
            }
        }
        stage('Deploy and verify rollout') {
            steps {
                sshagent(credentials: ['deploy-server-ssh']) {
                    sh '''
                        set -eu
                        ssh -o BatchMode=yes -o StrictHostKeyChecking=yes "$DEPLOY_HOST" \
                            "COMPONENT='$COMPONENT' IMAGE_NAME='$IMAGE_NAME' IMAGE_TAG='$IMAGE_TAG' CURRENT_COMMIT='$CURRENT_COMMIT' bash -se" <<'REMOTE'
set -eu
export KUBECONFIG=/home/ubuntu/.kube/config
DEPLOY_DIR=/home/ubuntu/tuddybuddy
STAGING="$DEPLOY_DIR/deploy-staging/$COMPONENT-$IMAGE_TAG"
cd "$STAGING"
test -s "$IMAGE_NAME-$IMAGE_TAG.tar"
sudo k3s ctr images import "$IMAGE_NAME-$IMAGE_TAG.tar"
kubectl apply -f "$COMPONENT-service.yaml"
sed "s|__IMAGE__|$IMAGE_NAME:$IMAGE_TAG|g" "$COMPONENT-deployment.yaml" > rendered-deployment.yaml
kubectl apply -f rendered-deployment.yaml
if ! kubectl rollout status "deployment/tuddybuddy-$COMPONENT" --timeout=300s; then
    kubectl get pods -l "app=tuddybuddy-$COMPONENT" -o wide
    echo "Rollout failed; deployment state was not advanced."
    exit 1
fi
if [ "$COMPONENT" = frontend ]; then
    curl --fail --silent --show-error --retry 5 --retry-connrefused --retry-delay 2 \
        --max-time 10 http://127.0.0.1:30000/ > /dev/null
fi
mkdir -p "$DEPLOY_DIR/deploy-state"
printf '%s\n' "$CURRENT_COMMIT" > "$DEPLOY_DIR/deploy-state/$COMPONENT.commit.tmp"
mv "$DEPLOY_DIR/deploy-state/$COMPONENT.commit.tmp" "$DEPLOY_DIR/deploy-state/$COMPONENT.commit"
rm -f "$IMAGE_NAME-$IMAGE_TAG.tar"
echo "$COMPONENT rollout verified. Business functionality requires separate acceptance testing."
REMOTE
                    '''
                }
            }
        }
    }
    post {
        always {
            sh 'rm -f "$WORKSPACE/$IMAGE_NAME-$IMAGE_TAG.tar"'
        }
    }
}

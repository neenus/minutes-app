pipeline {
  agent any

  environment {
    REGISTRY_URL = credentials('REGISTRY_URL')
    IMAGE_TAG    = "${env.BUILD_NUMBER}"
    DEPLOY_DIR   = '/volume1/docker/minutes'
    COMPOSE_FILE = 'docker-compose.yml'
  }

  options {
    buildDiscarder(logRotator(numToKeepStr: '10'))
    timeout(time: 30, unit: 'MINUTES')
    disableConcurrentBuilds()
  }

  stages {
    stage('Preflight') {
      steps {
        script {
          sh '''
            docker info > /dev/null 2>&1 || {
              echo "ERROR: Docker not accessible. Mount /var/run/docker.sock into Jenkins container."
              exit 1
            }
          '''
          sh '''
            curl -sf http://${REGISTRY_URL}/v2/ > /dev/null || {
              echo "ERROR: Registry at ${REGISTRY_URL} is not reachable."
              exit 1
            }
          '''
          sh 'docker-compose version > /dev/null 2>&1 || { echo "ERROR: docker-compose plugin not found."; exit 1; }'
        }
      }
    }

    stage('Checkout') {
      steps {
        checkout scm
        sh 'git log -1 --oneline'
      }
    }

    stage('Test') {
      steps {
        withCredentials([string(credentialsId: 'npm-private-token', variable: 'NPM_TOKEN')]) {
          sh 'docker build --build-arg NPM_TOKEN=$NPM_TOKEN -f Dockerfile.test .'
        }
      }
    }

    stage('Build API Image') {
      steps {
        withCredentials([string(credentialsId: 'npm-private-token', variable: 'NPM_TOKEN')]) {
          sh 'docker build --build-arg NPM_TOKEN=$NPM_TOKEN -f server/Dockerfile -t ${REGISTRY_URL}/minutes-api:${IMAGE_TAG} -t ${REGISTRY_URL}/minutes-api:latest ./server'
        }
      }
    }

    stage('Build UI Image') {
      steps {
        sh 'cp ${DEPLOY_DIR}/.env client/.env'
        sh 'docker build -f client/Dockerfile -t ${REGISTRY_URL}/minutes-ui:${IMAGE_TAG} -t ${REGISTRY_URL}/minutes-ui:latest ./client'
      }
    }

    stage('Push') {
      steps {
        sh 'docker push ${REGISTRY_URL}/minutes-api:${IMAGE_TAG}'
        sh 'docker push ${REGISTRY_URL}/minutes-api:latest'
        sh 'docker push ${REGISTRY_URL}/minutes-ui:${IMAGE_TAG}'
        sh 'docker push ${REGISTRY_URL}/minutes-ui:latest'
      }
    }

    stage('Deploy') {
      steps {
        script {
          sh 'cp ${COMPOSE_FILE} ${DEPLOY_DIR}/${COMPOSE_FILE}'
          sh '''
            cd ${DEPLOY_DIR}
            IMAGE_TAG=${IMAGE_TAG} docker-compose -f ${COMPOSE_FILE} up -d mongo
            IMAGE_TAG=${IMAGE_TAG} docker-compose -f ${COMPOSE_FILE} pull api ui
            IMAGE_TAG=${IMAGE_TAG} docker-compose -f ${COMPOSE_FILE} up -d --no-deps api ui
          '''
        }
      }
    }

    stage('Health Check') {
      steps {
        script {
          retry(12) {
            sleep(time: 5, unit: 'SECONDS')
            sh '''
              curl -sf "http://192.168.4.99:5020/health" > /dev/null || {
                echo "API not ready yet..."
                exit 1
              }
            '''
          }
          retry(6) {
            sleep(time: 5, unit: 'SECONDS')
            sh '''
              curl -sf "http://192.168.4.99:3020" > /dev/null || {
                echo "UI not ready yet..."
                exit 1
              }
            '''
          }
          echo 'Deployment successful — minutes-api and minutes-ui are healthy.'
        }
      }
    }
  }

  post {
    success {
      echo "Build ${IMAGE_TAG} deployed successfully."
    }
    failure {
      script {
        echo "Build ${IMAGE_TAG} failed. Rolling back to last known-good image..."
        sh '''
          test -d ${DEPLOY_DIR} || { echo "Deploy dir not found — skipping rollback."; exit 0; }
          cd ${DEPLOY_DIR}
          LAST_GOOD=$(docker images "${REGISTRY_URL}/minutes-api" --format "{{.Tag}}" \
            | grep -E "^[0-9]+$" \
            | sort -n \
            | grep -v "^${IMAGE_TAG}$" \
            | tail -1)
          if [ -z "$LAST_GOOD" ]; then
            echo "No previous image found to roll back to."
            exit 0
          fi
          echo "Rolling back to tag ${LAST_GOOD}"
          IMAGE_TAG=${LAST_GOOD} docker-compose -f ${COMPOSE_FILE} up -d --no-deps api ui || true
        '''
      }
    }
    always {
      script {
        sh 'docker image prune -f || true'
        sh '''
          for img in "${REGISTRY_URL}/minutes-api" "${REGISTRY_URL}/minutes-ui"; do
            docker images "$img" --format "{{.Tag}}" \
              | grep -E "^[0-9]+$" \
              | sort -n \
              | head -n -3 \
              | xargs -r -I{} docker rmi "$img:{}" || true
          done
        '''
      }
    }
  }
}

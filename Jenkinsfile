pipeline {
  agent any

  tools {
    nodejs '22.12.0'
  }

  environment {
    REGISTRY_URL  = credentials('REGISTRY_URL')
    API_IMAGE     = "${REGISTRY_URL}/minutes-api"
    UI_IMAGE      = "${REGISTRY_URL}/minutes-ui"
    IMAGE_TAG     = "${env.BUILD_NUMBER}"
    DEPLOY_DIR    = '/volume1/docker/minutes'
    COMPOSE_FILE  = 'docker-compose.yml'
    VITE_API_URL  = 'https://minutes-api.nraccounting.ca/api/v1'
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
          sh '''
            test -f "${DEPLOY_DIR}/.env" || {
              echo "ERROR: ${DEPLOY_DIR}/.env not found. Create it on the NAS before running the pipeline."
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

    stage('Install') {
      steps {
        withCredentials([string(credentialsId: 'npm-private-token', variable: 'NPM_TOKEN')]) {
          sh 'npm ci'
        }
      }
    }

    stage('CI') {
      parallel {
        stage('Server: Type Check') {
          steps { sh 'npx tsc --noEmit --project server/tsconfig.json' }
        }
        stage('Client: Type Check') {
          steps { sh 'npx tsc --noEmit --project client/tsconfig.json' }
        }
        stage('Client: Lint') {
          steps { sh 'npm run lint --workspace=client' }
        }
        stage('Server: Test') {
          when { expression { return fileExists('server/src/__tests__') } }
          steps { sh 'npm test --workspace=server' }
        }
      }
    }

    stage('DB Backup') {
      steps {
        sh "docker exec minutes-mongo mongodump --out ${DEPLOY_DIR}/backups/pre-deploy-${IMAGE_TAG} 2>&1 || echo 'Backup skipped (container not running yet)'"
      }
    }

    stage('Build & Push') {
      parallel {
        stage('API Image') {
          steps {
            dir('server') {
              withCredentials([string(credentialsId: 'npm-private-token', variable: 'NPM_TOKEN')]) {
                sh """
                  docker build --build-arg NPM_TOKEN=${NPM_TOKEN} \
                    -t ${API_IMAGE}:${IMAGE_TAG} -t ${API_IMAGE}:latest .
                  docker push ${API_IMAGE}:${IMAGE_TAG}
                  docker push ${API_IMAGE}:latest
                """
              }
            }
          }
        }
        stage('UI Image') {
          steps {
            dir('client') {
              sh """
                docker build --build-arg VITE_API_URL=${VITE_API_URL} \
                  -t ${UI_IMAGE}:${IMAGE_TAG} -t ${UI_IMAGE}:latest .
                docker push ${UI_IMAGE}:${IMAGE_TAG}
                docker push ${UI_IMAGE}:latest
              """
            }
          }
        }
      }
    }

    stage('Deploy') {
      steps {
        script {
          sh "cp ${COMPOSE_FILE} ${DEPLOY_DIR}/${COMPOSE_FILE}"
          sh """
            cd ${DEPLOY_DIR}
            IMAGE_TAG=${IMAGE_TAG} docker-compose -f ${COMPOSE_FILE} up -d mongo
            IMAGE_TAG=${IMAGE_TAG} docker-compose -f ${COMPOSE_FILE} pull api ui
            IMAGE_TAG=${IMAGE_TAG} docker-compose -f ${COMPOSE_FILE} up -d --no-deps api ui
          """
        }
      }
    }

    stage('Health Check') {
      steps {
        script {
          retry(12) {
            sleep(time: 5, unit: 'SECONDS')
            sh '''
              curl -sf "http://localhost:5020/health" > /dev/null || {
                echo "API not ready yet..."
                exit 1
              }
            '''
          }
          retry(6) {
            sleep(time: 5, unit: 'SECONDS')
            sh '''
              curl -sf "http://localhost:3020" > /dev/null || {
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
        sh """
          cd ${DEPLOY_DIR}
          LAST_GOOD=\$(docker images "${API_IMAGE}" --format "{{.Tag}}" \\
            | grep -E "^[0-9]+\$" \\
            | sort -n \\
            | grep -v "^\${IMAGE_TAG}\$" \\
            | tail -1)
          if [ -z "\$LAST_GOOD" ]; then
            echo "ERROR: No previous image found to roll back to."
            exit 1
          fi
          echo "Rolling back to tag \${LAST_GOOD}"
          IMAGE_TAG=\${LAST_GOOD} docker-compose -f ${COMPOSE_FILE} up -d --no-deps api ui || true
        """
      }
    }
    always {
      script {
        sh 'docker image prune -f || true'
        sh """
          for img in "${API_IMAGE}" "${UI_IMAGE}"; do
            docker images "\$img" --format "{{.Tag}}" \\
              | grep -E "^[0-9]+\$" \\
              | sort -n \\
              | head -n -3 \\
              | xargs -r -I{} docker rmi "\$img:{}" || true
          done
        """
      }
    }
  }
}

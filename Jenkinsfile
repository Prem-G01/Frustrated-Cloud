pipeline {
  agent any

  environment {
    APP_NAME = "Frustrated-Cloud"
    // DOCKERHUB_USER = credentials('doc-pass-username')
    // DOCKERHUB_PASS = credentials('dockerhub-password')
  }

  stages {
    stage('Checkout') {
      steps {
        git branch: 'main', url: 'https://github.com/Prem-G01/frustrated-cloud.git'
      }
    }

    stage('Build Docker images') {
      steps {
        sh 'docker build -t frustrated-cloud-backend ./backend'
        sh 'docker build -t frustrated-cloud-frontend ./frontend'
      }
    }

    stage('Push to DockerHub') {
      steps {
        script {
          withCredentials([usernamePassword(credentialsId: 'dockerhub-username',
                                                      usernameVariable: 'USER',
                                                      passwordVariable: 'PASS')]) {
              def docker_user = USER
              def docker_pass = PASS

              sh """
                  echo "${docker_pass}" | docker login -u "${docker_user}" --password-stdin
                  docker tag frustrated-cloud-backend "${docker_user}/frustrated-cloud-backend:latest"
                  docker tag frustrated-cloud-frontend "${docker_user}/frustrated-cloud-frontend:latest"
                  docker push "${docker_user}/frustrated-cloud-backend:latest"
                  docker push "${docker_user}/frustrated-cloud-frontend:latest"
              """
          }
        }
      }
    }

    stage('Deploy') {
      steps {
        sshagent (credentials: ['web-serverSSH']) {
          sh '''
          ssh -o StrictHostKeyChecking=no ubuntu@3.110.162.216 << 'EOF'
          cd ~/frustrated-cloud
          git pull origin main
          docker compose down
          docker compose up -d --build
          EOF
          '''
        }
      }
    }
  }

  post {
    success {
      echo '✅ Deployment successful!'
    }
    failure {
      echo '❌ Deployment failed!'
    }
  }
}

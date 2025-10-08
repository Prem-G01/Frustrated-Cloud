pipeline {
  agent any

  environment {
    DOCKERHUB_USER = credentials('dockerhub-username')
    DOCKERHUB_PASS = credentials('dockerhub-password')
  }

  stages {
    stage('Checkout') {
      steps {
        git branch: 'main', url: 'https://github.com/yourusername/frustrated-cloud.git'
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
          sh "echo $DOCKERHUB_PASS | docker login -u $DOCKERHUB_USER --password-stdin"
          sh "docker tag frustrated-cloud-backend $DOCKERHUB_USER/frustrated-cloud-backend:latest"
          sh "docker tag frustrated-cloud-frontend $DOCKERHUB_USER/frustrated-cloud-frontend:latest"
          sh "docker push $DOCKERHUB_USER/frustrated-cloud-backend:latest"
          sh "docker push $DOCKERHUB_USER/frustrated-cloud-frontend:latest"
        }
      }
    }

    stage('Deploy') {
      steps {
        sshagent (credentials: ['webserver-ssh']) {
          sh '''
          ssh -o StrictHostKeyChecking=no user@your-webserver << 'EOF'
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

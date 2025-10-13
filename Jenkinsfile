pipeline {
  agent any

  environment {
    APP_NAME = "Frustrated-Cloud"
  }

  stages {
    stage('Checkout') {
      steps {
        git branch: 'master', url: 'https://github.com/Prem-G01/frustrated-cloud.git'
      }
    }

    stage('Build Docker images') {
      steps {
        sh 'docker build -t frustrated-cloud-backend ./backend'
        sh 'docker build -t frustrated-cloud-frontend ./frontend'
      }
    }

    stage('Deploy') {
      steps {
        sshagent (credentials: ['web-serverSSH']) {
          sh '''
          # Copy local Docker images to remote server
          scp <(docker save frustrated-cloud-backend) ubuntu@3.110.162.216:~/frustrated-cloud/frustrated-cloud-backend.tar
          scp <(docker save frustrated-cloud-frontend) ubuntu@3.110.162.216:~/frustrated-cloud/frustrated-cloud-frontend.tar

          # SSH into remote server and load images
          ssh -o StrictHostKeyChecking=no ubuntu@3.110.162.216 << 'EOF'
          cd ~/frustrated-cloud

          # Load Docker images
          docker load -i frustrated-cloud-backend.tar
          docker load -i frustrated-cloud-frontend.tar

          # Deploy using docker-compose
          docker compose down
          docker compose up -d
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

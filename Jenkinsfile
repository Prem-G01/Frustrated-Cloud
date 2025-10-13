pipeline {
    agent any

    environment {
        SSH_CRED = 'web-serverSSH'
        WEBAPP_IP = '3.110.162.216'
    }

    stages {
        stage('Checkout Code') {
            steps {
                echo "Stage-1"
                 script {
                     git branch: 'master', url: 'https://github.com/Prem-G01/Frustrated-Cloud.git'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                echo "Stage-2"
                sh '''
                docker build -t backend:latest ./backend
                docker build -t frontend:latest ./frontend
                '''
            }
        }

        stage('Deploy to EC2 WebApp Server') {
            steps {
                echo "Stage-3"
                sshagent (credentials: ["${SSH_CRED}"]) {
                    sh '''
                    scp -o StrictHostKeyChecking=no docker-compose.yml ubuntu@${WEBAPP_IP}:/home/ubuntu/
                    rsync -avz --delete -e "ssh -o StrictHostKeyChecking=no" ./backend ./frontend ubuntu@${WEBAPP_IP}:/home/ubuntu/
                    ssh -o StrictHostKeyChecking=no ubuntu@${WEBAPP_IP} "cd /home/ubuntu && docker-compose down && docker-compose up -d --build"
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "✅ Deployment completed successfully!"
        }
        failure {
            echo "❌ Deployment failed!"
        }
        always {
            echo "🔁 Pipeline finished."
        }
    }
}

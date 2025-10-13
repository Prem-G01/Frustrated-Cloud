pipeline {
    agent any

    environment {
        APP_NAME = "Frustrated-Cloud"
    }

    stages {
        stage('Checkout') {
            steps {
                // Jenkins just pulls Jenkinsfile for pipeline definition
                git branch: 'master', url: 'https://github.com/Prem-G01/Frustrated-Cloud.git'
            }
        }

        stage('Deploy on Docker Server') {
            steps {
                sshagent (credentials: ['web-serverSSH']) {
                    sh '''
                    ssh -o StrictHostKeyChecking=no ubuntu@YOUR_DOCKER_SERVER_IP << 'EOF'
                    
                    # Navigate to project folder on Docker server
                    cd ~/frustrated-cloud
                    
                    # Pull latest code from GitHub
                    git pull origin master
                    
                    # Build Docker images on Docker server
                    docker build -t frustrated-cloud-backend ./backend
                    docker build -t frustrated-cloud-frontend ./frontend
                    
                    # Deploy using Docker Compose
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

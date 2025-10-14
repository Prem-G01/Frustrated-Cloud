pipeline {
    agent any

    environment {
        APP_NAME = "Frustrated-Cloud"
        DOCKER_SERVER = "ubuntu@15.207.106.190"
    }

    stages {

        stage('Checkout Code') {
            steps {
                echo "Stage-1: Checking out source code"
                script {
                    git branch: 'master',
                        credentialsId: 'git-pat',
                        url: 'https://github.com/Prem-G01/Frustrated-Cloud.git'
                }
            }
        }
        stage('Build & Deploy on Remote Docker Server') {
            steps {
                echo "Stage-2: Building and deploying on remote Docker host"
                sshagent(['web-serverSSH']) {
                    sh """
                    ssh -o StrictHostKeyChecking=no ${DOCKER_SERVER} <<'EOF'
                    set -e
                    echo "🚀 Starting deployment on Docker host..."

                    # Ensure project directory exists
                    if [ ! -d "/home/ubuntu/Frustrated-Cloud" ]; then
                        echo "📦 Cloning repository..."
                        git clone https://github.com/Prem-G01/Frustrated-Cloud.git
                    fi

                    cd /home/ubuntu/Frustrated-Cloud
                    echo "🔄 Pulling latest changes..."
                    git pull origin master

                    echo "🧱 Building Docker containers..."
                    docker compose down || true
                    docker compose build

                    echo "🚀 Starting containers..."
                    docker compose up -d

                    echo "✅ Deployment completed successfully!"
                    EOF
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ Deployment pipeline executed successfully!"
        }
        failure {
            echo "❌ Deployment pipeline failed!"
        }
        always {
            echo "🔁 Pipeline finished."
        }
    }
}

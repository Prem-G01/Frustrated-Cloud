pipeline {
    agent any

    environment {
        APP_NAME = "Frustrated-Cloud"
        DOCKER_SERVER = "ubuntu@15.207.106.190"
        REPO_URL = "https://github.com/Prem-G01/Frustrated-Cloud.git"
    }

    stages {

        stage('Checkout Code') {
            steps {
                echo "Stage-1: Checking out source code"
                git branch: 'master',
                    credentialsId: 'git-pat',
                    url: "${REPO_URL}"
            }
        }

        stage('Build & Deploy on Remote Docker Server') {
            steps {
                echo "Stage-2: Building and deploying on remote Docker host"
                sshagent(['web-serverSSH']) {
                    // Fixed EOF issue: no indentation for the ending EOF
                    sh """ssh -o StrictHostKeyChecking=no ${DOCKER_SERVER} <<'EOF'
set -e

echo "🚀 Starting deployment on Docker host..."

# Ensure project directory exists
if [ ! -d "/home/ubuntu/${APP_NAME}" ]; then
    echo "📦 Cloning repository..."
    git clone ${REPO_URL} /home/ubuntu/${APP_NAME}
fi

cd /home/ubuntu/${APP_NAME}

echo "🔄 Pulling latest changes..."
git reset --hard
git clean -fd
git pull origin master

echo "🧱 Building Docker containers..."
docker compose down || true
docker compose build --pull

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

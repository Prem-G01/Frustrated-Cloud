stage('Deploy on Docker Server') {
    steps {
        sshagent (credentials: ['web-serverSSH']) {
            sh """
            ssh -o StrictHostKeyChecking=no ubuntu@3.110.162.216 << 'ENDSSH'

            # Create directory if missing
            mkdir -p ~/frustrated-cloud
            cd ~/frustrated-cloud

            # Copy files from Jenkins workspace to Docker server
            rsync -avz --exclude='.git' jenkins@52.66.96.236:/var/lib/jenkins/workspace/docker/backend ./backend
            rsync -avz --exclude='.git' jenkins@52.66.96.236:/var/lib/jenkins/workspace/docker/frontend ./frontend
            rsync -avz --exclude='.git' jenkins@52.66.96.236:/var/lib/jenkins/workspace/docker/docker-compose.yml ./

            # Build and run Docker containers with sudo
            sudo docker build -t frustrated-cloud-backend ./backend
            sudo docker build -t frustrated-cloud-frontend ./frontend

            sudo docker compose down
            sudo docker compose up -d --build

            ENDSSH
            """
        }
    }
}

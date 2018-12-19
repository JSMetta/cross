# cross - 业务管理系统

#### clone a specific branch in git
git clone -b branch remote_repo


cd /home/jsmtest/apps/cross
git pull origin docker-deploy-test
docker build -t jsmetta/cross .
docker run -d --name redis -p 6379:6379 redis

docker run --name mongodb --restart unless-stopped -v /home/mongo/data:/data/db -v home/mongo/backups:/backups -d mongo --smallfiles

docker run -d -p 8089:8080 --link redis:redis --name cross jsmetta/cross

docker run -it --link mongodb:mongo --rm mongo mongo --host mongo test

docker run -d --name nginx -p 80:80 --link cross:cross cross/nginx

docker-compose up --build

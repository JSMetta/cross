# cross - 业务管理系统

cd /home/jsmtest/apps/cross
git pull origin docker-deploy-test
docker build -t jsmetta/node .
docker run -d --name redis -p 6379:6379 redis

docker run --name mongodb --restart unless-stopped -v /home/mongo/data:/data/db -v home/mongo/backups:/backups -d mongo --smallfiles

docker run -d -p 8089:8080 --link redis:redis --name cross jsmetta/node

docker run -it --link mongodb:mongo --rm mongo mongo --host mongo test
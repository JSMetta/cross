# cross - 业务管理系统

## 系统安装
假设安装目录为: /home/jsmtest/apps

Clone cross：

```
git clone -b docker-deploy-test https://github.com/JSMetta/cross.git
cd cross
git pull origin docker-deploy-test

git clone -b vcross-1.0.1 https://github.com/JSMetta/VCross.git
cd VCross
git pull origin vcross-1.0.1

cd ..

docker-compose up --build -d

```
cross项目在/home/jsmtest/apps/cross中


## 常用命令

cd /home/jsmtest/apps/cross
git pull origin docker-deploy-test
docker build -t jsmetta/cross .
docker run -d --name redis -p 6379:6379 redis

docker run --name mongodb --restart unless-stopped -v /home/mongo/data:/data/db -v home/mongo/backups:/backups -d mongo --smallfiles

docker run -d -p 8089:8080 --link redis:redis --name cross jsmetta/cross

docker run -it --link mongodb:mongo --rm mongo mongo --host mongo test

docker run -d --name nginx -p 80:80 --link cross:cross cross/nginx

docker-compose up --build

#### Remove dangling images
docker images -f dangling=true
docker images purge
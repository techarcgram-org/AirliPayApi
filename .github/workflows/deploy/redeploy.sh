#!bin/sh

docker pull rg.fr-par.scw.cloud/apiv2/api-nest:latest
docker stop api-nest-5
docker system prune -f
docker run -d --env-file env.prod -p 8000:8000 --name=api-nest-5 rg.fr-par.scw.cloud/apiv2/api-nest:latest



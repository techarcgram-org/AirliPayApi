#!/bin/sh
# wait-for-postgres.sh

set -e
  
# host="$1"
# user="$2"
# shift
# shift
cmd="$@"

DOCKER_CONTAINER_NAME="db"
# PG_READY="pg_isready -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USERNAME"
PG_READY="docker exec $DOCKER_CONTAINER_NAME pg_isready"
# timeout 90s bash -c "until docker exec $DOCKER_CONTAINER_NAME pg_isready ; do sleep 5 ; done"
until $PSQL -c "select version()" &> /dev/null; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done
  
>&2 echo "Postgres is up - executing command"

exec $cmd
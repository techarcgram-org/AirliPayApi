#!/bin/sh
# wait-for-postgres.sh

set -e
  
# host="$1"
# user="$2"
# shift
# shift
cmd="$@"

DOCKER_CONTAINER_NAME="db"
PG_READY="docker exec db pg_isready"
# timeout 90s bash -c "until docker exec $DOCKER_CONTAINER_NAME pg_isready ; do sleep 5 ; done"
until $PG_READY; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done
  
>&2 echo "Postgres is up - executing command"

exec $cmd
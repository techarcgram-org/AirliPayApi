#!/bin/sh
# wait-for-postgres.sh

set -e
  
# host="$1"
# user="$2"
# shift
# shift
cmd="$@"

PG_READY="pg_isready -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USERNAME"
  
until $PG_READY; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done
  
>&2 echo "Postgres is up - executing command"

exec $cmd
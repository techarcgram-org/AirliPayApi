#!/bin/sh
# wait-for-postgres.sh

set -e
  
# host="$1"
# user="$2"
# shift
# shift
cmd="$@"

# Set the host and port to check
HOST="db"
PORT="5432"

# Function to check if port is open
check_port() {
  nc -z "$1" "$2" >/dev/null 2>&1
}

# Check if the port is open
until $PG_READY; do
  >&2 echo "Port $PORT on host $HOST is not yet ready to receive connections."
  sleep 1
done
  
>&2 echo "Postgres is up - executing command"

exec $cmd
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

until check_port "$HOST" "$PORT"; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done
  
>&2 echo "Postgres is up - executing command"

exec $cmd
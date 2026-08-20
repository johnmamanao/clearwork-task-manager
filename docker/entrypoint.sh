#!/bin/sh
set -eu

if [ -z "${APP_KEY:-}" ]; then
    APP_KEY="$(php artisan key:generate --show --no-ansi)"
    export APP_KEY
fi

attempt=1
max_attempts=30

until php artisan migrate --seed --force; do
    if [ "$attempt" -ge "$max_attempts" ]; then
        echo "Database was not ready after $max_attempts attempts." >&2
        exit 1
    fi

    echo "Database is not ready yet; retrying in 2 seconds ($attempt/$max_attempts)..." >&2
    attempt=$((attempt + 1))
    sleep 2
done

exec "$@"

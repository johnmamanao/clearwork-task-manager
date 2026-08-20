#!/bin/sh
set -eu

if [ -z "${APP_KEY:-}" ]; then
    APP_KEY="$(php artisan key:generate --show --no-ansi)"
    export APP_KEY
fi

php artisan migrate --seed --force

exec "$@"

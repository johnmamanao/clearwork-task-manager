FROM node:24-alpine AS frontend

WORKDIR /build

COPY package.json package-lock.json ./
RUN npm ci

COPY resources ./resources
COPY public ./public
COPY tsconfig.json vite.config.js ./
RUN npm run build


FROM composer:2 AS vendor

WORKDIR /build

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --no-scripts \
    --optimize-autoloader \
    --prefer-dist


FROM php:8.4-cli-bookworm AS application

RUN apt-get update \
    && apt-get install -y --no-install-recommends libonig-dev \
    && docker-php-ext-install -j"$(nproc)" mbstring pdo_mysql \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .
COPY --from=vendor /build/vendor ./vendor
COPY --from=frontend /build/public/build ./public/build

RUN composer dump-autoload --no-dev --no-scripts --optimize \
    && php artisan package:discover --ansi \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod +x docker/entrypoint.sh

USER www-data

EXPOSE 8000

ENTRYPOINT ["/var/www/html/docker/entrypoint.sh"]
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]

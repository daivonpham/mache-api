# ---- Build ----
FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json yarn.lock ./
RUN yarn config set registry https://registry.npmjs.org \
  && yarn config set network-timeout 600000 \
  && yarn install --frozen-lockfile

COPY . .
RUN yarn build

# ---- Production ----
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package.json yarn.lock ./
COPY --from=builder /app/node_modules ./node_modules
RUN yarn config set registry https://registry.npmjs.org \
  && yarn config set network-timeout 600000 \
  && yarn install --frozen-lockfile --production --prefer-offline

COPY --from=builder /app/dist ./dist

RUN mkdir -p storages/uploads

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["sh", "/entrypoint.sh"]

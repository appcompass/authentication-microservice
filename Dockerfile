FROM node:16 as builder
WORKDIR /app
COPY ./package*.json ./
RUN npm install -g npm
RUN npm ci
RUN npm rebuild bcrypt --build-from-source
COPY . .
RUN npm run build && npm prune --production

FROM node:16-stretch-slim
WORKDIR /app
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules /app/node_modules

ARG GIT_HASH=""
ARG GIT_TAG=""

ENV NODE_ENV=production
ENV GIT_HASH=${GIT_HASH}
ENV GIT_TAG=${GIT_TAG}

CMD ["npm", "run", "start:prod"]

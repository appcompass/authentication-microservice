FROM node:16 as builder
WORKDIR /app
COPY ./package*.json ./
RUN npm install npm node-gyp @nestjs/cli -g
RUN npm install --production
RUN npm rebuild bcrypt --build-from-source
COPY . .
RUN npm run build

FROM node:16-stretch-slim
WORKDIR /app
COPY --from=builder /app .

ARG GIT_HASH=""
ARG GIT_TAG=""

ENV GIT_HASH=${GIT_HASH}
ENV GIT_TAG=${GIT_TAG}

CMD ["npm", "run", "start:prod"]

FROM node:12 as builder
WORKDIR /app
COPY ./package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:12-alpine
WORKDIR /app
COPY --from=builder /app .

ARG SERVICE_PORT="3000"
ARG SERVICE_HOST="0.0.0.0"
ARG VAULT_ADDR="http://127.0.0.1:8200"
ARG VAULT_TOKEN=""

ENV SERVICE_PORT=${SERVICE_PORT}
ENV SERVICE_HOST=${SERVICE_HOST}
ENV VAULT_ADDR=${VAULT_ADDR}
ENV VAULT_TOKEN=${VAULT_TOKEN}

EXPOSE ${SERVICE_PORT}

CMD ["npm", "run", "start:prod"]

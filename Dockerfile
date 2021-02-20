FROM node:12 as builder
WORKDIR /app
COPY ./package*.json ./
RUN npm install
RUN npm rebuild bcrypt --build-from-source
COPY . .
RUN npm run build

FROM node:12-alpine
WORKDIR /app
COPY --from=builder /app .

ARG VAULT_ADDR="http://127.0.0.1:8200"
ARG VAULT_TOKEN=""

ENV VAULT_ADDR=${VAULT_ADDR}
ENV VAULT_TOKEN=${VAULT_TOKEN}

CMD ["npm", "run", "start:prod"]

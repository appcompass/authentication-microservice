#!/usr/bin/bash

SERVICE_HOST="${SERVICE_HOST:-}"
SERVICE_PORT="${SERVICE_PORT:-}"
SERVICE_NAME="${SERVICE_NAME:-}"

[[ -z "$SERVICE_HOST" ]] && { echo "SERVICE_HOST is empty" ; exit 1; }
[[ -z "$SERVICE_PORT" ]] && { echo "SERVICE_PORT is empty" ; exit 1; }
[[ -z "$SERVICE_NAME" ]] && { echo "SERVICE_NAME is empty" ; exit 1; }


CONTAINER_NAME=$SERVICE_NAME-service

vault policy write $SERVICE_NAME  "$(pwd)/../../service-policy.hcl"

vault kv put secret/service/shared/organizationsServiceHost value=$SERVICE_HOST
vault kv put secret/service/shared/organizationsServicePort value=$SERVICE_PORT
vault kv put secret/service/organizations/natsQueue value=$SERVICE_NAME


VAULT_TOKEN=$(vault token create -format=json -policy="$SERVICE_NAME" | jq -r ".auth.client_token")

# use pm2 to start service with VAULT_TOKEN and VAULT_URL
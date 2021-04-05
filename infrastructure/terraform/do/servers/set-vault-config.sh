#!/usr/bin/bash

echo $(jq -c --arg listener_addr '0.0.0.0:8200' \
  --argjson listener_tls_disable 1 \
  --arg api_addr 'http://127.0.0.1:8200' \
  --arg storage_s3_endpoint $DIGITALOCEAN_VAULT_ENDPOINT \
  --arg storage_s3_region $DIGITALOCEAN_VAULT_REGION \
  --arg storage_s3_bucket $DIGITALOCEAN_VAULT_BUCKET \
  --arg storage_s3_access_key $DIGITALOCEAN_SPACE_ACCESS_KEY \
  --arg storage_s3_secret_key $DIGITALOCEAN_SPACE_SECRET_KEY \
  --arg storage_s3_path 'vault/latest' \
  --argjson ui true \
  '. | .listener[0].tcp.address=$listener_addr |
  .listener[0].tcp.tls_disable=$listener_tls_disable |
  .api_addr=$ api_addr |
  .storage.s3.endpoint=$storage_s3_endpoint |
  .storage.s3.region=$storage_s3_region |
  .storage.s3.bucket=$storage_s3_bucket |
  .storage.s3.access_key=$storage_s3_access_key |
  .storage.s3.secret_key=$storage_s3_secret_key |
  .storage.s3.path=$storage_s3_path |
  .ui=$ui' <<<'{}') > ~/.config/vault-config.json

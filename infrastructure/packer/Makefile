.PHONY: help build
.DEFAULT_GOAL := help

help:
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

build-do: ## Using Packer, this builds the droplet snapshot image that is later used for deploying the service.
	packer build digital-ocean.pkr.hcl

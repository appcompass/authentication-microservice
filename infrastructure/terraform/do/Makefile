.PHONY: help build init plan apply destroy clean
.DEFAULT_GOAL := help

help:
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

init: ## Initialize a new or existing Terraform working directory by creating initial files, loading any remote state, downloading modules, etc.
	terraform init \
		-backend-config="access_key=${DIGITALOCEAN_SPACE_ACCESS_KEY}" \
		-backend-config="secret_key=${DIGITALOCEAN_SPACE_SECRET_KEY}" \
		-backend-config="key=${TERRAFORM_DIGITALOCEAN_SPACE_KEY}" \
		-backend-config="endpoint=${TERRAFORM_DIGITALOCEAN_ENDPOINT}" \
		-backend-config="region=${TERRAFORM_DIGITALOCEAN_REGION}" \
		-backend-config="bucket=${TERRAFORM_DIGITALOCEAN_BUCKET}"

check: ## Check if the input is formatted. Exit status will be 0 if all input is properly formatted and non-zero otherwise.
	terraform fmt -check

format: ## Rewrites all Terraform configuration files to a canonical format. Both configuration files (.tf) and variables files (.tfvars) are updated.
	terraform fmt

plan: ## Generates a speculative execution plan, showing what actions Terraform would take to apply the current configuration. This command will not actually perform the planned actions.
	terraform plan -out terraform.tfplan

apply: ## Creates or updates infrastructure according to Terraform configuration files in the current directory.
	terraform apply -auto-approve

destroy: ## Generate and apply a plan to destroy all resources managed by the given configuration and state.
	terraform plan -destroy -out terraform.tfplan
	terraform apply terraform.tfplan

clean: ## remove local terraform.tfplan and terraform.tfstate cleaning the local state.
	rm terraform.tfplan
	rm terraform.tfstate
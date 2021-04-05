terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "2.4.0"
    }
  }

  backend "s3" {
    skip_credentials_validation = true
    skip_metadata_api_check     = true
  }
}

provider "digitalocean" {}


data "digitalocean_ssh_keys" "keys" {
}

data "digitalocean_image" "vault_image" {
  name = "vault-server"
}

data "digitalocean_image" "nats_image" {
  name = "nats-server"
}

locals {
  ssh_keys = data.digitalocean_ssh_keys.keys.ssh_keys
}


resource "digitalocean_droplet" "nats_server" {
  name               = "nats-server"
  image              = data.digitalocean_image.nats_image.id
  size               = "s-1vcpu-1gb"
  private_networking = true
  region             = var.do_region
  ssh_keys           = local.ssh_keys.*.fingerprint
  user_data = templatefile("${path.module}/templates/server.tpl", {
    userdata_authorized_keys = jsonencode(local.ssh_keys.*.public_key)
  })

  connection {
    user        = "server"
    type        = "ssh"
    host        = self.ipv4_address
    private_key = file("~/.ssh/id_rsa")
    timeout     = "2m"
  }

  provisioner "remote-exec" {
    inline = [
      "sleep 5",
      "mkdir ~/.config",
      "sudo chown server -R ~/.config",
    ]
  }
}

resource "digitalocean_droplet" "vault_server" {
  name               = "vault-server"
  image              = data.digitalocean_image.vault_image.id
  size               = "s-1vcpu-1gb"
  private_networking = true
  region             = var.do_region
  ssh_keys           = local.ssh_keys.*.fingerprint
  user_data = templatefile("${path.module}/templates/server.tpl", {
    userdata_authorized_keys = jsonencode(local.ssh_keys.*.public_key)
  })

  connection {
    user        = "server"
    type        = "ssh"
    host        = self.ipv4_address
    private_key = file("~/.ssh/id_rsa")
    timeout     = "2m"
  }

  provisioner "file" {
    source      = "${path.module}/servers/set-vault-config.sh"
    destination = "/home/server/set-vault-config.sh"
  }

  provisioner "remote-exec" {
    inline = [
      "sleep 5",
      "mkdir ~/.config",
      "DIGITALOCEAN_SPACE_ACCESS_KEY=${var.space_access_key} DIGITALOCEAN_SPACE_SECRET_KEY=${var.space_secret_key} DIGITALOCEAN_VAULT_BUCKET=${var.vault_bucket} DIGITALOCEAN_VAULT_ENDPOINT=${var.vault_endpoint} DIGITALOCEAN_VAULT_REGION=${var.vault_region} bash /home/server/set-vault-config.sh",
      "sudo systemctl enable vault",
      "sudo systemctl start vault",
    ]
  }
}





resource "digitalocean_droplet" "service" {
  name     = var.service_instance_name
  image    = var.service_image
  region   = var.do_region
  size     = var.service_instance_size
  ssh_keys = local.ssh_keys.*.fingerprint
  user_data = templatefile("${path.module}/templates/service.tpl", {
    userdata_authorized_keys = jsonencode(local.ssh_keys.*.public_key)
  })

  connection {
    user        = "service"
    type        = "ssh"
    host        = self.ipv4_address
    private_key = file("~/.ssh/id_rsa")
    timeout     = "2m"
  }

  provisioner "file" {
    source      = "${path.module}/scripts"
    destination = "/home/service"
  }

  provisioner "remote-exec" {
    inline = [
      "sleep 5",
      "mkdir ~/.config",
      "sudo chown service -R ~/.config",
      "export VAULT_ADDR=http://${digitalocean_droplet.vault_server.ipv4_address_private}:8200/",
      "export NATS_URL=http://${digitalocean_droplet.nats_server.ipv4_address_private}:8200/",
      # "export VAULT_TOKEN=${var.vault_admin_token}",
      # "export DIGITALOCEAN_SPACE_ACCESS_KEY=${var.space_access_key}",
      # "export DIGITALOCEAN_SPACE_SECRET_KEY=${var.space_secret_key}",
      # "export AUTH_PASSPHRASE='${local.auth_passphrase}'",
      # "export AUTH_PUBLIC_PEM='${local.auth_public_pem}'",
      # "export AUTH_PRIVATE_PEM='${local.auth_private_pem}'",
      "sleep 1",
      "sudo chown service -R ~/scripts",
      "sudo chmod u+x ~/scripts/*"
    ]
  }
}

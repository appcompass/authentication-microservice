variable "do_token" {
  type =  string
}

variable "base_system_image" {
  type =  string
}

variable "region" {
  type =  string
}

variable "server_size" {
  type =  string
}

source "digitalocean" "vault-server" {
  droplet_name  = "vault-server"
  snapshot_name = "vault-server"
  ssh_username  = "root"
  api_token     = "${var.do_token}"
  image         = "${var.base_system_image}"
  region        = "${var.region}"
  size          = "${var.server_size}"
}

source "digitalocean" "nats-server" {
  droplet_name  = "nats-server"
  snapshot_name = "nats-server"
  ssh_username  = "root"
  api_token     = "${var.do_token}"
  image         = "${var.base_system_image}"
  region        = "${var.region}"
  size          = "${var.server_size}"
}


build {
  sources = ["source.digitalocean.vault-server"]

  provisioner "file"{
    sources = [
      "vault/vault.service"
    ]
    destination = "/etc/systemd/system/"
  }

  provisioner "shell" {
    inline = [
      "export DEBIAN_FRONTEND=noninteractive",
      "apt update",
      "apt -y install apt-transport-https ca-certificates curl software-properties-common",
      "curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -",
      "sudo apt-add-repository \"deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main\"",
      "apt update",
      "apt -y install vault jq"
    ]
  }
}

build {
  sources = ["source.digitalocean.nats-server"]

  provisioner "file"{
    sources = [
      "nats/nats.cfg"
    ]
    destination = "/tmp/"
  }

  provisioner "shell" {
    inline = [
      "export DEBIAN_FRONTEND=noninteractive",
      "apt update",
      "apt -y install apt-transport-https ca-certificates curl software-properties-common",
      "snap install nats",
      "mkdir /var/snap/nats/common/server",
      "mv /tmp/nats.cfg /var/snap/nats/common/server/",
      "snap start --enable nats"
    ]
  }
}

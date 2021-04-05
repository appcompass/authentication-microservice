#cloud-config

package_reboot_if_required: true
package_update: true

users:
  - name: server
    groups: sudo
    sudo: ['ALL=(ALL) NOPASSWD:ALL']
    shell: /bin/bash
    home: /home/server
    lock_passwd: true
    ssh-authorized-keys: ${userdata_authorized_keys}

disable_root: true

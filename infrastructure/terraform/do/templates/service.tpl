#cloud-config

package_reboot_if_required: true
package_update: true

users:
  - name: service
    groups: sudo
    sudo: ['ALL=(ALL) NOPASSWD:ALL']
    shell: /bin/bash
    home: /home/service
    lock_passwd: true
    ssh-authorized-keys: ${userdata_authorized_keys}

disable_root: true

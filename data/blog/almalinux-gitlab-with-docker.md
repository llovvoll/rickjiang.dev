---
title: Almalinux 9.2 利用 Docker 建置 GitLab
date: '2023-06-05'
lastmod: '2023-06-05'
tags: ['almalinux', 'docker']
draft: false
summary: 自從 centOS 改為 Stream 版本後就改使用 Almalinux 來替代 centOS，以下紀錄一下在 Almalinux 上使用 Docker 建置 GitLab
images: []
authors: ['default']
layout: PostLayout
---

<TOCInline toc={props.toc} asDisclosure />

![](/static/images/2022/02/14/gitlab-and-gitlab-runner-with-docker/gitlab_workflow_example.png)

自從 centOS 改為 Stream 版本後就改使用 Almalinux 來替代 centOS，以下紀錄一下在 Almalinux 上使用 Docker 建置 GitLab

# 1. Host 系統設定

```bash
# System Update
dnf check-update
dnf update
reboot

# Change HostName
hostnamectl set-hostname gitlab

# Timezone & Sync
timedatectl set-timezone Asia/Ho_Chi_Minh
dnf install chrony
systemctl enable chronyd
vi /etc/chrony.conf
  pool 0.asia.pool.ntp.org
  pool 1.asia.pool.ntp.org
  pool 2.vn.pool.ntp.org
systemctl restart chronyd

# SSH Key
chmod 700 /root/.ssh
chmod 600 /root/.ssh/authorized_keys

# Change SSH Port
vi /etc/ssh/sshd_config
  # 一開始不要急著就把 22 Port 改掉，可以先同時存在兩個 Port 號
  # 等確定 2222 Port 可以正常連線後再把 22 Port 拿掉，以免有問題無法連到主機
  Port 22
  Port 2222

# 如果出現 semanage : command not found, 可以使用 yum whatprovides semanage 查看需要安裝哪個包，安裝後即可
semanage port -a -t ssh_port_t -p tcp 2222
semanage port -l | grep ssh # ssh_port_t  tcp      2222, 22
systemctl restart sshd

# Firewall
firewall-cmd --zone=public --add-port 2222/tcp --permanent
firewall-cmd --reload
firewall-cmd --list-all-zones

# Install Docker
dnf config-manager --add-repo=https://download.docker.com/linux/centos/docker-ce.repo
dnf update
dnf install docker-ce docker-ce-cli containerd.io
docker --version
systemctl start docker
systemctl enable docker
```

# 2. GitLab

```yml:docker-compose.yml
services:
  gitlab:
    image: 'gitlab/gitlab-ce:latest'
    container_name: 'gitlab'
    restart: always
    hostname: 'gitlab'
    environment:
      GITLAB_OMNIBUS_CONFIG: |
        external_url 'https://gitlab'
        gitlab_rails['smtp_enable'] = true
        gitlab_rails['smtp_address'] = '192.168.23.6'
        gitlab_rails['smtp_port'] = 25
        gitlab_rails['smtp_user_name'] = 'gitlab@example.com'
        gitlab_rails['smtp_password'] = ''
        gitlab_rails['smtp_domain'] = 'example.com'
        gitlab_rails['smtp_authentication'] = 'login'
        gitlab_rails['smtp_enable_starttls_auto'] = false
        gitlab_rails['smtp_tls'] = false
        gitlab_rails['smtp_openssl_verify_mode'] = 'peer'
        gitlab_rails['gitlab_email_from'] = 'gitlab@example.com'
        gitlab_rails['gitlab_email_reply_to'] = 'noreply@example.com'
    ports:
      - '80:80'
      - '443:443'
      - '22:22'
    volumes:
      - './gitlab_data/config:/etc/gitlab'
      - './gitlab_data/logs:/var/log/gitlab'
      - './gitlab_data/data:/var/opt/gitlab'
```

```bash
# Get GitLab Root Default Password
docker exec -it gitlab sh
cat /etc/gitlab/initial_root_password

# SMTP Test
docker exec -it <container-id> gitlab-rails console
Notify.test_email('rick.jiang@example.com', 'Message Subject', 'Message Body').deliver_now
```

# 3. GitLab Runner

GitLab 起來後基本上 SSL 運作是正常的，但是當你要註冊 GitLab Runner 時會遇到 `x509: certificate relies on legacy Common Name field, use SANs instead` 的問題，需要重新自己簽一張憑證替換後就搞定了，可以參考上一篇文章[利用 Docker 建置 GitLab + GitLab Runner](https://www.rickjiang.dev/blog/gitlab-and-gitlab-runner-with-docker)

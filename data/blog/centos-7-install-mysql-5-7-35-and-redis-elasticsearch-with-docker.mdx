---
title: CentOS 7 安裝 MySQL 5.7.35 搭配 Docker 搭建 Redis 及 Elasticsearch
date: '2021-09-13'
lastmod: '2021-09-13'
tags: ['centos', 'docker']
draft: false
summary: 前陣子將公司安裝在 Windows Server 上的開發資料庫及快取服務搬移到 CentOS 上， Linux 系統還是比較穩定及節省效能，MySQL 採取直接安裝到系統上，Redis 及 Elasticsearch 則使用 Docker 快速搭建
images: []
authors: ['default']
layout: PostLayout
---

<TOCInline toc={props.toc} asDisclosure />

前陣子將公司安裝在 Windows Server 上的開發資料庫及快取服務搬移到 [CentOS](https://www.centos.org/) 上， Linux 系統還是比較穩定及節省效能，[MySQL](https://www.mysql.com/) 採取直接安裝到系統上，[Redis](https://redis.io/) 及 [Elasticsearch](https://www.elastic.co/) 則使用 Docker 快速搭建，以下為安裝及設定紀錄

## 1. CentOS 7 基本系統設定

```bash
# System Update
yum check-update
yum update
yum install epel-release
yum install dnf
yum update
reboot

# Change HostName
hostnamectl set-hostname db-localdomain

# Timezone & Sync
timedatectl set-timezone Asia/Taipei
dnf install chrony
vi /etc/chrony.conf
    server time.stdtime.gov.tw
    server tock.stdtime.gov.tw
    server watch.stdtime.gov.tw
    server time.stdtime.gov.tw
    server clock.stdtime.gov.tw
    server tick.stdtime.gov.tw
sudo systemctl restart chronyd
chronyc sources
chronyc -a makestep

# Network Settings
cd /etc/sysconfig/network-scripts/
ls
vi ifcfg-ens192
	BOOTPROTO=static
	IPADDR=192.168.1.1
	NETMASK=255.255.255.0
	GATEWAY=192.168.1.254
	DNS8=8.8.8.8
	ONBOOT=yes
ifup ens192

# Disable IPv6 Network Interface
vi /etc/sysctl.conf
net.ipv6.conf.all.disable_ipv6 = 1
net.ipv6.conf.default.disable_ipv6 = 1


# Disable SSH IPv6
vi /etc/ssh/sshd_config
# inet is ipv4 only, inet6 is ipv6 only
AddressFamily inet
```

## 2. 安裝 MySQL 5.7.35

```bash
sudo yum install wget
wget -i -c http://repo.mysql.com/mysql57-community-release-el7-10.noarch.rpm
yum -y install mysql57-community-release-el7-10.noarch.rpm
yum -y install mysql-community-server
sudo systemctl start mysqld.service
sudo systemctl status mysqld.service
sudo systemctl enable mysqld.service

grep "password" /var/log/mysqld.log # 預設密碼
sudo mysql_secure_installation # 執行 MySQL 內建的安全性設定腳本
Remove anonymous users? [Y/n]: Y
Disallow root login remotely? [Y/n]: N
Remove test database and access to it? [Y/n]: Y
Reload privilege tables now? [Y/n]: Y

mysql -u root -p
uninstall plugin validate_password; # 關閉密碼強度規則
# 允許 root 遠端存取，不建議這樣設定，正常來說應該依 Table 建立相依的帳號進行存取
# 這邊為開發用，所以就直接開 root 了
ALTER USER 'root'@'localhost' IDENTIFIED BY 'passowrd';
GRANT ALL PRIVILEGES ON *.* to root@'%' IDENTIFIED BY 'password' WITH GRANT OPTION;
FLUSH PRIVILEGES;
vi /etc/my.cnf
  bind-address = 0.0.0.0
sudo systemctl restart mysqld.service

# Firewall
firewall-cmd --permanent --add-port=3306/tcp
firewall-cmd --reload
```

## 3. 安裝 Docker & Docker-compose

```bash
yum install -y yum-utils
yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
yum update
yum install docker-ce docker-ce-cli containerd.io.
sudo systemctl enable docker
sudo systemctl start docker
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## 4. Redis

```bash
# Firewall
firewall-cmd --permanent --add-port=6379/tcp
firewall-cmd --reload
mkdir ~/Docker/Redis
cd ~/Docker/Redis
touch docker-compose.yml
vi docker-compost.yml
```

```yml:docker-compose.yml
services:
  redis:
    image: redis:latest
    container_name: redis
    environment:
      - TZ=Asia/Taipei
    volumes:
      - ./conf/redis.conf:/usr/local/etc/redis/redis.conf
      - ./redis-data/:/data:rw
    ports:
      - 6379:6379
    command: [ "redis-server", "/usr/local/etc/redis/redis.conf" ]
    restart: always
```

## 5. Elasticsearch

```bash
# Firewall
firewall-cmd --permanent --add-port=9200/tcp
firewall-cmd --reload
mkdir ~/Docker/Elasticsearch
cd ~/Docker/Elasticsearch
touch docker-compose.yml
vi docker-compost.yml
chmod 777 data
```

```yml:docker-compose.yml
services:
  elasticsearch:
    image: elasticsearch:6.8.6
    container_name: elasticsearch
    environment:
       - discovery.type=single-node
       - TZ=Asia/Taipei
       - LANG=en_US.UTF-8
    volumes:
       - ./data:/usr/share/elasticsearch/data
       - ./plugins:/usr/share/elasticsearch/plugins # 如果有額外的套件需要引入
    ports:
       - 9200:9200
    restart: always
```

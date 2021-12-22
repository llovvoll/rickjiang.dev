---
title: 開箱 RackNerd 年付 $10.88 美金 VPS & 利用 Docker 快速建置 VPN Server
date: '2021-12-22'
lastmod: '2021-12-22'
tags: ['vps', 'docker']
draft: false
summary: 之前也有買過幾台年付 $10 美金左右的 VPS，昨天在 VPS 論壇上看到有人分享 RackNerd 的黑色星期五促銷方案，一台 VPS 才年付 $10.88 美金 RackNerd 的評論也還不錯，所以就手滑下訂了 XD，買來當 Lab 很方便，價格非常便宜且不傷荷包
images: []
authors: ['default']
layout: PostLayout
---

之前也有買過幾台年付 \$10 美金左右的 VPS，昨天在 VPS 論壇上看到有人分享 [RackNerd](https://www.racknerd.com/) 的黑色星期五促銷方案，一台 VPS 才年付 \$10.88 美金，RackNerd 的評論也還不錯，所以就手滑下訂了 XD，買來當 Lab 很方便，價格非常便宜且不傷荷包

這台 VPS 我買的方案是 768MB 記憶體、1 CPU 核心、12 GB SSD、1 TB 月流量、1 Gbps 速率，機房位置在 San Jose, California(美國聖荷西)，網路延遲差不多都在 130ms 上下，速度上還不錯，至於主機穩定性就還有待觀察

這邊分享一下 RackNerd 黑色星期五的促銷方案，有需要的可以參考看看 (純分享，不是業配文

[↓ 購買連結 ↓](https://my.racknerd.com/aff.php?aff=1192&pid=587)

```
768 MB KVM VPS

1x vCPU Core
12 GB PURE SSD RAID-10 Storage
768 MB RAM
1000GB Monthly Premium Bandwidth
1Gbps Public Network Port
Full Root Admin Access
1 Dedicated IPv4 Address
KVM / SolusVM Control Panel - Reboot, Reinstall, Manage rDNS, & much more
Available in Multiple Locations
```

[↓ 購買連結 ↓](https://my.racknerd.com/aff.php?aff=1192&pid=588)

```
1GB KVM VPS

1x vCPU Core
25 GB PURE SSD RAID-10 Storage
1 GB RAM
4000GB Monthly Premium Bandwidth
1Gbps Public Network Port
Full Root Admin Access
1 Dedicated IPv4 Address
KVM / SolusVM Control Panel - Reboot, Reinstall, Manage rDNS, & much more
Available in Multiple Locations
```

接著如何快速建置 VPN Server 呢，這邊可以使用 [docker-ipsec-vpn-server](https://github.com/hwdsl2/docker-ipsec-vpn-server) 這個容器，這邊使用 docker-compose 來啟動

```yml:docker-compose.yml
version: '3'

services:
  vpn:
    image: hwdsl2/ipsec-vpn-server
    restart: always
    ports:
      - "500:500/udp"
      - "4500:4500/udp"
    privileged: true
    hostname: ipsec-vpn-server
    container_name: ipsec-vpn-server
```

啟動完成後即可使用指令 `docker logs ipsec-vpn-server` 來查看 IPsec 的 PSK 跟連線帳號及密碼

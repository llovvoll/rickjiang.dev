---
title: 利用 Docker 五分鐘內完成設定 Nginx 及 Let's Encrypt SSL 憑證
date: '2021-11-21'
lastmod: '2021-11-21'
tags: ['docker', 'nginx']
draft: false
summary: Nginx 是知名輕量級的 Web 伺服器及反向代理伺服器，Let's Encrypt 則是免費提供 SSL 憑證的服務商，那麼如何快速利用 Docker 來建置 Nginx Server 又自動更新套用 Let's Encrypt SSL 憑證，這邊就要先感謝善心人士，開發了自動化的腳本並開源出來
images: []
authors: ['default']
layout: PostLayout
---

[Nginx](https://www.nginx.com/) 是知名輕量級的 Web 伺服器及反向代理伺服器，[Let's Encrypt](https://letsencrypt.org/) 則是免費提供 SSL 憑證的服務商，那麼如何快速利用 Docker 來建置 Nginx Server 又自動更新套用 Let's Encrypt SSL 憑證，這邊就要先感謝善心人士，開發了自動化的腳本並開源出來，只要先把 [docker-nginx-certbot](https://github.com/JonasAlfredsson/docker-nginx-certbot) Clone 到本機裡

先修改 `examples` 裡的 `nginx-certbot.env`，將 `CERTBOT_EMAIL` 改成自己的信箱，接著建立一個 `user_conf.d` 資料夾把 `example_server.conf` 丟進資料夾後就能使用 `docker-compose up -d` 將 Nginx 容器執行起來

差不多等個三分鐘後，就能連到 `https://localhost`，如果沒有意外就會看到 `Let's Encrypt certificate successfully installed!` 的文字，那就代表已經完成憑證的取得及套用了，接著就能按自己的需求配置 Nginx 了，如果對設定不太熟的話可以試試看 [NGINXConfig](https://www.digitalocean.com/community/tools/nginx) 這個自動化的工具，只要按需勾選就會產生 Nginx 的配置檔內容

```env:nginx-certbot.env
# Required
CERTBOT_EMAIL=your@email.org

# Optional (Defaults)
STAGING=0
DHPARAM_SIZE=2048
RSA_KEY_SIZE=2048
ELLIPTIC_CURVE=secp256r1
USE_ECDSA=0
RENEWAL_INTERVAL=8d

# Advanced (Defaults)
DEBUG=0
USE_LOCAL_CA=0
```

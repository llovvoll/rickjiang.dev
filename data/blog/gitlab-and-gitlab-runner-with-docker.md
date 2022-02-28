---
title: 利用 Docker 建置 GitLab + GitLab Runner
date: '2022-02-14'
lastmod: '2022-02-14'
tags: ['docker', 'ci/cd', 'gitlab']
draft: false
summary: 繼上一篇文章中提到為團隊導入了 Jenkins 作為我們的 CI/CD 平台，這段時間整體架構都運作的非常順暢，也大大提升了團隊開發效率，但是為甚麼這次要替換掉既有架構呢？因爲目前所使用的版本控制平台為 Gitblit，雖然以版本控制的角度來看沒有甚麼太大的問題，但畢竟還是小眾平台且功能較為陽春，使用起來還是覺得少了點東西，所以之前就起了想要使用 GitLab 來整合 WorkFlow 的念頭，一來方便省事，二來 GitLab 比較多人使用，整體的安全性、維護性還是高一點，所以就趁剛好年後比較有時間來替換，這篇就紀錄一下如何使用 Docker 快速的建置內部 GitLab + GitLab Runner，還有自己在建置中所遇到的問題
images: []
authors: ['default']
layout: PostLayout
---

<TOCInline toc={props.toc} asDisclosure />

![](/static/images/2022/02/14/gitlab-and-gitlab-runner-with-docker/gitlab_workflow_example.png)

繼[上一篇](https://www.rickjiang.dev/blog/jenkins-with-docker)文章中提到為團隊導入了 Jenkins 作為我們的 CI/CD 平台，這段時間整體架構都運作的非常順暢，也大大提升了團隊開發效率，但是為甚麼這次要替換掉既有架構呢？因爲目前所使用的版本控制平台為 [Gitblit](http://gitblit.github.io/gitblit/) ，雖然以版本控制的角度來看沒有甚麼太大的問題，但畢竟還是小眾平台且功能較為陽春，使用起來還是覺得少了點東西，所以之前就起了想要使用 [GitLab](https://about.gitlab.com/) 來整合 WorkFlow 的念頭，一來方便省事，二來 GitLab 比較多人使用，整體的安全性、維護性還是高一點，所以就趁剛好年後比較有時間來替換，這篇就紀錄一下如何使用 Docker 快速的建置內部 GitLab + [GitLab Runner](https://docs.gitlab.com/runner/)，還有自己在建置中所遇到的問題

# 1. Host 系統設定

首先 Host 的系統是使用 Centos 7，基本的系統設定可以參考[這篇](https://www.rickjiang.dev/blog/centos-7-install-mysql-5-7-35-and-redis-elasticsearch-with-docker)文章，其中因爲 GitLab 會使用到 SSH，但是預設 22 Port 會被系統佔用，所以為了與 GitLab 使用 SSH 互動時的順暢度，這邊就將 Host 的 SSH Port 改掉，將 22 Port 留給 GitLab 使用，修改方式如下

```bash
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
firewall-cmd --add-port=2222/tcp --permanent
firewall-cmd --reload
```

接著就可以使用 `ssh -p 2222 root@server` 測試看看，如果可以就完成系統基本設定

# 2. GitLab

系統基本設定及 Docker 都搞定後就可以用 Docker Compose 來建置了，GitLab [官方文件](https://docs.gitlab.com/ee/install/docker.html#install-gitlab-using-docker-compose)有提供基本的範例可以參考

```yml:docker-compose.yml
web:
  image: 'gitlab/gitlab-ce:latest'
  container_name: 'gitlab'
  restart: always
  hostname: 'gitlab'
  environment:
    GITLAB_OMNIBUS_CONFIG: |
      external_url 'https://gitlab'
  ports:
    - '80:80'
    - '443:443'
    - '22:22'
  volumes:
    - './gitlab_data/config:/etc/gitlab'
    - './gitlab_data/logs:/var/log/gitlab'
    - './gitlab_data/data:/var/opt/gitlab'
```

# 3. 重簽 SSL 憑證

GitLab 起來後基本上 SSL 運作是正常的，但是當你要註冊 GitLab Runner 時會遇到 `x509: certificate relies on legacy Common Name field, use SANs instead` 的問題，原本在這個問題卡了一下，後來重新自己簽一張憑證替換後就搞定了

```ssl.conf
[req]
prompt = no
default_md = sha256
default_bits = 2048
distinguished_name = dn
x509_extensions = v3_req

[dn]
[req]
prompt = no
default_md = sha256
default_bits = 2048
distinguished_name = dn
x509_extensions = v3_req

[dn]
C = TW
ST = Taiwan
L = Taipei
O = gitlab Inc.
OU = IT Department
emailAddress = <YOUR EMAIL>
CN = gitlab

[v3_req]
subjectAltName = @alt_names

[alt_names]
DNS.1 = gitlab
DNS.2 = *.gitlab
IP.1  = <YOUR SERVER IP>
```

接著簽署憑證 `openssl req -x509 -new -nodes -sha256 -utf8 -days 3650 -newkey rsa:2048 -keyo ut gitlab.key -out gitlab.crt -config ssl.conf`，將產生出來的憑證跟私鑰替換到 `gitlab_data/config/ssl` 重啟容器就可以了

# 4. GitLab Runner

啟動容器之前要記得將剛剛重簽署的 `gitlab.crt` 憑證放到 `/config/certs` 中

```yml:docker-compose.yml
services:
  gitlab-runner:
    image: gitlab/gitlab-runner:latest
    container_name: "gitlab_runner"
    environment:
      - CI_SERVER_URL=https://gitlab/
    extra_hosts:
      - "gitlab:<YOUR SERVER IP>"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./config:/etc/gitlab-runner
    restart: always

```

容器起來後就可以 `docker exec -it gitlab_runner bash` 進到容器中將 GitLab Runner 註冊到 GitLab

```bash
gitlab-runner register --tls-ca-file /etc/gitlab-runner/certs/gitlab.crt
```

以上簡簡單單就能完成自行架設內部的 GitLab + GitLab Runner 囉 🥳

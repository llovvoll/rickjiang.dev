---
title: 利用 Docker 快速建置 CI/CD 平台 Jenkins
date: '2021-09-02'
lastmod: '2021-09-02'
tags: ['docker', 'ci/cd', 'jenkins']
draft: false
summary: 最近協助團隊導入了 Jenkins 作為我們的 CI/CD 平台，在我還沒有來到這個團隊時，每當前後端版本有更新時總是都得人工在本機進行編譯後遠端連線至伺服器進行關閉現有服務、替換新程式、開啟服務，其中許多的人工行為非常耗時且枯燥，光是部署的時間成本可能就得耗費不少並且可能有人為失誤的可能性，所以盡可能的將這些交給自動化處理
images: []
authors: ['default']
layout: PostLayout
---

![](/static/images/2021/09/02/jenkins-with-docker/cover_CICD-Overview.png)

最近協助團隊導入了 [Jenkins](https://www.jenkins.io/) 作為我們的 CI/CD 平台，在我還沒有來到這個團隊時，每當前後端版本有更新時總是都得人工在本機進行編譯後遠端連線至伺服器進行關閉現有服務、替換新程式、開啟服務，其中許多的人工行為非常耗時且枯燥，光是部署的時間成本可能就得耗費不少並且可能有人為失誤的可能性，所以盡可能的將這些交給自動化處理

CI/CD 的資訊在網路上都有許多不錯的分享，這邊簡單重點 CI/CD 主要目的如下

- 降低人為疏失風險
- 減少人工手動的反覆步驟
- 進行版本控管制
- 增加系統一致性與透明化
- 減少團隊 Loading

如果想了解更多 CI/CD 的資訊可以看看其它網路上的分享，本篇文章著重於如何快速建置

Jenkins 本身有提供 [Docker Image](https://hub.docker.com/_/jenkins)，所以我們可以編寫 Docker Compose 快速將 Jenkins 建置起來

```yml:docker-compose.yml
version: '3.7'
services:
  jenkins:
    image: jenkins/jenkins
    container_name: jenkins
    privileged: true
    user: root
    environment:
      - TZ=Asia/Taipei
      - JAVA_OPTS=-Duser.timezone=Asia/Taipei
    volumes:
      - ./jenkins_data:/var/jenkins_home # 數據持久化
      - /var/run/docker.sock:/var/run/docker.sock # 掛載本機 Docker 到 Jenkins 容器中使用
    networks:
      - jenkins
    ports:
      - 8080:8080
      - 50000:50000
    restart: always
networks:
  jenkins:
```

只要建立 `docker-compose.yml` 後並打開 Terminal 到同層目錄下指令即可完成建置，接著就可以打開瀏覽器連到 `http://localhost:8080/` 開始享受 Jenkins 的~~坑~~了 

```bash
docker-compose up -d
```

## References

- [導入 CI/CD 的第一步 | Complete Think](https://rickhw.github.io/2018/03/20/DevOps/First-Step-To-CICD/)
- [Day12 什麼是 CICD - iT 邦幫忙::一起幫忙解決難題，拯救 IT 人的一天](https://ithelp.ithome.com.tw/articles/10219083)

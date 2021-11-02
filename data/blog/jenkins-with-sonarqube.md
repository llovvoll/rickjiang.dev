---
title: 利用 Docker 快速建置 SonarQube 程式碼品質分析平台並與 Jenkins 整合
date: '2021-10-06'
lastmod: '2021-10-06'
tags: ['docker', 'ci/cd', 'jenkins', 'sonarqube']
draft: false
summary: 前幾篇文章我們使用 Docker 建立了 CI/CD 平台 Jenkins，並做到了簡單的 Node.js 專案的自動化編譯及佈署，但是當一個專案逐漸壯大或開發人員增加時，總會造成專案品質的問題，因為每個人技術或是觀念習慣不同所導致程式碼的變化，這時除了做 Code Review 之外，還能藉由 SonarQube 這套開源的程式碼品質分析工具來對我們的專案進行分析找出隱藏在層層程式碼中的問題
images: []
authors: ['default']
layout: PostLayout
---

<TOCInline toc={props.toc} asDisclosure />

前幾篇文章我們使用 Docker 建立了 CI/CD 平台 Jenkins，並做到了簡單的 Node.js 專案的自動化編譯及佈署，但是當一個專案逐漸壯大或開發人員增加時，總會造成專案品質的問題，因為每個人技術或是觀念習慣不同所導致程式碼的變化，這時除了做 Code Review 之外，還能藉由 [SonarQube](https://www.sonarqube.org/) 這套開源的程式碼品質分析工具來對我們的專案進行分析找出隱藏在層層程式碼中的問題

# 1. 建置 SonarQube

老樣子使用 Docker 快速建置我們的 SonarQube 平台

```yml:docker-compose.yml
services:
  sonarqube:
    image: sonarqube:8.9.2-community
    depends_on:
      - db
    ports:
      - "9000:9000"
    networks:
      - sonarnet
    environment:
      SONAR_JDBC_URL: jdbc:postgresql://db:5432/sonar
      SONAR_JDBC_USERNAME: sonar
      SONAR_JDBC_PASSWORD: sonar
    volumes:
      - sonarqube_data:/opt/sonarqube/data
      - sonarqube_extensions:/opt/sonarqube/extensions
      - sonarqube_logs:/opt/sonarqube/logs
      - sonarqube_temp:/opt/sonarqube/temp

  db:
    image: postgres
    ports:
      - "5432:5432"
    networks:
      - sonarnet
    environment:
      POSTGRES_USER: sonar
      POSTGRES_PASSWORD: sonar
    volumes:
      - postgresql:/var/lib/postgresql
      - postgresql_data:/var/lib/postgresql/data

networks:
  sonarnet:
    driver: bridge

volumes:
  sonarqube_data:
  sonarqube_extensions:
  sonarqube_logs:
  sonarqube_temp:
  postgresql:
  postgresql_data:
```

這邊要注意一點，如果發現 SonarQube 運行不起來並報錯 `Max virtual memory areas vm.max_map_count [65530] is too low, increase to at least [262144]`，Linux 必須在 `/etc/sysctl.conf` 加入 `vm.max_map_count = 262144` 重新開機後應該就可以正常運行了，如果是 Windows 的話則可以參考這篇文章 [vm.max_map_count in docker-desktop distro for WSL2 #5202](https://github.com/docker/for-win/issues/5202)

運行起來後就可以連結 [http://localhost:9000](http://localhost:9000) 進到 SonarQube，預設的帳號密碼都是 `admin`，登入正常的話 SonarQube 就建置完成囉

# 2. 建立 Token

![](/static/images/2021/10/06/jenkins-with-sonarqube/001.png)

可以點擊 [http://localhost:9000/account/security](http://localhost:9000/account/security/) 並在 `Generate Tokens` 輸入 Token 的名稱並按 `Generate`，這邊產生的 Token 要先保存起來備用，因為畫面重新整理後就看不到了，忘記的話就得再重新產生一組

# 3. 建立專案

![](/static/images/2021/10/06/jenkins-with-sonarqube/002.png)

![](/static/images/2021/10/06/jenkins-with-sonarqube/003.png)

回到 SonarQube 首頁點擊 `Add Project` 選擇 `Manually`，接著輸入 `Project key` 及 `Display name` 後點擊 Set Up，在 `Provide a token` 的地方選擇 `Use existing token` 並貼上我們剛剛產生的 token 後按 `Continue`，完成這個步驟後就先將畫面停留在這邊，可以開新分頁完成 Jenkins 整合的部分

# 4. 安裝 SonarQube Scanner for Jenkins Plugin

這邊安裝 Plugin 的方式跟安裝 Node.js 一樣，如果忘記怎麼安裝的話可以參考上次的文章 [利用 Jenkins 簡單實現前端 Node.js 專案自動化部署](https://www.rickjiang.dev/blog/jenkins-with-nodejs)

![](/static/images/2021/10/06/jenkins-with-sonarqube/004.png)

安裝完畢後到 Manage Jenkins -> Global Tool Configuration 設定 SonarQube Scanner 版本

# 5. 設定 SonarQube Token

![](/static/images/2021/10/06/jenkins-with-sonarqube/005.png)

在 Jenkins 頁面點擊 Manage Jenkins -> Mange Credentials -> Add Credentials 選擇 `Secret text` 並把我們剛剛在 SonarQube 所產生的 Token 並貼到 Secret 上按 OK 保存

# 6. 設定 SonarQube Instance Server

![](/static/images/2021/10/06/jenkins-with-sonarqube/006.png)

在 Jenkins 頁面點擊 Manage Jenkins -> Configure System -> SonarQube servers，這邊輸入 SonarQube Server `Name` 及 `URL` 並選擇連接 token 後按 Save 保存設定

# 7. 加入 SonarQube Scan 任務

![](/static/images/2021/10/06/jenkins-with-sonarqube/007.png)

這邊以 Node.js 的專案為例，在 `Add Build step` 中選擇 `Execute SonarQube Scanner`，在 `Analysis properties` 的地方貼入以下參數，實際參數還是依專案的不同有所差異，詳細可以參考官方的設定文件 [SonarScanner | SonarQube Docs](https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/)

```
sonar.projectKey=test
sonar.projectName=test
sonar.projectVersion=1.0
sonar.sourceEncoding=UTF-8
sonar.modules=javascript-module

javascript-module.sonar.projectName=JavaScript Module
javascript-module.sonar.language=js
javascript-module.sonar.sources=.
javascript-module.sonar.projectBaseDir=src
```

# 8. 分析結果

![](/static/images/2021/10/06/jenkins-with-sonarqube/008.png)

如果上面的步驟都沒有錯誤的話，正常來說在 Jenkins 的構建 Console 中就會看到掃描分析的相關紀錄，此時就可以回到 SonarQube 的頁面應該就會看到分析的結果了，上圖僅供參考....絕不是我的專案 XD

## References

- [SonarQube 程式碼品質分析工具使用教學 - Office 指南](https://officeguide.cc/sonarqube-code-quality-security-review-tool-tutorial-examples/)
- [CI/CD 實現 - Sonarqube 篇 - 技術雜記 Technology Notes - Jack Yu | 傑克](https://yu-jack.github.io/2021/01/17/ci-cd-sonarqube/)

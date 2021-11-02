---
title: 利用 Jenkins 簡單實現前端 Node.js 專案自動化部署
date: '2021-09-04'
lastmod: '2021-09-04'
tags: ['ci/cd', 'jenkins']
draft: false
summary: 上一篇講到了如何使用 Docker 快速建置團隊的 CI/CD 平台 Jenkins，這篇就來簡單介紹如何快速的建立自動化部署我們的前端專案
images: []
authors: ['default']
layout: PostSimple
---

<TOCInline toc={props.toc} asDisclosure />

![](/static/images/2021/09/04/jenkins-with-nodejs/jenkins-with-nodejs-workflow.png)

上一篇講到了如何使用 Docker 快速建置團隊的 CI/CD 平台 Jenkins，這篇就來介紹如何快速的建立自動化部署我們的前端專案，主要的步驟如下，廢話不多說 Just Do It！

1. 建立 Jenkins SSH key
2. 安裝 Node.js Plugin
3. 安裝 Publish Over SSH Plugin
4. 建立 FreeStyle Project
5. 輪詢 GitHub Repository
6. 設定 WorkFlow
7. ~~翹腳髯嘴鬚~~

# 1. 建立 Jenkins SSH key

首先連進我們的 Jenkins 容器中並建立我們的 SSH key 並取得公鑰設定到 GitHub 即可

```bash
docker exec -it jenkins bash
cd ~ && pwd # /var/jenkins_home
ssh-keygen
cat ./.ssh/id_rsa.pub # Here is your SSH Public Key
```

# 2. 安裝 Node.js Plugin

![](/static/images/2021/09/04/jenkins-with-nodejs/001.png)

![](/static/images/2021/09/04/jenkins-with-nodejs/002.png)

![](/static/images/2021/09/04/jenkins-with-nodejs/003.png)

![](/static/images/2021/09/04/jenkins-with-nodejs/004.png)

這邊可以依據自己的專案來選擇所需要的 Node.js 版本來進行編譯

# 3. 安裝 Publish Over SSH Plugin

![](/static/images/2021/09/04/jenkins-with-nodejs/005.png)

Publish Over SSH 的安裝方式與安裝 Node.js 一樣，所以這邊不特別附圖，直接從設定被部署端的 Server 連接資訊開始，這邊起一台 AWS EC2 當作被部署端

![](/static/images/2021/09/04/jenkins-with-nodejs/006.png)

![](/static/images/2021/09/04/jenkins-with-nodejs/007.png)

這邊填寫 Server 相關資訊及 SSH key，記得是將私鑰貼上來而不是公鑰

![](/static/images/2021/09/04/jenkins-with-nodejs/008.png)

填寫完畢後點擊 `Test Configuration` 如果出現 `Success` 就代表連線沒有問題，如果失敗就得檢查一下哪邊出錯，沒問題後記得點擊 Save

# 4. 建立 FreeStyle Project

![](/static/images/2021/09/04/jenkins-with-nodejs/009.png)

輸入專案名稱選擇 `FreeStyle Project` 按下 `OK` 即可新建立專案

# 5. 輪詢 GitHub Repository

![](/static/images/2021/09/04/jenkins-with-nodejs/010.png)

![](/static/images/2021/09/04/jenkins-with-nodejs/011.png)

![](/static/images/2021/09/04/jenkins-with-nodejs/012.png)

這邊勾選 `Poll SCM` 使用輪詢的方式去確認 Repository 是否有異動，正常來說可以搭配一些 WebHook 機制，但文章避免複雜化，所以先採取主動輪詢的方式，這邊所輸入的值代表`每週一到週五`，`上午八點至下午八點`之間`每兩分鐘`確認一次

# 6. 設定 WorkFlow

![](/static/images/2021/09/04/jenkins-with-nodejs/013.png)

`Build Environment` 如圖勾選，並選擇我們剛剛建立的 Node.js 版本，在 Build 的地方選擇增加 `Execute shell` 並打上我們所需要的編譯指令

![](/static/images/2021/09/04/jenkins-with-nodejs/014.png)

`Post-build Actions` 我們新增一個 `Send build artifacts over SSH` 流程

接著在 SSH Server 選擇我們剛剛所建立的 AWS EC2 實例主機，並將所編譯後的 `dist` 目錄內的所有檔案 利用 SSH 傳送到 `/www/html` 中， `Remove prefix` 輸入 `dist` 的作用為刪除 `/dist/` 這個  前綴，不然傳送到 Server 會變成在 `/www/html/dist` 中

> SSH 預設會在 `user_home`，所以我們可以建立軟連結到 `/var/www`

```bash
ln -s /var/www www
```

![](/static/images/2021/09/04/jenkins-with-nodejs/015.png)

上述設定完成後就可以保存  點擊 `Build Now` 開始進行自動化構建，可以在 `Console Output` 看到所運作的狀況，如果看到 `Finished: SUCCESS` 就代表已經順利完成了，連線到我們的站台看到成功部署就可以~~翹腳髯嘴鬚~~了

> 如果發生 `ERROR: Exception when publishing, exception message [Permission denied]` 錯誤，代表可能資料夾沒有權限，此時可以對資料夾開放權限，例如以下指令

```bash
sudo chmod a+rwx /var/www/html/
```

![](/static/images/2021/09/04/jenkins-with-nodejs/016.png)

這篇文章所提到的都是很基礎的應用，Jenkins 還有很多更強大的應用及設定，不過要學習的東西也很多，歡迎進入到 Jenkins 的~~坑~~

## References

- [CI/CD Pipeline for a NodeJS Application with Jenkins | by Prashant Bhatasana | AppGambit | Medium](https://medium.com/appgambit/ci-cd-pipeline-for-a-nodejs-application-with-jenkins-fa3cc7fad13a)

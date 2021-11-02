---
title: Jenkins 透過 SSH 自動化佈署 Maven 多模組 Jar 檔至 Windows
date: '2021-10-28'
lastmod: '2021-10-28'
tags: ['ci/cd', 'jenkins']
draft: false
summary: 最近將公司內部的一個 Maven 專案利用 Jenkins 做到自動化編譯及佈署到遠端 Windows 伺服器中，搭配 Batch Script 自動替換新版 Jar 檔，關閉舊版程式並執行新版程式，達成全自動化作業，但因為對 Java 不太熟，雖然實現方式非常土炮，但還是比之前人工更版方便很多了，之後可以繼續研究看看是否有更好的解決方案
images: []
authors: ['default']
layout: PostLayout
---

<TOCInline toc={props.toc} asDisclosure />

最近將公司內部的一個 Maven 專案利用 Jenkins 做到自動化編譯及佈署到遠端 Windows 伺服器中，搭配 Batch Script 自動替換新版 Jar 檔，關閉舊版程式並執行新版程式，達成全自動化作業，但因為對 Java 不太熟，雖然實現方式非常土炮，但還是比之前人工更版方便很多了，之後可以繼續研究看看是否有更好的解決方案

# 踩坑紀錄

這個專案其實已經運行了一段時間，這段時間我只有完成到自動化編譯並利用 SSH 推送已編譯好的檔案到目標伺服器，要更版的時候再人工 RDP 到伺服器中進行手動更版，期間有嘗試過不少的方法，寫了 Script 做到了自動替換檔案並執行，但會遇到不同 RDP Session 查看不到 CMD 運行視窗標題的狀況，所以無法準確找到各模組的執行序來進行關閉重啟的動作，所以作罷，但昨天在網路上翻到一篇文章 [windows、linux 如何後臺運行 jar（而且顯示進程名）](http://hk.javashuo.com/article/p-anasigrr-kr.html)，發現可以更名 javaw.exe 再搭配 -jar 參數來執行就可以在工作管理員看到各模組名稱的 .exe 執行序，看完後馬上讓我靈光一閃又茅塞頓開，馬上就覺得終於有解了，但事情怎麼可能這麼順利，又讓我踩了個坑....就是如果利用 SSH 來執行 Script 時，當 SSH Session 結束時也會關閉自己所執行過的程式....所以又在這邊卡住了，網路上查過不少資料也沒有得到解決的方式，所以我想到更土炮的方式...使用工作排程器，讓 Script 每兩分鐘確認一次是否有新版的 Jar 檔，如果有的話就執行關閉舊版程式 -> 更名舊版 Jar 檔 -> 移動新版 Jar 檔 -> 執行程式，雖然方法蠢了一點，但還是有達到自動化的目的，其實有很簡單的解決方式在 Linux 系統上，但無奈目前這台伺服器僅能使用 Windows，所以才只能用這種方式才達到目標，也可能是我瞭解還不夠，可能也有更好的解決方案在 Windows 上，以下簡單紀錄一下主要步驟

# 1. 自動化編譯

Jenkins 必須先安裝 [Pipeline Maven Integration Plugin](https://plugins.jenkins.io/pipeline-maven/)，安裝及設定方式可以參考之前的文章[利用 Jenkins 簡單實現前端 Node.js 專案自動化部署](https://www.rickjiang.dev/blog/jenkins-with-nodejs)，接著建立一個 `Maven project`，並在 `build` 新增一個 `Invoke top-level Maven targets` 步驟並選擇版本及輸入指令及 POM 資訊

![](/static/images/2021/10/28/jenkins-deploy-mulit-module-jar-to-windows/001.png)

# 2. SSH 傳送檔案

這邊只是很單純的將已編譯後的 Jar 檔及壓縮檔傳送到目標伺服器中

![](/static/images/2021/10/28/jenkins-deploy-mulit-module-jar-to-windows/002.png)

# 3. javaw.exe 更名成所需的名稱

複製 javaw.exe 並更名貼到各個需要執行的模組資料夾中，以方便之後的 Script 執行

![](/static/images/2021/10/28/jenkins-deploy-mulit-module-jar-to-windows/003.png)

# 4. 建立工作排程器

這邊我將 Script 每兩分鐘執行一次

![](/static/images/2021/10/28/jenkins-deploy-mulit-module-jar-to-windows/004.png)

# 5. Batch Script

這個 Script 算是整個流程中最靈魂的角色了吧 XD，好在以前當 MIS 時就喜歡寫些 Batch 來自動化一些繁瑣的流程，重點的部分加上註解說明

```batch
@Echo Off
Title Jenkins Deploy Tool
Color 03
Mode con cols=60 lines=25

REM Variable
Set PROJECT_ROOT_PATH=C:\crm\package_localhost\test_package
Set EXPORT_PATH=%PROJECT_ROOT_PATH%\export
Set ModuleArray[0]=admin
Set ModuleArray[1]=authorization
Set ModuleArray[2]=bi
Set ModuleArray[3]=crm
Set ModuleArray[4]=examine
Set ModuleArray[5]=gateway
Set ModuleArray[6]=hrm
Set ModuleArray[7]=job
Set ModuleArray[8]=jxc
Set ModuleArray[9]=km
Set ModuleArray[10]=oa
Set ModuleArray[11]=work
Set CurrentModule=NULL
Set ArrayIndex=0

setlocal enabledelayedexpansion
:Loop
if defined ModuleArray[%ArrayIndex%] (
    Set CurrentModule=!ModuleArray[%ArrayIndex%]!
    Call :Compare
    Goto :Loop
)

:Compare
Set OldJarPath=%PROJECT_ROOT_PATH%\%CurrentModule%\%CurrentModule%-0.0.1-SNAPSHOT.jar
Set NewJarPath=%PROJECT_ROOT_PATH%\export\%CurrentModule%\target\%CurrentModule%-0.0.1-SNAPSHOT.jar
REM 利用 fc 指令來判斷檔案是否相同，不相同視為有新版並執行 Run function，反之不做任何動作
fc %OldJarPath% %NewJarPath% > NUL && Echo %CurrentModule% unchanged, nothing to do || Call :Run
Set /a "ArrayIndex+=1"
Goto :eof

:Run
if exist %NewJarPath% (
    if exist %OldJarPath% (
        if exist %PROJECT_ROOT_PATH%\%CurrentModule%\%CurrentModule%-0.0.1-SNAPSHOT-bak.jar (
            Del %PROJECT_ROOT_PATH%\%CurrentModule%\%CurrentModule%-0.0.1-SNAPSHOT-bak.jar /S /Q
        )
        REM 如果當前模組已經執行就關閉
        Tasklist | find /i "%CurrentModule%.exe" && Taskkill /F /IM %CurrentModule%.exe || Echo %CurrentModule% not running
        Timeout 2
        REM 更名舊有 Jar 檔
        Ren %OldJarPath% %CurrentModule%-0.0.1-SNAPSHOT-bak.jar
    )
    REM 複製新的 Jar 檔到當前模組資料夾
    Echo f | Xcopy /F /Y %NewJarPath% %OldJarPath%
    Timeout 2
    CD %PROJECT_ROOT_PATH%\%CurrentModule%
    REM 執行當前模組名稱.exe 並用 -jar 參數指定執行當前模組的 Jar 檔
    start %CurrentModule% -jar %PROJECT_ROOT_PATH%\%CurrentModule%\%CurrentModule%-0.0.1-SNAPSHOT.jar
    Timeout 5
    CD %PROJECT_ROOT_PATH%
) else (
    Echo Can't find %CurrentModule% jar file, skip the module
)
Goto:Eof
```

# 6. 結論

雖然完成了自動化的目標，但是我覺得實現方式真的髒了一點，有很多優化的地方，像是工作排程器的部分可以改使用 Golang 或 Python 簡單寫個 Webhook 來給 Jenkins 呼叫使用，如果有更好的解決方式，也歡迎在留言分享交流一下 🤗，打完收工 🖖

## References

- [windows、linux 如何後臺運行 jar（而且顯示進程名） - JavaShuo](http://hk.javashuo.com/article/p-anasigrr-kr.html)
- [What's the nohup on Windows? - Stack Overflow](https://stackoverflow.com/questions/3382082/whats-the-nohup-on-windows)

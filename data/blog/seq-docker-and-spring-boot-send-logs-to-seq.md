---
title: 利用 Docker 架設 Seq Server 及設定 Spring boot LogBack 輸出 Logs 至 Seq
date: '2022-07-20'
lastmod: '2022-07-20'
tags: ['docker', 'java', 'spring-boot']
draft: false
summary: 雖然目前專案中我不是負責後端的工程師，但在串接後端的 API 時難免會遇到一些狀況需要去翻一下 Logs 來看一下發生甚麼事，但目前公司的 Spring boot 專案 Logs 主要是存在本機的 .log 檔案中，所以當要查閱 Logs 時非常的不方便必須遠端到主機中開啟檔案並用文字編輯器來查詢自己所需要的資訊，這個過程非常的麻煩，對於微服務的架構這種紀錄方式非常不 smart，所以決定以架設 Seq 加上 GELF 的方式將 Logs 輸出到 Seq 中儲存來解決這個問題
images: []
authors: ['default']
layout: PostLayout
---

<TOCInline toc={props.toc} asDisclosure />

雖然目前專案中我不是負責後端的工程師，但在串接後端的 API 時難免會遇到一些狀況需要去翻一下 Logs 來看一下發生甚麼事，但目前公司的 Spring boot 專案 Logs 主要是存在本機的 .log 檔案中，所以當要查閱 Logs 時非常的不方便必須遠端到主機中開啟檔案並用文字編輯器來查詢自己所需要的資訊，這個過程非常的麻煩，對於微服務的架構這種紀錄方式非常不 smart，所以決定以架設 [Seq](https://datalust.co/seq) 加上 [GELF](https://www.graylog.org/features/gelf) 的方式將 Logs 輸出到 Seq 中儲存來解決這個問題，由於對 Spring boot 沒有很熟，這邊簡單紀錄一下導入的過程，如果說明有誤的地方請見諒

# 1. Seq with Docker

這邊使用 docker compose 快速的將服務起起來，連到 http://localhost 就可以看到 Seq 的介面

```yml:docker-compose.yml
services:
  seq:
    image: datalust/seq:latest
    container_name: seq
    volumes:
      - ./seq_data:/data
    environment:
      - ACCEPT_EULA=Y
    ports:
      - 80:80
      - 5341:5341
    restart: always

  seq-input-gelf:
    image: datalust/seq-input-gelf:latest
    container_name: seq-input-gelf
    depends_on:
       - seq
    environment:
      - SEQ_ADDRESS=http://seq:5341
    ports:
       - '12201:12201'
       - '12201:12201/udp'
    restart: always
```

# 2. LogBack with GELF

這邊會使用到 [logback-gelf](https://github.com/osiegmar/logback-gelf) 這個套件，在 `pom.xml` 中加入依賴

### pom.xml

```xml:pom.xml
<dependencies>
<!-- logback for seq -->
    <dependency>
        <groupId>de.siegmar</groupId>
        <artifactId>logback-gelf</artifactId>
        <version>2.1.2</version>
    </dependency>
</dependencies>

```

### logback-spring.xml

因為這邊使用的是自定義的 `logback-spring.xml` 所以如果要加入環境變數必須由 `bootstrap.yml ` 來提供

```xml:logback-spring.xml
<configuration>
    <!-- Seq environment-->
    <springProperty scope="context" name="seqHost" source="spring.seq.host"/>
    <property name="seqHost" value="${seqHost}" />

    <!-- 輸出到Seq -->
    <appender name="GELF" class="de.siegmar.logbackgelf.GelfUdpAppender">
        <graylogHost>${seqHost}</graylogHost>
        <graylogPort>12201</graylogPort>
        <maxChunkSize>508</maxChunkSize>
        <useCompression>true</useCompression>
        <encoder class="de.siegmar.logbackgelf.GelfEncoder">
            <includeRawMessage>false</includeRawMessage>
            <includeMarker>true</includeMarker>
            <includeMdcData>true</includeMdcData>
            <includeCallerData>false</includeCallerData>
            <includeRootCauseData>false</includeRootCauseData>
            <includeLevelName>false</includeLevelName>
            <shortPatternLayout class="ch.qos.logback.classic.PatternLayout">
                <pattern>%m%nopex</pattern>
            </shortPatternLayout>
            <fullPatternLayout class="ch.qos.logback.classic.PatternLayout">
                <pattern>%m%n</pattern>
            </fullPatternLayout>
            <numbersAsString>false</numbersAsString>
            <staticField>module_name:${logName}</staticField>
            <staticField>os_arch:${os.arch}</staticField>
            <staticField>os_name:${os.name}</staticField>
            <staticField>os_version:${os.version}</staticField>
        </encoder>
    </appender>

    <!-- 輸出 Log 層級 -->
    <root level="INFO">
        <appender-ref ref="GELF" />
    </root>
    <root level="debug">
        <appender-ref ref="GELF" />
    </root>
</configuration>
```

### bootstrap.yml

這邊加入 `logback-spring.xml` 所需的變數，接著在系統環境變數加入 `SEQ_HOST` 即可

```yml:bootstrap.yml
spring:
    seq:
        host: ${SEQ_HOST:}
```

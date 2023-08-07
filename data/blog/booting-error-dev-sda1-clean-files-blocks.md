---
title: Debian 12 修復 booting error dev sda1 clean files blocks 錯誤
date: '2023-08-07'
lastmod: '2023-08-07'
tags: ['debian']
draft: false
summary: '最近將一台 Server 安裝 Debian 12 完成後重啟發現會進入不了系統，會出現 /dev/sda1: clean, xxxxx/xxxxx files, xxxxx/xxxxx blocks 訊息並卡住，後來發現是驅動程式的問題，以下紀錄一下解決方法。'
images: []
authors: ['default']
layout: PostLayout
---

最近將一台 Server 安裝 Debian 12 完成後重啟發現會進入不了系統，會出現 `/dev/sda1: clean, xxxxx/xxxxx files, xxxxx/xxxxx blocks` 訊息並卡住，後來發現是驅動程式的問題，以下紀錄一下解決方法。

```bash
sudo apt-get pruge nvidia*

# 禁用 nouveau 驅動程式
sudo vi /etc/modprobe.d/blacklist.conf
# blacklist nouveau
# options nouveau modeset=0

sudo apt-get autoremove
reboot
```

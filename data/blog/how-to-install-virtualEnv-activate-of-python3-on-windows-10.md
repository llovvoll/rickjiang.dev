---
title: Python Virtualenv 虛擬環境安裝
date: '2021-11-16'
lastmod: '2021-11-16'
tags: ['macos', 'windows', 'python']
draft: false
summary: Virtualenv 是 Python 的一個套件，主要用處是隔離環境，避免造成汙染主機環境，在沒有虛擬環境之前，安裝套件都會被安裝到全域環境中，當在不同的專案時很容易造成套件互相依賴影響的狀況，而且管理套件起來會很麻煩，但是如果使用 Virtualenv 就可以很輕鬆的建立虛擬環境，在裡面安裝套件就不會影響到全域環境，如果在虛擬環境搞壞了，直接刪除重建即可
images: []
authors: ['default']
layout: PostLayout
---

[Virtualenv](https://virtualenv.pypa.io/en/latest/#) 是 Python 的一個套件，主要用處是隔離環境，避免造成汙染主機環境，在沒有虛擬環境之前，安裝套件都會被安裝到全域環境中，當在不同的專案時很容易造成套件互相依賴影響的狀況，而且管理套件起來會很麻煩，但是如果使用 Virtualenv 就可以很輕鬆的建立虛擬環境，在裡面安裝套件就不會影響到全域環境，如果在虛擬環境搞壞了，直接刪除重建即可

# Windows

## 1. 安裝 Virtualenv

```bash
pip install virtualenv
```

![](/static/images/2021/11/16/how-to-install-virtualEnv-activate-of-python3-on-windows-10/001.png)

## 2. 建立並啟動虛擬環境

```bash
# 建立名稱 "env" 虛擬環境
virtualenv env

# 啟動 "env" 虛擬環境
env\Scripts\activate
```

啟動虛擬環境後使用 `which` 確認一下，可以看到 pip 已經被指向到專案資料夾中的虛擬環境了，這樣就搞定囉

![](/static/images/2021/11/16/how-to-install-virtualEnv-activate-of-python3-on-windows-10/002.png)

# macOS

現在比較少用 Python 做開發，這邊也筆記一下在 macOS 上的做法，通常會使用 [Pyenv](https://github.com/pyenv/pyenv) + Virtualenv（虛擬環境） 使用

```bash
brew install pyenv

# 安裝指定 Python 版本
pyenv install -v 3.10.0

# 建立 Pyenv 環境變數與初始化
# shell -> ~/.bashrc
# zsh -> ~/.zshrc
export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"

if command -v pyenv 1>/dev/null 2>&1; then
  eval "$(pyenv init --path)"
fi

# 切換 Python 版本
pyenv global 3.10.0 # 全域環境

pyenv local 3.10.0 # 當下資料夾（會建立一個 .python-version 檔）

pyenv shell 3.10.0 # 當下 shell

pip install virtualenv

# 建立名稱 "env" 虛擬環境
virtualenv env

# 啟動 "env" 虛擬環境
source env/bin/activate
```

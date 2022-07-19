---
title: My develop settings when reinstall
date: '2022-07-19'
lastmod: '2022-07-19'
tags: ['note', 'macos']
draft: false
summary: Record my development environment
images: []
authors: ['default']
layout: PostLayout
---

<TOCInline toc={props.toc} asDisclosure />

# Install HomeBrew

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

# Install develop tools

```bash
brew install --cask appcleaner
brew install --cask google-chrome
brew install --cask iterm2
brew install --cask visual-studio-code
brew install --cask fig
brew install --cask docker

brew install --cask forticlient
brew install --cask microsoft-remote-desktop
brew install --cask anydesk
brew install --cask zoom

brew tap homebrew/cask-fonts
brew install --cask font-hack-nerd-font
brew install --cask font-fira-code

brew install zsh
brew install node@16
```

# Setting Zsh as default & install oh-my-zsh

```bash
sudo sh -c "echo $(which zsh) >> /etc/shells"
chsh -s $(which zsh)
sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
```

# Setting Zsh theme & environment

```bash
# Preferences > Profiles > Terminal > Report Terminal Type> xterm-256color
git clone https://github.com/dracula/iterm.git
# iTerm import Dracula & select
git clone https://github.com/romkatv/powerlevel10k.git ~/.oh-my-zsh/custom/themes/powerlevel10k

vi ~/.zshrc

# Set name of the theme to load --- if set to "random", it will
# load a random theme each time oh-my-zsh is loaded, in which case,
# to know which specific one was loaded, run: echo $RANDOM_THEME
# See https://github.com/ohmyzsh/ohmyzsh/wiki/Themes
ZSH_THEME="powerlevel10k/powerlevel10k"

# Hide user name
DEFAULT_USER="rick"
```

# Generate SSH Key & Setting Git profile

```bash
# ed25519 is currently the safest and fastest key type for encryption and decryption
ssh-keygen -t ed25519 -C "your_email@example.com"
cat ~/.ssh/id_ed25519.pub

# if ed25519 have compatibility issue can choose rsa
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
cat ~/.ssh/id_rsa.pub

git config --global user.name "your_username"
git config --global user.email "your_email@example.com"
```

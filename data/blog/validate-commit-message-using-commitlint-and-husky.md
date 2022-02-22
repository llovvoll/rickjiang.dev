---
title: 使用 husky + commitlint 規範 Commit Message 格式是否符合要求
date: '2022-02-22'
lastmod: '2022-02-22'
tags: ['frontend']
draft: false
summary: 一個專案在多人協作時總是會遇到各種個人習慣的問題，比如說程式撰寫的風格，其包含變數命名、縮排...等等，在各種語言上都有相關的工具可以來嚴格規範統一團隊的開發風格，今天想提到的是 Git Commit Message，一個好的 commit 可以幫助團隊成員快速理解處理了甚麼及範圍
images: []
authors: ['default']
layout: PostLayout
---

一個專案在多人協作時總是會遇到各種個人習慣的問題，比如說程式撰寫的風格，其包含變數命名、縮排...等等，在各種語言上都有相關的工具可以來嚴格規範統一團隊的開發風格，今天想提到的是 Git Commit Message，一個好的 commit 可以幫助團隊成員快速理解處理了甚麼及範圍，舉例 [angular](https://github.com/angular/angular) 的專案，可以發現所有的 [commit](https://github.com/angular/angular/commits/master) 都有遵循其[規則](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#commit-message-header)來撰寫，一眼往去就非常一致看了就舒服，但多人協作時只靠口頭約定是不夠的，這時就可以利用 [husky](https://github.com/typicode/husky) 及 [commitlint](https://github.com/conventional-changelog/commitlint) 在 commit 的時候進行格式的檢查

```bash
# Install commitlint cli and conventional config
npm install --save-dev @commitlint/config-conventional @commitlint/cli

# Configure commitlint to use conventional config
echo "module.exports = {extends: ['@commitlint/config-conventional']}" > commitlint.config.js

# Install Husky v6
npm install husky --save-dev

# Activate hooks
npx husky install

# Add hook
npx husky add .husky/commit-msg "npx --no -- commitlint --edit $1"
```

## 效果圖

預設是採用 angular 的風格，詳細規則可以參考這裡 [@commitlint/config-conventional](https://github.com/conventional-changelog/commitlint/tree/master/@commitlint/config-conventional#type-enum)
![](https://github.com/conventional-changelog/commitlint/raw/master/docs/assets/commitlint.svg)

## References

- [conventional-changelog/commitlint: 📓 Lint commit messages](https://github.com/conventional-changelog/commitlint)

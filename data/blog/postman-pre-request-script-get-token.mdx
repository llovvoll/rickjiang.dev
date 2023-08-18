---
title: Postman 使用 Pre-request Script 自動取得 Token 後請求 API
date: '2021-10-08'
lastmod: '2021-10-08'
tags: ['frontend']
draft: false
summary: Postman 是前後端開發者的實用工具，可以在沒有前端畫面的時候測試 API 使用，大多數的 API 都會驗證其 Token，如果沒有攜帶正確的 Token 就會造成請求失敗，以往都得手動加入到 Header 後再進行請求，如果 Token 過期了就又得再重複一次的動作，這種動作實在太麻煩了，直接使用 Postman 內建的 Pre-request Script 功能就能輕鬆做到自動化，以下為範例程式碼，實際情況依自己的 API 規格不同進行調整
images: []
authors: ['default']
layout: PostLayout
---

Postman 是前後端開發者的實用工具，可以在沒有前端畫面的時候測試 API 使用，大多數的 API 都會驗證其 Token，如果沒有攜帶正確的 Token 就會造成請求失敗，以往都得手動加入到 Header 後再進行請求，如果 Token 過期了就又得再重複一次的動作，這種動作實在太麻煩了，直接使用 Postman 內建的 Pre-request Script 功能就能輕鬆做到自動化，以下為範例程式碼，實際情況依自己的 API 規格不同進行調整

```javascript
var URL = pm.variables.get('URL') // 從 Collection 的 Variables 中取出 "URL" API 位址的變數
var userName = pm.variables.get('USERNAME') // 從 Collection 的 Variables 中取出 "USERNAME" 登入帳號的變數
var passWord = pm.variables.get('PASSWORD') // 從 Collection 的 Variables 中取出 "PASSWORD" 登入密碼的變數

const config = {
  // 設定 Request 的參數
  url: URL + '/login',
  method: 'POST',
  header: 'Content-Type:application/json',
  body: {
    mode: 'raw',
    raw: JSON.stringify({
      username: userName,
      password: passWord,
    }),
  },
}

pm.sendRequest(config, (err, res) => {
  // 發出請求
  const token = res.json().data.adminToken // 取出 response data 中的 adminToken
  if (token) {
    console.log(`Admin Token => ${token}`)
    pm.request.headers.add({ key: 'Admin-Token', value: token }) // 在每個請求中的 Header 加入一個 key 為 'Admin-Token' 的值並帶入取回來的 token value
  } else {
    console.log('Can not get the Admin Token')
  }
})
```

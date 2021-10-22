---
title: 引入 Firebase 9 及 Authentication
date: '2021-10-22'
lastmod: '2021-10-22'
tags: ['frontend']
draft: false
summary: 過去在 Firebase 8 的時候，我們可以使用下面的範例程式碼引入 Firebase 跟 Authentication，當要使用 Auth 方法的時候就可以利用 app.auth() 來調用 auth 的相關函式
images: []
authors: ['default']
layout: PostLayout
---

過去在 Firebase 8 的時候，我們可以使用下面的範例程式碼引入 Firebase 及 Authentication，當要使用 Auth 方法的時候就可以利用 `app.auth()` 來調用 auth 的相關函式

```javascript
import firebase from 'firebase/app'
import 'firebase/auth'

const app = firebase.initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
})
export default app
```

但是在上面的方式在 Firebase 9 會造成錯誤，但是別擔心，Firebase 9 有提供相容性的方案，改成下面的方式引入就可以了

```javascript
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'

const app = firebase.initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
})
export default app
```

這樣就可以繼續使用 `app.auth()` 的方式來調用囉

## References

- [Upgrade from version 8 to the modular Web SDK  |  Firebase Documentation](https://firebase.google.com/docs/web/modular-upgrade)

---
title: Nuxt.js 將內建的 Axios 進行封裝
date: '2021-11-18'
lastmod: '2021-11-18'
tags: ['frontend', 'vuejs', 'nuxtjs']
draft: false
summary: 以往在 Vue 的專案中，我的習慣都會將 Axios 做二次封裝，可以對 Instance 加工一些 Loading 效果或是攔截器，處理好之後再 Export 給 API 的封裝，這樣在呼叫 API 的時候會比較方便及容易管理，但是平常很少碰 Nuxt，所以在封裝的時候的時候遇到一些問題，這邊紀錄一下如何進行封裝
images: []
authors: ['default']
layout: PostLayout
---

<TOCInline toc={props.toc} asDisclosure />

以往在 Vue 的專案中，我的習慣都會將 Axios 做二次封裝，可以對 Instance 加工一些 Loading 效果或是攔截器，處理好之後再 Export 給 API 的封裝，這樣在呼叫 API 的時候會比較方便及容易管理，但是平常很少碰 Nuxt，所以在封裝的時候的時候遇到一些問題，這邊紀錄一下如何進行封裝

## 1. 安裝 @nuxtjs/axios

Nuxt 官方團隊建議使用經他們優化過的 [Axios](https://axios.nuxtjs.org/) ，所以首先可以在我們的 Nuxt 專案中安裝，但是如果是用 `create-nuxt-app` 建立專案的話，可以直接在建立過程中選擇安裝

```bash
yarn add @nuxtjs/axios
```

```javascript:nuxt.config.js
export default {
  modules: ['@nuxtjs/axios']
  axios: {
      baseURL: 'https://localhost:5001'
  }
}
```

## 2. Axios Instance

在 `plugins` 目錄新增一個 `axios-accessor.js`

```javascript:plugins/axios-accessor.js
const accessor = ({ $axios }) => {
  // Request 攔截器
  $axios.onRequest((config) => {
    return config
  })

  $axios.onError((error) => {
    console.error(error)
  })

  // Response 攔截器
  $axios.interceptors.response.use((response) => {
    if (response.status === 200) {
      return Promise.resolve(response)
    } else {
      return Promise.reject(response)
    }
  })
}

export default accessor
```

接著要在 `nuxt.config.js` 導入

```javascript:nuxt.config.js
export default {
  plugins: [
    '~/plugins/axios-accessor'
  ]
}
```

## 3. 導出 Axios 進行 API 封裝

上一步做完只能在 `.vue` 中使用 `this.$axios` 使用，沒辦法在 `.js` 中導入使用，所以我們要再進行點處理，在 `utils` 目錄新增一個 `api.js`

```javascript:utils/api.js
import { NuxtAxiosInstance } from '@nuxtjs/axios'

let $axios = NuxtAxiosInstance

export function initializeAxios(axiosInstance) {
  $axios = axiosInstance
}

export { $axios }
```

接著回到 `axios-accessor.js` 加入初始化 Axios Instance

```javascript:plugins/axios-accessor.js
import { initializeAxios } from '~/utils/api'

const accessor = ({ $axios }) => {
  initializeAxios($axios)

  $axios.onRequest((config) => {
    return config
  })

  $axios.onError((error) => {
    console.error(error)
  })

  $axios.interceptors.response.use((response) => {
    if (response.status === 200) {
      return Promise.resolve(response)
    } else {
      return Promise.reject(response)
    }
  })
}

export default accessor
```

這樣下來我們就可以在 `.js` 中進行 API 封裝，例如以下的做法

```javascript:api/user.js
import { $axios } from '~/utils/api'

export function updateUserInfoAPI(data) {
    return $axios({
        url: '/userinfo',
        method: 'POST',
        data: data,
        headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        }
    })
}
```

接著就可以在頁面中直接導入使用封裝好的 API

```javascript:pages/user.vue
import { updateUserInfoAPI } from '@/api/user'

export default {
    methods: {
        update() {
            updateUserInfoAPI(...params).then(res => {
                // do something
            })
        }
    }
}
```

---

## References

- [Store - Nuxt TypeScript](https://typescript.nuxtjs.org/cookbook/store/)

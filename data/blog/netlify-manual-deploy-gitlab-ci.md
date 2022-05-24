---
title: 私有 GitLab 佈署 Netlify Previews
date: '2022-05-24'
lastmod: '2022-05-24'
tags: ['ci/cd', 'gitlab', 'nginx', 'golang']
draft: false
summary: 最近處理的專案，為了讓 Code Review 及整合測試更加流暢，讓有人提 Merge Request 的階段時可以佈署預覽網站，所以想到了可以利用 Netlify 來達成，但是佈署專案時如果要支援 Self-Hosted GitLab 是需要升級成 Pro 以上的方案，秉持著客家精神還好發現了可以使用 Netlify CLI 來達成
images: []
authors: ['default']
layout: PostLayout
---

最近處理的專案，為了讓 Code Review 及整合測試更加流暢，讓有人提 Merge Request 的階段時可以佈署預覽網站，所以想到了可以利用 [Netlify](https://www.netlify.com/) 來達成，但是佈署專案時如果要支援 Self-Hosted GitLab 是需要升級成 Pro 以上的方案，秉持著客家精神還好發現了可以使用 Netlify CLI 來達成，所以這邊只要寫好 GitLab CI/CD 配置檔就可以達成

這個專案是使用 Vue.js 採前後端分離的開發方式，所以在第 4、5 行分別加了一些設定來避免 Netlify 出現 CORS 及頁面重整時會報 404 的問題，這邊要注意 `_headers` 跟 `_redirects` 要與 `index.html` 擺在一起，更多的 Netlify 客製設定可以參考[官方文件](https://docs.netlify.com/routing/overview/)

```yml:gitlab-ci.yml
deploy:preview:
  stage: deploy
  script:
    - npm install
    - sed -i 's/""/"https:\/\/192.168.1.50"/g' config/prod.env.js # Netlify <ssl> 192.168.1.50 <proxy> target server
    - npm run build
    - echo $'/* \n Access-Control-Allow-Origin':' *' > dist/_headers # Fix CORS on Netlify
    - echo $'/* /index.html 200' > dist/_redirects # Fix Page Not Found on Reload on Netlify
    - npm install netlify-cli --save-dev
    - npx netlify deploy --site $NETLIFY_SITE_ID --auth $NETLIFY_AUTH_TOKEN --dir dist/ | tee netlify_output.txt
    - if [ -z ${CI_MERGE_REQUEST_IID} ]; then exit 0; fi
    - export DRAFT_URL=$(cat netlify_output.txt | grep 'Draft.*https' | sed 's/\[39m//g' | awk -F " " '{print $NF}')
    - which curl || ( apk add --update --no-cache curl )
    - 'curl -k --request POST
      --header "PRIVATE-TOKEN: $GITLAB_API_TOKEN"
      --data-urlencode "body=✔️ **Deploy Preview ready for [Pipeline $CI_PIPELINE_IID]($CI_PIPELINE_URL)**


      🔨 Explore the source changes: $CI_COMMIT_SHA


      😎 Browse the preview: $DRAFT_URL"
      "https://gitlab/api/v4/projects/$CI_PROJECT_ID/merge_requests/$CI_MERGE_REQUEST_IID/notes"'
  only:
    - merge_requests
  when: manual
```

因為後端 API 是沒有對外服務的，所以第一時間想到使用 Nginx 來做 Reverse Proxy，但是 Netlify 不支援非 SSL 的連線方式，所以可以自簽發憑證來達成，這邊為了讓測試的人可以彈性的決定要連向哪台後端 API 進行測試，我使用 Go 搭了一個 API 來讓 User 即時修改配置，但是對 Nginx 沒那麼熟，所以就用很蠢的方式直接使用 `sed` 替換修改配置檔再重啟服務

```go:main.go
package main

import (
 "context"
 "fmt"
 "net/http"
 "os/exec"
 "regexp"
 "strings"
 "sync"
 "time"

 "github.com/gin-gonic/gin"
 "github.com/go-redis/redis/v8"
)

type User struct {
 ID    string `json:"id"`
 Value string `json:"value"`
 Message string `json:"msg"`
}

var ctx = context.Background()
var rdb *redis.Client
var mutex sync.Mutex

var ids = []string{"USER1", "USER2", "USER3"}
var defaultValue = "http://192.168.1.150:8443"

func main() {
 rdb = initRedisClient()
 router := gin.Default()

 router.GET("/query", query)
 router.GET("/query/:userId", query)
 router.GET("/update/:userId/:newValue", update)

 router.NoRoute(func(c *gin.Context) {
  c.Redirect(http.StatusPermanentRedirect, "/query")
 })

 router.Run()
}

func initRedisClient() *redis.Client {
 rdb := redis.NewClient(&redis.Options{
  Addr:     "localhost:6379",
  Password: "",
  DB:       8,
 })

 _, err := rdb.Ping(ctx).Result()
 if (err != nil) {
  panic(err)
 }

 for _, id := range ids {
  result, err := rdb.Exists(ctx, id).Result()
  if err != nil {
   panic(err)
  }
  if (result == 0) {
   res, err := rdb.Set(ctx, id, defaultValue, 0).Result()
   if (err != nil) {
    panic(err)
   }
   fmt.Printf("%s init(%s): %s \n", id, defaultValue, res)
  }
 }

 return rdb
}

func query(c *gin.Context) {
 userId := c.Param("userId")
 if userId == "" {
  var users []User

  for _, id := range ids {
   user := User{
    ID:    id,
    Value: rdb.Get(ctx, id).Val(),
   }
   users = append(users, user)
  }
  c.JSON(http.StatusOK, users)
  return
 }

 result, err := rdb.Get(ctx, userId).Result()
 if err != nil {
  c.String(http.StatusOK, "NOT FOUND")
  return
 }
 c.JSON(http.StatusOK, User{ID: userId, Value: result})
}

func update(c *gin.Context) {
 userId := c.Param("userId")
 newValue := c.Param("newValue")
 result, err := rdb.Exists(ctx, userId).Result()
 if err != nil {
  panic(err)
 }
 if (result > 0) {
  ipv4_regex := `^(((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4})`
  match, _ := regexp.MatchString(ipv4_regex, newValue)
  if (match) {
   val := fmt.Sprintf("http://%s:8443", newValue)
   res, err := rdb.Set(ctx, userId, val, 0).Result()
   if (err != nil) {
    panic(err)
   }
   c.JSON(http.StatusOK, User{ID: userId, Value: val, Message: res})
   go reloadNginx()
  } else {
   c.String(http.StatusOK, "WRONG IP ADDRESS")
   return
  }
 } else {
  c.String(http.StatusOK, "NOT FOUND")
  return
 }
}

func reloadNginx() {
 mutex.Lock()

 exec.Command("/bin/sh", "-c", "mv -f /Nginx/default.conf /Nginx/default.conf.last").Run()
 exec.Command("/bin/sh", "-c", "cp -f /Nginx/default.conf.bak /Nginx/default.conf").Run()

 for _, id := range ids {
  value := strings.ReplaceAll(rdb.Get(ctx, id).Val(), "/", "\\/")
  arg := fmt.Sprintf("s/%s/%s/g", id, value)
  exec.Command("sed", "-i", arg, "/Nginx/default.conf").Run()
 }
 cmd, err := exec.Command("/bin/sh", "-c", "docker restart nginx").CombinedOutput()
 if (err != nil) {
  panic(nil)
 }
 fmt.Println(string(cmd))
 time.Sleep(5 * time.Second)
 mutex.Unlock()
}
```

API 會使用 `sed` 替換掉配置檔內的佔位符成 User 自己設定的值，如此一來當 User 進到 Nginx 會依照自己的 IP 去到自己所指定的後端主機，反之如果非指定的 User 則預設連到主要的測試主機上

```conf:default.conf
server {
  gzip on;
  listen 443 ssl;
  listen  [::]:443;
  server_name 192.168.1.50;

  ssl_certificate /etc/nginx/ssl/nginx.crt;
  ssl_certificate_key /etc/nginx/ssl/nginx.key;


  location ~* / {
  proxy_set_header  Host $host;
  proxy_set_header  X-Real-IP $remote_addr;
  proxy_set_header  X-Forwarded-For $remote_addr;
  proxy_set_header  X-Forwarded-Host $remote_addr;
  proxy_set_header  X-NginX-Proxy true;
  proxy_pass        http://192.168.1.150:8443;

  add_header Access-Control-Allow-Origin * always;
  add_header Access-Control-Allow-Headers *;
  add_header Access-Control-Allow-Methods *;
  add_header Access-Control-Allow-Credentials true;
  if ($request_method = 'OPTIONS') {
    return 204;
  }

  if ($remote_addr = "192.168.22.10") {
    proxy_pass  USER1;
    break;
  }
  if ($remote_addr = "192.168.22.11") {
    proxy_pass  USER2;
    break;
  }
  if ($remote_addr = "192.168.22.12") {
    proxy_pass  USER3;
    break;
  }
  }
}
```

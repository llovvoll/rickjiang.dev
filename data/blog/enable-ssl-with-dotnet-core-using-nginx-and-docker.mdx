---
title: 使用 Nginx + Let's Encrypt 反向代理 .NET Core 容器並支援 SSL
date: '2021-11-22'
lastmod: '2021-11-22'
tags: ['dotnet', 'docker', 'nginx']
draft: false
summary: 上一篇文章中提到了如何使用 docker-nginx-certbot 快速建置 Nginx 的容器及自動更新 Let's Encrypt 憑證，這篇則記錄一下，如何在 Nginx 容器中如何反向代理到 .NET Core 容器並啟用 SSL
images: []
authors: ['default']
layout: PostLayout
---

[上一篇文章](https://www.rickjiang.dev/blog/nginx-and-lets-encrypt-with-docker)中提到了如何使用 [docker-nginx-certbot](https://github.com/JonasAlfredsson/docker-nginx-certbot) 快速建置 Nginx 的容器及自動更新 Let's Encrypt 憑證，這篇則記錄一下，如何在 Nginx 容器中如何反向代理到 .NET Core 容器並啟用 SSL

首先把 `app.UseHttpsRedirection` 替換成以下的內容，開發環境中仍然使用 `app.UseHttpsRedirection`，如果是生產環境就進行 Header 轉發

```csharp:Startup.cs
public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    if (env.IsDevelopment())
    {
        app.UseHttpsRedirection();
    }
    else
    {
        app.UseForwardedHeaders(new ForwardedHeadersOptions
        {
            ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
        });
    }
}
```

搞定後就能打包成容器，並加入個環境變數，把監聽 Port 改為 5000

```dockerfile:Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /app

# copy csproj and restore as distinct layers
COPY *.sln .
COPY *.csproj .
RUN dotnet restore

# copy everything else and build app
COPY . .
RUN dotnet publish -c release -o out

# final stage/image
FROM mcr.microsoft.com/dotnet/aspnet:6.0
WORKDIR /app
COPY --from=build /app/out .
ENV ASPNETCORE_URLS=http://*:5000
ENTRYPOINT ["dotnet", "api.dll"]
```

接著建立 Nginx 配置檔，如果是從 `api.example.com` 來的話就反向代理到 .Net Core 容器中，這邊因為容器是額外獨立的，所以直接指向到 Host 的 5000 Port，這邊要注意的是 `/etc/letsencrypt/live/api.example.com/` 如果是多個網域，這邊的 `api.example.com` 必須修改，否則相同的話會共用同一個 SSL 憑證

```conf:user_conf.d/api.example.com.conf
server {
    # Listen to port 443 on both IPv4 and IPv6.
    listen 443 ssl; # 如果多個站台監聽同個 Port，必須改成這樣子，否則會出現 duplicate error

    # Domain names this server should respond to.
    server_name api.example.com;

    # Load the certificate files.
    ssl_certificate         /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key     /etc/letsencrypt/live/api.example.com/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/api.example.com/chain.pem;

    # Load the Diffie-Hellman parameter.
    ssl_dhparam /etc/letsencrypt/dhparams/dhparam.pem;

    location / {
        proxy_pass         http://host.docker.internal:5000; # 因為 .NET Core 的容器是獨立的，所以指向到 Host 的 5000 Port，由 Docker 再轉進去容器中
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection keep-alive;
        proxy_set_header   Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}
```

以上完成的話，連線到 api.example.com 沒有意外的話就可以正常反向代理到 .NET Core 容器中並支援 SSL 了 🤘

---

## References

[Configure ASP.NET Core to work with proxy servers and load balancers | Microsoft Docs](https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/proxy-load-balancer?view=aspnetcore-6.0#other-proxy-server-and-load-balancer-scenarios)

[Enable SSL with ASP.NET Core using Nginx and Docker](https://blog.tonysneed.com/2019/10/13/enable-ssl-with-asp-net-core-using-nginx-and-docker/)

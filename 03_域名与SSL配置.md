# 🌐 雷犀系统 - Nginx 域名与 SSL 配置指南

本手册提供生产环境下的 Nginx 配置模板，包含对 **React 路由**、**WebSocket 实时通知**、**大文件上传**及 **SSL 自动续期**的完整支持。

## 1. Nginx 核心配置模板

请根据您的实际环境修改 `server_name` 和 `root` 路径。建议将此配置保存为 `/etc/nginx/sites-available/leixi`。

```nginx
# HTTP 自动跳转 HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL 证书路径 (申请成功后由 Certbot 自动填入)
    # ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # 前端静态资源托管
    location / {
        root /var/www/leixi/frontend/dist; # 替换为前端构建产物路径
        index index.html;
        try_files $uri $uri/ /index.html; # 重要：支持 React BrowserRouter 路由
        
        gzip on;
        gzip_types text/plain application/javascript application/x-javascript text/javascript text/xml text/css;
    }

    # 后端 API 反向代理
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 适配知识库大文件上传 (PDF/音视频)
        client_max_body_size 500M;
    }

    # WebSocket 转发 (支持质检进度条和实时告警)
    location /socket.io {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # 延长超时时间，防止质检过程中连接中断
        proxy_read_timeout 86400;
    }

    # MinIO 资源透传
    location /ai-quality/ {
        proxy_pass http://127.0.0.1:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 2. SSL 证书申请 (Certbot)

我们推荐使用免费的 **Let's Encrypt** 证书。

### 2.1 安装 Certbot
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

### 2.2 申请并自动配置
运行以下命令，Certbot 将自动识别 Nginx 配置并完成证书安装：
```bash
sudo certbot --nginx -d your-domain.com
```
*   **Redirect**: 询问是否重定向时，选择 `2: Redirect` 以强制 HTTPS。

### 2.3 验证自动续期
Let's Encrypt 证书有效期 90 天，系统会自动续期。测试命令：
```bash
sudo certbot renew --dry-run
```

## 3. 核心参数调优说明

1.  **`client_max_body_size`**: 必须设为 `500M` 或更高。否则上传大型视频知识库文件时会报错 `413 Request Entity Too Large`。
2.  **`Upgrade` 与 `Connection`**: 这是 WebSocket 握手的核心。缺失这两行将导致控制台质检进度条无法实时更新。
3.  **`try_files`**: 解决 React 页面刷新报 404 的问题，确保路由控制权交还给 `index.html`。

## 4. 防火墙建议
请确保服务器已开放以下端口：
*   `80` (HTTP)
*   `443` (HTTPS)
*   `9001` (可选：MinIO 控制台)

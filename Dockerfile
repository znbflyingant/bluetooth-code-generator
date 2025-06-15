# 使用轻量级的nginx镜像
FROM nginx:alpine

# 复制项目文件到nginx默认目录
COPY . /usr/share/nginx/html/

# 复制nginx配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露80端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"] 
FROM node:latest as builder

RUN npm set registry https://registry.npm.taobao.org/

WORKDIR app

COPY . .

RUN npm install && \
    npm run build

RUN rm -rf node_modules/

# 使用openresty代替nginx
FROM openresty/openresty:alpine
COPY --from=builder /app/deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80


FROM node:16.20.2 as builder

RUN npm set registry https://registry.npmmirror.com/
# RUN npm set registry https://npm.temu.team/

WORKDIR app

COPY . .

RUN npm install
RUN npm run build

RUN rm -rf node_modules/

# 使用openresty代替nginx
FROM openresty/openresty:1.25.3.2-5-alpine-fat
COPY --from=builder /app/deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80


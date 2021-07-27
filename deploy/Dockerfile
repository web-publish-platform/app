FROM node:latest as builder

RUN npm set registry https://registry.npm.taobao.org/

WORKDIR app

COPY . .

RUN npm install && \
    npm run build

RUN rm -rf node_modules/

FROM nginx
COPY --from=builder /app/deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80


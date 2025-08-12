# 多阶段构建：第一阶段为builder（构建阶段）
FROM node:16.20.2 AS builder

# 在builder阶段定义构建参数（接收Jenkins传递的参数）
ARG COS_SECRET_ID
ARG COS_SECRET_KEY
ARG COS_BUCKET
ARG COS_REGION
ARG VERSION

# 将构建参数设置为当前阶段的环境变量（供npm run upload使用）
ENV COS_SECRET_ID=${COS_SECRET_ID}
ENV COS_SECRET_KEY=${COS_SECRET_KEY}
ENV COS_BUCKET=${COS_BUCKET}
ENV COS_REGION=${COS_REGION}
ENV VERSION=${VERSION}

# 配置npm镜像
RUN npm set registry https://registry.npmmirror.com/

# 设置工作目录
WORKDIR /app

# 复制项目文件
COPY . .

# 安装依赖、构建、上传
RUN npm install
RUN npm run build
RUN npm run upload  # 此时upload脚本可通过process.env读取上述环境变量

# 清理node_modules（可选）
RUN rm -rf node_modules/


# 第二阶段：生产环境（使用openresty）
FROM openresty/openresty:1.25.3.2-5-alpine-fat

# 从builder阶段复制构建产物和配置
# COPY --from=builder /app/deploy/nginx.conf /usr/local/openresty/nginx/conf/nginx.conf
COPY --from=builder /app/build /usr/local/openresty/nginx/html

# 暴露端口
EXPOSE 80

# 启动 OpenResty
CMD ["openresty", "-g", "daemon off;"]

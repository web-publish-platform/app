# 为k8s集群创建Secret

```
kubectl delete secret registry-key // 如果有的话先删除
kubectl -n default create secret docker-registry registry-key \
--docker-server=https://index.docker.io/v2/ \
--docker-username=Hub Name \
--docker-password=Hub 密码 \
--docker-email=邮箱
```

检查 Secret
kubectl get secret key-name --output=yaml

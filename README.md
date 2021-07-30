# 为k8s集群创建Secret

```
kubectl delete secret registry-key // 如果有的话先删除
kubectl -n default create secret docker-registry registry-key \
--docker-server=https://index.docker.io/v2/ \
--docker-username=djlxs \
--docker-password=djl.l951753 \
--docker-email=1281233206@qq.com
```

检查 Secret
kubectl get secret key-name --output=yaml

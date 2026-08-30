# Dashboard-app-demo





### DBマイグレーション
```
# マイグレーション実行
docker compose exec app npm run db:migrate

# シードデータ投入
docker compose exec app npm run db:seed
```
# How to

### To run the Docker locally

Start Docker:
`docker compose up`

Then visit the local PocketBase admin:
http://localhost:8090/\_/

### To get a snapshot of all collections fields and rules

`docker compose exec pocketbase /pb/pocketbase migrate collections`

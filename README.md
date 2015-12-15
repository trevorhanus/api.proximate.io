# api.bridgechat.io

## Enviorment Variables
The following enviorment variables must be set:
- MYSQL_BRIDGE_HOST
- MYSQL_BRIDGE_USER
- MYSQL_BRIDGE_PASSWORD
- MYSQL_BRIDGE_DB

- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_BRIDGE_FROM

## api.bridgechat.io Status Codes

### 2xx Success

200 OK - nothing was created, no errors

201 Created

### 4xx Client Error

400 Bad Request

401 Unauthorized

403 Forbidden

409 Conflict

# GEO APP

## Structure:
```
summer_app/
├── compose.yaml
├── backend/
│   ├── Dockerfile
│   ├── main.py
│   ├── modis.py
│   ├── requirements.txt
│   └── sentinel_process.py
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── package-lock.json
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js
        ├── index.css
        ├── index.js
        ├── assets/
        │   ├── arrows-move.svg
        │   └── hexagon.svg
        ├── components/
        │   ├── CoordinateForm.js
        │   ├── ModisButton.js
        │   ├── NdviButton.js
        │   └── ParcelSelector.js
        ├── context/
        │   └── UserContext.js
        ├── pages/
        │   ├── About.js
        │   ├── Auth.js
        │   ├── Home.js
        │   ├── Home2.js
        │   ├── index.js
        │   ├── Stats.js
        │   ├── components/
        │   │   ├── HistoryPanel/
        │   │   │   ├── HistoryPanel.js
        │   │   │   └── index.js
        │   │   ├── MapContainer/
        │   │   │   ├── index.js
        │   │   │   ├── MapContainer.js
        │   │   │   ├── MapInitializer.js
        │   │   │   └── MapMenuControl.js
        │   │   ├── NdviOverlay/
        │   │   │   ├── index.js
        │   │   │   └── NdviOverlay.js
        │   │   └── SidePanel/
        │   │       ├── ActionButtons.js
        │   │       ├── CoordinateForm.js
        │   │       ├── index.js
        │   │       ├── SidePanel.js
        │   │       └── UserInfo.js
        │   ├── constants/
        │   │   ├── mapConfig.js
        │   │   └── styleConfig.js
        │   ├── hooks/
        │   │   ├── useCoordinateLogic.js
        │   │   ├── useCoordinates.js
        │   │   ├── useGuestStorage.js
        │   │   ├── useMapSetup.js
        │   │   ├── useNdviOverlay.js
        │   │   └── useUserActions.js
        │   └── services/
        │       ├── coordinateService.js
        │       ├── ndviService.js
        │       └── userService.js
        └── utils/
            ├── api.js
            ├── geo.js
            ├── History.js
            └── mapMenu.js

```
## Description

This App's purpose is to help with Land cover type and mainly agriculture area insights by providing simple yet effective analysis features.

Currently implemented features:
- NDVI  -->  vegetation index monitoring
- MCD12Q1 (LC_Type2 => UMD classification)  --> land cover type classification and visualisation

signIn/signUp as user for permanent coordinates selection storage (data base usage) or use the app as guest with a temporary storage

---

## Installation

---
### repo clonning
```
git clone https://github.com/vladakin4105/Sattelite_Data.git
```

#### Important!
keep in mind for the properly working of the app you will have to add a .env on the level with compose.yaml that contains:
```
POSTGRES_USER=...    ---GEO_USER---
POSTGRES_PASSWORD=...   ---parola---
POSTGRES_DB=...    ---todo_db---
DATABASE_URL=...     ---adresa db ca in exemplu:    postgresql://---GEO_USER---:---parola---@db:5432/---todo_db---     ---
SH_CLIENT_ID=...      ---Sentinel-hub client id format string---
SH_CLIENT_SECRET=...        ---Sentinel-hub client secret format string---
SH_BASE_URL=...      ---"https://sh.dataspace.copernicus.eu"---
SH_TOKEN_URL=...      ---"https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token"---
HOME=/tmp
GOOGLE_APPLICATION_CREDENTIALS=...    ---google cloud credentials-key format .json file same level as the .env file---
GOOGLE_CLOUD_PROJECT=...     ---google cloud project name(ID)---
```


### docker desktop 

simple install on oficiall site:  [DOCKER DESKTOP](https://www.docker.com/products/docker-desktop/)

---

## Usage
---
### tools
git, git bash, Powershell, Docker Desktop

---

After complete installation of Docker Desktop run the following command in root folder of the repo:
```
docker compose up --build -d
```
After the first build , for future runs:
```
docker compose up -d
```

local application runs as:
- frontend : http://localhost:3000
- backend : http://localhost:8000
- db : http://localhost:5432

### DATABASE VISUALISATION (SQL CLASSIC COMMANDS)
```
docker compose exec db bash
time="2025-08-09T04:45:32+03:00" level=warning msg="*\\compose.yaml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion"
root@620df0895c27:/# psql -U user -d todo_db
psql (15.13 (Debian 15.13-1.pgdg120+1))
Type "help" for help.

todo_db=# \dt
           List of relations
 Schema |    Name    | Type  |  Owner
--------+------------+-------+----------
 public | coordinate | table | GEO_USER
 public | user       | table | GEO_USER
(2 rows)

todo_db=# select * from coordinate;
 id | user_id |  x1  |  y1  |  x2  |  y2
----+---------+------+------+------+------
  1 |       1 | 10.1 | 20.2 | 30.3 | 40.4
(1 row)


todo_db=# select * from "user";
 id | username
----+----------
  1 | alice
(1 row)

todo_db=# select * from "user";
 id | username
----+----------
  1 | alice
  2 | andrei
(2 rows)

todo_db=# select * from coordinate;
 id | user_id |  x1  |  y1  |  x2  |  y2
----+---------+------+------+------+------
  1 |       1 | 10.1 | 20.2 | 30.3 | 40.4
(1 row)

todo_db=# select * from "user";
 id | username
----+----------
  1 | alice
  2 | andrei
  3 | alex
(3 rows)

todo_db=# select * from coordinate;
 id | user_id |  x1  |  y1  |  x2  |  y2
----+---------+------+------+------+------
  1 |       1 | 10.1 | 20.2 | 30.3 | 40.4
  2 |       3 | 11.1 | 21.2 | 31.3 | 41.4
(2 rows)

```

### TESTING POST API/DB
```
git bash terminal api/db testing:
user@Linux MINGW64 ~
$ curl -X POST http://localhost:8000/users   -H "Content-Type: application/json"   -d '{"username":"alice"}'
{"id":1,"username":"alice"}
user@Linux MINGW64 ~
$ curl -X POST http://localhost:8000/users   -H "Content-Type: application/json"   -d '{"username":"andrei"}'
{"id":2,"username":"andrei"}
user@Linux MINGW64 ~
$ curl -X POST http://localhost:8000/users   -H "Content-Type: application/json"   -d '{"username":"alex"}'
{"id":3,"username":"alex"}
user@Linux MINGW64 ~
$ curl -X POST http://localhost:8000/users/alex/coords   -H "Content-Type: application/json"   -d '{"x1":11.1,"y1":21.2,"x2":31.3,"y2":41.4}'
{"x1":11.1,"y1":21.2,"x2":31.3,"y2":41.4}
```

### OTHER API/DB RESOURCES
```
http://localhost:8000/docs#/
http://localhost:8000/redoc
http://localhost:8000/users/alice/coords
```
---

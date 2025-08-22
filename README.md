# GEO APP

## Structure:
```
  ├── docker-compose.yml
  ├── backend/
  │   ├── Dockerfile
  │   ├── requirements.txt
  │   ├── sentinel_process.py
  │   └── main.py                         
  └── frontend/
      ├── Dockerfile
      ├── package.json
      ├── public/
      │   └── index.html
      └── src/
          ├── index.js
          ├── App.js
          ├── context/UserContext.js
          ├── utils/api.js
          └── pages/
              ├── Home.js
              ├── About.js
              └── Stats.js
```
## Description

---

## Installation

---
### repo clonning
```
git clone https://github.com/vladakin4105/Sattelite_Data.git
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

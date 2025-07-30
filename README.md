Structure:
  ├── .env
  ├── docker-compose.yml
  ├── backend/
  │   ├── Dockerfile
  │   ├── requirements.txt
  │   └── main.py                         
  └── frontend/
      ├── Dockerfile
      ├── package.json
      ├── public/
      │   └── index.html
      └── src/
          ├── index.js
          ├── App.js
          ├── context/TodoContext.js
          └── pages/
              ├── Home.js
              ├── About.js
              └── Stats.js
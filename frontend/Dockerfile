# Use official Node.js LTS image
FROM node:18.20.4-alpine
WORKDIR /app
RUN --mount=type=bind,source=package.json,target=package.json \
    npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
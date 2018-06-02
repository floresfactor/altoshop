FROM node:carbon
MAINTAINER rlopez@rnviz.com

RUN npm install pm2 -g

WORKDIR /app

ENTRYPOINT pm2-docker ./server.js
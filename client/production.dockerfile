FROM node
MAINTAINER rlopez@rnviz.com

RUN npm install pm2 -g

WORKDIR /app
COPY ./scripts/ /scripts

RUN chmod +rx /scripts/*.sh
ENTRYPOINT pm2-docker ./tools/prodServer.js
#ENTRYPOINT [ "/scripts/start.sh" ]
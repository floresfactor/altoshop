FROM mongo:3.4-jessie

MAINTAINER rlopez@rnviz.com

VOLUME /data/db
VOLUME /data/backup

RUN apt-get update && apt-get install -y cron netcat-traditional netcat-openbsd

COPY ./mongo/scripts /mongo_scripts

RUN chmod +rx /mongo_scripts/*.sh

EXPOSE 27017

ENTRYPOINT ["/mongo_scripts/start.sh"]
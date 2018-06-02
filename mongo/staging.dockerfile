FROM mongo

MAINTAINER rlopez@rnviz.com

VOLUME /data/db
VOLUME /data/backup

EXPOSE 27037

ENTRYPOINT /usr/bin/mongod --port 27037 $@
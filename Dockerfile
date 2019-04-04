FROM node:9.1.0-wheezy
LABEL maintainer="ezPAARSE Team <ezpaarse@couperin.org>"

ENV NODE_ENV production

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
RUN mkdir -p /usr/src/app/logs

COPY package.json /usr/src/app/
RUN npm install && npm cache clean --force
COPY . /usr/src/app

EXPOSE 4000
CMD [ "npm", "start" ]

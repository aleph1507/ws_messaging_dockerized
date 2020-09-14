FROM node:12
WORKDIR /home/node/app
COPY app /home/node/app
RUN npm install -g nodemon
RUN npm install

CMD nodemon run app
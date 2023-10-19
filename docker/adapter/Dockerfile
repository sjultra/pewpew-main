FROM node:latest

EXPOSE 8090
WORKDIR /adapter
COPY . .
RUN npm install --include-dev

VOLUME ./data

CMD ["npm","run","trace"]

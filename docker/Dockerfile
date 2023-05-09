FROM node:latest

EXPOSE 8080

WORKDIR /opt/pewpew
COPY . /opt/pewpew
RUN npm install http-server -g
RUN mkdir -p /opt/pewpew

RUN mkdir ./data
VOLUME ./data

# init external data file
RUN touch ./data/data.json
RUN echo "{\"data\": []}" > ./data/data.json

CMD ["http-server","-a","0.0.0.0","-p","8080","/opt/pewpew"]


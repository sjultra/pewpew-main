FROM node:latest

EXPOSE 8090
WORKDIR /adapter
COPY . .
RUN npm install --include-dev

VOLUME ./data
ENV TENANT_ID
ENV CLIENT_ID
ENV CLIENT_SECRET

CMD ["npm","run","trace"]

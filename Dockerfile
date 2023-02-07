FROM node:14-slim

WORKDIR ./app
COPY ./package.json ./
RUN npm install
RUN apt update
RUN apt --yes install ffmpeg
COPY ./ ./
EXPOSE 1338
CMD ["npm","start"]
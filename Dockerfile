#syntax=docker/dockerfile:1

#use official Node runtime as base image (parent image)
FROM node:16-alpine

#install yarn 
RUN apk add --no-cache yarn git make gcc g++ python3 libcap-dev


#set working directory in the container 
WORKDIR /app

#copy the current directory contents into the container 
COPY . . 

#install dependencies
#Keep the RUN yarn install --production in your Dockerfile if you are using Yarn and have a package.json.
RUN yarn install --production --verbose

#expose port 3000
EXPOSE 3000

#define Environment variable (same as python)
ENV NODE_ENV=production

#run the app when the container launches 
CMD ["node", "./routers/index.js"]



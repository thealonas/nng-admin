FROM node:alpine
EXPOSE 3000
WORKDIR /app
COPY . .
RUN npm ci
RUN npm install -g serve
RUN npm run build
CMD ["serve", "build", "-s"]

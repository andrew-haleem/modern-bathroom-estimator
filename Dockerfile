FROM node:18-alpine

# Install sqlite3 native dependencies
RUN apk add --no-cache python3 make g++ sqlite-dev

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy application code
COPY . .

# Build application is handled in CMD to allow volume mounts
EXPOSE 3000
CMD npm run build && npm start

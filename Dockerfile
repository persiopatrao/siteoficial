FROM node:20-alpine

WORKDIR /app

# Install backend dependencies
COPY package*.json ./
RUN npm install --production

# Install frontend dependencies and build
COPY frontend/package*.json ./frontend/
RUN npm --prefix frontend install --production
COPY frontend ./frontend
RUN npm --prefix frontend run build

# Copy backend source
COPY backend ./backend

EXPOSE 3000
CMD ["npm", "start"]

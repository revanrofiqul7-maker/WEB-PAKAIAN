FROM node:18-alpine

WORKDIR /app

# Copy root files
COPY package*.json ./

# Copy backend folder
COPY backend ./backend

# Install dependencies di backend
WORKDIR /app/backend
RUN npm install --production

# Expose port
EXPOSE 5000

# Start aplikasi
CMD ["npm", "start"]

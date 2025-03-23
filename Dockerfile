FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Hugging Face Spaces requires port 7860
EXPOSE 7860

# Use environment variables from Hugging Face Spaces
ENV PORT=7860
ENV NODE_ENV=production

CMD ["node", "server.js"] 
FROM node:20-slim

WORKDIR /app

# Install necessary tools
RUN apt-get update && apt-get install -y wget git && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

# Git configuration
RUN git config --global user.name "Cursed180"
RUN git config --global user.email "Cursed180@users.noreply.huggingface.co"

# Install OpenVSCode server
RUN wget https://github.com/gitpod-io/openvscode-server/releases/download/openvscode-server-v1.86.2/openvscode-server-v1.86.2-linux-x64.tar.gz -O /tmp/openvscode-server.tar.gz && \
    tar -xzf /tmp/openvscode-server.tar.gz -C /opt && \
    rm /tmp/openvscode-server.tar.gz && \
    mv /opt/openvscode-server-v1.86.2-linux-x64 /opt/openvscode-server && \
    chown -R 1000:1000 /opt/openvscode-server

# Hugging Face Spaces requires port 7860
EXPOSE 7860

# Use environment variables from Hugging Face Spaces
ENV PORT=7860
ENV NODE_ENV=production

CMD ["node", "server.js"] 
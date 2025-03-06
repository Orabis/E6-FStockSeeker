FROM node:16-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm run build
RUN npm install -g serve
EXPOSE 5000
CMD ["serve", "-s", "dist", "-l", "5000"]

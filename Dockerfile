# -- build stage --
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json ./
RUN echo "registry=https://registry.npmjs.org/" > .npmrc && npm install
COPY . .
ARG VITE_API_BASE_URL
RUN npm run build

# -- production stage --
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# SPA fallback: route all paths to index.html
COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Stage 1: Build Angular Frontend
FROM node:22-alpine AS frontend-build
WORKDIR /src/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npx ng build --configuration production
RUN if [ -d "../backend/KarthickCrackers.Api/wwwroot/browser" ]; then cp -r ../backend/KarthickCrackers.Api/wwwroot/browser/* ../backend/KarthickCrackers.Api/wwwroot/; fi

# Stage 2: Build .NET 10 API Backend
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-build
WORKDIR /src
COPY backend/KarthickCrackers.Api/*.csproj ./backend/KarthickCrackers.Api/
RUN dotnet restore ./backend/KarthickCrackers.Api/KarthickCrackers.Api.csproj
COPY backend/KarthickCrackers.Api/ ./backend/KarthickCrackers.Api/
COPY --from=frontend-build /src/backend/KarthickCrackers.Api/wwwroot ./backend/KarthickCrackers.Api/wwwroot
RUN if [ -d "./backend/KarthickCrackers.Api/wwwroot/browser" ]; then cp -r ./backend/KarthickCrackers.Api/wwwroot/browser/* ./backend/KarthickCrackers.Api/wwwroot/; fi
WORKDIR /src/backend/KarthickCrackers.Api
RUN dotnet publish -c Release -o /app/publish

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
RUN apt-get update && apt-get install -y \
    chromium \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    fonts-liberation \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
WORKDIR /app
COPY --from=backend-build /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "KarthickCrackers.Api.dll"]

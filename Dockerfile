# Stage 1: Build Angular Frontend
FROM node:20-alpine AS frontend-build
WORKDIR /src/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npx ng build --configuration production

# Stage 2: Build .NET 10 API Backend
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-build
WORKDIR /src
COPY backend/KarthickCrackers.Api/*.csproj ./backend/KarthickCrackers.Api/
RUN dotnet restore ./backend/KarthickCrackers.Api/KarthickCrackers.Api.csproj
COPY backend/KarthickCrackers.Api/ ./backend/KarthickCrackers.Api/
COPY --from=frontend-build /src/backend/KarthickCrackers.Api/wwwroot ./backend/KarthickCrackers.Api/wwwroot
WORKDIR /src/backend/KarthickCrackers.Api
RUN dotnet publish -c Release -o /app/publish

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=backend-build /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "KarthickCrackers.Api.dll"]

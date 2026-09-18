# Karthick Crackers Application

Welcome to the **Karthick Crackers** application repository.

## Architecture

This project is built using a modern full-stack architecture:

- **Frontend**: Angular, TypeScript, SCSS
- **Backend**: ASP.NET Core Web API, C#, Entity Framework Core
- **Database**: Microsoft SQL Server

```
Angular (Frontend)
   ↓
ASP.NET Core Web API (Backend)
   ↓
Entity Framework Core (ORM)
   ↓
SQL Server (Database)
```

## Directory Structure

```
KarthickCrackers/
│
├── frontend/             # Angular client application
├── backend/              # ASP.NET Core Web API application
│   └── KarthickCrackers.Api/
│       ├── Controllers/  # API Controllers
│       ├── Services/     # Business logic layer
│       ├── Repositories/ # Data access repository layer
│       ├── DTOs/         # Request & Response Data Transfer Objects
│       ├── Entities/     # Domain models & DB entity classes
│       ├── Data/         # DbContext & migrations
│       ├── Middleware/   # Custom exception handling & request pipeline
│       ├── Authentication/# JWT authentication configuration
│       └── Configuration/# App settings & options
├── database/             # Database scripts & migrations
│   ├── scripts/          # Raw SQL scripts
│   ├── migrations/       # EF Core / Schema migrations
│   └── seed/             # Initial seed data
└── docs/                 # System documentation
    ├── architecture/     # Architecture diagrams & docs
    ├── database/         # ERD and schema design
    ├── api/              # API specifications & contracts
    └── requirements/     # Business requirements & specifications
```

## Getting Started

### Prerequisites
- .NET 10 SDK (or .NET 8/9 SDK)
- Node.js (v18+) and npm
- SQL Server

### Backend Setup
1. Navigate to `backend/KarthickCrackers.Api`
2. Run `dotnet restore`
3. Run `dotnet build`
4. Run `dotnet run`

### Frontend Setup
1. Navigate to `frontend`
2. Run `npm install`
3. Run `npm run build` or `npx ng serve`

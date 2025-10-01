# Ostly - Development Setup Guide

## Prerequisites

Ensure you have the following installed:

- **Node.js**: v20+ ([Download](https://nodejs.org/))
- **npm**: v10+ (comes with Node.js)
- **Docker Desktop**: ([Download](https://www.docker.com/products/docker-desktop))
- **Git**: ([Download](https://git-scm.com/))
- **Angular CLI**: v20+ (install globally: `npm install -g @angular/cli@20`)

## Step 1: Clone Repository

```bash
git clone <repository-url>
cd OST_leerob
```

## Step 2: Configure Git Commit Template

```bash
git config commit.template .gitmessage
```

This will help you write descriptive commit messages following our conventions.

## Step 3: Start PostgreSQL Database

```bash
docker-compose up -d
```

**What this does:**
- Starts PostgreSQL 16 in a Docker container
- Creates database `ostly_db`
- Initializes schema from `database-schema.sql`
- Runs on `localhost:5432`

**Verify it's running:**
```bash
docker ps
# Should see ostly-postgres container running

docker-compose logs postgres
# Should see "database system is ready to accept connections"
```

## Step 4: Create Frontend Project (Angular 20)

```bash
# Create Angular 20 application
ng new frontend --routing --style=scss --skip-git

cd frontend

# Install Material
ng add @angular/material

# Install Tailwind CSS v4 (when available, for now use v3)
npm install -D tailwindcss@latest postcss autoprefixer
npx tailwindcss init

# Install AntV X6
npm install @antv/x6

# Install export dependencies
npm install jspdf

# Install development dependencies
npm install -D @types/node
```

## Step 5: Create Backend Project (Node.js + Express)

```bash
# Create backend directory
mkdir backend
cd backend

# Initialize npm project
npm init -y

# Install dependencies
npm install express cors dotenv pg
npm install -D typescript @types/node @types/express @types/cors nodemon ts-node

# Install Prisma (ORM)
npm install -D prisma
npm install @prisma/client
npx prisma init

# Configure TypeScript
npx tsc --init
```

## Step 6: Configure ESLint 9

### Frontend ESLint
```bash
cd frontend
npm install -D eslint@9 @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D eslint-plugin-angular
npx eslint --init
```

### Backend ESLint
```bash
cd backend
npm install -D eslint@9 @typescript-eslint/parser @typescript-eslint/eslint-plugin
npx eslint --init
```

## Step 7: Configure Prettier

```bash
# Frontend
cd frontend
npm install -D prettier eslint-config-prettier eslint-plugin-prettier

# Backend
cd backend
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
```

Create `.prettierrc` in both frontend and backend:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

## Step 8: Configure Playwright (E2E Testing)

```bash
cd frontend
npm init playwright@latest
```

**Select options:**
- TypeScript
- tests directory: `e2e`
- GitHub Actions: No (for now)
- Install browsers: Yes

## Step 9: Set Up Environment Variables

### Frontend
```bash
cd frontend
cp ../env.example .env
```

### Backend
```bash
cd backend
cp ../env.example .env
```

Edit `.env` files with your configuration.

## Step 10: Configure Prisma (Backend)

```bash
cd backend

# Update prisma/schema.prisma with your models
# Then generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push
```

## Step 11: Verify Setup

### Start Database
```bash
docker-compose up -d
```

### Start Backend
```bash
cd backend
npm run dev
```

### Start Frontend
```bash
cd frontend
npm start
```

### Run Tests
```bash
# Unit tests (frontend)
cd frontend
npm test

# E2E tests
npm run test:e2e

# Backend tests
cd backend
npm test
```

## Common Commands

### Database
```bash
# Start database
docker-compose up -d

# Stop database
docker-compose down

# View logs
docker-compose logs -f postgres

# Access PostgreSQL CLI
docker exec -it ostly-postgres psql -U ostly_user -d ostly_db
```

### Development
```bash
# Frontend
npm start              # Start dev server
npm test              # Run unit tests
npm run test:e2e      # Run E2E tests
npm run lint          # Run ESLint
npm run format        # Run Prettier

# Backend
npm run dev           # Start dev server with nodemon
npm test              # Run unit tests
npm run lint          # Run ESLint
npm run format        # Run Prettier
```

### Database Migrations (Prisma)
```bash
cd backend
npx prisma migrate dev --name init
npx prisma studio  # Open Prisma Studio GUI
```

## Troubleshooting

### PostgreSQL won't start
```bash
# Check if port 5432 is already in use
netstat -ano | findstr :5432  # Windows
lsof -i :5432                 # Mac/Linux

# Remove existing container and volumes
docker-compose down -v
docker-compose up -d
```

### Node modules issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Angular CLI issues
```bash
# Update Angular CLI
npm install -g @angular/cli@20

# Clear Angular cache
rm -rf .angular
```

## Next Steps

1. ✅ Database schema created
2. ✅ Design tokens defined
3. ✅ Templates created
4. ✅ Docker setup complete
5. ⏳ Create Angular components
6. ⏳ Set up AntV X6 graph editor
7. ⏳ Build API endpoints
8. ⏳ Implement export functionality

See `plan.md` for the complete implementation roadmap.

## Resources

- [Angular Documentation](https://angular.dev/)
- [AntV X6 Documentation](https://x6.antv.antgroup.com/en)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)


# Ostly - Opportunity Solution Tree Editor

> A collaborative, web-native tool for product teams to build, evolve, and share Opportunity Solution Trees (OSTs).

## 🎯 Product Vision

Ostly enables product teams to practice continuous discovery through OSTs - more than just a drawing tool, it provides process guidance for novice users and streamlines the OST workflow.

## 🏗️ Tech Stack

### Frontend
- **Framework**: Angular 20 + TypeScript
- **UI Library**: Material + Tailwind CSS v4
- **Diagramming**: AntV X6
- **Testing**: Playwright (E2E), Jasmine/Karma (Unit)
- **Linting**: ESLint 9

### Backend
- **Runtime**: Node.js + Express
- **Database**: PostgreSQL 16 (Docker container)
- **ORM**: Prisma or TypeORM (TBD)

### Development
- **Version Control**: Git with descriptive commit messages
- **Testing Approach**: Red/Green/Refactor TDD
- **Code Coverage**: Target >80% for business logic

## 📋 Quick Start

### Prerequisites
- Node.js 20+ and npm
- Docker Desktop
- Git

### 1. Start PostgreSQL Database

```bash
docker-compose up -d
```

This will:
- Start PostgreSQL 16 on port 5432
- Create database `ostly_db`
- Run initial schema from `database-schema.sql`

### 2. Install Dependencies

```bash
# Frontend (coming soon)
cd frontend
npm install

# Backend (coming soon)
cd backend
npm install
```

### 3. Run Development Servers

```bash
# Frontend
npm run start

# Backend
npm run dev
```

## 🎨 Design System

Color tokens and design system are defined in `design-tokens.json`:

### Node Types
- **Outcome**: Blue (Light: #E3F2FD, Dark: #1A237E)
- **Opportunity**: Purple (Light: #F3E5F5, Dark: #4A148C)
- **Solution**: Green (Light: #E8F5E9, Dark: #1B5E20)
- **Experiment**: Orange (Light: #FFF3E0, Dark: #E65100)

### Status Colors
- Draft: Gray
- In Progress: Blue
- Validated: Green
- Deprioritized: Orange
- Completed: Teal

All colors meet WCAG AA accessibility standards.

## 📊 Database Schema

The database uses an adjacency list pattern for tree structure:

- `ost_trees`: Main tree container
- `nodes`: Tree nodes with parent_id relationships
- `tree_versions`: Version history (JSONB snapshots)
- `templates`: Predefined OST templates

See `database-schema.sql` for full schema.

## 📝 Templates

Three starter templates are included:

1. **Retention Template**: Increase 30-Day User Retention
2. **Engagement Template**: Improve Weekly Active Users
3. **Onboarding Template**: Optimize User Onboarding

See `templates-content.json` for full template structures.

## 🧪 Testing

### Unit Tests
```bash
npm run test
npm run test:coverage
```

### E2E Tests
```bash
npm run test:e2e
```

### Development Covenants
- Follow Red/Green/Refactor TDD pattern
- Write unit tests for all business logic
- Maintain >80% code coverage
- Use Playwright for core user journey E2E tests
- Commit frequently with descriptive messages

## 📦 MVP Features (8 Weeks)

### Phase 1: Core Editor
- [x] Database schema design
- [x] Design tokens & color system
- [x] Template content creation
- [ ] Basic tree editor with drag-and-drop
- [ ] Node types: Outcome → Opportunity → Solution → Experiment
- [ ] Dark/Light mode theming
- [ ] Support up to 250 nodes

### Phase 2: Export & Sharing
- [ ] PNG export (AntV X6 built-in)
- [ ] PDF export (jsPDF conversion)
- [ ] Shareable view links

### Phase 3: Version Control & Templates
- [ ] Undo/redo functionality
- [ ] Basic version history
- [ ] 3 starter templates
- [ ] Onboarding tour with OST explanation

## 🚀 Deployment

The application is configured for automatic deployment:

- **Frontend**: Vercel (auto-deploy from main branch)
- **Backend**: Railway (auto-deploy from main branch)
- **Database**: Railway PostgreSQL (production)

### Quick Deploy

```bash
# Frontend
cd frontend
vercel --prod

# Backend
cd backend
railway up
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide and [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md) for step-by-step instructions.

## 📚 Resources

- [Teresa Torres - Continuous Discovery Habits](https://www.producttalk.org/continuous-discovery-habits/)
- [AntV X6 Documentation](https://x6.antv.antgroup.com/en)
- [Angular Material](https://material.angular.io/)
- [Tailwind CSS v4](https://tailwindcss.com/)

## 🤝 Contributing

This is currently a single-developer project following TDD and clean code practices.

## 📄 License

TBD

---

**Last Updated**: October 2025

